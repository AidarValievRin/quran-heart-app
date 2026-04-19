/**
 * Quran.com API v4 — cross-check / corpus (see CLAUDE.md). Do not treat as primary mushaf text.
 * https://api.quran.com/api/v4
 */

const BASE = 'https://api.quran.com/api/v4';

export interface WbwWord {
  id: number;
  position: number;
  text_uthmani: string;
  translation?: { text: string; language_name?: string };
  transliteration?: { text: string; language_name?: string };
}

export async function fetchWordsForVerse(verseKey: string): Promise<WbwWord[]> {
  const url = `${BASE}/verses/by_key/${encodeURIComponent(verseKey)}?words=true&word_fields=text_uthmani,translation,transliteration`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`words ${res.status}`);
  const data = await res.json();
  return (data.verse?.words ?? []).filter((w: WbwWord & { char_type_name?: string }) => w.char_type_name === 'word');
}

export interface TafsirPayload {
  resourceId: number;
  resourceName: string;
  textHtml: string;
}

/** Ibn Kathir (Arabic) — resource 14 on Quran.com API; abridged digital edition — attribute in UI. */
export async function fetchTafsirIbnKathirAr(verseKey: string): Promise<TafsirPayload> {
  const url = `${BASE}/tafsirs/14/by_ayah/${encodeURIComponent(verseKey)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`tafsir ${res.status}`);
  const data = await res.json();
  const t = data.tafsir;
  return {
    resourceId: t.resource_id,
    resourceName: t.resource_name ?? 'Ibn Kathir',
    textHtml: t.text ?? '',
  };
}

export function stripHtmlToPlain(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
