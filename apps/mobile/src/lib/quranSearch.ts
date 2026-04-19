import { SURAHS } from '../data/surahsMeta';
import type { Surah } from '../data/types';
import { getAllAyahs } from '../data/quran/ayahIndex';
import type { QuranAyahRow } from '../data/quran/types';
import { getAyahTranslationText } from '../data/quran/translationIndex';

const ALL_AYAHS: QuranAyahRow[] = getAllAyahs();

function normalizeArabic(s: string): string {
  try {
    return s.normalize('NFD').replace(/\p{M}+/gu, '').normalize('NFC').toLowerCase();
  } catch {
    return s.toLowerCase();
  }
}

function hasArabic(s: string): boolean {
  return /[\u0600-\u06FF]/.test(s);
}

export type QuranSearchHitSurah = { kind: 'surah'; surah: Surah };
export type QuranSearchHitAyah = { kind: 'ayah'; surah: number; ayah: number; preview: string };
export type QuranSearchHit = QuranSearchHitSurah | QuranSearchHitAyah;

export type QuranSearchSections = { surahs: Surah[]; ayahs: QuranSearchHitAyah[] };

/**
 * Search surah metadata, optional verse key (e.g. 2:255), and ayah Arabic / bundled translations.
 * Ayah scan runs for verse-key pattern, Arabic queries (2+ chars), or Latin/Cyrillic length ≥ 3.
 */
export function searchQuranSections(queryRaw: string, maxAyahs = 48): QuranSearchSections {
  const q = queryRaw.trim();
  const surahs: Surah[] = [];
  const ayahs: QuranSearchHitAyah[] = [];

  if (q.length < 2) {
    return { surahs, ayahs };
  }

  const qLower = q.toLocaleLowerCase('en-US');
  const qArNorm = normalizeArabic(q);

  const verseKey = /^\s*(\d{1,3})\s*[:：]\s*(\d{1,3})\s*$/u.exec(q);
  if (verseKey) {
    const sn = parseInt(verseKey[1], 10);
    const an = parseInt(verseKey[2], 10);
    if (sn >= 1 && sn <= 114) {
      const meta = SURAHS[sn - 1];
      if (meta && an >= 1 && an <= meta.ayahCount) {
        const row = ALL_AYAHS.find((a) => a.surah === sn && a.ayah === an);
        if (row) {
          ayahs.push({
            kind: 'ayah',
            surah: sn,
            ayah: an,
            preview: row.text.length > 100 ? `${row.text.slice(0, 100)}…` : row.text,
          });
        }
      }
    }
    if (ayahs.length > 0) {
      return { surahs, ayahs };
    }
  }

  for (const s of SURAHS) {
    if (
      s.nameRu.toLowerCase().includes(qLower) ||
      s.nameEn.toLowerCase().includes(qLower) ||
      s.nameTranslit.toLowerCase().includes(qLower) ||
      String(s.number) === q ||
      String(s.number).includes(q)
    ) {
      surahs.push(s);
    }
  }

  const scanAyahs =
    q.length >= 3 || (hasArabic(q) && qArNorm.replace(/\s+/g, '').length >= 2);

  if (!scanAyahs) {
    return { surahs, ayahs };
  }

  let count = 0;
  for (const row of ALL_AYAHS) {
    if (count >= maxAyahs) break;
    const arN = normalizeArabic(row.text);
    const kul = getAyahTranslationText(row.surah, row.ayah, 'kuliev');
    const sah = getAyahTranslationText(row.surah, row.ayah, 'sahih');
    const kulL = kul ? kul.toLocaleLowerCase('ru-RU') : '';
    const sahL = sah ? sah.toLocaleLowerCase('en-US') : '';
    const matchAr = hasArabic(q) && arN.includes(qArNorm);
    const matchRu = kulL.includes(qLower);
    const matchEn = sahL.includes(qLower);
    if (matchAr || matchRu || matchEn) {
      let preview = row.text;
      if (matchRu && kul) preview = kul;
      else if (matchEn && sah) preview = sah;
      preview = preview.length > 140 ? `${preview.slice(0, 140)}…` : preview;
      ayahs.push({ kind: 'ayah', surah: row.surah, ayah: row.ayah, preview });
      count++;
    }
  }

  return { surahs, ayahs };
}
