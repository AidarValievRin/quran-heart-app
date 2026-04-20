import React, { useCallback } from 'react';
import { Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../store/settingsStore';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

function googleMapsNearUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps/search/mosque/@${lat},${lon},15z`;
}

function yandexMapsNearUrl(lat: number, lon: number): string {
  return `https://yandex.ru/maps/?ll=${lon},${lat}&z=15&text=%D0%BC%D0%B5%D1%87%D0%B5%D1%82%D1%8C&type=business`;
}

export function MosqueScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const lat = useSettingsStore((s) => s.prayerLatitude);
  const lon = useSettingsStore((s) => s.prayerLongitude);

  const openGoogle = useCallback(async () => {
    const url =
      lat != null && lon != null
        ? googleMapsNearUrl(lat, lon)
        : 'https://www.google.com/maps/search/mosque/';
    await WebBrowser.openBrowserAsync(url);
  }, [lat, lon]);

  const openYandex = useCallback(async () => {
    const url =
      lat != null && lon != null
        ? yandexMapsNearUrl(lat, lon)
        : 'https://yandex.ru/maps/?text=%D0%BC%D0%B5%D1%87%D0%B5%D1%82%D1%8C';
    await WebBrowser.openBrowserAsync(url);
  }, [lat, lon]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.body, { color: colors.textSecondary }]}>{t('tools.mosque.body')}</Text>
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.accentGreen }]} onPress={() => void openGoogle()}>
        <Text style={styles.btnTxt}>{t('tools.mosque.openGoogle')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border }]}
        onPress={() => void openYandex()}
      >
        <Text style={{ color: colors.textPrimary }}>{t('tools.mosque.openYandex')}</Text>
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
