import { getDatabase } from './database';

export interface NoteRow {
  id: number;
  surah: number;
  ayah: number;
  body: string;
  updated_at: number;
}

export async function listNotes(): Promise<NoteRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<NoteRow>(
    'SELECT id, surah, ayah, body, updated_at FROM notes ORDER BY updated_at DESC'
  );
}

export async function getNoteForAyah(surah: number, ayah: number): Promise<NoteRow | null> {
  const db = await getDatabase();
  return db.getFirstAsync<NoteRow>(
    'SELECT id, surah, ayah, body, updated_at FROM notes WHERE surah = ? AND ayah = ? ORDER BY updated_at DESC LIMIT 1',
    [surah, ayah]
  );
}

export async function saveNote(surah: number, ayah: number, body: string): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    'INSERT INTO notes (surah, ayah, body, updated_at) VALUES (?, ?, ?, ?)',
    [surah, ayah, body.trim(), now]
  );
}

export async function deleteNote(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
}
