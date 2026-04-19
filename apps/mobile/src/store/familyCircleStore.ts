import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FamilyMember = {
  id: string;
  name: string;
  /** Surahs marked read in the app (manual for non-self members). */
  surahsRead: number;
};

type State = {
  circleName: string;
  inviteCode: string;
  members: FamilyMember[];
  familyGoalSurahsRamadan: number;
  setCircleName: (n: string) => void;
  addMember: (name: string) => void;
  removeMember: (id: string) => void;
  setMemberSurahs: (id: string, n: number) => void;
  setFamilyGoal: (n: number) => void;
  regenerateInvite: () => void;
};

function randomCode(): string {
  const a = Math.floor(1000 + Math.random() * 9000);
  const b = Math.floor(1000 + Math.random() * 9000);
  return `${a}-${b}`;
}

export const useFamilyCircleStore = create<State>()(
  persist(
    (set, get) => ({
      circleName: '',
      inviteCode: randomCode(),
      members: [],
      familyGoalSurahsRamadan: 30,
      setCircleName: (circleName) => set({ circleName }),
      addMember: (name) => {
        const trimmed = name.trim();
        if (!trimmed || get().members.length >= 6) return;
        const id = `${Date.now()}`;
        set((s) => ({
          members: [...s.members, { id, name: trimmed, surahsRead: 0 }],
        }));
      },
      removeMember: (id) => set((s) => ({ members: s.members.filter((m) => m.id !== id) })),
      setMemberSurahs: (id, surahsRead) =>
        set((s) => ({
          members: s.members.map((m) => (m.id === id ? { ...m, surahsRead } : m)),
        })),
      setFamilyGoal: (familyGoalSurahsRamadan) => set({ familyGoalSurahsRamadan }),
      regenerateInvite: () => set({ inviteCode: randomCode() }),
    }),
    { name: 'quran-family-circle', storage: createJSONStorage(() => AsyncStorage) }
  )
);
