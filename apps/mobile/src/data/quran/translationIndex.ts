import kulievBundle from './translation.ru.kuliev.bundle.json';
import sahihBundle from './translation.en.sahih.bundle.json';

export type TranslationSlugActive = 'kuliev' | 'sahih';

function stripFootnotes(html: string): string {
  return html
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildMap(rows: { surah: number; ayah: number; text: string }[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const r of rows) {
    m.set(`${r.surah}:${r.ayah}`, stripFootnotes(r.text));
  }
  return m;
}

const kulievMap = buildMap((kulievBundle as { ayahs: { surah: number; ayah: number; text: string }[] }).ayahs);
const sahihMap = buildMap((sahihBundle as { ayahs: { surah: number; ayah: number; text: string }[] }).ayahs);

export function getAyahTranslationText(
  surah: number,
  ayah: number,
  slug: TranslationSlugActive
): string | null {
  const key = `${surah}:${ayah}`;
  if (slug === 'kuliev') return kulievMap.get(key) ?? null;
  if (slug === 'sahih') return sahihMap.get(key) ?? null;
  return null;
}
