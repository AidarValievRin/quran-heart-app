export const Colors = {
  light: {
    bgMain: '#FBF8F1',
    bgCard: '#FFFFFF',
    accentGreen: '#1F6B5E',
    accentGold: '#C9A24B',
    textPrimary: '#1B2A2E',
    textSecondary: '#6B7A7E',
    border: '#E8E1D2',

    // Surah status colors
    statusUnread: '#F0EAD8',
    statusRead: '#CFE4D8',
    statusStudying: '#E8D6A6',
    statusMemorizing: '#B8E0D4',
    statusMemorized: '#0F4F45',
    statusReviewing: '#BCD6E0',
  },
  dark: {
    bgMain: '#0F1B1E',
    bgCard: '#172428',
    accentGreen: '#2A8F7F',
    accentGold: '#C9A24B',
    textPrimary: '#EDE8DF',
    textSecondary: '#8FA3A8',
    border: '#243035',

    statusUnread: '#1C2A2E',
    statusRead: '#1A3D30',
    statusStudying: '#3A3018',
    statusMemorizing: '#1A3530',
    statusMemorized: '#0F4F45',
    statusReviewing: '#1A2E38',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
/** Active palette (light or dark) — same keys, different literals. */
export type ThemeColors = (typeof Colors)[ColorScheme];
