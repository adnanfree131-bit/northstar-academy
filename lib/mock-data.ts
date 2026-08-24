export type StudentStatus = "active" | "inactive" | "transferred" | "alumni" | "suspended";
export type FeeStatus = "paid" | "partial" | "overdue" | "waived" | "pending";
export type AttendanceStatus = "present" | "absent" | "late" | "half-day" | "leave" | "holiday";

export interface Guardian {
  id: string;
  name: string;
  relation: "Father" | "Mother" | "Guardian" | "Other";
  phone: string;
  email?: string;
  isPrimary: boolean;
  occupation?: string;
}

export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: string;
  className: string;
  section: string;
  rollNo: string;
  status: StudentStatus;
  admissionDate: string;
  bloodGroup?: string;
  allergies?: string[];
  photoUrl?: string;
  guardians: Guardian[];
  siblingIds: string[];
  transportRoute?: string;
  isHostel: boolean;
  medicalNotes?: string;
  specialNeeds?: string;
  feeBalance: number;
  attendancePercent: number;
}

export interface FeeComponent {
  id: string;
  name: string;
  amount: number;
  type: "tuition" | "transport" | "lab" | "activity" | "hostel" | "exam" | "misc";
}

export interface FeeInvoice {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  academicYear: string;
  term: string;
  components: FeeComponent[];
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: FeeStatus;
  lateFee: number;
  discount: number;
  discountReason?: string;
  lastPaymentDate?: string;
  receiptNo?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  date: string;
  status: AttendanceStatus;
  period?: string;
  reason?: string;
  markedBy: string;
  markedAt: string;
}

export interface StaffMember {
  id: string;
  employeeId: string;
  name: string;
  role: "Principal" | "Vice Principal" | "Teacher" | "Accountant" | "Admin" | "Librarian" | "Support";
  department?: string;
  subjects?: string[];
  email: string;
  phone: string;
  status: "active" | "on-leave" | "resigned";
  joiningDate: string;
  workloadHours: number;
  classesAssigned: string[];
}

export interface Exam {
  id: string;
  name: string;
  type: "unit" | "mid-term" | "final" | "practical" | "improvement";
  className: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "ongoing" | "completed" | "result-published";
  subjects: { name: string; maxMarks: number; date: string }[];
}

export interface TimetableSlot {
  id: string;
  day: string;
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
  className: string;
  section: string;
  isSubstitution?: boolean;
  originalTeacher?: string;
}

// ─── Mock Data ───────────────────────────────────────────────

