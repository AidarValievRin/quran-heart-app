import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

const RULES = ['madd', 'ghunnah', 'idgham', 'ikhfa', 'iqlab', 'qalqalah'] as const;

export function TajweedScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
        <Text style={[styles.banner, { color: colors.textSecondary }]}>{t('tajweed.mlNote')}</Text>
        {RULES.map((key) => (
          <View key={key} style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
            <Text style={{ color: colors.accentGreen, fontWeight: '700' }}>{t(`tajweed.rules.${key}.title`)}</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 6, lineHeight: 20 }}>
              {t(`tajweed.rules.${key}.body`)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  banner: { fontSize: 12, lineHeight: 18, marginBottom: Spacing.md },
  card: { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.sm },
});
