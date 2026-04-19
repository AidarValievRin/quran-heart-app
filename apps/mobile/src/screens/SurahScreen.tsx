import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { FlashListRef } from '@shopify/flash-list';
import { Audio } from 'expo-av';
import { useTranslation } from 'react-i18next';
import { useFonts, Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { SURAHS } from '../data/surahsMeta';
import { getAyahsForSurah } from '../data/quran/ayahIndex';
import type { QuranAyahRow } from '../data/quran/types';
import { getAyahTranslationText, type TranslationSlugActive } from '../data/quran/translationIndex';
import { useSettingsStore } from '../store/settingsStore';
import { useAppTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme';
import { mishariAlafasyAyahMp3 } from '../audio/everyAyah';
import { getBookmark, removeBookmark, upsertBookmark } from '../db/bookmarksRepo';
import { getNoteForAyah, saveNote } from '../db/notesRepo';
import { seedMemorizationIfAbsent, upsertAfterGrade } from '../db/memorizationRepo';
import {
  fetchTafsirIbnKathirAr,
  fetchWordsForVerse,
  stripHtmlToPlain,
  type WbwWord,
} from '../services/quranComApi';

type ReadMode = 'standard' | 'arabic' | 'translation';

const READ_MODES = ['standard', 'arabic', 'translation'] as const satisfies readonly ReadMode[];

export function SurahScreen({ route, navigation }: { route: any; navigation: any }) {
  const { surahId, ayah: initialAyah } = (route.params ?? {}) as { surahId: number; ayah?: number };
  const surah = SURAHS[surahId - 1];
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const [fontsLoaded] = useFonts({ Amiri_400Regular, Amiri_700Bold });
  const quranTranslation = useSettingsStore((s) => s.quranTranslation);
  const listRef = useRef<FlashListRef<QuranAyahRow>>(null);

  const [readMode, setReadMode] = useState<ReadMode>('standard');
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  const [noteModal, setNoteModal] = useState<QuranAyahRow | null>(null);
  const [noteBody, setNoteBody] = useState('');
  const [insight, setInsight] = useState<QuranAyahRow | null>(null);
  const [insightTab, setInsightTab] = useState<'words' | 'tafsir'>('words');
  const [words, setWords] = useState<WbwWord[] | null>(null);
  const [tafsirPlain, setTafsirPlain] = useState<string | null>(null);
  const [tafsirAttr, setTafsirAttr] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [gradeAyah, setGradeAyah] = useState<QuranAyahRow | null>(null);

  const [marks, setMarks] = useState<Record<string, boolean>>({});

  const ayahs = useMemo(() => getAyahsForSurah(surahId), [surahId]);

  const transSlug: TranslationSlugActive | null =
    quranTranslation === 'kuliev' || quranTranslation === 'sahih' ? quranTranslation : null;

  const refreshMarks = useCallback(async () => {
    const m: Record<string, boolean> = {};
    for (const a of ayahs) {
      const b = await getBookmark(surahId, a.ayah);
      m[`${a.surah}:${a.ayah}`] = !!b;
    }
    setMarks(m);
  }, [ayahs, surahId]);

  useEffect(() => {
    void refreshMarks();
  }, [refreshMarks]);

  useEffect(() => {
    return () => {
      void sound?.unloadAsync();
    };
  }, [sound]);

  useEffect(() => {
    if (!initialAyah || !listRef.current || ayahs.length === 0) return;
    const idx = ayahs.findIndex((a) => a.ayah === initialAyah);
    if (idx >= 0) {
      setTimeout(() => listRef.current?.scrollToIndex({ index: idx, animated: true }), 300);
    }
  }, [initialAyah, ayahs]);

  const metaLine = useMemo(() => {
    if (!surah) return '';
    const place =
      surah.revelationPlace === 'meccan' ? t('surahCard.meccan') : t('surahCard.medinan');
    return t('surahScreen.metaLine', {
      number: surah.number,
      ayahCount: surah.ayahCount,
      place,
    });
  }, [surah, t]);

  const playAyah = async (row: QuranAyahRow) => {
    const key = `${row.surah}:${row.ayah}`;
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      await sound?.unloadAsync();
      const uri = mishariAlafasyAyahMp3(row.surah, row.ayah);
      const { sound: s } = await Audio.Sound.createAsync({ uri });
      setSound(s);
      setPlayingKey(key);
      s.setOnPlaybackStatusUpdate((st) => {
        if (st.isLoaded && st.didJustFinish) {
          setPlayingKey(null);
        }
      });
      await s.playAsync();
    } catch {
      setPlayingKey(null);
    }
  };

  const toggleBookmark = async (row: QuranAyahRow) => {
    const key = `${row.surah}:${row.ayah}`;
    if (marks[key]) {
      await removeBookmark(row.surah, row.ayah);
    } else {
      await upsertBookmark(row.surah, row.ayah, 'gold');
    }
    await refreshMarks();
  };

  const openNote = async (row: QuranAyahRow) => {
    const n = await getNoteForAyah(row.surah, row.ayah);
    setNoteBody(n?.body ?? '');
    setNoteModal(row);
  };

  const saveNotePress = async () => {
    if (!noteModal) return;
    await saveNote(noteModal.surah, noteModal.ayah, noteBody);
    setNoteModal(null);
  };

  const openInsight = async (row: QuranAyahRow, tab: 'words' | 'tafsir') => {
    setInsight(row);
    setInsightTab(tab);
    setWords(null);
    setTafsirPlain(null);
    setTafsirAttr('');
    setLoadingInsight(true);
    const key = `${row.surah}:${row.ayah}`;
    try {
      if (tab === 'words') {
        const w = await fetchWordsForVerse(key);
        setWords(w);
      } else {
        const tf = await fetchTafsirIbnKathirAr(key);
        setTafsirPlain(stripHtmlToPlain(tf.textHtml));
        setTafsirAttr(`${tf.resourceName} (Quran.com API, resource ${tf.resourceId})`);
      }
    } catch {
      setWords([]);
      setTafsirPlain(t('surahScreen.offlineHint'));
    } finally {
      setLoadingInsight(false);
    }
  };

  const renderAyah = ({ item }: { item: QuranAyahRow }) => {
    const key = `${item.surah}:${item.ayah}`;
    const tr =
      transSlug && readMode !== 'arabic' ? getAyahTranslationText(item.surah, item.ayah, transSlug) : null;
    const showAr = readMode !== 'translation';
    const showTr = readMode !== 'arabic' && tr;

    return (
      <View style={[styles.ayahRow, { borderColor: colors.border, maxWidth: width }]}>
        <View style={styles.ayahHead}>
          <Text style={[styles.ayahNum, { color: colors.textSecondary }]}>{item.ayah}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => void toggleBookmark(item)}>
              <Text style={{ color: marks[key] ? colors.accentGold : colors.textSecondary }}>
                {marks[key] ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => void openNote(item)}>
              <Text style={{ color: colors.textSecondary }}>✎</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => void playAyah(item)}>
              <Text style={{ color: playingKey === key ? colors.accentGold : colors.textSecondary }}>▶</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel={t('surahScreen.a11yMemorize')}
              onPress={async () => {
                await seedMemorizationIfAbsent(item.surah, item.ayah);
                setGradeAyah(item);
              }}
            >
              <Text style={[styles.actionLbl, { color: colors.textSecondary }]}>{t('surahScreen.actionMemorize')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel={t('surahScreen.a11yWords')}
              onPress={() => void openInsight(item, 'words')}
            >
              <Text style={[styles.actionLbl, { color: colors.textSecondary }]}>{t('surahScreen.actionWords')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel={t('surahScreen.a11yTafsir')}
              onPress={() => void openInsight(item, 'tafsir')}
            >
              <Text style={[styles.actionLbl, { color: colors.textSecondary }]}>{t('surahScreen.actionTafsir')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {showAr ? (
          <Text
            style={[
              styles.ayahArabic,
              { color: colors.textPrimary, fontFamily: fontsLoaded ? 'Amiri_400Regular' : undefined },
            ]}
            selectable
          >
            {item.text}
          </Text>
        ) : null}
        {showTr ? (
          <Text style={[styles.trans, { color: colors.textSecondary }]} selectable>
            {tr}
          </Text>
        ) : null}
      </View>
    );
  };

  if (!surah) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bgMain }]}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.accentGreen, fontSize: 16 }}>← {t('surahScreen.back')}</Text>
        </TouchableOpacity>
        <Text style={{ color: colors.textPrimary, padding: Spacing.lg }}>{t('surahScreen.invalidSurah')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgMain }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={{ color: colors.accentGreen, fontSize: 16 }}>← {t('surahScreen.back')}</Text>
      </TouchableOpacity>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text
          style={[
            styles.nameAr,
            { color: colors.accentGreen, fontFamily: fontsLoaded ? 'Amiri_700Bold' : undefined },
          ]}
        >
          {surah.nameAr}
        </Text>
        <Text style={[styles.nameTranslit, { color: colors.textSecondary }]}>{surah.nameTranslit}</Text>
        <Text style={[styles.nameRu, { color: colors.textPrimary }]}>
          {i18n.language.startsWith('en') ? surah.nameEn : surah.nameRu}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{metaLine}</Text>
        <Text style={[styles.attribution, { color: colors.textSecondary }]}>{t('surahScreen.textAttribution')}</Text>
        <View style={styles.modeRow}>
          {READ_MODES.map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.modeChip,
                readMode === m && { backgroundColor: colors.accentGreen },
                { borderColor: colors.border },
              ]}
              onPress={() => setReadMode(m)}
            >
              <Text style={{ color: readMode === m ? '#fff' : colors.textPrimary, fontSize: 12 }}>
                {t(`surahScreen.readMode.${m}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <FlashList
        ref={listRef}
        style={styles.list}
        data={ayahs}
        renderItem={renderAyah}
        keyExtractor={(item) => `${item.surah}:${item.ayah}`}
        contentContainerStyle={styles.listContent}
        extraData={{ marks, playingKey, readMode, fontsLoaded }}
      />

      <Modal visible={!!noteModal} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setNoteModal(null)}>
          <Pressable onPress={() => {}} style={[styles.sheet, { backgroundColor: colors.bgCard }]}>
            <Text style={{ color: colors.textPrimary, fontWeight: '600', marginBottom: Spacing.sm }}>
              {t('surahScreen.noteTitle')}
            </Text>
            <TextInput
              style={[
                styles.noteInput,
                { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgMain },
              ]}
              multiline
              value={noteBody}
              onChangeText={setNoteBody}
            />
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.accentGreen }]} onPress={saveNotePress}>
              <Text style={styles.primaryTxt}>{t('common.save')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={!!insight} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setInsight(null)}>
          <Pressable onPress={() => {}} style={[styles.insightSheet, { backgroundColor: colors.bgCard }]}>
            <View style={styles.tabRow}>
              <TouchableOpacity onPress={() => insight && void openInsight(insight, 'words')}>
                <Text style={{ color: insightTab === 'words' ? colors.accentGreen : colors.textSecondary }}>
                  {t('surahScreen.tabWords')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => insight && void openInsight(insight, 'tafsir')}>
                <Text style={{ color: insightTab === 'tafsir' ? colors.accentGreen : colors.textSecondary }}>
                  {t('surahScreen.tabTafsir')}
                </Text>
              </TouchableOpacity>
            </View>
            {loadingInsight ? <ActivityIndicator color={colors.accentGreen} /> : null}
            <ScrollView style={{ maxHeight: 360 }}>
              {insightTab === 'words' && words
                ? words.map((w) => (
                    <View key={w.id} style={{ marginBottom: Spacing.sm }}>
                      <Text style={{ color: colors.textPrimary, fontSize: 20, textAlign: 'right' }}>{w.text_uthmani}</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{w.transliteration?.text}</Text>
                      <Text style={{ color: colors.textSecondary }}>{w.translation?.text}</Text>
                    </View>
                  ))
                : null}
              {insightTab === 'tafsir' ? (
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: Spacing.sm }}>{tafsirAttr}</Text>
                  <Text style={{ color: colors.textPrimary }}>{tafsirPlain}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: Spacing.md }}>
                    {t('surahScreen.tafsirDisclaimer')}
                  </Text>
                </View>
              ) : null}
            </ScrollView>
            <TouchableOpacity onPress={() => setInsight(null)}>
              <Text style={{ color: colors.accentGreen, textAlign: 'center', marginTop: Spacing.md }}>
                {t('common.close')}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={!!gradeAyah} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setGradeAyah(null)}>
          <Pressable onPress={() => {}} style={[styles.sheet, { backgroundColor: colors.bgCard }]}>
            <Text style={{ color: colors.textPrimary, marginBottom: Spacing.md }}>{t('hifz.gradeHint')}</Text>
            <View style={styles.gradeRow}>
              {([0, 1, 2, 3] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.gradeBtn, { backgroundColor: colors.accentGreen }]}
                  onPress={async () => {
                    if (!gradeAyah) return;
                    await upsertAfterGrade(gradeAyah.surah, gradeAyah.ayah, g);
                    setGradeAyah(null);
                  }}
                >
                  <Text style={styles.primaryTxt}>{t(`hifz.grade${g}`)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  back: { padding: Spacing.md },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  nameAr: { fontSize: 36, textAlign: 'center' },
  nameTranslit: { fontSize: 17, marginTop: 4, textAlign: 'center' },
  nameRu: { fontSize: 20, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  meta: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  attribution: { fontSize: 10, marginTop: 10, textAlign: 'center', lineHeight: 14 },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: Spacing.md, justifyContent: 'center' },
  modeChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  listContent: { paddingVertical: Spacing.md, paddingBottom: Spacing.xl },
  ayahRow: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ayahHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ayahNum: { fontSize: 14, width: 28 },
  actions: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', alignItems: 'center' },
  actionLbl: { fontSize: 10, fontWeight: '600' },
  ayahArabic: {
    fontSize: 22,
    lineHeight: 38,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: Spacing.sm,
  },
  trans: { marginTop: Spacing.sm, fontSize: 15, lineHeight: 22 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    padding: Spacing.xl,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  insightSheet: {
    padding: Spacing.lg,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '80%',
  },
  tabRow: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.md },
  noteInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    minHeight: 100,
    padding: Spacing.md,
    textAlignVertical: 'top',
  },
  primaryBtn: { marginTop: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
  primaryTxt: { color: '#fff', fontWeight: '700' },
  gradeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  gradeBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.md },
});
