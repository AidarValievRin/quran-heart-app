import React, { useCallback, useMemo, useState } from 'react';
import { Text, SectionList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
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

  const sections = useMemo(() => {
    const bySurah = new Map<number, BookmarkRow[]>();
    for (const r of rows) {
      if (!bySurah.has(r.surah)) bySurah.set(r.surah, []);
      bySurah.get(r.surah)!.push(r);
    }
    const surahIds = [...bySurah.keys()].sort((a, b) => a - b);
    return surahIds.map((sid) => ({
      title: SURAHS[sid - 1]?.nameTranslit ?? `Surah ${sid}`,
      data: bySurah.get(sid)!,
    }));
  }, [rows]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{t('bookmarks.title')}</Text>
      <SectionList
        sections={sections}
        keyExtractor={(r) => String(r.id)}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary }}>{t('bookmarks.empty')}</Text>}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.sectionHdr, { color: colors.accentGreen }]}>{title}</Text>
        )}
        renderItem={({ item }) => {
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
                {t('surahScreen.ayahShort', { n: item.ayah })}
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
  sectionHdr: { fontSize: 14, fontWeight: '700', marginTop: Spacing.md, marginBottom: Spacing.sm },
  row: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
});
