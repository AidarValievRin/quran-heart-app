import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getAyahsForSurah } from '../data/quran/ayahIndex';
import { getAyahTranslationText, type TranslationSlugActive } from '../data/quran/translationIndex';
import { upsertAfterGrade } from '../db/memorizationRepo';
import { useAppTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme';
import { useSettingsStore } from '../store/settingsStore';
import { fetchWordsForVerse } from '../services/quranComApi';
import { latinTranslitToRuPractice } from '../lib/quranLatinToRuPractice';

type InputMode = 'ar' | 'translit' | 'ru';

export function TrainerContinueScreen({ route, navigation }: { route: any; navigation: any }) {
  const { surah, ayah } = route.params as { surah: number; ayah: number };
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const quranTranslation = useSettingsStore((s) => s.quranTranslation);
  const transSlug: TranslationSlugActive | null =
    quranTranslation === 'kuliev' || quranTranslation === 'sahih' ? quranTranslation : null;

  const ayahs = useMemo(() => getAyahsForSurah(surah), [surah]);
  const full = useMemo(() => ayahs.find((a) => a.ayah === ayah)?.text ?? '', [ayahs, ayah]);
  const words = useMemo(() => full.split(/\s+/).filter(Boolean), [full]);

  const [latinLine, setLatinLine] = useState('');
  const [ruLine, setRuLine] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('ar');
  const [shown, setShown] = useState(3);
  const [guess, setGuess] = useState('');

  const initialShown = inputMode === 'ar' ? 3 : inputMode === 'translit' ? 5 : 6;

  useEffect(() => {
    setShown(initialShown);
  }, [initialShown, surah, ayah]);

  useEffect(() => {
    void (async () => {
      try {
        const w = await fetchWordsForVerse(`${surah}:${ayah}`);
        setLatinLine(w.map((x) => x.transliteration?.text).filter(Boolean).join(' '));
      } catch {
        setLatinLine('');
      }
    })();
  }, [surah, ayah]);

  useEffect(() => {
    setRuLine(transSlug ? getAyahTranslationText(surah, ayah, transSlug) ?? '' : '');
  }, [surah, ayah, transSlug]);

  const visible = words.slice(0, Math.min(shown, words.length)).join(' ');
  const hidden = words.slice(shown).join(' ');
  const ruPractice = latinLine ? latinTranslitToRuPractice(latinLine) : '';

  const revealStep = () => {
    const bonus = inputMode === 'ar' ? 2 : inputMode === 'translit' ? 3 : 4;
    setShown((n) => Math.min(words.length, n + bonus));
  };

  const revealFullLeave = () => {
    setShown(words.length);
    navigation.goBack();
  };

  const grade = async (g: 0 | 1 | 2 | 3) => {
    await upsertAfterGrade(surah, ayah, g);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('hifz.trainerContinueTitle')}</Text>

        <Text style={[styles.section, { color: colors.textSecondary }]}>{t('hifz.trainerInputMode')}</Text>
        <View style={styles.modeRow}>
          {(['ar', 'translit', 'ru'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.modeChip,
                { borderColor: colors.border, backgroundColor: inputMode === m ? colors.accentGreen : colors.bgCard },
              ]}
              onPress={() => setInputMode(m)}
            >
              <Text style={{ color: inputMode === m ? '#fff' : colors.textPrimary, fontSize: 12 }}>
                {t(`hifz.inputMode.${m}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('hifz.trainerArabic')}</Text>
        <Text style={[styles.ar, { color: colors.textPrimary }]} selectable>
          {visible}
          {hidden.length > 0 ? ' …' : ''}
        </Text>

        {latinLine ? (
          <>
            <Text style={[styles.label, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              {t('hifz.trainerTranslitLatin')}
            </Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]} selectable>
              {latinLine}
            </Text>
            {i18n.language.startsWith('ru') && ruPractice ? (
              <>
                <Text style={[styles.label, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                  {t('hifz.trainerTranslitRu')}
                </Text>
                <Text style={[styles.meta, { color: colors.textSecondary }]} selectable>
                  {ruPractice}
                </Text>
              </>
            ) : null}
          </>
        ) : null}

        {ruLine ? (
          <>
            <Text style={[styles.label, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              {t('hifz.trainerTranslation')}
            </Text>
            <Text style={[styles.meta, { color: colors.textPrimary }]} selectable>
              {ruLine}
            </Text>
          </>
        ) : null}

        <TouchableOpacity onPress={revealStep}>
          <Text style={{ color: colors.accentGreen, marginVertical: Spacing.md }}>{t('hifz.revealMore')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={revealFullLeave}>
          <Text style={{ color: colors.textSecondary, marginBottom: Spacing.md }}>{t('hifz.revealFullNoGrade')}</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('hifz.typeContinuation')}</Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgCard },
          ]}
          placeholder={t(`hifz.placeholder.${inputMode}`)}
          placeholderTextColor={colors.textSecondary}
          value={guess}
          onChangeText={setGuess}
          multiline
          textAlignVertical="top"
        />

        <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('hifz.gradeHint')}</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.md },
  title: { fontSize: 20, fontWeight: '700', marginBottom: Spacing.md },
  section: { fontSize: 12, fontWeight: '600', marginBottom: Spacing.sm },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  modeChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1 },
  label: { fontSize: 11, marginBottom: 4 },
  ar: { fontSize: 24, lineHeight: 40, textAlign: 'right', writingDirection: 'rtl' },
  meta: { fontSize: 15, lineHeight: 22 },
  input: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, minHeight: 100, marginTop: Spacing.sm },
  hint: { marginTop: Spacing.lg, marginBottom: Spacing.sm },
  grades: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  gradeBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.md },
  gradeTxt: { color: '#fff', fontWeight: '600', fontSize: 12 },
});
