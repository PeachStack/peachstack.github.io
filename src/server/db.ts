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
      target_role TEXT DEFAULT 'all',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
      estimated_hours REAL,
      actual_hours REAL,
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

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(sender_id) REFERENCES users(id),
      FOREIGN KEY(recipient_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS message_threads (
      id TEXT PRIMARY KEY,
      participant_one TEXT NOT NULL,
      participant_two TEXT NOT NULL,
      last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(participant_one) REFERENCES users(id),
      FOREIGN KEY(participant_two) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS message_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      role_filter TEXT,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS message_group_members (
      group_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(group_id, user_id),
      FOREIGN KEY(group_id) REFERENCES message_groups(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS group_messages (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(group_id) REFERENCES message_groups(id),
      FOREIGN KEY(sender_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS group_message_reads (
      group_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      last_read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(group_id, user_id),
      FOREIGN KEY(group_id) REFERENCES message_groups(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Add missing columns to existing tables (safe to run multiple times)
  try { await db.execute({ sql: "ALTER TABLE projects ADD COLUMN target_role TEXT DEFAULT 'all'", args: [] }); } catch { /* column already exists */ }
  try { await db.execute({ sql: "ALTER TABLE projects ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP", args: [] }); } catch { /* column already exists */ }
  try { await db.execute({ sql: "ALTER TABLE projects ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP", args: [] }); } catch { /* column already exists */ }
  try { await db.execute({ sql: "ALTER TABLE projects ADD COLUMN created_by TEXT", args: [] }); } catch { /* column already exists */ }
  try { await db.execute({ sql: "ALTER TABLE tasks ADD COLUMN estimated_hours REAL", args: [] }); } catch { /* column already exists */ }
  try { await db.execute({ sql: "ALTER TABLE tasks ADD COLUMN actual_hours REAL", args: [] }); } catch { /* column already exists */ }

  // Seed superadmin only when the account does not exist yet.
  // Skipping bcrypt on warm/cold restarts keeps startup fast.
  const adminCheck = await db.execute({
    sql: "SELECT id FROM users WHERE email = 'peachstackadmin@gmail.com' AND role = 'superadmin' AND is_active = 1",
    args: [],
  });
  if (adminCheck.rows.length === 0) {
    const bcrypt = await import('bcryptjs');
    const adminPassword = await bcrypt.default.hash(process.env.ADMIN_PASSWORD || 'PeachAdmin2026!', 12);
    await db.execute({
      sql: `INSERT OR REPLACE INTO users (id, email, password, role, name, is_active) VALUES ('admin-1', 'peachstackadmin@gmail.com', ?, 'superadmin', 'Peach Stack Admin', 1)`,
      args: [adminPassword],
    });
  }

  // Seed default platform settings
  await db.execute({
    sql: `INSERT OR IGNORE INTO platform_settings (key, value) VALUES ('allow_intern_to_intern_messaging', 'false')`,
    args: [],
  });
}