export const students: Student[] = [
  {
    id: "stu-001",
    admissionNo: "ADM-2024-0142",
    firstName: "Ayesha",
    lastName: "Khan",
    fullName: "Ayesha Khan",
    gender: "Female",
    dateOfBirth: "2012-03-14",
    className: "8",
    section: "A",
    rollNo: "12",
    status: "active",
    admissionDate: "2020-04-02",
    bloodGroup: "B+",
    allergies: ["Peanuts"],
    guardians: [
      { id: "g1", name: "Imran Khan", relation: "Father", phone: "+92 300 1234567", email: "imran.khan@email.com", isPrimary: true, occupation: "Engineer" },
      { id: "g2", name: "Sana Khan", relation: "Mother", phone: "+92 321 7654321", isPrimary: false },
    ],
    siblingIds: ["stu-014"],
    transportRoute: "Route-03",
    isHostel: false,
    feeBalance: 12500,
    attendancePercent: 94.2,
  },
  {
    id: "stu-002",
    admissionNo: "ADM-2023-0087",
    firstName: "Hassan",
    lastName: "Ali",
    fullName: "Hassan Ali",
    gender: "Male",
    dateOfBirth: "2011-11-22",
    className: "9",
    section: "B",
    rollNo: "05",
    status: "active",
    admissionDate: "2019-03-15",
    bloodGroup: "O+",
    guardians: [
      { id: "g3", name: "Tariq Ali", relation: "Father", phone: "+92 333 9876543", isPrimary: true, occupation: "Business" },
    ],
    siblingIds: [],
    transportRoute: "Route-01",
    isHostel: false,
    medicalNotes: "Asthma – carry inhaler",
    feeBalance: 0,
    attendancePercent: 88.7,
  },
  {
    id: "stu-003",
    admissionNo: "ADM-2025-0031",
    firstName: "Zainab",
    lastName: "Raza",
    fullName: "Zainab Raza",
    gender: "Female",
    dateOfBirth: "2013-07-08",
    className: "7",
    section: "A",
    rollNo: "19",
    status: "active",
    admissionDate: "2021-04-10",
    bloodGroup: "A+",
    guardians: [
      { id: "g4", name: "Faisal Raza", relation: "Father", phone: "+92 345 1122334", isPrimary: true },
      { id: "g5", name: "Nadia Raza", relation: "Mother", phone: "+92 300 5566778", isPrimary: false },
    ],
    siblingIds: [],
    isHostel: true,
    specialNeeds: "Mild dyslexia – extra time on written exams",
    feeBalance: 34200,
    attendancePercent: 96.5,
  },
  {
    id: "stu-004",
    admissionNo: "ADM-2022-0199",
    firstName: "Bilal",
    lastName: "Ahmed",
    fullName: "Bilal Ahmed",
    gender: "Male",
    dateOfBirth: "2010-01-30",
    className: "10",
    section: "A",
    rollNo: "03",
    status: "active",
    admissionDate: "2018-04-05",
    bloodGroup: "AB+",
    guardians: [
      { id: "g6", name: "Kamran Ahmed", relation: "Father", phone: "+92 312 3344556", isPrimary: true, occupation: "Doctor" },
    ],
    siblingIds: ["stu-009"],
    transportRoute: "Route-05",
    isHostel: false,
    feeBalance: 8750,
    attendancePercent: 91.3,
  },
  {
    id: "stu-005",
    admissionNo: "ADM-2024-0211",
    firstName: "Fatima",
    lastName: "Noor",
    fullName: "Fatima Noor",
    gender: "Female",
    dateOfBirth: "2012-09-17",
    className: "8",
    section: "B",
    rollNo: "07",
    status: "suspended",
    admissionDate: "2020-04-12",
    bloodGroup: "B-",
    guardians: [
      { id: "g7", name: "Asif Noor", relation: "Father", phone: "+92 321 9988776", isPrimary: true },
    ],
    siblingIds: [],
    isHostel: false,
    feeBalance: 45600,
    attendancePercent: 72.1,
  },
];

export const feeInvoices: FeeInvoice[] = [
  {
    id: "inv-1001",
    studentId: "stu-001",
    studentName: "Ayesha Khan",
    className: "8-A",
    academicYear: "2025-26",
    term: "Term 1",
    components: [
      { id: "c1", name: "Tuition Fee", amount: 28000, type: "tuition" },
      { id: "c2", name: "Transport", amount: 8500, type: "transport" },
      { id: "c3", name: "Lab Fee", amount: 3500, type: "lab" },
    ],
    totalAmount: 40000,
    paidAmount: 27500,
    dueDate: "2026-04-15",
    status: "partial",
    lateFee: 0,
    discount: 0,
    lastPaymentDate: "2026-03-28",
  },
  {
    id: "inv-1002",
    studentId: "stu-002",
    studentName: "Hassan Ali",
    className: "9-B",
    academicYear: "2025-26",
    term: "Term 1",
    components: [
      { id: "c4", name: "Tuition Fee", amount: 32000, type: "tuition" },
      { id: "c5", name: "Transport", amount: 8500, type: "transport" },
    ],
    totalAmount: 40500,
    paidAmount: 40500,
    dueDate: "2026-04-15",
    status: "paid",
    lateFee: 0,
    discount: 0,
    lastPaymentDate: "2026-04-02",
    receiptNo: "RCP-88421",
  },
  {
    id: "inv-1003",
    studentId: "stu-003",
    studentName: "Zainab Raza",
    className: "7-A",
    academicYear: "2025-26",
    term: "Term 1",
    components: [
      { id: "c6", name: "Tuition Fee", amount: 26000, type: "tuition" },
      { id: "c7", name: "Hostel Fee", amount: 45000, type: "hostel" },
      { id: "c8", name: "Activity Fee", amount: 4000, type: "activity" },
    ],
    totalAmount: 75000,
    paidAmount: 40800,
    dueDate: "2026-03-31",
    status: "overdue",
    lateFee: 2500,
    discount: 5000,
    discountReason: "Sibling concession (partial)",
  },
  {
    id: "inv-1004",
    studentId: "stu-005",
    studentName: "Fatima Noor",
    className: "8-B",
    academicYear: "2025-26",
    term: "Term 1",
    components: [
      { id: "c9", name: "Tuition Fee", amount: 28000, type: "tuition" },
      { id: "c10", name: "Transport", amount: 8500, type: "transport" },
      { id: "c11", name: "Lab Fee", amount: 3500, type: "lab" },
    ],
    totalAmount: 40000,
    paidAmount: 0,
    dueDate: "2026-02-28",
    status: "overdue",
    lateFee: 5600,
    discount: 0,
  },
];

