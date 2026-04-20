import React, { useMemo } from 'react';
import { Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { getAllAyahs } from '../../data/quran/ayahIndex';
import { getAyahTranslationText } from '../../data/quran/translationIndex';
import { useSettingsStore } from '../../store/settingsStore';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

type Nav = { dispatch: (a: unknown) => void };

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime() + (start.getTimezoneOffset() - d.getTimezoneOffset()) * 60_000;
  return Math.floor(diff / 86_400_000);
}

export function AyahOfDayScreen({ navigation }: { navigation: Nav }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const quranTranslation = useSettingsStore((s) => s.quranTranslation);

  const row = useMemo(() => {
    const all = getAllAyahs();
    const idx = dayOfYear(new Date()) % all.length;
    return all[idx]!;
  }, []);

  const slug = quranTranslation === 'kuliev' || quranTranslation === 'sahih' ? quranTranslation : null;
  const tr = slug ? getAyahTranslationText(row.surah, row.ayah, slug) : null;

  const open = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Heart',
        params: {
          screen: 'Surah',
          params: { surahId: row.surah, ayah: row.ayah },
        },
      })
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {t('content.ayahDay.meta', { surah: row.surah, ayah: row.ayah })}
        </Text>
        <Text
          style={[
            styles.ar,
            { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgCard },
          ]}
          selectable
        >
          {row.text}
        </Text>
        {tr ? (
          <Text style={[styles.tr, { color: colors.textSecondary }]} selectable>
            {tr}
          </Text>
        ) : null}
        <Text style={[styles.note, { color: colors.textSecondary }]}>{t('content.ayahDay.note')}</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.accentGreen }]} onPress={open}>
          <Text style={styles.btnTxt}>{t('content.ayahDay.openInReader')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  meta: { marginBottom: Spacing.md },
  ar: {
    fontSize: 22,
    lineHeight: 38,
    textAlign: 'right',
    writingDirection: 'rtl',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  tr: { marginTop: Spacing.md, fontSize: 15, lineHeight: 22 },
  note: { fontSize: 11, marginTop: Spacing.lg, lineHeight: 16 },
  btn: { marginTop: Spacing.lg, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: '700' },
});
