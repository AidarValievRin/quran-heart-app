import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SurahStatus, SurahProgress } from '../data/types';

interface ProgressState {
  progress: Record<number, SurahProgress>;
  setSurahStatus: (surahId: number, status: SurahStatus) => void;
  markAyahMemorized: (surahId: number, ayahNumber: number) => void;
  getSurahProgress: (surahId: number) => SurahProgress;
  totalMemorizedAyahs: () => number;
  totalReadSurahs: () => number;
}

const defaultProgress = (surahId: number): SurahProgress => ({
  surahId,
  status: 'unread',
  memorizedAyahs: [],
});

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: {},

      setSurahStatus: (surahId, status) => {
        set((state) => ({
          progress: {
            ...state.progress,
            [surahId]: {
              ...defaultProgress(surahId),
              ...state.progress[surahId],
              status,
              startedAt: state.progress[surahId]?.startedAt ?? Date.now(),
              lastReadAt: Date.now(),
            },
          },
        }));
      },

      markAyahMemorized: (surahId, ayahNumber) => {
        set((state) => {
          const current = state.progress[surahId] ?? defaultProgress(surahId);
          const already = current.memorizedAyahs.includes(ayahNumber);
          return {
            progress: {
              ...state.progress,
              [surahId]: {
                ...current,
                memorizedAyahs: already
                  ? current.memorizedAyahs.filter((n) => n !== ayahNumber)
                  : [...current.memorizedAyahs, ayahNumber],
              },
            },
          };
        });
      },

      getSurahProgress: (surahId) => {
        return get().progress[surahId] ?? defaultProgress(surahId);
      },

      totalMemorizedAyahs: () => {
        return Object.values(get().progress).reduce(
          (sum, p) => sum + p.memorizedAyahs.length,
          0
        );
      },

      totalReadSurahs: () => {
        return Object.values(get().progress).filter(
          (p) => p.status !== 'unread'
        ).length;
      },
    }),
    {
      name: 'quran-progress',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
