import { getAllAyahs } from './ayahIndex';
import type { QuranAyahRow } from './types';

/** Consecutive ayahs from the mushaf order (may span surahs). */
export function getAyahChain(startSurah: number, startAyah: number, count: number): QuranAyahRow[] {
  const all = getAllAyahs();
  const idx = all.findIndex((a) => a.surah === startSurah && a.ayah === startAyah);
  if (idx < 0) return [];
  return all.slice(idx, idx + Math.max(1, count));
}
