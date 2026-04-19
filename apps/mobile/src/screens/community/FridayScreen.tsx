import React, { useMemo } from 'react';
import { Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

type Nav = { getParent: () => { navigate: (n: string, p?: object) => void } | undefined };

export function FridayScreen({ navigation }: { navigation: Nav }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const isFriday = useMemo(() => new Date().getDay() === 5, []);

  const openKahf = () => {
    navigation.getParent()?.navigate('Heart', { screen: 'Surah', params: { surahId: 18 } });
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
