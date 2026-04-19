import React, { useMemo } from 'react';
import { Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
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

  const iso = todayIsoDate();
  const fastToday = !!fastingByDate[iso];

  const maghrib = useMemo(() => {
    if (lat == null || lon == null) return null;
    const pt = getPrayerTimesForDate(lat, lon, method, madhab, new Date());
    return timeForSalah(pt, 'maghrib');
  }, [lat, lon, method, madhab]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.md },
  note: { fontSize: 11, lineHeight: 16, marginBottom: Spacing.md },
  toggle: { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.sm },
});
