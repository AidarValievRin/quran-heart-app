import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wikiPath = path.join(__dirname, 'wiki-names-raw.txt');

const w = fs.readFileSync(wikiPath, 'utf8');
const rows = [];
for (const line of w.split(/\n/)) {
  if (!line.trim().startsWith('|')) continue;
  const parts = line.split('|').map((s) => s.trim());
  if (parts.length < 6) continue;
  const no = +parts[1];
  if (!Number.isFinite(no) || no < 1 || no > 99) continue;
  rows.push({
    no,
    nameAr: parts[2],
    roman: parts[4],
    meaningEn: parts[5],
  });
}
rows.sort((a, b) => a.no - b.no);
if (rows.length !== 99) {
  console.error('Expected 99 rows, got', rows.length);
  process.exit(1);
}
const items = rows.map((r) => ({
  order: r.no,
  nameAr: r.nameAr,
  transliteration: r.roman,
  meaningEn: r.meaningEn,
  meaningRu: '',
}));

const out = {
  attribution:
    'Arabic forms, romanization, and English glosses adapted from the comparative table on Wikipedia (article: Names of God in Islam), CC BY-SA 4.0. Lists vary between classical sources; confirm with a qualified scholar. Russian glosses are intentionally omitted until reviewed.',
  sourceUrl: 'https://en.wikipedia.org/wiki/Names_of_God_in_Islam',
  items,
};

const dest = path.join(__dirname, '..', 'apps', 'mobile', 'src', 'data', 'content', 'names99.bundle.json');
fs.writeFileSync(dest, JSON.stringify(out, null, 2), 'utf8');
console.log('wrote', dest);
