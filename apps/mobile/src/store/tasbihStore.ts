import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TasbihSessionRow = {
  id: string;
  at: number;
  /** i18n preset id or 'custom' */
  presetId: string;
  target: number;
  /** Optional user note (Latin/Cyrillic), not sacred text */
  phraseNote?: string;
};

const MAX_SESSIONS = 24;

interface TasbihState {
  sessions: TasbihSessionRow[];
  recordCompletedCycle: (presetId: string, target: number, phraseNote?: string) => void;
}

export const useTasbihStore = create<TasbihState>()(
  persist(
    (set, get) => ({
      sessions: [],
      recordCompletedCycle: (presetId, target, phraseNote) => {
        const row: TasbihSessionRow = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          at: Date.now(),
          presetId,
          target,
          phraseNote: phraseNote?.trim() || undefined,
        };
        const next = [row, ...get().sessions].slice(0, MAX_SESSIONS);
        set({ sessions: next });
      },
    }),
    { name: 'quran-tasbih-sessions', storage: createJSONStorage(() => AsyncStorage) }
  )
);
