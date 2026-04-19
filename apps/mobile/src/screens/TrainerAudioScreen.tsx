import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { useTranslation } from 'react-i18next';
import { getAyahsForSurah } from '../data/quran/ayahIndex';
import { upsertAfterGrade } from '../db/memorizationRepo';
import { useAppTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme';
import { mishariAlafasyAyahMp3 } from '../audio/everyAyah';

const CLIP_MS = 4500;

export function TrainerAudioScreen({ route, navigation }: { route: any; navigation: any }) {
  const { surah, ayah } = route.params as { surah: number; ayah: number };
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const ayahs = getAyahsForSurah(surah);
  const full = ayahs.find((a) => a.ayah === ayah)?.text ?? '';
  const soundRef = useRef<Audio.Sound | null>(null);
  const clipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [guess, setGuess] = useState('');

  useEffect(() => {
    return () => {
      if (clipTimerRef.current) clearTimeout(clipTimerRef.current);
      void soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, [surah, ayah]);

  const playClip = async () => {
    try {
      if (clipTimerRef.current) clearTimeout(clipTimerRef.current);
      await soundRef.current?.unloadAsync();
      soundRef.current = null;
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const uri = mishariAlafasyAyahMp3(surah, ayah);
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false, volume: 1 });
      soundRef.current = sound;
      setPlaying(true);
      await sound.playAsync();
      clipTimerRef.current = setTimeout(async () => {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch {
          /* ignore */
        }
        if (soundRef.current === sound) soundRef.current = null;
        setPlaying(false);
      }, CLIP_MS);
    } catch {
      setPlaying(false);
    }
  };

  const grade = async (g: 0 | 1 | 2 | 3) => {
    if (clipTimerRef.current) clearTimeout(clipTimerRef.current);
    void soundRef.current?.unloadAsync();
    soundRef.current = null;
    setPlaying(false);
    await upsertAfterGrade(surah, ayah, g);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('hifz.trainerAudioTitle')}</Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('hifz.trainerAudioHint', { sec: Math.round(CLIP_MS / 1000) })}</Text>

        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: colors.accentGold, opacity: playing ? 0.6 : 1 }]}
          onPress={() => void playClip()}
          disabled={playing}
        >
          <Text style={styles.playTxt}>{playing ? t('hifz.audioPlaying') : t('hifz.audioPlayClip')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setGuess(full)}>
          <Text style={{ color: colors.accentGreen, marginVertical: Spacing.md }}>{t('hifz.revealFullAyah')}</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('hifz.typeContinuation')}</Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgCard },
          ]}
          placeholder={t('hifz.placeholder.ar')}
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
  playBtn: { padding: Spacing.lg, borderRadius: Radius.md, alignItems: 'center' },
  playTxt: { color: '#1a1a1a', fontWeight: '700', fontSize: 16 },
  label: { fontSize: 12, marginBottom: Spacing.xs },
  input: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, minHeight: 100, marginTop: Spacing.sm },
  grades: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  gradeBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.md },
  gradeTxt: { color: '#fff', fontWeight: '600', fontSize: 12 },
});
