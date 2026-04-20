import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { SURAHS } from '../data/surahsMeta';
import { useAppTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme';

export function SurahIndexScreen() {
  const { i18n } = useTranslation();
  const { colors } = useAppTheme();
  const navigation = useNavigation<any>();

  const openSurah = useCallback(
    (surahId: number) => {
      navigation.getParent()?.navigate('Heart', { screen: 'Surah', params: { surahId } });
    },
    [navigation]
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <FlatList
        data={SURAHS}
        keyExtractor={(s) => String(s.number)}
        contentContainerStyle={{ padding: Spacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, { borderColor: colors.border, backgroundColor: colors.bgCard }]}
            onPress={() => openSurah(item.number)}
          >
            <Text style={[styles.num, { color: colors.textSecondary }]}>{item.number}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.ar, { color: colors.textPrimary }]}>{item.nameAr}</Text>
              <Text style={{ color: colors.textSecondary, marginTop: 2 }}>
                {i18n.language.startsWith('en') ? item.nameEn : item.nameRu} · {item.nameTranslit}
              </Text>
            </View>
            <Text style={{ color: colors.accentGreen }}>›</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  num: { width: 28, fontWeight: '700' },
  ar: { fontSize: 18, textAlign: 'right', writingDirection: 'rtl' },
});
