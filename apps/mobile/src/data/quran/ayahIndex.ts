import type { QuranAyahBundle, QuranAyahRow } from './types';
import bundleJson from './ayahs.bundle.json';

const bundle = bundleJson as QuranAyahBundle;

/** First index in `bundle.ayahs` for each surah (1-indexed surah number). */
const surahStartIndex: number[] = (() => {
  const arr = new Array(115).fill(-1);
  bundle.ayahs.forEach((row, i) => {
    if (arr[row.surah] === -1) {
      arr[row.surah] = i;
    }
  });
  return arr;
})();

export function getAyahsForSurah(surahNumber: number): QuranAyahRow[] {
  if (surahNumber < 1 || surahNumber > 114) return [];
  const start = surahStartIndex[surahNumber];
  if (start === -1) return [];
  const out: QuranAyahRow[] = [];
  for (let i = start; i < bundle.ayahs.length; i++) {
    const row = bundle.ayahs[i];
    if (row.surah !== surahNumber) break;
    out.push(row);
  }
  return out;
}

export function getQuranBundleMeta(): Pick<QuranAyahBundle, 'bundleVersion' | 'builtAt' | 'sourceNote' | 'apiUrl' | 'verseCount'> {
  const { bundleVersion, builtAt, sourceNote, apiUrl, verseCount } = bundle;
  return { bundleVersion, builtAt, sourceNote, apiUrl, verseCount };
}

export function getAllAyahs(): QuranAyahRow[] {
  return bundle.ayahs;
}
