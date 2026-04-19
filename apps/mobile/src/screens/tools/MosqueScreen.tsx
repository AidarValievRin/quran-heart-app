import React, { useCallback } from 'react';
import { Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../store/settingsStore';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

/** OSM expects #map=zoom/lat/lon (lat/lon in decimal degrees). */
function osmMosqueNearUrl(lat: number, lon: number, zoom = 15): string {
  const q = encodeURIComponent(`mosque near ${lat},${lon}`);
  return `https://www.openstreetmap.org/search?query=${q}#map=${zoom}/${lat}/${lon}`;
}

export function MosqueScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const lat = useSettingsStore((s) => s.prayerLatitude);
  const lon = useSettingsStore((s) => s.prayerLongitude);

  const openOsm = useCallback(async () => {
    const url =
      lat != null && lon != null
        ? osmMosqueNearUrl(lat, lon)
        : 'https://www.openstreetmap.org/search?query=mosque';
    await WebBrowser.openBrowserAsync(url);
  }, [lat, lon]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.body, { color: colors.textSecondary }]}>{t('tools.mosque.body')}</Text>
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.accentGreen }]} onPress={() => void openOsm()}>
        <Text style={styles.btnTxt}>{t('tools.mosque.openOsm')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border }]}
        onPress={() => void WebBrowser.openBrowserAsync('https://www.openstreetmap.org/copyright')}
      >
        <Text style={{ color: colors.textPrimary }}>{t('tools.mosque.osmAttrib')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.lg },
  body: { fontSize: 14, lineHeight: 22, marginBottom: Spacing.lg },
  btn: { padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center', marginBottom: Spacing.sm },
  btnTxt: { color: '#fff', fontWeight: '700' },
});
