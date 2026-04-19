import React, { useCallback, useState } from 'react';
import { Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
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
      <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('hifz.queueTrainerHint')}</Text>
      <FlatList
        data={rows}
        keyExtractor={(r) => `${r.surah}:${r.ayah}`}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary }}>{t('hifz.queueEmpty')}</Text>}
        renderItem={({ item }) => {
          const surah = SURAHS[item.surah - 1];
          const openTrainerMenu = () => {
            Alert.alert(
              `${surah?.nameTranslit ?? ''} · ${item.ayah}`,
              t('hifz.pickTrainer'),
              [
                {
                  text: t('hifz.trainerContinueTitle'),
                  onPress: () =>
                    navigation.navigate('TrainerContinue', { surah: item.surah, ayah: item.ayah }),
                },
                {
                  text: t('hifz.trainerHiddenTitle'),
                  onPress: () =>
                    navigation.navigate('TrainerHidden', { surah: item.surah, ayah: item.ayah }),
                },
                {
                  text: t('hifz.trainerChainTitle'),
                  onPress: () =>
                    navigation.navigate('TrainerChain', { surah: item.surah, ayah: item.ayah }),
                },
                {
                  text: t('hifz.trainerAudioTitle'),
                  onPress: () =>
                    navigation.navigate('TrainerAudio', { surah: item.surah, ayah: item.ayah }),
                },
                { text: t('common.cancel'), style: 'cancel' },
              ],
              { cancelable: true }
            );
          };
          return (
            <TouchableOpacity
              style={[styles.row, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
              onPress={() =>
                navigation.navigate('TrainerContinue', { surah: item.surah, ayah: item.ayah })
              }
              onLongPress={openTrainerMenu}
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
  title: { fontSize: 22, fontWeight: '700', marginBottom: Spacing.xs },
  hint: { fontSize: 12, lineHeight: 16, marginBottom: Spacing.md },
  row: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
});
