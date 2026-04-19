import React, { useCallback, useState } from 'react';
import { Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { listDueAyahs } from '../db/memorizationRepo';
import type { MemorizationRow } from '../lib/sm2';
import { SURAHS } from '../data/surahsMeta';
import { useAppTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme';

export function HifzQueueScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const navigation = useNavigation<any>();
  const [rows, setRows] = useState<MemorizationRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      void listDueAyahs(Date.now(), 100).then(setRows);
    }, [])
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{t('hifz.queueTitle')}</Text>
      <FlatList
        data={rows}
        keyExtractor={(r) => `${r.surah}:${r.ayah}`}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary }}>{t('hifz.queueEmpty')}</Text>}
        renderItem={({ item }) => {
          const surah = SURAHS[item.surah - 1];
          return (
            <TouchableOpacity
              style={[styles.row, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
              onPress={() =>
                navigation.navigate('TrainerContinue', { surah: item.surah, ayah: item.ayah })
              }
            >
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                {surah?.nameTranslit} · {item.ayah}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {t('hifz.due')}: {new Date(item.due_at).toLocaleString()}
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
