import React from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

type Nav = { navigate: (name: string) => void };

export function ToolsHomeScreen({ navigation }: { navigation: Nav }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const row = (label: string, screen: string) => (
    <TouchableOpacity
      key={screen}
      style={[styles.row, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
      onPress={() => navigation.navigate(screen)}
    >
      <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{label}</Text>
      <Text style={{ color: colors.textSecondary }}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
        <Text style={[styles.h1, { color: colors.textPrimary }]}>{t('toolsHub.title')}</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>{t('toolsHub.subtitle')}</Text>

        <Text style={[styles.section, { color: colors.accentGreen }]}>{t('toolsHub.phase4')}</Text>
        {row(t('tools.prayer.title'), 'PrayerTimes')}
        {row(t('tools.qibla.title'), 'Qibla')}
        {row(t('tools.tasbih.title'), 'Tasbih')}
        {row(t('tools.adhkar.title'), 'Adhkar')}
        {row(t('tools.hijri.title'), 'Hijri')}
        {row(t('tools.names99.title'), 'Names99')}
        {row(t('tools.zakat.title'), 'Zakat')}
        {row(t('tools.mosque.title'), 'Mosque')}
        {row(t('tools.dua.title'), 'DuaCollection')}

        <Text style={[styles.section, { color: colors.accentGreen }]}>{t('toolsHub.phase5')}</Text>
        {row(t('community.title'), 'CommunityHome')}

        <Text style={[styles.section, { color: colors.accentGreen }]}>{t('toolsHub.phase6')}</Text>
        {row(t('tajweed.title'), 'Tajweed')}

        <Text style={[styles.section, { color: colors.accentGreen }]}>{t('toolsHub.phase7')}</Text>
        {row(t('content.ayahDay.title'), 'AyahOfDay')}
        {row(t('content.seerah.title'), 'SeerahOutline')}
        {row(t('content.lectures.title'), 'Lectures')}
        {row(t('content.hajj.title'), 'HajjGuide')}

        <Text style={[styles.section, { color: colors.accentGreen }]}>{t('toolsHub.phase8')}</Text>
        {row(t('sync.title'), 'SyncStatus')}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  h1: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  sub: { fontSize: 13, marginBottom: Spacing.lg },
  section: { fontSize: 12, fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
});