export const staff: StaffMember[] = [
  {
    id: "stf-01",
    employeeId: "EMP-001",
    name: "Dr. Sara Malik",
    role: "Principal",
    email: "sara.malik@school.edu",
    phone: "+92 300 1112233",
    status: "active",
    joiningDate: "2015-08-01",
    workloadHours: 20,
    classesAssigned: [],
  },
  {
    id: "stf-02",
    employeeId: "EMP-014",
    name: "Mr. Usman Sheikh",
    role: "Teacher",
    department: "Science",
    subjects: ["Physics", "Chemistry"],
    email: "usman.sheikh@school.edu",
    phone: "+92 321 4445566",
    status: "active",
    joiningDate: "2019-03-12",
    workloadHours: 28,
    classesAssigned: ["9-A", "9-B", "10-A"],
  },
  {
    id: "stf-03",
    employeeId: "EMP-022",
    name: "Ms. Hina Qureshi",
    role: "Teacher",
    department: "Mathematics",
    subjects: ["Mathematics"],
    email: "hina.qureshi@school.edu",
    phone: "+92 333 7778899",
    status: "on-leave",
    joiningDate: "2021-01-20",
    workloadHours: 24,
    classesAssigned: ["7-A", "8-A", "8-B"],
  },
  {
    id: "stf-04",
    employeeId: "EMP-008",
    name: "Mr. Khalid Mehmood",
    role: "Accountant",
    email: "khalid.mehmood@school.edu",
    phone: "+92 345 2223344",
    status: "active",
    joiningDate: "2017-06-01",
    workloadHours: 40,
    classesAssigned: [],
  },
];

export const exams: Exam[] = [
  {
    id: "ex-01",
    name: "Mid-Term Examination 2026",
    type: "mid-term",
    className: "All",
    startDate: "2026-05-12",
    endDate: "2026-05-23",
    status: "upcoming",
    subjects: [
      { name: "English", maxMarks: 100, date: "2026-05-12" },
      { name: "Mathematics", maxMarks: 100, date: "2026-05-14" },
      { name: "Science", maxMarks: 100, date: "2026-05-16" },
      { name: "Urdu", maxMarks: 75, date: "2026-05-19" },
      { name: "Islamiat", maxMarks: 50, date: "2026-05-21" },
    ],
  },
  {
    id: "ex-02",
    name: "Unit Test 3 – Class 10",
    type: "unit",
    className: "10",
    startDate: "2026-04-08",
    endDate: "2026-04-10",
    status: "completed",
    subjects: [
      { name: "Physics", maxMarks: 50, date: "2026-04-08" },
      { name: "Chemistry", maxMarks: 50, date: "2026-04-09" },
      { name: "Mathematics", maxMarks: 50, date: "2026-04-10" },
    ],
  },
];

export const dashboardStats = {
  totalStudents: 1248,
  activeStudents: 1189,
  totalStaff: 87,
  feeCollectedThisMonth: 4850000,
  feeOutstanding: 1240000,
  averageAttendance: 92.4,
  upcomingExams: 3,
  pendingSubstitutions: 2,
  overdueInvoices: 47,
  newAdmissionsThisMonth: 18,
};
