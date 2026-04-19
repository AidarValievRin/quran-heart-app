import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { getAyahsForSurah } from '../data/quran/ayahIndex';
import { upsertAfterGrade } from '../db/memorizationRepo';
import { useAppTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme';

/** Pick 1–3 distinct word indices to hide (deterministic from surah/ayah for reproducibility). */
function pickHiddenIndices(wordCount: number, seed: number): number[] {
  if (wordCount <= 2) return wordCount > 0 ? [0] : [];
  const nHide = Math.min(3, Math.max(1, Math.floor(wordCount / 6)));
  const out: number[] = [];
  let x = (seed * 1103515245 + 12345) >>> 0;
  while (out.length < nHide) {
    x = (x * 1103515245 + 12345) >>> 0;
    const idx = x % wordCount;
    if (!out.includes(idx)) out.push(idx);
  }
  return out.sort((a, b) => a - b);
}

export function TrainerHiddenScreen({ route, navigation }: { route: any; navigation: any }) {
  const { surah, ayah } = route.params as { surah: number; ayah: number };
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const ayahs = useMemo(() => getAyahsForSurah(surah), [surah]);
  const full = useMemo(() => ayahs.find((a) => a.ayah === ayah)?.text ?? '', [ayahs, ayah]);
  const words = useMemo(() => full.split(/\s+/).filter(Boolean), [full]);
  const hiddenIdx = useMemo(
    () => pickHiddenIndices(words.length, surah * 1000 + ayah),
    [words.length, surah, ayah]
  );

  const [revealed, setRevealed] = useState(false);
  const [guess, setGuess] = useState('');

  useEffect(() => {
    setRevealed(false);
    setGuess('');
  }, [surah, ayah]);

  const displayWords = words.map((w, i) => (revealed || !hiddenIdx.includes(i) ? w : '___'));

  const grade = async (g: 0 | 1 | 2 | 3) => {
    await upsertAfterGrade(surah, ayah, g);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('hifz.trainerHiddenTitle')}</Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('hifz.trainerHiddenHint')}</Text>

        <Text
          style={[
            styles.ar,
            { color: colors.textPrimary, fontFamily: undefined },
          ]}
          selectable
        >
          {displayWords.join(' ')}
        </Text>

        <TouchableOpacity onPress={() => setRevealed(true)}>
          <Text style={{ color: colors.accentGreen, marginVertical: Spacing.md }}>{t('hifz.revealWords')}</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('hifz.typeHiddenWords')}</Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgCard },
          ]}
          placeholder={t('hifz.placeholderHidden')}
          placeholderTextColor={colors.textSecondary}
          value={guess}
          onChangeText={setGuess}
          multiline
          textAlignVertical="top"
        />

        <Text style={[styles.hint, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
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
  ar: { fontSize: 22, lineHeight: 38, textAlign: 'right', writingDirection: 'rtl' },
  label: { fontSize: 12, marginBottom: Spacing.xs },
  input: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, minHeight: 80, marginTop: Spacing.sm },
  grades: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  gradeBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.md },
  gradeTxt: { color: '#fff', fontWeight: '600', fontSize: 12 },
});
