/**
 * Short routine rows: open verified Qur'an text in-app only (surah/ayah).
 * Not a replacement for Hisn al-Muslim — full catalog pending scholar review (ROADMAP 4.4).
 */
export type AdhkarRoutinePeriod = 'morning' | 'evening';

export interface AdhkarRoutineItem {
  id: string;
  period: AdhkarRoutinePeriod;
  /** i18n key under tools.adhkar.routine */
  titleKey: string;
  surah: number;
  ayah?: number;
  repeats: number;
}

export const ADHKAR_ROUTINE_ITEMS: AdhkarRoutineItem[] = [
  { id: 'm_fatiha', period: 'morning', titleKey: 'm_fatiha', surah: 1, repeats: 1 },
  { id: 'm_bakara_last', period: 'morning', titleKey: 'm_bakara_last', surah: 2, ayah: 285, repeats: 1 },
  { id: 'm_ikhlas', period: 'morning', titleKey: 'm_ikhlas', surah: 112, repeats: 3 },
  { id: 'e_ikhlas', period: 'evening', titleKey: 'e_ikhlas', surah: 112, repeats: 3 },
  { id: 'e_falaq', period: 'evening', titleKey: 'e_falaq', surah: 113, repeats: 3 },
  { id: 'e_nas', period: 'evening', titleKey: 'e_nas', surah: 114, repeats: 3 },
];
