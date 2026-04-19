/** One ayah row in the bundled Uthmani corpus (see ayahs.bundle.json). */
export interface QuranAyahRow {
  surah: number;
  ayah: number;
  text: string;
}

export interface QuranAyahBundle {
  bundleVersion: number;
  builtAt: string;
  sourceNote: string;
  apiUrl: string;
  verseCount: number;
  ayahs: QuranAyahRow[];
}
