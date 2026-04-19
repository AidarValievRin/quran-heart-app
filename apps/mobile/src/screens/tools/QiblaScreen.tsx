import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import Svg, { G, Path, Line, Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../store/settingsStore';
import { qiblaBearingDegrees } from '../../lib/prayer';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing } from '../../theme';

function headingFromMagnetometer(x: number, y: number): number {
  let angle = Math.atan2(y, x) * (180 / Math.PI);
  angle = (angle + 360) % 360;
  return angle;
}

export function QiblaScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const lat = useSettingsStore((s) => s.prayerLatitude);
  const lon = useSettingsStore((s) => s.prayerLongitude);

  const [heading, setHeading] = useState<number | null>(null);

  const qibla = useMemo(() => {
    if (lat == null || lon == null) return null;
    return qiblaBearingDegrees(lat, lon);
  }, [lat, lon]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let sub: { remove: () => void } | undefined;
    (async () => {
      const avail = await Magnetometer.isAvailableAsync();
      if (!avail) return;
      Magnetometer.setUpdateInterval(250);
      sub = Magnetometer.addListener((m) => {
        setHeading(headingFromMagnetometer(m.x, m.y));
      });
    })();
    return () => sub?.remove();
  }, []);

  const delta = useMemo(() => {
    if (qibla == null || heading == null) return null;
    return (qibla - heading + 360) % 360;
  }, [qibla, heading]);

  if (lat == null || lon == null || qibla == null) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
        <Text style={{ color: colors.textPrimary, padding: Spacing.lg }}>{t('tools.qibla.needLocation')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>{t('tools.qibla.disclaimer')}</Text>
      <View style={styles.dialWrap}>
        <Svg width={220} height={220} viewBox="0 0 220 220">
          <Circle cx="110" cy="110" r="100" fill="none" stroke={colors.border} strokeWidth={2} />
          <Line x1="110" y1="110" x2="110" y2="30" stroke={colors.textSecondary} strokeWidth={2} />
          {delta != null ? (
            <G transform={`rotate(${delta} 110 110)`}>
              <Line x1="110" y1="110" x2="110" y2="40" stroke={colors.accentGreen} strokeWidth={4} strokeLinecap="round" />
              <Path d="M110 32 L102 48 L118 48 Z" fill={colors.accentGreen} />
            </G>
          ) : null}
        </Svg>
      </View>
      <Text style={[styles.meta, { color: colors.textPrimary }]}>
        {t('tools.qibla.bearing', { deg: Math.round(qibla) })}
      </Text>
      {heading != null ? (
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {t('tools.qibla.heading', { deg: Math.round(heading) })}
        </Text>
      ) : (
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{t('tools.qibla.noCompass')}</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.md },
  disclaimer: { fontSize: 11, lineHeight: 16, marginBottom: Spacing.md },
  dialWrap: { alignSelf: 'center', marginVertical: Spacing.lg },
  meta: { textAlign: 'center', marginTop: 6 },
});
