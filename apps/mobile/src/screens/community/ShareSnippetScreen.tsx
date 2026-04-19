import React, { useState } from 'react';
import { Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SURAHS } from '../../data/surahsMeta';
import { getAyahsForSurah } from '../../data/quran/ayahIndex';
import { getAyahTranslationText } from '../../data/quran/translationIndex';
import { useSettingsStore } from '../../store/settingsStore';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

export function ShareSnippetScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const quranTranslation = useSettingsStore((s) => s.quranTranslation);
  const [surahId, setSurahId] = useState('1');
  const [ayah, setAyah] = useState('1');

  const share = () => {
    const sid = Math.min(114, Math.max(1, parseInt(surahId, 10) || 1));
    let an = Math.max(1, parseInt(ayah, 10) || 1);
    const surah = SURAHS[sid - 1];
    an = Math.min(surah.ayahCount, an);
    const ayahs = getAyahsForSurah(sid);
    const row = ayahs.find((a) => a.ayah === an);
    const name = i18n.language.startsWith('en') ? surah.nameEn : surah.nameRu;
    const slug = quranTranslation === 'kuliev' || quranTranslation === 'sahih' ? quranTranslation : null;
    const tr = slug ? getAyahTranslationText(sid, an, slug) : null;
    const lines = [
      `${name} — ${sid}:${an} (${t('community.share.ref')})`,
      row?.text ?? '',
      tr ? `\n${tr}` : '',
      `\n— ${t('surahScreen.textAttribution')}`,
    ];
    void Share.share({ message: lines.join('\n') });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.note, { color: colors.textSecondary }]}>{t('community.share.note')}</Text>
      <Text style={{ color: colors.textSecondary }}>{t('community.share.surah')}</Text>
      <TextInput
        keyboardType="number-pad"
        value={surahId}
        onChangeText={setSurahId}
        style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgCard }]}
      />
      <Text style={{ color: colors.textSecondary, marginTop: Spacing.md }}>{t('community.share.ayah')}</Text>
      <TextInput
        keyboardType="number-pad"
        value={ayah}
        onChangeText={setAyah}
        style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgCard }]}
      />
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.accentGreen }]} onPress={share}>
        <Text style={styles.btnTxt}>{t('common.share')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.md },
  note: { fontSize: 11, lineHeight: 16, marginBottom: Spacing.lg },
  input: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.sm },
  btn: { marginTop: Spacing.lg, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: '700' },
});
