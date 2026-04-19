import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

type Nav = { navigate: (name: string, params?: object) => void; getParent: () => { navigate: (n: string, p?: object) => void } | undefined };

const ITEMS: { key: string; surahId: number }[] = [
  { key: 'fatiha', surahId: 1 },
  { key: 'bakara255', surahId: 2 },
  { key: 'falaq', surahId: 113 },
  { key: 'nas', surahId: 114 },
];

export function AdhkarScreen({ navigation }: { navigation: Nav }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const openSurah = (surahId: number) => {
    navigation.getParent()?.navigate('Heart', { screen: 'Surah', params: { surahId } });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
        <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>{t('tools.adhkar.disclaimer')}</Text>
        {ITEMS.map((it) => (
          <TouchableOpacity
            key={it.key}
            style={[styles.row, { borderColor: colors.border, backgroundColor: colors.bgCard }]}
            onPress={() => openSurah(it.surahId)}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{t(`tools.adhkar.items.${it.key}.title`)}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                {t(`tools.adhkar.items.${it.key}.hint`)}
              </Text>
            </View>
            <Text style={{ color: colors.accentGreen }}>›</Text>
          </TouchableOpacity>
        ))}
        <Text style={[styles.note, { color: colors.textSecondary }]}>{t('tools.adhkar.hisnNote')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  disclaimer: { fontSize: 11, lineHeight: 16, marginBottom: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  note: { fontSize: 11, marginTop: Spacing.lg },
});
