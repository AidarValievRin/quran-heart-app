import React, { useCallback } from 'react';
import { Text, StyleSheet, SafeAreaView, TouchableOpacity, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../store/settingsStore';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

export function MosqueScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const lat = useSettingsStore((s) => s.prayerLatitude);
  const lon = useSettingsStore((s) => s.prayerLongitude);

  const openOsm = useCallback(async () => {
    if (lat != null && lon != null) {
      const url = `https://www.openstreetmap.org/search?query=mosque#map=14/${lat}/${lon}`;
      await WebBrowser.openBrowserAsync(url);
    } else {
      await WebBrowser.openBrowserAsync('https://www.openstreetmap.org/search?query=mosque');
    }
  }, [lat, lon]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.body, { color: colors.textSecondary }]}>{t('tools.mosque.body')}</Text>
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.accentGreen }]} onPress={() => void openOsm()}>
        <Text style={styles.btnTxt}>{t('tools.mosque.openOsm')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border }]}
        onPress={() => void Linking.openURL('https://www.openstreetmap.org/copyright')}
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
