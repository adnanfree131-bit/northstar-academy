export interface Env {
  DB: D1Database;
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  DOCUMENTS?: R2Bucket;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "no-store",
    },
  });
}

function notFound(path?: string, method?: string) {
  return json({ error: "Not found", path, method }, 404);
}

export async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, "") || "/";

  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
        "access-control-allow-headers": "content-type, authorization",
      },
    });
  }

  if (!env.DB) {
    return json({ error: "D1 is not bound", ok: false }, 503);
  }

  try {
    if (path === "/api/auth/login" && request.method === "POST") {
      const body = (await request.json()) as { email?: string; password?: string };
      const email = (body.email || "").trim().toLowerCase();
      const password = body.password || "";
      if (!email || !password) return json({ error: "Email and password required" }, 400);
      const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first<{
        id: string;
        email: string;
        password_hash: string;
        name: string;
        role: string;
        student_id: string | null;
      }>();
      if (!user || user.password_hash !== (await sha256(password))) {
        return json({ error: "Invalid credentials" }, 401);
      }
      const token = crypto.randomUUID();
      const expires = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
      await env.DB.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)")
        .bind(token, user.id, expires)
        .run();
      await audit(env, "login", "user", user.id, user.email);
      return json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          studentId: user.student_id,
        },
      });
    }

    if (path === "/api/auth/logout" && request.method === "POST") {
      const session = await getSession(request, env);
      if (session) {
        await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(session.token).run();
      }
      return json({ ok: true });
    }

    if (path === "/api/me" && request.method === "GET") {
      const session = await getSession(request, env);
      if (!session) return json({ error: "Unauthorized" }, 401);
      return json(session.user);
    }

    if (path === "/api/health" && request.method === "GET") {
      const tables = await env.DB.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      ).all();
      return json({
        ok: true,
        database: "northstar-db",
        r2: Boolean(env.DOCUMENTS),
        tables: (tables.results || []).map((t: { name: string }) => t.name),
      });
    }

    if (path === "/api/stats" && request.method === "GET") {
      const students = await env.DB.prepare("SELECT COUNT(*) AS c FROM students").first<{ c: number }>();
      const active = await env.DB.prepare(
        "SELECT COUNT(*) AS c FROM students WHERE status = 'active'"
      ).first<{ c: number }>();
      const staff = await env.DB.prepare("SELECT COUNT(*) AS c FROM staff").first<{ c: number }>();
      const overdue = await env.DB.prepare(
        "SELECT COUNT(*) AS c FROM fee_invoices WHERE status = 'overdue'"
      ).first<{ c: number }>();
      const collected = await env.DB.prepare(
        "SELECT COALESCE(SUM(paid_amount),0) AS s FROM fee_invoices"
      ).first<{ s: number }>();
      const outstanding = await env.DB.prepare(
        "SELECT COALESCE(SUM(total_amount - paid_amount + late_fee),0) AS s FROM fee_invoices"
      ).first<{ s: number }>();
      const attendance = await env.DB.prepare(
        "SELECT AVG(attendance_percent) AS a FROM students WHERE status = 'active'"
      ).first<{ a: number }>();
      return json({
        totalStudents: students?.c ?? 0,
        activeStudents: active?.c ?? 0,
        totalStaff: staff?.c ?? 0,
        overdueInvoices: overdue?.c ?? 0,
        feeCollected: collected?.s ?? 0,
        feeOutstanding: outstanding?.s ?? 0,
        averageAttendance: Number((attendance?.a ?? 0).toFixed(1)),
        r2Enabled: Boolean(env.DOCUMENTS),
      });
    }

    if (path === "/api/students" && request.method === "GET") {
      const session = await getSession(request, env);
      const rows = await env.DB.prepare(
        "SELECT * FROM students ORDER BY class_name, section, roll_no"
      ).all();
      const guardians = await env.DB.prepare("SELECT * FROM guardians").all();
      const byStudent: Record<string, unknown[]> = {};
      for (const g of guardians.results || []) {
        const row = g as { student_id: string };
        (byStudent[row.student_id] ||= []).push(mapGuardian(row as never));
      }
      let list = (rows.results || []).map((s) =>
        mapStudent(s as never, byStudent[(s as { id: string }).id] || [])
      );
      if (session?.user.role === "parent" && session.user.studentId) {
        list = list.filter((s) => s.id === session.user.studentId);
      }
      return json(list);
    }

    const studentMatch = path.match(/^\/api\/students\/([^/]+)$/);
    if (studentMatch && request.method === "GET") {
      const id = decodeURIComponent(studentMatch[1]);
      const s = await env.DB.prepare("SELECT * FROM students WHERE id = ?").bind(id).first();
      if (!s) return notFound();
      const guardians = await env.DB.prepare("SELECT * FROM guardians WHERE student_id = ?")
        .bind(id)
        .all();
      const invoices = await env.DB.prepare("SELECT * FROM fee_invoices WHERE student_id = ?")
        .bind(id)
        .all();
      const notes = await env.DB.prepare(
        "SELECT * FROM notes WHERE student_id = ? ORDER BY pinned DESC, created_at DESC"
      )
        .bind(id)
        .all();
      const documents = await env.DB.prepare("SELECT * FROM documents WHERE student_id = ?")
        .bind(id)
        .all();
      return json({
        student: mapStudent(s as never, (guardians.results || []).map(mapGuardian)),
        invoices: invoices.results || [],
        notes: notes.results || [],
        documents: documents.results || [],
      });
    }

    if (path === "/api/fees" && request.method === "GET") {
      const invoices = await env.DB.prepare(
        "SELECT * FROM fee_invoices ORDER BY due_date ASC"
      ).all();
      const components = await env.DB.prepare("SELECT * FROM fee_components").all();
      const byInv: Record<string, unknown[]> = {};
      for (const c of components.results || []) {
        const row = c as { invoice_id: string };
        (byInv[row.invoice_id] ||= []).push(c);
      }
      return json(
        (invoices.results || []).map((inv) => ({
          ...inv,
          components: byInv[(inv as { id: string }).id] || [],
        }))
      );
    }

    if (path === "/api/staff" && request.method === "GET") {
      const rows = await env.DB.prepare("SELECT * FROM staff ORDER BY name").all();
      return json(
        (rows.results || []).map((s) => {
          const row = s as {
            subjects?: string;
            classes_assigned?: string;
          };
          return {
            ...s,
            subjects: row.subjects ? row.subjects.split(",").filter(Boolean) : [],
            classesAssigned: row.classes_assigned
              ? row.classes_assigned.split(",").filter(Boolean)
              : [],
          };
        })
      );
    }

    if (path === "/api/exams" && request.method === "GET") {
      const exams = await env.DB.prepare("SELECT * FROM exams ORDER BY start_date").all();
      const subjects = await env.DB.prepare("SELECT * FROM exam_subjects").all();
      const byExam: Record<string, unknown[]> = {};
      for (const sub of subjects.results || []) {
        const row = sub as { exam_id: string };
        (byExam[row.exam_id] ||= []).push(sub);
      }
      return json(
        (exams.results || []).map((e) => ({
          ...e,
          subjects: byExam[(e as { id: string }).id] || [],
        }))
      );
    }

    if (path === "/api/notes" && request.method === "GET") {
      const studentId = url.searchParams.get("studentId");
      const stmt = studentId
        ? env.DB.prepare(
            "SELECT * FROM notes WHERE student_id = ? OR student_id IS NULL ORDER BY pinned DESC, created_at DESC"
          ).bind(studentId)
        : env.DB.prepare("SELECT * FROM notes ORDER BY pinned DESC, created_at DESC");
      const rows = await stmt.all();
      return json(rows.results || []);
    }

    if (path === "/api/notes" && request.method === "POST") {
      const body = (await request.json()) as {
        studentId?: string;
        title: string;
        body: string;
        category?: string;
        confidential?: boolean;
        author?: string;
      };
      if (!body?.title || !body?.body) {
        return json({ error: "title and body are required" }, 400);
      }
      const id = `note-${crypto.randomUUID().slice(0, 8)}`;
      await env.DB.prepare(
        "INSERT INTO notes (id, student_id, title, body, category, confidential, pinned, author) VALUES (?, ?, ?, ?, ?, ?, 0, ?)"
      )
        .bind(
          id,
          body.studentId || null,
          body.title,
          body.body,
          body.category || "general",
          body.confidential ? 1 : 0,
          body.author || "Staff"
        )
        .run();
      await env.DB.prepare(
        "INSERT INTO audit_log (action, entity, entity_id, detail) VALUES (?, ?, ?, ?)"
      )
        .bind("create", "note", id, body.title)
        .run();
      const row = await env.DB.prepare("SELECT * FROM notes WHERE id = ?").bind(id).first();
      return json(row, 201);
    }

    if (path === "/api/audit" && request.method === "GET") {
      const rows = await env.DB.prepare(
        "SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 50"
      ).all();
      return json(rows.results || []);
    }

    if (path === "/api/students" && request.method === "POST") {
      const session = await requireRole(request, env, ["principal", "accountant"]);
      if (session instanceof Response) return session;
      const body = (await request.json()) as {
        firstName: string;
        lastName: string;
        gender: string;
        dateOfBirth: string;
        className: string;
        section: string;
        rollNo: string;
        guardianName: string;
        guardianPhone: string;
        isHostel?: boolean;
        specialNeeds?: string;
        siblingId?: string;
      };
      if (!body.firstName || !body.lastName || !body.className || !body.guardianName) {
        return json({ error: "Missing required admission fields" }, 400);
      }
      const admissionNo = `ADM-2026-${String(Date.now()).slice(-4)}`;
      const dup = await env.DB.prepare(
        "SELECT id FROM students WHERE class_name = ? AND section = ? AND roll_no = ?"
      )
        .bind(body.className, body.section || "A", body.rollNo || "01")
        .first();
      if (dup) return json({ error: "Roll number already used in this class/section" }, 409);
      const id = `stu-${crypto.randomUUID().slice(0, 6)}`;
      const fullName = `${body.firstName} ${body.lastName}`;
      await env.DB.prepare(
        `INSERT INTO students (id, admission_no, first_name, last_name, full_name, gender, date_of_birth, class_name, section, roll_no, status, admission_date, is_hostel, special_needs, sibling_ids, fee_balance, attendance_percent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', date('now'), ?, ?, ?, 0, 100)`
      )
        .bind(
          id,
          admissionNo,
          body.firstName,
          body.lastName,
          fullName,
          body.gender || "Other",
          body.dateOfBirth || "2012-01-01",
          body.className,
          body.section || "A",
          body.rollNo || "01",
          body.isHostel ? 1 : 0,
          body.specialNeeds || null,
          body.siblingId || ""
        )
        .run();
      const gid = `g-${crypto.randomUUID().slice(0, 6)}`;
      await env.DB.prepare(
        "INSERT INTO guardians (id, student_id, name, relation, phone, is_primary) VALUES (?, ?, ?, 'Guardian', ?, 1)"
      )
        .bind(gid, id, body.guardianName, body.guardianPhone || "")
        .run();
      await audit(env, "admit", "student", id, fullName);
      const row = await env.DB.prepare("SELECT * FROM students WHERE id = ?").bind(id).first();
      return json({ student: mapStudent(row as never, []) }, 201);
    }

    const payMatch = path.match(/^\/api\/fees\/([^/]+)\/pay$/);
    if (payMatch && request.method === "POST") {
      const session = await requireRole(request, env, ["principal", "accountant"]);
      if (session instanceof Response) return session;
      const invoiceId = decodeURIComponent(payMatch[1]);
      const body = (await request.json()) as { amount?: number; method?: string; waiveLate?: boolean };
      const inv = await env.DB.prepare("SELECT * FROM fee_invoices WHERE id = ?").bind(invoiceId).first<{
        id: string;
        student_id: string;
        total_amount: number;
        paid_amount: number;
        late_fee: number;
        status: string;
      }>();
      if (!inv) return notFound();
      let late = inv.late_fee;
      if (body.waiveLate) late = 0;
      const balance = inv.total_amount - inv.paid_amount + late;
      const amount = Number(body.amount || 0);
      if (amount <= 0) return json({ error: "Amount must be greater than 0" }, 400);
      if (amount > balance) return json({ error: "Amount exceeds outstanding balance" }, 400);
      const paid = inv.paid_amount + amount;
      const newBalance = inv.total_amount - paid + late;
      const status = newBalance <= 0 ? "paid" : "partial";
      const receipt = `RCP-${Date.now().toString().slice(-6)}`;
      await env.DB.prepare(
        "UPDATE fee_invoices SET paid_amount = ?, late_fee = ?, status = ?, last_payment_date = date('now'), receipt_no = ? WHERE id = ?"
      )
        .bind(paid, late, status, receipt, invoiceId)
        .run();
      await env.DB.prepare(
        "INSERT INTO payments (id, invoice_id, amount, method, receipt_no) VALUES (?, ?, ?, ?, ?)"
      )
        .bind(`pay-${crypto.randomUUID().slice(0, 8)}`, invoiceId, amount, body.method || "cash", receipt)
        .run();
      await env.DB.prepare(
        "UPDATE students SET fee_balance = MAX(fee_balance - ?, 0) WHERE id = ?"
      )
        .bind(amount, inv.student_id)
        .run();
      await audit(env, "collect", "invoice", invoiceId, `${amount} via ${body.method || "cash"}`);
      const updated = await env.DB.prepare("SELECT * FROM fee_invoices WHERE id = ?").bind(invoiceId).first();
      return json({ invoice: updated, receiptNo: receipt, status });
    }

    if (path === "/api/attendance" && request.method === "GET") {
      const date = url.searchParams.get("date");
      const className = url.searchParams.get("class");
      const section = url.searchParams.get("section");
      if (!date) return json({ error: "date required" }, 400);
      let q = "SELECT * FROM attendance WHERE date = ?";
      const binds: string[] = [date];
      if (className) {
        q += " AND class_name = ?";
        binds.push(className);
      }
      if (section) {
        q += " AND section = ?";
        binds.push(section);
      }
      const rows = await env.DB.prepare(q).bind(...binds).all();
      return json(rows.results || []);
    }

    if (path === "/api/attendance" && request.method === "POST") {
      const session = await requireRole(request, env, ["principal", "teacher"]);
      if (session instanceof Response) return session;
      const body = (await request.json()) as {
        date: string;
        className: string;
        section: string;
        marks: { studentId: string; status: string }[];
      };
      if (!body.date || !body.marks?.length) return json({ error: "date and marks required" }, 400);
      for (const mark of body.marks) {
        const id = `att-${body.date}-${mark.studentId}`;
        await env.DB.prepare(
          `INSERT INTO attendance (id, student_id, class_name, section, date, status, marked_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(student_id, date) DO UPDATE SET status = excluded.status, marked_by = excluded.marked_by`
        )
          .bind(
            id,
            mark.studentId,
            body.className,
            body.section,
            body.date,
            mark.status,
            session.user.name
          )
          .run();
      }
      await audit(env, "mark", "attendance", body.date, `${body.className}-${body.section} ${body.marks.length} rows`);
      return json({ ok: true, saved: body.marks.length });
    }

    const examMarksMatch = path.match(/^\/api\/exams\/([^/]+)\/marks$/);
    if (examMarksMatch && request.method === "GET") {
      const examId = decodeURIComponent(examMarksMatch[1]);
      const rows = await env.DB.prepare("SELECT * FROM exam_marks WHERE exam_id = ?").bind(examId).all();
      return json(rows.results || []);
    }

    if (examMarksMatch && request.method === "POST") {
      const session = await requireRole(request, env, ["principal", "teacher"]);
      if (session instanceof Response) return session;
      const examId = decodeURIComponent(examMarksMatch[1]);
      const body = (await request.json()) as {
        studentId: string;
        subject: string;
        marks?: number;
        maxMarks: number;
        absent?: boolean;
        grace?: number;
      };
      const max = Number(body.maxMarks || 0);
      const grace = Number(body.grace || 0);
      if (body.absent) {
        // ok
      } else if (body.marks == null || Number.isNaN(Number(body.marks))) {
        return json({ error: "marks required unless absent" }, 400);
      } else if (Number(body.marks) + grace > max) {
        return json({ error: "Marks + grace cannot exceed max" }, 400);
      }
      const id = `mk-${examId}-${body.studentId}-${body.subject}`.replace(/\s+/g, "");
      await env.DB.prepare(
        `INSERT INTO exam_marks (id, exam_id, student_id, subject, marks, max_marks, absent, grace)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(exam_id, student_id, subject) DO UPDATE SET marks = excluded.marks, absent = excluded.absent, grace = excluded.grace`
      )
        .bind(
          id,
          examId,
          body.studentId,
          body.subject,
          body.absent ? null : Number(body.marks),
          max,
          body.absent ? 1 : 0,
          grace
        )
        .run();
      await audit(env, "marks", "exam", examId, `${body.studentId} ${body.subject}`);
      return json({ ok: true });
    }

    const reportMatch = path.match(/^\/api\/exams\/([^/]+)\/report\/([^/]+)$/);
    if (reportMatch && request.method === "GET") {
      const examId = decodeURIComponent(reportMatch[1]);
      const studentId = decodeURIComponent(reportMatch[2]);
      const student = await env.DB.prepare("SELECT * FROM students WHERE id = ?").bind(studentId).first();
      const exam = await env.DB.prepare("SELECT * FROM exams WHERE id = ?").bind(examId).first();
      const marks = await env.DB.prepare(
        "SELECT * FROM exam_marks WHERE exam_id = ? AND student_id = ?"
      )
        .bind(examId, studentId)
        .all();
      const rows = (marks.results || []) as {
        marks: number | null;
        max_marks: number;
        absent: number;
        grace: number;
        subject: string;
      }[];
      const obtained = rows.reduce((s, r) => s + (r.absent ? 0 : Number(r.marks || 0) + Number(r.grace || 0)), 0);
      const max = rows.reduce((s, r) => s + Number(r.max_marks || 0), 0);
      const percent = max ? Number(((obtained / max) * 100).toFixed(1)) : 0;
      const grade =
        percent >= 90 ? "A+" : percent >= 80 ? "A" : percent >= 70 ? "B" : percent >= 60 ? "C" : percent >= 50 ? "D" : "F";
      return json({ student, exam, subjects: rows, obtained, max, percent, grade });
    }

    if (path === "/api/rollover/preview" && request.method === "GET") {
      const session = await requireRole(request, env, ["principal"]);
      if (session instanceof Response) return session;
      const year = await env.DB.prepare("SELECT value FROM app_settings WHERE key = 'academic_year'").first<{
        value: string;
      }>();
      const rolled = await env.DB.prepare("SELECT value FROM app_settings WHERE key = 'rolled_over'").first<{
        value: string;
      }>();
      const rows = await env.DB.prepare("SELECT * FROM students WHERE status IN ('active','suspended')").all();
      const preview = (rows.results || []).map((raw) => {
        const s = raw as {
          id: string;
          full_name: string;
          class_name: string;
          attendance_percent: number;
          fee_balance: number;
          status: string;
        };
        const blocked: string[] = [];
        if (s.status === "suspended") blocked.push("Suspended");
        if (s.attendance_percent < 80) blocked.push("Attendance below 80%");
        if (s.fee_balance > 0) blocked.push("Fee hold");
        const nextClass = s.class_name === "10" ? "alumni" : String(Number(s.class_name) + 1);
        return {
          id: s.id,
          name: s.full_name,
          from: s.class_name,
          to: blocked.length ? s.class_name : nextClass,
          blocked,
          eligible: blocked.length === 0,
        };
      });
      return json({
        academicYear: year?.value || "2025-26",
        rolledOver: rolled?.value === "1",
        eligible: preview.filter((p) => p.eligible).length,
        blocked: preview.filter((p) => !p.eligible).length,
        students: preview,
      });
    }

    if (path === "/api/rollover" && request.method === "POST") {
      const session = await requireRole(request, env, ["principal"]);
      if (session instanceof Response) return session;
      const rolled = await env.DB.prepare("SELECT value FROM app_settings WHERE key = 'rolled_over'").first<{
        value: string;
      }>();
      if (rolled?.value === "1") return json({ error: "Already rolled over for this cycle" }, 409);
      const rows = await env.DB.prepare("SELECT * FROM students WHERE status IN ('active','suspended')").all();
      let promoted = 0;
      let held = 0;
      for (const raw of rows.results || []) {
        const s = raw as {
          id: string;
          class_name: string;
          attendance_percent: number;
          fee_balance: number;
          status: string;
        };
        const blocked = s.status === "suspended" || s.attendance_percent < 80 || s.fee_balance > 0;
        if (blocked) {
          held += 1;
          continue;
        }
        if (s.class_name === "10") {
          await env.DB.prepare("UPDATE students SET status = 'alumni' WHERE id = ?").bind(s.id).run();
        } else {
          await env.DB.prepare("UPDATE students SET class_name = ? WHERE id = ?")
            .bind(String(Number(s.class_name) + 1), s.id)
            .run();
        }
        promoted += 1;
      }
      await env.DB.prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('academic_year', '2026-27')").run();
      await env.DB.prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('rolled_over', '1')").run();
      await audit(env, "rollover", "academic_year", "2026-27", `promoted ${promoted}, held ${held}`);
      return json({ ok: true, promoted, held, academicYear: "2026-27" });
    }

    return notFound(path, request.method);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return json({ error: message }, 500);
  }
}

