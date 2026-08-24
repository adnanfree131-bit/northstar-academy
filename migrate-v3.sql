ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

UPDATE users SET status = 'active' WHERE status IS NULL OR status = '';
