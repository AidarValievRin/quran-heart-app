import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface State {
  /** yyyy-mm-dd → set of routine item ids marked "read today" */
  doneIdsByDate: Record<string, string[]>;
  /** yyyy-mm-dd → itemId → how many repetitions logged today (for repeats > 1) */
  readsByDate: Record<string, Record<string, number>>;
  toggleDoneToday: (itemId: string) => void;
  isDoneToday: (itemId: string) => boolean;
  incrementReadToday: (itemId: string, cap: number) => void;
  readCountToday: (itemId: string) => number;
}

export const useAdhkarDailyStore = create<State>()(
  persist(
    (set, get) => ({
      doneIdsByDate: {},
      readsByDate: {},
      toggleDoneToday: (itemId) => {
        const day = ymd(new Date());
        const cur = get().doneIdsByDate[day] ?? [];
        const has = cur.includes(itemId);
        const nextList = has ? cur.filter((x) => x !== itemId) : [...cur, itemId];
        set({
          doneIdsByDate: { ...get().doneIdsByDate, [day]: nextList },
        });
      },
      isDoneToday: (itemId) => {
        const day = ymd(new Date());
        return (get().doneIdsByDate[day] ?? []).includes(itemId);
      },
      incrementReadToday: (itemId, cap) => {
        const day = ymd(new Date());
        const dayReads = { ...(get().readsByDate[day] ?? {}) };
        const prev = dayReads[itemId] ?? 0;
        const next = Math.min(cap, prev + 1);
        dayReads[itemId] = next;
        const done = get().doneIdsByDate[day] ?? [];
        const doneSet = new Set(done);
        if (next >= cap) doneSet.add(itemId);
        set({
          readsByDate: { ...get().readsByDate, [day]: dayReads },
          doneIdsByDate: { ...get().doneIdsByDate, [day]: [...doneSet] },
        });
      },
      readCountToday: (itemId) => {
        const day = ymd(new Date());
        return (get().readsByDate[day] ?? {})[itemId] ?? 0;
      },
    }),
    { name: 'quran-adhkar-daily', storage: createJSONStorage(() => AsyncStorage) }
  )
);
