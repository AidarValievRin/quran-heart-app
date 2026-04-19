export type RevelationPlace = 'meccan' | 'medinan';

export type SurahStatus =
  | 'unread'
  | 'read'
  | 'studying'
  | 'memorizing'
  | 'memorized'
  | 'reviewing';

export interface Surah {
  id: number;        // 1–114
  number: number;    // same as id, 1-indexed
  nameAr: string;
  nameTranslit: string;
  nameTranslitRu: string;
  nameRu: string;
  nameEn: string;
  revelationPlace: RevelationPlace;
  revelationOrder: number;
  ayahCount: number;
  juzStart: number;
  juzEnd: number;
}

export interface Ayah {
  id: string;           // "1:1", "2:255" etc.
  surahNumber: number;
  ayahNumber: number;
  textUthmani: string;  // Sacred Quranic text — verified against Tanzil.net
  juz: number;
  page: number;
  ruku: number;
}

export interface Translation {
  ayahId: string;
  slug: string;       // 'kuliev', 'sahih', 'osmanov'
  text: string;
}

export interface SurahProgress {
  surahId: number;
  status: SurahStatus;
  startedAt?: number;
  lastReadAt?: number;
  memorizedAyahs: number[];
}
