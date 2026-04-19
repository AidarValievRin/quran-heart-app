/**
 * Simplified SM-2 spaced repetition for ayah cards (ROADMAP 2.1).
 * Grades: 0 = forgot, 1 = hard, 2 = good, 3 = easy (mapped from UI).
 */

export interface MemorizationRow {
  surah: number;
  ayah: number;
  ease: number;
  interval_days: number;
  repetitions: number;
  due_at: number;
  lapses: number;
  last_grade: number | null;
}

const MS_PER_DAY = 86400000;

export function scheduleAfterReview(
  prev: MemorizationRow | null,
  grade: 0 | 1 | 2 | 3,
  now: number = Date.now()
): Omit<MemorizationRow, 'surah' | 'ayah'> {
  if (!prev) {
    if (grade === 0) {
      return {
        ease: 2.5,
        interval_days: 0,
        repetitions: 0,
        due_at: now + 10 * 60 * 1000,
        lapses: 1,
        last_grade: grade,
      };
    }
    return {
      ease: 2.5,
      interval_days: 1,
      repetitions: 1,
      due_at: now + MS_PER_DAY,
      lapses: 0,
      last_grade: grade,
    };
  }

  let ease = prev.ease;
  let reps = prev.repetitions;
  let lapses = prev.lapses;
  let interval = prev.interval_days;

  if (grade === 0) {
    reps = 0;
    lapses += 1;
    ease = Math.max(1.3, ease - 0.2);
    interval = 0;
    const due_at = now + 10 * 60 * 1000;
    return { ease, interval_days: interval, repetitions: reps, due_at, lapses, last_grade: grade };
  }

  if (reps === 0) interval = 1;
  else if (reps === 1) interval = 6;
  else interval = Math.round(interval * ease);

  if (grade === 1) {
    ease = Math.max(1.3, ease - 0.15);
    interval = Math.max(1, Math.round(interval * 0.85));
  } else if (grade === 3) {
    ease += 0.15;
    interval = Math.round(interval * 1.3);
  }

  reps += 1;
  const due_at = now + Math.max(1, Math.round(interval)) * MS_PER_DAY;

  return {
    ease,
    interval_days: interval,
    repetitions: reps,
    due_at,
    lapses,
    last_grade: grade,
  };
}
