import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getAyahsForSurah } from '../data/quran/ayahIndex';
import { upsertAfterGrade } from '../db/memorizationRepo';
import { useAppTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme';

export function TrainerContinueScreen({ route, navigation }: { route: any; navigation: any }) {
  const { surah, ayah } = route.params as { surah: number; ayah: number };
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const ayahs = useMemo(() => getAyahsForSurah(surah), [surah]);
  const full = useMemo(() => ayahs.find((a) => a.ayah === ayah)?.text ?? '', [ayahs, ayah]);
  const words = useMemo(() => full.split(/\s+/).filter(Boolean), [full]);
  const [shown, setShown] = useState(3);
  const [guess, setGuess] = useState('');

  const visible = words.slice(0, Math.min(shown, words.length)).join(' ');
  const hidden = words.slice(shown).join(' ');

  const grade = async (g: 0 | 1 | 2 | 3) => {
    await upsertAfterGrade(surah, ayah, g);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{t('hifz.trainerContinueTitle')}</Text>
      <Text style={[styles.ar, { color: colors.textPrimary }]} selectable>
        {visible}
        {hidden.length > 0 ? ' …' : ''}
      </Text>
      <TouchableOpacity onPress={() => setShown((n) => Math.min(words.length, n + 2))}>
        <Text style={{ color: colors.accentGreen, marginVertical: Spacing.md }}>{t('hifz.revealMore')}</Text>
      </TouchableOpacity>
      <TextInput
        style={[
          styles.input,
          { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgCard },
        ]}
        placeholder={t('hifz.typeContinuation')}
        placeholderTextColor={colors.textSecondary}
        value={guess}
        onChangeText={setGuess}
        multiline
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.md },
  title: { fontSize: 20, fontWeight: '700', marginBottom: Spacing.md },
  ar: { fontSize: 24, lineHeight: 40, textAlign: 'right', writingDirection: 'rtl' },
  input: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, minHeight: 80, marginTop: Spacing.md },
  hint: { marginTop: Spacing.lg, marginBottom: Spacing.sm },
  grades: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  gradeBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.md },
  gradeTxt: { color: '#fff', fontWeight: '600', fontSize: 12 },
});
