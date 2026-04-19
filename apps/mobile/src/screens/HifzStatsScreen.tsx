import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { countMemorizationRows, countDueAyahs } from '../db/memorizationRepo';
import { useActivityStore } from '../store/activityStore';
import { useAppTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme';

export function HifzStatsScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [totalRows, setTotalRows] = useState(0);
  const [due, setDue] = useState(0);
  const streakDays = useActivityStore((s) => s.streakDays);
  const quranMinutesApprox = useActivityStore((s) => s.quranMinutesApprox);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const [tr, du] = await Promise.all([countMemorizationRows(), countDueAyahs(Date.now())]);
        setTotalRows(tr);
        setDue(du);
      })();
    }, [])
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xl }}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('hifz.statsTitle')}</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>{t('hifz.statsSubtitle')}</Text>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <StatLine label={t('hifz.statsInQueue')} value={String(totalRows)} colors={colors} />
          <StatLine label={t('hifz.statsDueNow')} value={String(due)} colors={colors} />
          <StatLine label={t('hifz.statsStreak')} value={String(streakDays)} colors={colors} />
          <StatLine label={t('hifz.statsQuranMinutes')} value={String(quranMinutesApprox)} colors={colors} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatLine({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: { textPrimary: string; textSecondary: string };
}) {
  return (
    <View style={styles.row}>
      <Text style={{ color: colors.textSecondary, flex: 1 }}>{label}</Text>
      <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 18 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: Spacing.xs },
  sub: { fontSize: 13, marginBottom: Spacing.lg, lineHeight: 18 },
  card: { borderRadius: Radius.md, borderWidth: 1, padding: Spacing.lg, gap: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
