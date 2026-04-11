import { createClient } from '@libsql/client';

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN env vars');
}

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function initDb() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'employer', 'admin', 'superadmin')),
      name TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      token_version INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      user_id TEXT PRIMARY KEY,
      university TEXT,
      major TEXT,
      minor TEXT,
      year TEXT,
      skills TEXT,
      bio TEXT,
      profile_picture_url TEXT,
      badges_earned TEXT,
      cohort TEXT,
      intern_role TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'alumni', 'removed')),
      points_total INTEGER DEFAULT 0,
      notes TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS employer_profiles (
      user_id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      industry TEXT,
      company_size TEXT,
      description TEXT,
      logo_url TEXT,
      contact_person TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS contact_submissions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'unread' CHECK(status IN ('unread', 'read'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      employer_id TEXT NOT NULL,
      skills_required TEXT,
      status TEXT DEFAULT 'open' CHECK(status IN ('open', 'closed', 'in-progress')),
      deadline DATETIME,
      compensation TEXT,
      FOREIGN KEY(employer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      project_id TEXT,
      created_by TEXT NOT NULL,
      assigned_to TEXT,
      assigned_role TEXT,
      status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'in_review', 'completed', 'blocked')),
      priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
      task_type TEXT DEFAULT 'regular' CHECK(task_type IN ('regular', 'challenge')),
      due_date DATETIME,
      points INTEGER DEFAULT 10,
      tags TEXT,
      submission_url TEXT,
      submission_note TEXT,
      admin_feedback TEXT,
      admin_score INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY(created_by) REFERENCES users(id),
      FOREIGN KEY(assigned_to) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS task_comments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(task_id) REFERENCES tasks(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS task_activity_log (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(task_id) REFERENCES tasks(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      event_date TEXT NOT NULL,
      event_time TEXT,
      target_role TEXT DEFAULT 'all',
      target_user_id TEXT,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('task_assigned','task_reviewed','event_added','challenge_posted','account_created')),
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS security_log (
      id TEXT PRIMARY KEY,
      email TEXT,
      ip_address TEXT,
      event TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed superadmin unconditionally on every boot
  const bcrypt = await import('bcryptjs');
  const adminPassword = await bcrypt.default.hash(process.env.ADMIN_PASSWORD || 'PeachAdmin2026!', 12);
  await db.execute({
    sql: `INSERT OR IGNORE INTO users (id, email, password, role, name) VALUES ('admin-1', 'peachstackadmin@gmail.com', ?, 'superadmin', 'Peachstack Admin')`,
    args: [adminPassword],
  });
  await db.execute({
    sql: `UPDATE users SET password = ?, role = 'superadmin', is_active = 1 WHERE email = 'peachstackadmin@gmail.com'`,
    args: [adminPassword],
  });
}
