import React, { useMemo } from 'react';
import { Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing } from '../../theme';

function hijriFormat(d: Date, locale: string): string {
  try {
    const base = locale.startsWith('ru') ? 'ru' : 'en';
    return new Intl.DateTimeFormat(`${base}-u-ca-islamic-civil`, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch {
    return '';
  }
}

function gregorianFormat(d: Date, locale: string): string {
  return d.toLocaleDateString(locale.startsWith('ru') ? 'ru-RU' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function HijriScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const d = useMemo(() => new Date(), []);

  const h = hijriFormat(d, i18n.language);
  const g = gregorianFormat(d, i18n.language);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{t('tools.hijri.gregorian')}</Text>
      <Text style={[styles.big, { color: colors.textPrimary }]}>{g || '—'}</Text>
      <Text style={[styles.label, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
        {t('tools.hijri.islamic')}
      </Text>
      <Text style={[styles.big, { color: colors.accentGreen }]}>{h || t('tools.hijri.unsupported')}</Text>
      <Text style={[styles.note, { color: colors.textSecondary }]}>{t('tools.hijri.note')}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.lg },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  big: { fontSize: 18, lineHeight: 26 },
  note: { fontSize: 11, marginTop: Spacing.xl, lineHeight: 16 },
});
