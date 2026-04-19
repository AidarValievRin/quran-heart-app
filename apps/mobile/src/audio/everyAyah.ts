/**
 * Per-ayah audio URLs (Mishari Rashid al-Afasy) from EveryAyah.com directory layout.
 * Non-commercial use per site terms — confirm before commercial release.
 * @see https://everyayah.com/
 */
export function mishariAlafasyAyahMp3(surah: number, ayah: number): string {
  const s = String(surah).padStart(3, '0');
  const a = String(ayah).padStart(3, '0');
  return `https://everyayah.com/data/Alafasy_64kbps/${s}${a}.mp3`;
}
