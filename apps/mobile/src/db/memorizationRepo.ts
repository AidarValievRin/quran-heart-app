import { getDatabase } from './database';
import type { MemorizationRow } from '../lib/sm2';
import { scheduleAfterReview } from '../lib/sm2';

/** First tap «заучивание» — create row due now so it appears in the queue. */
export async function seedMemorizationIfAbsent(surah: number, ayah: number): Promise<void> {
  const existing = await getMemorization(surah, ayah);
  if (existing) return;
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO ayah_memorization (surah, ayah, ease, interval_days, repetitions, due_at, lapses, last_grade)
     VALUES (?, ?, 2.5, 0, 0, ?, 0, NULL)`,
    [surah, ayah, now]
  );
}

export async function getMemorization(surah: number, ayah: number): Promise<MemorizationRow | null> {
  const db = await getDatabase();
  return db.getFirstAsync<MemorizationRow>(
    'SELECT surah, ayah, ease, interval_days, repetitions, due_at, lapses, last_grade FROM ayah_memorization WHERE surah = ? AND ayah = ?',
    [surah, ayah]
  );
}

export async function upsertAfterGrade(
  surah: number,
  ayah: number,
  grade: 0 | 1 | 2 | 3,
  now: number = Date.now()
): Promise<void> {
  const db = await getDatabase();
  const prev = await getMemorization(surah, ayah);
  const next = scheduleAfterReview(prev, grade, now);
  await db.runAsync(
    `INSERT INTO ayah_memorization (surah, ayah, ease, interval_days, repetitions, due_at, lapses, last_grade)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(surah, ayah) DO UPDATE SET
       ease = excluded.ease,
       interval_days = excluded.interval_days,
       repetitions = excluded.repetitions,
       due_at = excluded.due_at,
       lapses = excluded.lapses,
       last_grade = excluded.last_grade`,
    [
      surah,
      ayah,
      next.ease,
      next.interval_days,
      next.repetitions,
      next.due_at,
      next.lapses,
      next.last_grade,
    ]
  );
}

export async function listDueAyahs(before: number = Date.now(), limit = 50): Promise<MemorizationRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<MemorizationRow>(
    'SELECT surah, ayah, ease, interval_days, repetitions, due_at, lapses, last_grade FROM ayah_memorization WHERE due_at <= ? ORDER BY due_at ASC LIMIT ?',
    [before, limit]
  );
}
