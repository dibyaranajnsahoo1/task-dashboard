import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import app from './app';
import { initDb } from './db/database';
import { runMigrations } from './db/migrate';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

async function start(): Promise<void> {
  // Ensure the data directory exists for the database file
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Initialize the WASM SQLite engine, then run schema migrations
  await initDb();
  runMigrations();

  app.listen(PORT, () => {
    console.log(`✅  Server running at http://localhost:${PORT}`);
    console.log(`🔍  Health:  GET http://localhost:${PORT}/health`);
    console.log(`📋  Tasks:   GET http://localhost:${PORT}/tasks`);
  });
}

start().catch((err: unknown) => {
  console.error('❌  Failed to start server:', err);
  process.exit(1);
});
