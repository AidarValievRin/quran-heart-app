import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useProgressStore } from '../store/progressStore';
import { useAppTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme';

export function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { totalReadSurahs, totalMemorizedAyahs } = useProgressStore();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('profile.title')}</Text>

        <View style={[styles.avatar, { backgroundColor: colors.bgCard, borderColor: colors.accentGold }]}>
          <Text style={{ fontSize: 48 }}>✦</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            value={totalReadSurahs()}
            label={t('profile.stats.readSurahs')}
            color={colors.accentGreen}
            bg={colors.bgCard}
            border={colors.border}
            labelColor={colors.textSecondary}
          />
          <StatCard
            value={totalMemorizedAyahs()}
            label={t('profile.stats.memorizedAyahs')}
            color={colors.accentGold}
            bg={colors.bgCard}
            border={colors.border}
            labelColor={colors.textSecondary}
          />
        </View>

        <View style={styles.menu}>
          <MenuRow
            label={t('profile.openBookmarks')}
            colors={colors}
            onPress={() => navigation.navigate('Bookmarks')}
          />
          <MenuRow
            label={t('profile.openNotes')}
            colors={colors}
            onPress={() => navigation.navigate('Notes')}
          />
          <MenuRow
            label={t('profile.openHifzQueue')}
            colors={colors}
            onPress={() => navigation.navigate('HifzQueue')}
          />
          <MenuRow
            label={t('profile.openSettings')}
            colors={colors}
            onPress={() => navigation.navigate('Settings')}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t('profile.quranProgressTitle')}
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
            {t('profile.surahsProgress', { current: totalReadSurahs() })}
          </Text>
        </View>

        <View style={[styles.hadithBox, { backgroundColor: colors.bgCard, borderColor: colors.accentGold }]}>
          <Text style={[styles.hadithAr, { color: colors.accentGreen }]}>{t('profile.hadithAr')}</Text>
          <Text style={[styles.hadithRu, { color: colors.textSecondary }]}>{t('profile.hadithRu')}</Text>
          <Text style={[styles.hadithSrc, { color: colors.textSecondary }]}>({t('profile.hadithSource')})</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuRow({
  label,
  colors,
  onPress,
}: {
  label: string;
  colors: { bgCard: string; border: string; textPrimary: string };
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuRow, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
      onPress={onPress}
    >
      <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{label}</Text>
      <Text style={{ color: colors.textPrimary }}>›</Text>
    </TouchableOpacity>
  );
}

function StatCard({
  value,
  label,
  color,
  bg,
  border,
  labelColor,
}: {
  value: number;
  label: string;
  color: string;
  bg: string;
  border: string;
  labelColor: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: labelColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: Spacing.lg },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: Spacing.lg,
  },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  menu: { gap: Spacing.sm, marginBottom: Spacing.md },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: { fontSize: 32, fontWeight: '700' },
  statLabel: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  section: { padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: Spacing.sm },
  progressBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 4, minWidth: 4 },
  progressLabel: { fontSize: 13 },
  hadithBox: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: Spacing.xl,
  },
  hadithAr: { fontSize: 20, textAlign: 'right', marginBottom: Spacing.sm, lineHeight: 34 },
  hadithRu: { fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
  hadithSrc: { fontSize: 12, marginTop: 4 },
});
