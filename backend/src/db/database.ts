import initSqlJs from 'sql.js';
import type { Database, SqlJsStatic } from 'sql.js';
import path from 'path';
import fs from 'fs';

const isTest = process.env.NODE_ENV === 'test';
const DB_PATH = path.resolve(__dirname, '../../data/tasks.db');

let sqlJs: SqlJsStatic;
let rawDb: Database;

/**
 * A thin wrapper that exposes a better-sqlite3-compatible synchronous API
 * over sql.js — a WASM port of SQLite requiring zero native compilation.
 *
 * Why sql.js instead of better-sqlite3?
 * better-sqlite3 requires compiling a native C++ addon via node-gyp,
 * which needs the Windows SDK. sql.js uses WebAssembly and works on
 * every platform without any build tools.
 */
export class DbWrapper {
  constructor(private readonly db: Database) {}

  /** Run one or more SQL statements — used by migrations. */
  exec(sql: string): void {
    this.db.exec(sql);
    this.persist();
  }

  pragma(str: string): void {
    this.db.run(`PRAGMA ${str}`);
  }

  /** Returns a statement-like object with get / all / run — matches better-sqlite3 API. */
  prepare(sql: string) {
    const db = this.db;
    const self = this;

    return {
      get(...params: unknown[]): Record<string, unknown> | undefined {
        const stmt = db.prepare(sql);
        stmt.bind(params as (string | number | null | Uint8Array)[]);
        const hasRow = stmt.step();
        const row = hasRow
          ? ({ ...stmt.getAsObject() } as Record<string, unknown>)
          : undefined;
        stmt.free();
        return row;
      },

      all(...params: unknown[]): Record<string, unknown>[] {
        const stmt = db.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params as (string | number | null | Uint8Array)[]);
        }
        const rows: Record<string, unknown>[] = [];
        while (stmt.step()) {
          rows.push({ ...stmt.getAsObject() } as Record<string, unknown>);
        }
        stmt.free();
        return rows;
      },

      run(...params: unknown[]): { lastInsertRowid: number } {
        db.run(sql, params as (string | number | null | Uint8Array)[]);
        const res = db.exec('SELECT last_insert_rowid()');
        const rowid = (res[0]?.values[0]?.[0] as number) ?? 0;
        self.persist();
        return { lastInsertRowid: rowid };
      },
    };
  }

  /** Save in-memory database to disk. No-op during tests. */
  private persist(): void {
    if (isTest) return;
    const data = this.db.export();
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

let wrapper: DbWrapper;

/**
 * Initialise the WASM SQLite engine and open the database.
 * Must be awaited before any db access.
 */
export async function initDb(): Promise<void> {
  sqlJs = await initSqlJs({
    locateFile: (file: string) =>
      path.resolve(__dirname, '../../node_modules/sql.js/dist/', file),
  });

  let rawDatabase: Database;

  if (!isTest && fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    rawDatabase = new sqlJs.Database(fileBuffer);
  } else {
    rawDatabase = new sqlJs.Database();
  }

  rawDb = rawDatabase;
  wrapper = new DbWrapper(rawDb);
}

/** Returns the database wrapper. Throws if initDb() has not been called. */
export function getDb(): DbWrapper {
  if (!wrapper) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return wrapper;
}

/** Closes the database — used in tests to isolate between test files. */
export function resetDb(): void {
  if (rawDb) {
    rawDb.close();
    rawDb = undefined as unknown as Database;
    wrapper = undefined as unknown as DbWrapper;
  }
}
