CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  student_id TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  section TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  marked_by TEXT NOT NULL,
  UNIQUE(student_id, date)
);

CREATE TABLE IF NOT EXISTS exam_marks (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  marks REAL,
  max_marks INTEGER NOT NULL,
  absent INTEGER NOT NULL DEFAULT 0,
  grace INTEGER NOT NULL DEFAULT 0,
  UNIQUE(exam_id, student_id, subject)
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL,
  receipt_no TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO app_settings (key, value) VALUES
('academic_year', '2025-26'),
('rolled_over', '0');

-- password for all demo users is: northstar
INSERT OR REPLACE INTO users (id, email, password_hash, name, role, student_id) VALUES
('usr-principal','principal@northstar.edu','634c994592e182e3666815b60e7cec0eece3c758f4026146d0ed6762c4a6abc0','Dr. Sara Malik','principal',NULL),
('usr-teacher','teacher@northstar.edu','634c994592e182e3666815b60e7cec0eece3c758f4026146d0ed6762c4a6abc0','Mr. Usman Sheikh','teacher',NULL),
('usr-accounts','accounts@northstar.edu','634c994592e182e3666815b60e7cec0eece3c758f4026146d0ed6762c4a6abc0','Mr. Khalid Mehmood','accountant',NULL),
('usr-parent','parent@northstar.edu','634c994592e182e3666815b60e7cec0eece3c758f4026146d0ed6762c4a6abc0','Imran Khan','parent','stu-001');
