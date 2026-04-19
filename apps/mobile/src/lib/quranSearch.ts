import { SURAHS } from '../data/surahsMeta';
import type { Surah } from '../data/types';
import { getAllAyahs } from '../data/quran/ayahIndex';
import type { QuranAyahRow } from '../data/quran/types';
import { getAyahTranslationText } from '../data/quran/translationIndex';

const ALL_AYAHS: QuranAyahRow[] = getAllAyahs();

/**
 * Russian/Kazakh transliterations of surah names (by surah id).
 * Users in post-Soviet countries know surahs by these names.
 */
const SURAH_TRANSLIT_RU: Record<number, string> = {
  1: 'фатиха', 2: 'бакара', 3: 'али имран', 4: 'ниса', 5: 'маида',
  6: 'анам', 7: 'аараф', 8: 'анфаль', 9: 'тауба', 10: 'юнус',
  11: 'худ', 12: 'юсуф', 13: 'раад', 14: 'ибрахим', 15: 'хиджр',
  16: 'нахль', 17: 'исра', 18: 'кахф', 19: 'марьям', 20: 'таха',
  21: 'анбия', 22: 'хадж', 23: 'муминун', 24: 'нур', 25: 'фуркан',
  26: 'шуара', 27: 'намль', 28: 'касас', 29: 'анкабут', 30: 'рум',
  31: 'лукман', 32: 'саджда', 33: 'ахзаб', 34: 'саба', 35: 'фатыр',
  36: 'ясин', 37: 'саффат', 38: 'сад', 39: 'зумар', 40: 'гафир',
  41: 'фуссилат', 42: 'шура', 43: 'зухруф', 44: 'духан', 45: 'джасия',
  46: 'ахкаф', 47: 'мухаммад', 48: 'фатх', 49: 'худжурат', 50: 'каф',
  51: 'зарият', 52: 'тур', 53: 'наджм', 54: 'камар', 55: 'рахман',
  56: 'вакиа', 57: 'хадид', 58: 'муджадала', 59: 'хашр', 60: 'мумтахина',
  61: 'саф', 62: 'джумуа', 63: 'мунафикун', 64: 'тагабун', 65: 'талак',
  66: 'тахрим', 67: 'мульк', 68: 'калам', 69: 'хакка', 70: 'маариж',
  71: 'нух', 72: 'джинн', 73: 'муззаммиль', 74: 'муддассир', 75: 'кыяма',
  76: 'инсан', 77: 'мурсалат', 78: 'наба', 79: 'назиат', 80: 'абаса',
  81: 'таквир', 82: 'инфитар', 83: 'мутаффифин', 84: 'иншикак', 85: 'бурудж',
  86: 'тарик', 87: 'аля', 88: 'гашия', 89: 'фаджр', 90: 'балад',
  91: 'шамс', 92: 'лейль', 93: 'духа', 94: 'шарх', 95: 'тин',
  96: 'алак', 97: 'кадр', 98: 'баийина', 99: 'зилзала', 100: 'адият',
  101: 'кариа', 102: 'такасур', 103: 'аср', 104: 'хумаза', 105: 'филь',
  106: 'курайш', 107: 'маун', 108: 'каусар', 109: 'кафирун', 110: 'наср',
  111: 'масад', 112: 'ихлас', 113: 'фалак', 114: 'нас',
};

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

  const qArNormClean = qArNorm.replace(/\s+/g, '');
  for (const s of SURAHS) {
    const translit = SURAH_TRANSLIT_RU[s.id] ?? '';
    const arNorm = normalizeArabic(s.nameAr).replace(/\s+/g, '');
    const matchAr = hasArabic(q) && arNorm.includes(qArNormClean);
    const matchTranslit = translit.includes(qLower);
    if (
      matchAr ||
      matchTranslit ||
      s.nameRu.toLowerCase().includes(qLower) ||
      s.nameEn.toLowerCase().includes(qLower) ||
      s.nameTranslit.toLowerCase().includes(qLower) ||
      String(s.number) === q
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
