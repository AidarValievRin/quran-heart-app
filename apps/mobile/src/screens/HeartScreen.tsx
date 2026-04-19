import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { HeartCanvas } from '../components/heart/HeartCanvas';
import { SURAHS } from '../data/surahsMeta';
import { useProgressStore } from '../store/progressStore';
import { Colors, Spacing, Radius } from '../theme';
import type { SurahStatus } from '../data/types';

type ColorMode = 'status' | 'juz' | 'place' | 'length';

const STATUS_ORDER: SurahStatus[] = [
  'unread', 'read', 'studying', 'memorizing', 'memorized', 'reviewing',
];

export function HeartScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { getSurahProgress, setSurahStatus } = useProgressStore();
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [colorMode, setColorMode] = useState<ColorMode>('status');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const surah = selectedSurah ? SURAHS[selectedSurah - 1] : null;
  const progress = selectedSurah ? getSurahProgress(selectedSurah) : null;

  const colors = Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgMain }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.titleAr, { color: colors.accentGreen }]}>
          {t('heart.title')}
        </Text>
        <Text style={[styles.titleRu, { color: colors.textSecondary }]}>
          {t('heart.subtitle')}
        </Text>
        <TouchableOpacity
          style={styles.colorModeBtn}
          onPress={() => setShowColorPicker(true)}
        >
          <Text style={{ color: colors.accentGold, fontSize: 13 }}>
            {t('heart.colorBy')}: {t(`heart.by${colorMode.charAt(0).toUpperCase() + colorMode.slice(1)}` as any)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Heart canvas */}
      <HeartCanvas
        onSurahPress={setSelectedSurah}
        colorMode={colorMode}
      />

      {/* Color mode picker */}
      <Modal visible={showColorPicker} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowColorPicker(false)}>
          <View style={[styles.pickerCard, { backgroundColor: colors.bgCard }]}>
            {(['status', 'juz', 'place', 'length'] as ColorMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.pickerItem, colorMode === mode && { backgroundColor: colors.statusRead }]}
                onPress={() => { setColorMode(mode); setShowColorPicker(false); }}
              >
                <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
                  {t(`heart.by${mode.charAt(0).toUpperCase() + mode.slice(1)}` as any)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Surah card modal */}
      {surah && progress && (
        <Modal visible={!!selectedSurah} transparent animationType="slide">
          <Pressable style={styles.overlay} onPress={() => setSelectedSurah(null)}>
            <View style={[styles.surahCard, { backgroundColor: colors.bgCard }]}>
              <Text style={[styles.surahNameAr, { color: colors.accentGreen }]}>
                {surah.nameAr}
              </Text>
              <Text style={[styles.surahNameTranslit, { color: colors.textSecondary }]}>
                {surah.nameTranslit}
              </Text>
              <Text style={[styles.surahNameRu, { color: colors.textPrimary }]}>
                {surah.nameRu}
              </Text>

              <View style={styles.metaRow}>
                <MetaTag label={`№ ${surah.number}`} colors={colors} />
                <MetaTag label={`${surah.ayahCount} ${t('surahCard.ayahs')}`} colors={colors} />
                <MetaTag
                  label={surah.revelationPlace === 'meccan' ? t('surahCard.meccan') : t('surahCard.medinan')}
                  colors={colors}
                />
              </View>

              {/* Status selector */}
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                {t('surahCard.changeStatus')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.statusRow}>
                  {STATUS_ORDER.map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusChip,
                        progress.status === status && styles.statusChipActive,
                        { borderColor: colors.border },
                      ]}
                      onPress={() => setSurahStatus(surah.id, status)}
                    >
                      <Text style={{ fontSize: 12, color: progress.status === status ? '#fff' : colors.textPrimary }}>
                        {t(`surahStatus.${status}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Actions */}
              <View style={styles.actions}>
                <ActionButton
                  label={t('common.open')}
                  color={colors.accentGreen}
                  onPress={() => {
                    setSelectedSurah(null);
                    navigation.navigate('Surah', { surahId: surah.id });
                  }}
                />
                <ActionButton
                  label={t('common.listen')}
                  color={colors.accentGold}
                  onPress={() => setSelectedSurah(null)}
                />
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
}

function MetaTag({ label, colors }: { label: string; colors: typeof Colors.light }) {
  return (
    <View style={[styles.metaTag, { backgroundColor: colors.bgMain, borderColor: colors.border }]}>
      <Text style={{ fontSize: 12, color: colors.textSecondary }}>{label}</Text>
    </View>
  );
}

function ActionButton({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  titleAr: { fontSize: 28, fontWeight: '700' },
  titleRu: { fontSize: 14, marginTop: 2 },
  colorModeBtn: { marginTop: Spacing.xs, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  pickerCard: {
    margin: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  pickerItem: { padding: Spacing.md, borderRadius: Radius.sm, marginVertical: 2 },
  surahCard: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  surahNameAr: { fontSize: 34, textAlign: 'center', fontWeight: '700' },
  surahNameTranslit: { fontSize: 16, textAlign: 'center', marginTop: 4 },
  surahNameRu: { fontSize: 20, textAlign: 'center', fontWeight: '600', marginTop: 4 },
  metaRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: Spacing.md },
  metaTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  sectionLabel: { fontSize: 13, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  statusChipActive: { backgroundColor: '#1F6B5E', borderColor: '#1F6B5E' },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  actionBtn: { flex: 1, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
});
