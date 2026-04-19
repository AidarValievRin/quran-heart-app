import React from 'react';
import { Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../theme/ThemeContext';
import type { ThemePreference } from '../theme/types';
import { Spacing, Radius } from '../theme';

export function SettingsScreen() {
  const { t } = useTranslation();
  const { colors, preference, setPreference } = useAppTheme();

  const set = (p: ThemePreference) => () => setPreference(p);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{t('settings.title')}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{t('settings.appearance')}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: Spacing.sm }}>
        {t('settings.themeCurrent', { value: preference })}
      </Text>
      {(['system', 'light', 'dark'] as const).map((p) => (
        <TouchableOpacity
          key={p}
          style={[
            styles.row,
            {
              backgroundColor: preference === p ? colors.statusRead : colors.bgCard,
              borderColor: colors.border,
            },
          ]}
          onPress={set(p)}
        >
          <Text style={{ color: colors.textPrimary }}>{t(`settings.theme.${p}`)}</Text>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.md },
  title: { fontSize: 22, fontWeight: '700', marginBottom: Spacing.lg },
  label: { marginBottom: Spacing.xs, fontWeight: '600' },
  row: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
});
