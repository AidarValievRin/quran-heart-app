import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useProgressStore } from '../store/progressStore';
import { Colors, Spacing, Radius } from '../theme';

export function ProfileScreen() {
  const { totalReadSurahs, totalMemorizedAyahs } = useProgressStore();
  const colors = Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Профиль</Text>

        {/* Avatar placeholder — geometric ornament */}
        <View style={[styles.avatar, { backgroundColor: colors.bgCard, borderColor: colors.accentGold }]}>
          <Text style={{ fontSize: 48 }}>✦</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            value={totalReadSurahs()}
            label="Сур прочитано"
            color={colors.accentGreen}
            bg={colors.bgCard}
            border={colors.border}
          />
          <StatCard
            value={totalMemorizedAyahs()}
            label="Аятов заучено"
            color={colors.accentGold}
            bg={colors.bgCard}
            border={colors.border}
          />
        </View>

        {/* Progress bar Quran */}
        <View style={[styles.section, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Прогресс по Корану
          </Text>
          <View style={[styles.progressBg, { backgroundColor: colors.bgMain }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.accentGreen,
                  width: `${(totalReadSurahs() / 114) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            {totalReadSurahs()} из 114 сур
          </Text>
        </View>

        {/* Quran hadith */}
        <View style={[styles.hadithBox, { backgroundColor: colors.bgCard, borderColor: colors.accentGold }]}>
          <Text style={[styles.hadithAr, { color: colors.accentGreen }]}>
            خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
          </Text>
          <Text style={[styles.hadithRu, { color: colors.textSecondary }]}>
            «Лучший из вас тот, кто изучает Коран и обучает ему» (аль-Бухари)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ value, label, color, bg, border }: {
  value: number; label: string; color: string; bg: string; border: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: '#6B7A7E' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: Spacing.lg },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    alignSelf: 'center', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, marginBottom: Spacing.lg,
  },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  statCard: {
    flex: 1, padding: Spacing.lg, borderRadius: Radius.md,
    alignItems: 'center', borderWidth: 1,
  },
  statValue: { fontSize: 32, fontWeight: '700' },
  statLabel: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  section: { padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: Spacing.sm },
  progressBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 4, minWidth: 4 },
  progressLabel: { fontSize: 13 },
  hadithBox: {
    padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 1,
    borderLeftWidth: 4, marginBottom: Spacing.xl,
  },
  hadithAr: { fontSize: 20, textAlign: 'right', marginBottom: Spacing.sm, lineHeight: 34 },
  hadithRu: { fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
});
