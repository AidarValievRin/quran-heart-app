import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReadingProgressState {
  lastSurahId: number;
  lastAyah: number;
  setReadingPosition: (surahId: number, ayah: number) => void;
}

export const useReadingProgressStore = create<ReadingProgressState>()(
  persist(
    (set) => ({
      /** 0 = not set (avoid showing “resume” before the user opens a surah). */
      lastSurahId: 0,
      lastAyah: 0,
      setReadingPosition: (lastSurahId, lastAyah) => set({ lastSurahId, lastAyah }),
    }),
    {
      name: 'quran-reading-progress',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
