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
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import type { FlashListRef } from '@shopify/flash-list';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
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
  fetchTransliterationLatinByAyahForChapter,
  fetchWordsForVerse,
  stripHtmlToPlain,
  type WbwWord,
} from '../services/quranComApi';
import { latinTranslitToRuPractice } from '../lib/quranLatinToRuPractice';
import { useReadingProgressStore } from '../store/readingProgressStore';
import { useActivityStore } from '../store/activityStore';
import { useProgressStore } from '../store/progressStore';
import type { SurahProgress, SurahStatus } from '../data/types';

type ReadMode = 'standard' | 'arabic' | 'translation';

const SURAH_STATUS_OPTIONS: SurahStatus[] = [
  'unread',
  'read',
  'studying',
  'memorizing',
  'memorized',
  'reviewing',
];

const READ_MODES = ['standard', 'arabic', 'translation'] as const satisfies readonly ReadMode[];

export function SurahScreen({ route, navigation }: { route: any; navigation: any }) {
  const { surahId, ayah: initialAyah, autoPlayAyah } = (route.params ?? {}) as {
    surahId: number;
    ayah?: number;
    autoPlayAyah?: boolean;
  };
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
  const [playbackRate, setPlaybackRate] = useState(1);
  const [repeatTotal, setRepeatTotal] = useState(1);
  const [autoNextAyah, setAutoNextAyah] = useState(false);
  const audioCtxRef = useRef<{ row: QuranAyahRow; playsRemaining: number; autoNext: boolean } | null>(null);
  const ayahsRef = useRef<QuranAyahRow[]>([]);
  const [inlineTafsirKey, setInlineTafsirKey] = useState<string | null>(null);
  const [inlineTafsirLoading, setInlineTafsirLoading] = useState<string | null>(null);
  const [inlineTafsirByKey, setInlineTafsirByKey] = useState<Record<string, { text: string; attr: string }>>({});
  const setSurahStatus = useProgressStore((s) => s.setSurahStatus);
  const surahProgress: SurahProgress = useProgressStore((s) => {
    const p = s.progress[surahId];
    return p ?? { surahId, status: 'unread', memorizedAyahs: [] };
  });

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
  const [ayahTranslitLatin, setAyahTranslitLatin] = useState<Record<number, string>>({});
  const lastReading = useReadingProgressStore((s) => ({ sid: s.lastSurahId, ay: s.lastAyah }));
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { item: QuranAyahRow; isViewable?: boolean }[] }) => {
      const top = viewableItems.find((v) => v.isViewable)?.item;
      if (top) useReadingProgressStore.getState().setReadingPosition(top.surah, top.ayah);
    }
  ).current;
  const viewabilityConfigCallbackPairs = useRef([{ viewabilityConfig: { itemVisiblePercentThreshold: 40 }, onViewableItemsChanged }]).current;

  const ayahs = useMemo(() => getAyahsForSurah(surahId), [surahId]);

  useEffect(() => {
    ayahsRef.current = ayahs;
  }, [ayahs]);

  useFocusEffect(
    useCallback(() => {
      useActivityStore.getState().recordQuranSession(0);
      const id = setInterval(() => {
        useActivityStore.getState().recordQuranSession(1);
      }, 60000);
      return () => clearInterval(id);
    }, [])
  );

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

  useEffect(() => {
    if (initialAyah || !listRef.current || ayahs.length === 0) return;
    if (lastReading.sid !== surahId || lastReading.ay <= 0) return;
    const idx = ayahs.findIndex((a) => a.ayah === lastReading.ay);
    if (idx >= 0) {
      setTimeout(() => listRef.current?.scrollToIndex({ index: idx, animated: false }), 400);
    }
  }, [initialAyah, ayahs, surahId, lastReading.sid, lastReading.ay]);

  useEffect(() => {
    let cancelled = false;
    setAyahTranslitLatin({});
    void (async () => {
      try {
        const map = await fetchTransliterationLatinByAyahForChapter(surahId);
        if (cancelled) return;
        const rec: Record<number, string> = {};
        map.forEach((v, k) => {
          if (v) rec[k] = v;
        });
        setAyahTranslitLatin(rec);
      } catch {
        if (!cancelled) setAyahTranslitLatin({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [surahId]);

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
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      audioCtxRef.current = null;
      await sound?.unloadAsync();
      const uri = mishariAlafasyAyahMp3(row.surah, row.ayah);
      const { sound: s } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false, volume: 1 },
        (st) => {
          if (st.isLoaded && st.didJustFinish) {
            setPlayingKey(null);
            const ctx = audioCtxRef.current;
            if (!ctx) return;
            const left = ctx.playsRemaining - 1;
            if (left > 0) {
              audioCtxRef.current = { ...ctx, playsRemaining: left };
              void (async () => {
                try {
                  await s.setPositionAsync(0);
                  setPlayingKey(key);
                  await s.playAsync();
                } catch {
                  setPlayingKey(null);
                  audioCtxRef.current = null;
                }
              })();
            } else {
              audioCtxRef.current = null;
              if (ctx.autoNext) {
                const list = ayahsRef.current;
                const idx = list.findIndex((a) => a.surah === ctx.row.surah && a.ayah === ctx.row.ayah);
                const next = idx >= 0 ? list[idx + 1] : undefined;
                if (next) void playAyah(next);
              }
            }
          }
        }
      );
      audioCtxRef.current = {
        row,
        playsRemaining: repeatTotal,
        autoNext: autoNextAyah,
      };
      setSound(s);
      setPlayingKey(key);
      await s.setRateAsync(playbackRate, true);
      await s.playAsync();
    } catch {
      setPlayingKey(null);
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    void sound?.setRateAsync(playbackRate, true);
  }, [sound, playbackRate]);

  useEffect(() => {
    if (!autoPlayAyah || !initialAyah || ayahs.length === 0) return;
    const row = ayahs.find((a) => a.ayah === initialAyah);
    if (!row) return;
    const tid = setTimeout(() => {
      void playAyah(row);
    }, 900);
    return () => clearTimeout(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot autoplay on navigation params
  }, [autoPlayAyah, initialAyah, surahId, ayahs.length]);

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

  const toggleInlineTafsir = async (row: QuranAyahRow) => {
    const key = `${row.surah}:${row.ayah}`;
    if (inlineTafsirKey === key) {
      setInlineTafsirKey(null);
      return;
    }
    setInlineTafsirKey(key);
    if (inlineTafsirByKey[key]) return;
    setInlineTafsirLoading(key);
    try {
      const tf = await fetchTafsirIbnKathirAr(key);
      setInlineTafsirByKey((prev) => ({
        ...prev,
        [key]: {
          text: stripHtmlToPlain(tf.textHtml),
          attr: `${tf.resourceName} (Quran.com API, resource ${tf.resourceId})`,
        },
      }));
    } catch {
      setInlineTafsirByKey((prev) => ({
        ...prev,
        [key]: { text: t('surahScreen.offlineHint'), attr: '' },
      }));
    } finally {
      setInlineTafsirLoading(null);
    }
  };

  const openSurahStatusPicker = () => {
    if (!surah) return;
    Alert.alert(
      t('surahScreen.surahStatusTitle'),
      surah.nameTranslit,
      [
        ...SURAH_STATUS_OPTIONS.map((st) => ({
          text: t(`surahStatus.${st}`),
          onPress: () => setSurahStatus(surahId, st),
        })),
        { text: t('common.cancel'), style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const renderAyah = ({ item }: { item: QuranAyahRow }) => {
    const key = `${item.surah}:${item.ayah}`;
    const tr =
      transSlug && readMode !== 'arabic' ? getAyahTranslationText(item.surah, item.ayah, transSlug) : null;
    const showAr = readMode !== 'translation';
    const showTr = readMode !== 'arabic' && tr;
    const latin = ayahTranslitLatin[item.ayah];
    const middleReading =
      latin && i18n.language.startsWith('ru') ? latinTranslitToRuPractice(latin) : latin || null;

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
              onPress={() => void toggleInlineTafsir(item)}
            >
              <Text
                style={[
                  styles.actionLbl,
                  { color: inlineTafsirKey === key ? colors.accentGold : colors.textSecondary },
                ]}
              >
                {t('surahScreen.actionTafsir')}
              </Text>
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
        {showAr && middleReading ? (
          <Text style={[styles.translit, { color: colors.textSecondary }]} selectable>
            {middleReading}
          </Text>
        ) : null}
        {showAr && latin && i18n.language.startsWith('ru') ? (
          <Text style={[styles.translitLatinSub, { color: colors.textSecondary }]} selectable>
            {latin}
          </Text>
        ) : null}
        {showTr ? (
          <Text style={[styles.trans, { color: colors.textSecondary }]} selectable>
            {tr}
          </Text>
        ) : null}
        {inlineTafsirKey === key ? (
          <View style={{ marginTop: Spacing.md }}>
            {inlineTafsirLoading === key ? <ActivityIndicator color={colors.accentGreen} /> : null}
            {inlineTafsirByKey[key] ? (
              <>
                <Text style={[styles.tafsirAttr, { color: colors.textSecondary }]}>{inlineTafsirByKey[key].attr}</Text>
                <Text style={[styles.tafsirBody, { color: colors.textPrimary }]}>{inlineTafsirByKey[key].text}</Text>
                <Text style={[styles.tafsirDisclaimer, { color: colors.textSecondary }]}>
                  {t('surahScreen.tafsirDisclaimer')}
                </Text>
              </>
            ) : null}
          </View>
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
        <TouchableOpacity onPress={openSurahStatusPicker} style={{ marginTop: Spacing.sm }}>
          <Text style={[styles.statusPick, { color: colors.accentGold }]}>
            {t('surahScreen.currentStatus', { status: t(`surahStatus.${surahProgress.status}`) })}
          </Text>
        </TouchableOpacity>
        <View style={[styles.audioBar, { borderColor: colors.border }]}>
          {[0.75, 1, 1.25].map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.audioChip,
                { borderColor: colors.border },
                playbackRate === r && { backgroundColor: colors.accentGreen },
              ]}
              onPress={() => setPlaybackRate(r)}
            >
              <Text style={{ color: playbackRate === r ? '#fff' : colors.textPrimary, fontSize: 11 }}>
                {t('surahScreen.rateChip', { rate: r })}
              </Text>
            </TouchableOpacity>
          ))}
          {[1, 2, 3].map((n) => (
            <TouchableOpacity
              key={n}
              style={[
                styles.audioChip,
                { borderColor: colors.border },
                repeatTotal === n && { backgroundColor: colors.accentGold },
              ]}
              onPress={() => setRepeatTotal(n)}
            >
              <Text style={{ color: repeatTotal === n ? '#1a1a1a' : colors.textPrimary, fontSize: 11 }}>
                {t('surahScreen.repeatChip', { n })}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.audioChip,
              { borderColor: colors.border },
              autoNextAyah && { backgroundColor: colors.statusRead },
            ]}
            onPress={() => setAutoNextAyah((v) => !v)}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 11 }}>{t('surahScreen.autoNextShort')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.attribution, { color: colors.textSecondary }]}>{t('surahScreen.textAttribution')}</Text>
        <Text style={[styles.attribution, { color: colors.textSecondary }]}>{t('surahScreen.translitAttribution')}</Text>
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
        extraData={{
          marks,
          playingKey,
          readMode,
          fontsLoaded,
          ayahTranslitLatin,
          i18n: i18n.language,
          inlineTafsirKey,
          inlineTafsirByKey,
          inlineTafsirLoading,
          surahProgress,
          playbackRate,
          repeatTotal,
          autoNextAyah,
        }}
        onViewableItemsChanged={viewabilityConfigCallbackPairs[0].onViewableItemsChanged}
        viewabilityConfig={viewabilityConfigCallbackPairs[0].viewabilityConfig}
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
  statusPick: { fontSize: 13, textAlign: 'center', textDecorationLine: 'underline' },
  audioBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    justifyContent: 'center',
  },
  audioChip: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: Spacing.md, justifyContent: 'center' },
  modeChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  tafsirAttr: { fontSize: 10, marginBottom: Spacing.xs },
  tafsirBody: { fontSize: 14, lineHeight: 22 },
  tafsirDisclaimer: { fontSize: 11, marginTop: Spacing.sm },
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
  translit: { marginTop: Spacing.sm, fontSize: 15, lineHeight: 22, fontStyle: 'italic' },
  translitLatinSub: { marginTop: 4, fontSize: 12, lineHeight: 18, opacity: 0.85 },
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
