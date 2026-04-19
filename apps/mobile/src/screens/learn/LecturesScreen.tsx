import React from 'react';
import { Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing } from '../../theme';

export function LecturesScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.p, { color: colors.textPrimary }]}>{t('content.lectures.p1')}</Text>
      <Text style={[styles.p, { color: colors.textSecondary }]}>{t('content.lectures.p2')}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.lg },
  p: { fontSize: 14, lineHeight: 22, marginBottom: Spacing.md },
});
