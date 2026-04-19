export { Colors } from './colors';
export type { ColorScheme, ThemeColors } from './colors';

export const Typography = {
  quranArabic: 'KFGQPC-Uthman-Taha-Naskh',
  uiArabic: 'Amiri',
  ui: 'Inter',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
