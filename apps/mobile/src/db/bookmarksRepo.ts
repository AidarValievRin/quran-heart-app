import { getDatabase } from './database';

export type BookmarkColor = 'gold' | 'green' | 'blue' | 'rose';

export interface BookmarkRow {
  id: number;
  surah: number;
  ayah: number;
  color: string;
  created_at: number;
}

export async function listBookmarks(): Promise<BookmarkRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<BookmarkRow>(
    'SELECT id, surah, ayah, color, created_at FROM bookmarks ORDER BY surah, ayah'
  );
}

export async function getBookmark(surah: number, ayah: number): Promise<BookmarkRow | null> {
  const db = await getDatabase();
  return db.getFirstAsync<BookmarkRow>(
    'SELECT id, surah, ayah, color, created_at FROM bookmarks WHERE surah = ? AND ayah = ?',
    [surah, ayah]
  );
}

export async function upsertBookmark(surah: number, ayah: number, color: BookmarkColor): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO bookmarks (surah, ayah, color, created_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(surah, ayah) DO UPDATE SET color = excluded.color`,
    [surah, ayah, color, now]
  );
}

export async function removeBookmark(surah: number, ayah: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM bookmarks WHERE surah = ? AND ayah = ?', [surah, ayah]);
}
