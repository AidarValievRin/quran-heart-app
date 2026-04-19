import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, type ThemeColors } from './colors';
import type { ThemePreference } from './types';
import { useSettingsStore } from '../store/settingsStore';

type Ctx = {
  preference: ThemePreference;
  resolvedScheme: 'light' | 'dark';
  colors: ThemeColors;
  setPreference: (p: ThemePreference) => void;
};

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const preference = useSettingsStore((s) => s.themePreference);
  const setPreference = useSettingsStore((s) => s.setThemePreference);

  const resolvedScheme: 'light' | 'dark' = useMemo(() => {
    if (preference === 'dark') return 'dark';
    if (preference === 'light') return 'light';
    return system === 'dark' ? 'dark' : 'light';
  }, [preference, system]);

  const colors = resolvedScheme === 'dark' ? Colors.dark : Colors.light;

  const value = useMemo(
    () => ({ preference, resolvedScheme, colors, setPreference }),
    [preference, resolvedScheme, colors, setPreference]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useAppTheme(): Ctx {
  const v = useContext(ThemeCtx);
  if (!v) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return v;
}
