import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** yyyy-mm-dd → user marked fasting that Gregorian day (local). */
type FastingMap = Record<string, boolean>;

type State = {
  fastingByDate: FastingMap;
  quranPagesRamadan: number;
  taraweehRakats: number;
  /** User tracks last ten nights of Ramadan locally (1..10); not tied to moon sighting. */
  lastTenNights: boolean[];
  toggleFast: (isoDate: string) => void;
  setQuranPages: (n: number) => void;
  setTaraweeh: (n: number) => void;
  toggleLastTenNight: (index: number) => void;
};

export const useRamadanStore = create<State>()(
  persist(
    (set) => ({
      fastingByDate: {},
      quranPagesRamadan: 0,
      taraweehRakats: 0,
      lastTenNights: Array.from({ length: 10 }, () => false),
      toggleFast: (isoDate) =>
        set((s) => ({
          fastingByDate: { ...s.fastingByDate, [isoDate]: !s.fastingByDate[isoDate] },
        })),
      setQuranPages: (quranPagesRamadan) => set({ quranPagesRamadan }),
      setTaraweeh: (taraweehRakats) => set({ taraweehRakats }),
      toggleLastTenNight: (index) =>
        set((s) => {
          let base = s.lastTenNights;
          if (!Array.isArray(base) || base.length !== 10) {
            base = Array.from({ length: 10 }, () => false);
          } else {
            base = [...base];
          }
          if (index < 0 || index > 9) return { lastTenNights: base };
          base[index] = !base[index];
          return { lastTenNights: base };
        }),
    }),
    { name: 'quran-ramadan-local', storage: createJSONStorage(() => AsyncStorage) }
  )
);

export function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}
