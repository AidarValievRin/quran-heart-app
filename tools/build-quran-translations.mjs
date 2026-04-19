/**
 * Fetches verse translations from Quran.com API v4 (resource IDs are stable per API).
 * Elmir Kuliev (RU): resource 45 — verify license with rights holder before commercial use.
 * Saheeh International (EN): resource 20 — typically used as PD summary; verify for your product.
 *
 * https://api.quran.com/api/v4/quran/translations/{id}
 */

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'apps', 'mobile', 'src', 'data', 'quran');
const UTHMANI_PATH = join(OUT_DIR, 'ayahs.bundle.json');

const RESOURCES = [
  { id: 45, slug: 'ru.kuliev', name: 'Russian Translation ( Elmir Kuliev )' },
  { id: 20, slug: 'en.sahih', name: 'Saheeh International' },
];

async function fetchAll(resourceId, ayahKeys) {
  const res = await fetch(`https://api.quran.com/api/v4/quran/translations/${resourceId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} for translations ${resourceId}`);
  const data = await res.json();
  const tr = data.translations;
  if (!Array.isArray(tr) || tr.length !== ayahKeys.length) {
    throw new Error(`Translation count ${tr?.length} !== ayah count ${ayahKeys.length}`);
  }
  return tr.map((t, i) => ({
    surah: ayahKeys[i].surah,
    ayah: ayahKeys[i].ayah,
    text: t.text,
  }));
}

function loadAyahKeys() {
  const raw = JSON.parse(readFileSync(UTHMANI_PATH, 'utf8'));
  const ayahs = raw.ayahs;
  if (!Array.isArray(ayahs) || ayahs.length < 6000) {
    throw new Error('Run tools/build-quran-uthmani.mjs first (ayahs.bundle.json missing)');
  }
  return ayahs.map((a) => ({ surah: a.surah, ayah: a.ayah }));
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const ayahKeys = loadAyahKeys();
  const checksums = [];

  for (const r of RESOURCES) {
    const rows = await fetchAll(r.id, ayahKeys);
    const bundle = {
      bundleVersion: 1,
      builtAt: new Date().toISOString(),
      resourceId: r.id,
      resourceSlug: r.slug,
      resourceName: r.name,
      apiUrlTemplate: 'https://api.quran.com/api/v4/quran/translations/{id}',
      verseCount: rows.length,
      ayahs: rows,
    };
    const fname = `translation.${r.slug}.bundle.json`;
    const outPath = join(OUT_DIR, fname);
    const json = `${JSON.stringify(bundle)}\n`;
    writeFileSync(outPath, json, 'utf8');
    const sha = createHash('sha256').update(readFileSync(outPath)).digest('hex');
    checksums.push({ file: `src/data/quran/${fname}`, sha256: sha, resource: r.name });
    console.log(`Wrote ${outPath} (${rows.length}) sha256=${sha}`);
  }

  const checksumPath = join(ROOT, 'apps', 'mobile', 'assets', 'translation-checksums.json');
  writeFileSync(
    checksumPath,
    `${JSON.stringify({ builtAt: new Date().toISOString(), files: checksums }, null, 2)}\n`,
    'utf8'
  );
  console.log(`Wrote ${checksumPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
