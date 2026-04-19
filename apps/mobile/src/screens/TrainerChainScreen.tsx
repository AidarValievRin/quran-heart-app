import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getAyahChain } from '../data/quran/ayahChain';
import { upsertAfterGrade } from '../db/memorizationRepo';
import { useAppTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme';
import { SURAHS } from '../data/surahsMeta';

const CHAIN_LEN = 5;

export function TrainerChainScreen({ route, navigation }: { route: any; navigation: any }) {
  const { surah, ayah } = route.params as { surah: number; ayah: number };
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const chain = useMemo(() => getAyahChain(surah, ayah, CHAIN_LEN), [surah, ayah]);
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState<boolean[]>(() => chain.map(() => false));

  const current = chain[step];
  const showText = current && revealed[step];

  const revealCurrent = () => {
    setRevealed((prev) => {
      const next = [...prev];
      if (step < next.length) next[step] = true;
      return next;
    });
  };

  const nextStep = () => {
    if (step < chain.length - 1) {
      setStep((s) => s + 1);
    }
  };

  const grade = async (g: 0 | 1 | 2 | 3) => {
    await upsertAfterGrade(surah, ayah, g);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('hifz.trainerChainTitle')}</Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('hifz.trainerChainHint')}</Text>

        <View style={[styles.progress, { borderColor: colors.border }]}>
          {chain.map((row, i) => {
            const meta = SURAHS[row.surah - 1];
            const done = i < step || (i === step && revealed[i]);
            return (
              <Text key={`${row.surah}:${row.ayah}`} style={{ color: done ? colors.accentGreen : colors.textSecondary, fontSize: 12 }}>
                {i + 1}. {meta?.nameTranslit} · {row.ayah}
              </Text>
            );
          })}
        </View>

        {current ? (
          <>
            <Text style={[styles.meta, { color: colors.textPrimary, marginTop: Spacing.md }]}>
              {t('hifz.chainCurrent', { n: step + 1, total: chain.length })}
            </Text>
            {showText ? (
              <Text style={[styles.ar, { color: colors.textPrimary }]} selectable>
                {current.text}
              </Text>
            ) : (
              <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
                {t('hifz.chainHidden')}
              </Text>
            )}
            <View style={styles.rowBtns}>
              {!showText ? (
                <TouchableOpacity style={[styles.btn, { backgroundColor: colors.accentGreen }]} onPress={revealCurrent}>
                  <Text style={styles.btnTxt}>{t('hifz.revealAyah')}</Text>
                </TouchableOpacity>
              ) : step < chain.length - 1 ? (
                <TouchableOpacity style={[styles.btn, { backgroundColor: colors.accentGold }]} onPress={nextStep}>
                  <Text style={styles.btnTxt}>{t('hifz.chainNext')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        ) : (
          <Text style={{ color: colors.textSecondary }}>{t('hifz.chainEmpty')}</Text>
        )}

        <Text style={[styles.hint, { color: colors.textSecondary, marginTop: Spacing.xl }]}>
          {t('hifz.gradeHint')}
        </Text>
        <View style={styles.grades}>
          {[0, 1, 2, 3].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.gradeBtn, { backgroundColor: colors.accentGreen }]}
              onPress={() => void grade(g as 0 | 1 | 2 | 3)}
            >
              <Text style={styles.gradeTxt}>{t(`hifz.grade${g}`)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: Spacing.lg }}>
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>{t('hifz.leaveNoGrade')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.md },
  title: { fontSize: 20, fontWeight: '700', marginBottom: Spacing.sm },
  hint: { fontSize: 13, lineHeight: 18, marginBottom: Spacing.md },
  progress: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: 4 },
  meta: { fontWeight: '600', fontSize: 15 },
  ar: { fontSize: 20, lineHeight: 36, textAlign: 'right', writingDirection: 'rtl', marginTop: Spacing.sm },
  placeholder: { fontStyle: 'italic', marginTop: Spacing.sm },
  rowBtns: { marginTop: Spacing.md },
  btn: { padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: '700' },
  grades: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  gradeBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.md },
  gradeTxt: { color: '#fff', fontWeight: '600', fontSize: 12 },
});