function mapGuardian(g: Record<string, unknown>) {
  return {
    id: g.id,
    name: g.name,
    relation: g.relation,
    phone: g.phone,
    email: g.email,
    isPrimary: Boolean(g.is_primary),
    occupation: g.occupation,
  };
}

function mapStudent(s: Record<string, unknown>, guardians: unknown[]) {
  return {
    id: s.id,
    admissionNo: s.admission_no,
    firstName: s.first_name,
    lastName: s.last_name,
    fullName: s.full_name,
    gender: s.gender,
    dateOfBirth: s.date_of_birth,
    className: s.class_name,
    section: s.section,
    rollNo: s.roll_no,
    status: s.status,
    admissionDate: s.admission_date,
    bloodGroup: s.blood_group,
    allergies: s.allergies ? String(s.allergies).split(",").filter(Boolean) : [],
    photoUrl: undefined,
    guardians,
    siblingIds: s.sibling_ids ? String(s.sibling_ids).split(",").filter(Boolean) : [],
    transportRoute: s.transport_route,
    isHostel: Boolean(s.is_hostel),
    medicalNotes: s.medical_notes,
    specialNeeds: s.special_needs,
    feeBalance: s.fee_balance,
    attendancePercent: s.attendance_percent,
  };
}

type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  studentId: string | null;
};

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getSession(request: Request, env: Env) {
  const header = request.headers.get("authorization") || "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT s.token, s.expires_at, u.id, u.email, u.name, u.role, u.student_id
     FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?`
  )
    .bind(token)
    .first<{
      token: string;
      expires_at: string;
      id: string;
      email: string;
      name: string;
      role: string;
      student_id: string | null;
    }>();
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  return {
    token: row.token,
    user: {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      studentId: row.student_id,
    } as SessionUser,
  };
}

async function requireRole(request: Request, env: Env, roles: string[]) {
  const session = await getSession(request, env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  if (session.user.role !== "principal" && !roles.includes(session.user.role)) {
    return json({ error: "Forbidden for this role" }, 403);
  }
  return session;
}

async function audit(env: Env, action: string, entity: string, entityId: string | null, detail: string) {
  await env.DB.prepare(
    "INSERT INTO audit_log (action, entity, entity_id, detail) VALUES (?, ?, ?, ?)"
  )
    .bind(action, entity, entityId, detail)
    .run();
}

