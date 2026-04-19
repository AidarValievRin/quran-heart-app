import React, { useMemo } from 'react';
import { Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRamadanStore, todayIsoDate } from '../../store/ramadanStore';
import { useSettingsStore } from '../../store/settingsStore';
import { getPrayerTimesForDate, timeForSalah } from '../../lib/prayer';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

export function RamadanScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const lat = useSettingsStore((s) => s.prayerLatitude);
  const lon = useSettingsStore((s) => s.prayerLongitude);
  const method = useSettingsStore((s) => s.prayerMethod);
  const madhab = useSettingsStore((s) => s.prayerMadhab);
  const toggleFast = useRamadanStore((s) => s.toggleFast);
  const fastingByDate = useRamadanStore((s) => s.fastingByDate);
  const pages = useRamadanStore((s) => s.quranPagesRamadan);
  const setPages = useRamadanStore((s) => s.setQuranPages);
  const taraweeh = useRamadanStore((s) => s.taraweehRakats);
  const setTaraweeh = useRamadanStore((s) => s.setTaraweeh);
  const lastTenJoined = useRamadanStore((s) => {
    const a = s.lastTenNights;
    if (!Array.isArray(a) || a.length !== 10) return '0000000000';
    return a.map((x) => (x ? '1' : '0')).join('');
  });
  const lastTenNights = useMemo(() => lastTenJoined.split('').map((c) => c === '1'), [lastTenJoined]);
  const toggleLastTenNight = useRamadanStore((s) => s.toggleLastTenNight);

  const iso = todayIsoDate();
  const fastToday = !!fastingByDate[iso];

  const maghrib = useMemo(() => {
    if (lat == null || lon == null) return null;
    const pt = getPrayerTimesForDate(lat, lon, method, madhab, new Date());
    return timeForSalah(pt, 'maghrib');
  }, [lat, lon, method, madhab]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }}>
      <Text style={[styles.note, { color: colors.textSecondary }]}>{t('community.ramadan.note')}</Text>
      {maghrib ? (
        <Text style={{ color: colors.textPrimary, marginBottom: Spacing.md }}>
          {t('community.ramadan.maghribHint', {
            time: maghrib.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }),
          })}
        </Text>
      ) : null}
      <TouchableOpacity
        style={[
          styles.toggle,
          { borderColor: colors.border, backgroundColor: fastToday ? colors.statusRead : colors.bgCard },
        ]}
        onPress={() => toggleFast(iso)}
      >
        <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
          {fastToday ? t('community.ramadan.fastingOn') : t('community.ramadan.fastingOff')}
        </Text>
      </TouchableOpacity>
      <Text style={{ color: colors.textSecondary, marginTop: Spacing.lg }}>{t('community.ramadan.pages')}</Text>
      <TextInput
        keyboardType="number-pad"
        defaultValue={String(pages)}
        onEndEditing={(e) => setPages(Math.max(0, parseInt(e.nativeEvent.text, 10) || 0))}
        style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgCard }]}
      />
      <Text style={{ color: colors.textSecondary, marginTop: Spacing.md }}>{t('community.ramadan.taraweeh')}</Text>
      <TextInput
        keyboardType="number-pad"
        defaultValue={String(taraweeh)}
        onEndEditing={(e) => setTaraweeh(Math.max(0, parseInt(e.nativeEvent.text, 10) || 0))}
        style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgCard }]}
      />

      <Text style={[styles.section, { color: colors.textPrimary }]}>{t('community.ramadan.lastTenTitle')}</Text>
      <Text style={[styles.note, { color: colors.textSecondary, marginBottom: Spacing.md }]}>
        {t('community.ramadan.lastTenHint')}
      </Text>
      <View style={styles.tenGrid}>
        {lastTenNights.map((on, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.nightChip,
              { borderColor: colors.border, backgroundColor: on ? colors.statusRead : colors.bgCard },
            ]}
            onPress={() => toggleLastTenNight(i)}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '600' }}>
              {t('community.ramadan.nightChip', { n: i + 1 })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.md },
  note: { fontSize: 11, lineHeight: 16, marginBottom: Spacing.md },
  toggle: { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.sm },
  section: { fontSize: 15, fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.xs },
  tenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  nightChip: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.md, borderWidth: 1, minWidth: '28%' },
});
