import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '../theme/types';

/** Quran translation for ayah text (bundled JSON). */
export type QuranTranslationSlug = 'none' | 'kuliev' | 'sahih';

export type ReaderSlug = 'mishari';

/** Prayer calculation preset (maps to `adhan` CalculationMethod). */
export type PrayerMethodId =
  | 'mwl'
  | 'isna'
  | 'egypt'
  | 'umm_al_qura'
  | 'tehran'
  | 'karachi'
  | 'moon_sighting';

export type PrayerMadhabId = 'shafi' | 'hanafi';

interface SettingsState {
  onboardingCompleted: boolean;
  interfaceLang: 'ru' | 'en';
  quranTranslation: QuranTranslationSlug;
  reader: ReaderSlug;
  intentionText: string;
  themePreference: ThemePreference;
  prayerMethod: PrayerMethodId;
  prayerMadhab: PrayerMadhabId;
  /** Last saved coordinates; null until user sets location or uses GPS */
  prayerLatitude: number | null;
  prayerLongitude: number | null;
  /** Optional display name on profile (Latin / Cyrillic; not used for auth). */
  profileDisplayName: string;
  /** 0–7: geometric ornament preset for profile avatar. */
  profileOrnamentId: number;
  setOnboardingCompleted: (v: boolean) => void;
  setInterfaceLang: (lang: 'ru' | 'en') => void;
  setQuranTranslation: (slug: QuranTranslationSlug) => void;
  setReader: (r: ReaderSlug) => void;
  setIntentionText: (t: string) => void;
  setThemePreference: (p: ThemePreference) => void;
  setPrayerMethod: (m: PrayerMethodId) => void;
  setPrayerMadhab: (m: PrayerMadhabId) => void;
  setPrayerCoordinates: (lat: number, lon: number) => void;
  setProfileDisplayName: (name: string) => void;
  setProfileOrnamentId: (id: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      onboardingCompleted: false,
      interfaceLang: 'ru',
      quranTranslation: 'sahih',
      reader: 'mishari',
      intentionText: '',
      themePreference: 'system',
      prayerMethod: 'mwl',
      prayerMadhab: 'shafi',
      prayerLatitude: 55.7558,
      prayerLongitude: 37.6173,
      profileDisplayName: '',
      profileOrnamentId: 0,
      setOnboardingCompleted: (onboardingCompleted) => set({ onboardingCompleted }),
      setInterfaceLang: (interfaceLang) => set({ interfaceLang }),
      setQuranTranslation: (quranTranslation) => set({ quranTranslation }),
      setReader: (reader) => set({ reader }),
      setIntentionText: (intentionText) => set({ intentionText }),
      setThemePreference: (themePreference) => set({ themePreference }),
      setPrayerMethod: (prayerMethod) => set({ prayerMethod }),
      setPrayerMadhab: (prayerMadhab) => set({ prayerMadhab }),
      setPrayerCoordinates: (prayerLatitude, prayerLongitude) => set({ prayerLatitude, prayerLongitude }),
      setProfileDisplayName: (profileDisplayName) => set({ profileDisplayName }),
      setProfileOrnamentId: (profileOrnamentId) =>
        set({ profileOrnamentId: Math.max(0, Math.min(7, Math.floor(profileOrnamentId))) }),
    }),
    {
      name: 'quran-settings',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      // Old persisted state may lack newer fields (e.g. profileDisplayName).
      // Merge with current defaults so destructured values are never undefined.
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<SettingsState> | null | undefined ?? {}),
      }),
    }
  )
);
