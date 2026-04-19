/**
 * Builds apps/mobile/src/data/quran/ayahTranslitLatin.search.json for offline ayah transliteration search.
 * Map key: "surah:ayah" → Latin string (Quran.com word transliterations joined).
 *
 * Run from repo root: node tools/build-ayah-translit-search.mjs
 * Respect Quran.com API rate limits; sequential requests.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'apps', 'mobile', 'src', 'data', 'quran', 'ayahTranslitLatin.search.json');
const BASE = 'https://api.quran.com/api/v4';

async function fetchChapterPage(surah, page) {
  const url = `${BASE}/verses/by_chapter/${surah}?words=true&word_fields=transliteration&per_page=50&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

async function main() {
  const index = {};
  for (let surah = 1; surah <= 114; surah++) {
    let page = 1;
    for (;;) {
      const data = await fetchChapterPage(surah, page);
      const verses = data.verses ?? [];
      if (!verses.length) break;
      for (const v of verses) {
        const ayah = v.verse_number;
        const words = (v.words ?? []).filter((w) => w.char_type_name === 'word');
        const parts = words.map((w) => w.transliteration?.text?.trim()).filter(Boolean);
        index[`${surah}:${ayah}`] = parts.join(' ');
      }
      const next = data.pagination?.next_page;
      if (!next) break;
      page = next;
      await new Promise((r) => setTimeout(r, 120));
    }
    process.stdout.write(`\rsurah ${surah}/114`);
    await new Promise((r) => setTimeout(r, 150));
  }
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(index), 'utf8');
  console.log(`\nWrote ${OUT} (${Object.keys(index).length} keys)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
