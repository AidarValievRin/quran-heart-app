import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { useSettingsStore, type PrayerMethodId, type PrayerMadhabId } from '../../store/settingsStore';
import { getPrayerTimesForDate, nextSalahAfter, timeForSalah, type PrayerName } from '../../lib/prayer';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

const METHODS: PrayerMethodId[] = [
  'mwl',
  'isna',
  'egypt',
  'umm_al_qura',
  'tehran',
  'karachi',
  'moon_sighting',
];

function fmtTime(d: Date, locale: string): string {
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

export function PrayerTimesScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const lat = useSettingsStore((s) => s.prayerLatitude);
  const lon = useSettingsStore((s) => s.prayerLongitude);
  const method = useSettingsStore((s) => s.prayerMethod);
  const madhab = useSettingsStore((s) => s.prayerMadhab);
  const setMethod = useSettingsStore((s) => s.setPrayerMethod);
  const setMadhab = useSettingsStore((s) => s.setPrayerMadhab);
  const setCoords = useSettingsStore((s) => s.setPrayerCoordinates);

  const [now, setNow] = useState(() => new Date());
  const [locLoading, setLocLoading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const times = useMemo(() => {
    if (lat == null || lon == null) return null;
    return getPrayerTimesForDate(lat, lon, method, madhab, now);
  }, [lat, lon, method, madhab, now]);

  const next = useMemo(() => (times ? nextSalahAfter(times, now) : null), [times, now]);

  const fetchGps = useCallback(async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({});
      setCoords(pos.coords.latitude, pos.coords.longitude);
    } finally {
      setLocLoading(false);
    }
  }, [setCoords]);

  if (lat == null || lon == null) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
        <Text style={{ color: colors.textPrimary, padding: Spacing.lg }}>{t('tools.prayer.noCoords')}</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.accentGreen }]} onPress={() => void fetchGps()}>
          {locLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnTxt}>{t('tools.prayer.useGps')}</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const rows: { key: PrayerName; label: string }[] = [
    { key: 'fajr', label: t('tools.prayer.fajr') },
    { key: 'sunrise', label: t('tools.prayer.sunrise') },
    { key: 'dhuhr', label: t('tools.prayer.dhuhr') },
    { key: 'asr', label: t('tools.prayer.asr') },
    { key: 'maghrib', label: t('tools.prayer.maghrib') },
    { key: 'isha', label: t('tools.prayer.isha') },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
        <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>{t('tools.prayer.disclaimer')}</Text>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.accentGreen, marginBottom: Spacing.md }]}
          onPress={() => void fetchGps()}
        >
          {locLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnTxt}>{t('tools.prayer.refreshGps')}</Text>
          )}
        </TouchableOpacity>

        {next ? (
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
            <Text style={{ color: colors.textSecondary }}>{t('tools.prayer.next')}</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '700' }}>
              {t(`tools.prayer.${next.name}`)} · {fmtTime(next.at, i18n.language)}
            </Text>
          </View>
        ) : null}

        {times
          ? rows.map((r) => (
              <View
                key={r.key}
                style={[styles.row, { borderColor: colors.border, backgroundColor: colors.bgCard }]}
              >
                <Text style={{ color: colors.textPrimary }}>{r.label}</Text>
                <Text style={{ color: colors.accentGreen, fontVariant: ['tabular-nums'] }}>
                  {fmtTime(timeForSalah(times, r.key), i18n.language)}
                </Text>
              </View>
            ))
          : null}

        <Text style={[styles.section, { color: colors.textPrimary }]}>{t('tools.prayer.method')}</Text>
        {METHODS.map((m) => (
          <TouchableOpacity
            key={m}
            style={[
              styles.chip,
              {
                borderColor: colors.border,
                backgroundColor: method === m ? colors.statusRead : colors.bgCard,
              },
            ]}
            onPress={() => setMethod(m)}
          >
            <Text style={{ color: colors.textPrimary }}>{t(`tools.prayer.methods.${m}`)}</Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.section, { color: colors.textPrimary }]}>{t('tools.prayer.madhab')}</Text>
        {(['shafi', 'hanafi'] as PrayerMadhabId[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[
              styles.chip,
              {
                borderColor: colors.border,
                backgroundColor: madhab === m ? colors.statusRead : colors.bgCard,
              },
            ]}
            onPress={() => setMadhab(m)}
          >
            <Text style={{ color: colors.textPrimary }}>{t(`tools.prayer.madhabs.${m}`)}</Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.note, { color: colors.textSecondary }]}>{t('tools.prayer.notificationsNote')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  disclaimer: { fontSize: 11, lineHeight: 16, marginBottom: Spacing.sm },
  btn: { marginHorizontal: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: '700' },
  card: { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  section: { fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  chip: { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.sm },
  note: { fontSize: 11, marginTop: Spacing.lg },
});
