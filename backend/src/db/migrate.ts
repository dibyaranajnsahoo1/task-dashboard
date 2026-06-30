import { getDb } from './database';

/**
 * Runs all schema migrations on startup.
 * Uses IF NOT EXISTS so it is safe to run every time the server starts.
 * Reviewers do not need to set up the database manually.
 */
export function runMigrations(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id                 TEXT    PRIMARY KEY,
      title              TEXT    NOT NULL,
      description        TEXT    NOT NULL DEFAULT '',
      priority           TEXT    NOT NULL DEFAULT 'Medium'
                                 CHECK(priority IN ('Low', 'Medium', 'High')),
      status             TEXT    NOT NULL DEFAULT 'To Do'
                                 CHECK(status IN ('To Do', 'In Progress', 'Done')),
      due_date           TEXT,
      assignee_name      TEXT,
      assignee_initials  TEXT,
      tags               TEXT    NOT NULL DEFAULT '[]',
      created_by         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at         TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at         TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_status   ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
  `);
}
