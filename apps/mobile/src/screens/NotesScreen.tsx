import React, { useCallback, useState } from 'react';
import { Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { listNotes, type NoteRow } from '../db/notesRepo';
import { SURAHS } from '../data/surahsMeta';
import { useAppTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme';

export function NotesScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<NoteRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      void listNotes().then(setRows);
    }, [])
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{t('notes.title')}</Text>
      <FlatList
        data={rows}
        keyExtractor={(r) => String(r.id)}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary }}>{t('notes.empty')}</Text>}
        renderItem={({ item }) => {
          const surah = SURAHS[item.surah - 1];
          return (
            <TouchableOpacity
              style={[styles.row, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
              onPress={() =>
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'Heart',
                    params: {
                      screen: 'Surah',
                      params: { surahId: item.surah, ayah: item.ayah },
                    },
                  })
                )
              }
            >
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                {surah?.nameTranslit} · {t('surahScreen.ayahShort', { n: item.ayah })}
              </Text>
              <Text style={{ color: colors.textSecondary, marginTop: 4 }} numberOfLines={3}>
                {item.body}
              </Text>
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
