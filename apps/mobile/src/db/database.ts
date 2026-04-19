import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openAndMigrate();
  }
  return dbPromise;
}

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('quranheart.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      surah INTEGER NOT NULL,
      ayah INTEGER NOT NULL,
      color TEXT NOT NULL DEFAULT 'gold',
      created_at INTEGER NOT NULL,
      UNIQUE(surah, ayah)
    );
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      surah INTEGER NOT NULL,
      ayah INTEGER NOT NULL,
      body TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ayah_memorization (
      surah INTEGER NOT NULL,
      ayah INTEGER NOT NULL,
      ease REAL NOT NULL DEFAULT 2.5,
      interval_days REAL NOT NULL DEFAULT 0,
      repetitions INTEGER NOT NULL DEFAULT 0,
      due_at INTEGER NOT NULL,
      lapses INTEGER NOT NULL DEFAULT 0,
      last_grade INTEGER,
      PRIMARY KEY (surah, ayah)
    );
    CREATE INDEX IF NOT EXISTS idx_notes_surah ON notes(surah, ayah);
    CREATE INDEX IF NOT EXISTS idx_memo_due ON ayah_memorization(due_at);
  `);
  return db;
}
