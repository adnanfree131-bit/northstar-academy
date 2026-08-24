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

function notFound() {
  return json({ error: "Not found" }, 404);
}

export async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, "") || "/";

  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
        "access-control-allow-headers": "content-type",
      },
    });
  }

  if (!env.DB) {
    return json({ error: "D1 is not bound", ok: false }, 503);
  }

  try {
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
      const rows = await env.DB.prepare(
        "SELECT * FROM students ORDER BY class_name, section, roll_no"
      ).all();
      const guardians = await env.DB.prepare("SELECT * FROM guardians").all();
      const byStudent: Record<string, unknown[]> = {};
      for (const g of guardians.results || []) {
        const row = g as { student_id: string };
        (byStudent[row.student_id] ||= []).push(mapGuardian(row as never));
      }
      return json(
        (rows.results || []).map((s) => mapStudent(s as never, byStudent[(s as { id: string }).id] || []))
      );
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

    return notFound();
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
