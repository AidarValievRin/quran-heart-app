import React, { useCallback, useState } from 'react';
import { Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { listBookmarks, type BookmarkRow } from '../db/bookmarksRepo';
import { SURAHS } from '../data/surahsMeta';
import { useAppTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme';

export function BookmarksScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<BookmarkRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      void listBookmarks().then(setRows);
    }, [])
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{t('bookmarks.title')}</Text>
      <FlatList
        data={rows}
        keyExtractor={(r) => String(r.id)}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary }}>{t('bookmarks.empty')}</Text>}
        renderItem={({ item }) => {
          const surah = SURAHS[item.surah - 1];
          return (
            <TouchableOpacity
              style={[styles.row, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
              onPress={() =>
                navigation.getParent()?.navigate('Heart', {
                  screen: 'Surah',
                  params: { surahId: item.surah, ayah: item.ayah },
                })
              }
            >
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                {surah?.nameTranslit} · {t('surahScreen.ayahShort', { n: item.ayah })}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.color}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.md },
  title: { fontSize: 22, fontWeight: '700', marginBottom: Spacing.md },
  row: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
});
