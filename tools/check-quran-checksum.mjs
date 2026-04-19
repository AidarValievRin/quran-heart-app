/**
 * Verifies SHA-256 of bundled Quran JSON matches apps/mobile/assets/quran-checksum.json.
 * Run from repo root: node tools/check-quran-checksum.mjs
 */
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CHECK = join(ROOT, 'apps', 'mobile', 'assets', 'quran-checksum.json');
const BUNDLE = join(ROOT, 'apps', 'mobile', 'src', 'data', 'quran', 'ayahs.bundle.json');

function main() {
  if (!existsSync(CHECK) || !existsSync(BUNDLE)) {
    console.error('Missing', CHECK, 'or', BUNDLE);
    process.exit(1);
  }
  const meta = JSON.parse(readFileSync(CHECK, 'utf8'));
  const buf = readFileSync(BUNDLE);
  const hash = createHash('sha256').update(buf).digest('hex');
  const expected = meta.files?.[0]?.sha256;
  if (!expected) {
    console.error('No sha256 in checksum file');
    process.exit(1);
  }
  if (hash !== expected) {
    console.error(`SHA256 mismatch.\n  expected: ${expected}\n  actual:   ${hash}\nRun npm run quran:build and commit updated checksum.`);
    process.exit(1);
  }
  console.log('OK: ayahs.bundle.json matches quran-checksum.json');
}

main();
