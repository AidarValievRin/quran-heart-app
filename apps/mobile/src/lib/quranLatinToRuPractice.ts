/**
 * Approximate Latin (Quran.com-style word transliteration) → Cyrillic letters for reading practice.
 * This is not a scholarly Arabic transcription; Arabic remains the authoritative form (see CLAUDE.md).
 */
export function latinTranslitToRuPractice(input: string): string {
  if (!input.trim()) return '';
  let s = input.normalize('NFD').replace(/\p{M}/gu, '');
  s = s.replace(/ʿ|ʾ|ʼ|'/g, "'");
  s = s.replace(/ḥ/g, 'h').replace(/ḍ/g, 'd').replace(/ṣ/g, 's').replace(/ṭ/g, 't').replace(/ẓ/g, 'z');
  s = s.replace(/ā/g, 'a').replace(/ī/g, 'i').replace(/ū/g, 'u').replace(/ō/g, 'o').replace(/ē/g, 'e');
  s = s.replace(/ɪ/g, 'i').replace(/ɔ/g, 'o');
  s = s.toLowerCase();

  const pairs: [RegExp, string][] = [
    [/al-/g, 'аль-'],
    [/ar-/g, 'ар-'],
    [/as-/g, 'ас-'],
    [/az-/g, 'аз-'],
    [/ad-/g, 'ад-'],
    [/an-/g, 'ан-'],
    [/at-/g, 'ат-'],
    [/ash-/g, 'аш-'],
    [/l-/g, 'ль-'],
    [/bis'mi/g, "бисми"],
    [/sh/g, 'ш'],
    [/ch/g, 'ч'],
    [/kh/g, 'х'],
    [/gh/g, 'гх'],
    [/ph/g, 'ф'],
    [/th/g, 'с'],
    [/dh/g, 'з'],
    [/zh/g, 'ж'],
    [/ng/g, 'нг'],
    [/qu/g, 'кв'],
    [/aa/g, 'аа'],
    [/ee/g, 'и'],
    [/ii/g, 'и'],
    [/uu/g, 'у'],
    [/oo/g, 'у'],
  ];
  for (const [re, rep] of pairs) s = s.replace(re, rep);

  const map: Record<string, string> = {
    a: 'а',
    b: 'б',
    c: 'к',
    d: 'д',
    e: 'е',
    f: 'ф',
    g: 'г',
    h: 'х',
    i: 'и',
    j: 'дж',
    k: 'к',
    l: 'л',
    m: 'м',
    n: 'н',
    o: 'о',
    p: 'п',
    q: 'к',
    r: 'р',
    s: 'с',
    t: 'т',
    u: 'у',
    v: 'в',
    w: 'в',
    x: 'кс',
    y: 'й',
    z: 'з',
    "'": 'ъ',
    '-': '-',
    ' ': ' ',
  };

  let out = '';
  for (const ch of s) {
    out += map[ch] ?? ch;
  }
  return out.replace(/\s+/g, ' ').trim();
}
