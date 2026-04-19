/**
 * Fetches Uthmani verse text from Quran.com API v4 (corpus) and writes a bundle JSON + SHA-256.
 *
 * Per project constitution (CLAUDE.md): primary mushaf reference is Tanzil (quran-uthmani.txt).
 * This API is the documented cross-check source; before production release, run a byte-level
 * diff against Tanzil output and update the bundle if needed.
 *
 * API: https://api.quran.com/api/v4/quran/verses/uthmani
 * Terms: https://quran.com/developers — respect rate limits; build-time use only.
 */

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'apps', 'mobile', 'src', 'data', 'quran');
const OUT_JSON = join(OUT_DIR, 'ayahs.bundle.json');
const OUT_CHECKSUM = join(ROOT, 'apps', 'mobile', 'assets', 'quran-checksum.json');

const API = 'https://api.quran.com/api/v4/quran/verses/uthmani';

function parseVerseKey(key) {
  const [s, a] = key.split(':').map(Number);
  return { surah: s, ayah: a };
}

async function main() {
  mkdirSync(dirname(OUT_JSON), { recursive: true });
  mkdirSync(dirname(OUT_CHECKSUM), { recursive: true });

  const res = await fetch(API);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${API}`);
  }
  const data = await res.json();
  const verses = data.verses;
  if (!Array.isArray(verses) || verses.length < 6000) {
    throw new Error(`Unexpected verse count: ${verses?.length}`);
  }

  const ayahs = verses.map((v) => {
    const { surah, ayah } = parseVerseKey(v.verse_key);
    return { surah, ayah, text: v.text_uthmani };
  });

  const bundle = {
    bundleVersion: 1,
    builtAt: new Date().toISOString(),
    sourceNote:
      'Uthmani text from Quran.com API v4 (corpus). Must be verified against Tanzil quran-uthmani.txt before release.',
    apiUrl: API,
    verseCount: ayahs.length,
    ayahs,
  };

  const json = `${JSON.stringify(bundle)}\n`;
  writeFileSync(OUT_JSON, json, 'utf8');

  const hash = createHash('sha256').update(readFileSync(OUT_JSON)).digest('hex');
  const checksumPayload = {
    generatedAt: bundle.builtAt,
    algorithm: 'SHA-256',
    files: [
      {
        path: 'src/data/quran/ayahs.bundle.json',
        sha256: hash,
        description: 'Quran Uthmani ayah text (Hafs) — build source see tools/build-quran-uthmani.mjs',
      },
    ],
  };
  writeFileSync(OUT_CHECKSUM, `${JSON.stringify(checksumPayload, null, 2)}\n`, 'utf8');

  console.log(`Wrote ${OUT_JSON} (${ayahs.length} ayahs)`);
  console.log(`Wrote ${OUT_CHECKSUM} sha256=${hash}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
