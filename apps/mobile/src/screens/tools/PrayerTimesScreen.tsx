import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
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
  const loc = locale.startsWith('ru') ? 'ru-RU' : 'en-US';
  return d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit', hour12: false });
}

function parseCoord(text: string): number | null {
  const t = text.trim().replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
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
  const [latInput, setLatInput] = useState('');
  const [lonInput, setLonInput] = useState('');

  useEffect(() => {
    setLatInput(lat != null ? String(lat) : '');
    setLonInput(lon != null ? String(lon) : '');
  }, [lat, lon]);

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
      if (status !== 'granted') {
        Alert.alert(t('tools.prayer.title'), t('tools.prayer.gpsDenied'));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords(pos.coords.latitude, pos.coords.longitude);
    } catch {
      Alert.alert(t('tools.prayer.title'), t('tools.prayer.gpsError'));
    } finally {
      setLocLoading(false);
    }
  }, [setCoords, t]);

  const applyManual = useCallback(() => {
    const la = parseCoord(latInput);
    const lo = parseCoord(lonInput);
    if (la == null || lo == null) {
      Alert.alert(t('tools.prayer.title'), t('tools.prayer.invalidCoords'));
      return;
    }
    if (la < -90 || la > 90 || lo < -180 || lo > 180) {
      Alert.alert(t('tools.prayer.title'), t('tools.prayer.invalidCoords'));
      return;
    }
    setCoords(la, lo);
  }, [latInput, lonInput, setCoords, t]);

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
          style={[styles.btn, { backgroundColor: colors.accentGreen, marginBottom: Spacing.sm }]}
          onPress={() => void fetchGps()}
        >
          {locLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnTxt}>{t('tools.prayer.refreshGps')}</Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.section, { color: colors.textPrimary }]}>{t('tools.prayer.manualCoords')}</Text>
        <View style={styles.rowInputs}>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgCard }]}
            value={latInput}
            onChangeText={setLatInput}
            placeholder={t('tools.prayer.latPh')}
            placeholderTextColor={colors.textSecondary}
            keyboardType="numbers-and-punctuation"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgCard }]}
            value={lonInput}
            onChangeText={setLonInput}
            placeholder={t('tools.prayer.lonPh')}
            placeholderTextColor={colors.textSecondary}
            keyboardType="numbers-and-punctuation"
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border }]}
          onPress={applyManual}
        >
          <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{t('tools.prayer.applyManual')}</Text>
        </TouchableOpacity>

        {lat != null && lon != null ? (
          <Text style={[styles.coords, { color: colors.textSecondary }]}>
            {t('tools.prayer.currentCoords', { lat: lat.toFixed(5), lon: lon.toFixed(5) })}
          </Text>
        ) : (
          <Text style={[styles.coords, { color: colors.textSecondary }]}>{t('tools.prayer.noCoords')}</Text>
        )}

        {lat == null || lon == null ? (
          <Text style={[styles.warn, { color: colors.textSecondary }]}>{t('tools.prayer.needCoordsForTimes')}</Text>
        ) : null}

        {next && times ? (
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
  btn: { padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: '700' },
  section: { fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  rowInputs: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  input: { flex: 1, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  coords: { fontSize: 12, marginTop: Spacing.sm, marginBottom: Spacing.sm },
  warn: { fontSize: 12, marginBottom: Spacing.md },
  card: { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  chip: { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.sm },
  note: { fontSize: 11, marginTop: Spacing.lg },
});
