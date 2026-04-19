import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysBetween(a: string, b: string): number | null {
  const da = new Date(`${a}T12:00:00`);
  const db = new Date(`${b}T12:00:00`);
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return null;
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

interface ActivityState {
  /** ISO date YYYY-MM-DD of last Quran reading session */
  lastQuranDay: string | null;
  streakDays: number;
  /** Approximate minutes in Surah screen (incremented in coarse steps). */
  quranMinutesApprox: number;
  recordQuranSession: (minutes?: number) => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      lastQuranDay: null,
      streakDays: 0,
      quranMinutesApprox: 0,

      recordQuranSession: (minutes = 1) => {
        const today = ymd(new Date());
        const prev = get().lastQuranDay;
        let streak = get().streakDays;
        if (!prev) {
          streak = 1;
        } else if (prev === today) {
          /* same calendar day — streak unchanged */
        } else {
          const gap = daysBetween(prev, today);
          if (gap === 1) streak += 1;
          else streak = 1;
        }
        set({
          lastQuranDay: today,
          streakDays: streak,
          quranMinutesApprox: get().quranMinutesApprox + Math.max(0, Math.min(120, minutes)),
        });
      },
    }),
    {
      name: 'quran-activity',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
