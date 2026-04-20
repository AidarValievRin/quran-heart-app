import React, { useMemo } from 'react';
import { Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

type Nav = {
  dispatch: (a: unknown) => void;
  navigate: (n: string) => void;
};

export function FridayScreen({ navigation }: { navigation: Nav }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const isFriday = useMemo(() => new Date().getDay() === 5, []);

  const openKahf = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Heart',
        params: { screen: 'Surah', params: { surahId: 18 } },
      })
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.badge, { color: isFriday ? colors.accentGreen : colors.textSecondary }]}>
        {isFriday ? t('community.friday.today') : t('community.friday.notToday')}
      </Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>{t('community.friday.body')}</Text>
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.accentGreen }]} onPress={openKahf}>
        <Text style={styles.btnTxt}>{t('community.friday.openKahf')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, marginTop: Spacing.sm }]}
        onPress={() => navigation.navigate('PrayerTimes')}
      >
        <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{t('community.friday.openPrayerTimes')}</Text>
      </TouchableOpacity>
      <Text style={[styles.dua, { color: colors.textPrimary }]}>{t('community.friday.dua')}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.lg },
  badge: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.md },
  body: { fontSize: 14, lineHeight: 22, marginBottom: Spacing.lg },
  btn: { padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: '700' },
  dua: { marginTop: Spacing.lg, fontSize: 14, lineHeight: 22 },
});
