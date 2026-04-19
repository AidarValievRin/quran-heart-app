import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';
import { useTasbihStore } from '../../store/tasbihStore';

type Preset = { id: string; n: number };

const COUNT_PRESETS: Preset[] = [
  { id: 'subhan33', n: 33 },
  { id: 'hamd33', n: 33 },
  { id: 'akbar34', n: 34 },
  { id: 'istighfar100', n: 100 },
  { id: 'salawat10', n: 10 },
  { id: 'salawat100', n: 100 },
  { id: 'n33', n: 33 },
  { id: 'n34', n: 34 },
  { id: 'n99', n: 99 },
  { id: 'n100', n: 100 },
];

export function TasbihScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const sessions = useTasbihStore((s) => s.sessions);
  const recordCompletedCycle = useTasbihStore((s) => s.recordCompletedCycle);

  const [presetId, setPresetId] = useState<string>('subhan33');
  const [target, setTarget] = useState(33);
  const [count, setCount] = useState(0);
  const [customText, setCustomText] = useState('');
  const [phraseNote, setPhraseNote] = useState('');

  const presetLabel = useMemo(() => {
    const p = COUNT_PRESETS.find((x) => x.id === presetId);
    if (!p) return presetId;
    return t(`tools.tasbih.presets.${p.id}`, { defaultValue: `×${p.n}` });
  }, [presetId, t]);

  const applyPreset = (p: Preset) => {
    setPresetId(p.id);
    setTarget(p.n);
    setCount(0);
  };

  const tap = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCount((c) => {
      const n = c + 1;
      if (n >= target) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        recordCompletedCycle(presetId, target, phraseNote.trim() || undefined);
        return 0;
      }
      return n;
    });
  };

  const reset = () => {
    void Haptics.selectionAsync();
    setCount(0);
  };

  const applyCustom = () => {
    const v = parseInt(customText.trim(), 10);
    if (!Number.isFinite(v) || v < 1 || v > 9999) return;
    setPresetId('custom');
    setTarget(v);
    setCount(0);
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('tools.tasbih.hint')}</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>{t('tools.tasbih.namedPresets')}</Text>
        <View style={styles.presets}>
          {COUNT_PRESETS.slice(0, 6).map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.preset,
                { borderColor: colors.border, backgroundColor: presetId === p.id ? colors.statusRead : colors.bgCard },
              ]}
              onPress={() => applyPreset(p)}
            >
              <Text style={{ color: colors.textPrimary, fontSize: 12 }} numberOfLines={2}>
                {t(`tools.tasbih.presets.${p.id}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>{t('tools.tasbih.countPresets')}</Text>
        <View style={styles.presets}>
          {COUNT_PRESETS.slice(6).map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.preset,
                { borderColor: colors.border, backgroundColor: presetId === p.id ? colors.statusRead : colors.bgCard },
              ]}
              onPress={() => applyPreset(p)}
            >
              <Text style={{ color: colors.textPrimary }}>×{p.n}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>{t('tools.tasbih.phraseNoteHint')}</Text>
        <TextInput
          style={[
            styles.noteInput,
            { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgCard },
          ]}
          placeholder={t('tools.tasbih.phraseNotePh')}
          placeholderTextColor={colors.textSecondary}
          value={phraseNote}
          onChangeText={setPhraseNote}
          maxLength={120}
        />
        <View style={[styles.customRow, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.customInput, { color: colors.textPrimary }]}
            placeholder={t('tools.tasbih.customPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            value={customText}
            onChangeText={setCustomText}
            maxLength={4}
          />
          <TouchableOpacity style={[styles.customBtn, { backgroundColor: colors.accentGreen }]} onPress={applyCustom}>
            <Text style={styles.customBtnTxt}>{t('tools.tasbih.applyCustom')}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.big, { backgroundColor: colors.accentGreen }]}
          onPress={tap}
          accessibilityRole="button"
        >
          <Text style={styles.bigNum}>{count}</Text>
          <Text style={styles.bigSub}>/ {target}</Text>
          <Text style={styles.bigCap} numberOfLines={1}>
            {presetLabel}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.reset, { borderColor: colors.border }]} onPress={reset}>
          <Text style={{ color: colors.textPrimary }}>{t('tools.tasbih.reset')}</Text>
        </TouchableOpacity>

        <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>{t('tools.tasbih.historyTitle')}</Text>
        {sessions.length === 0 ? (
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{t('tools.tasbih.historyEmpty')}</Text>
        ) : (
          sessions.map((s) => (
            <View key={s.id} style={[styles.histRow, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                {new Date(s.at).toLocaleString(i18n.language)}
              </Text>
              <Text style={{ color: colors.textPrimary, fontWeight: '600', marginTop: 4 }}>
                {t(`tools.tasbih.presets.${s.presetId}`, { defaultValue: s.presetId })} · ×{s.target}
              </Text>
              {s.phraseNote ? (
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>{s.phraseNote}</Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hint: { textAlign: 'center', marginBottom: Spacing.sm, paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  sub: { fontSize: 12, fontWeight: '600', marginBottom: Spacing.xs, paddingHorizontal: Spacing.md },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center', marginBottom: Spacing.md, paddingHorizontal: Spacing.md },
  preset: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, minWidth: 100, maxWidth: '48%', alignItems: 'center' },
  noteInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  customInput: { flex: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, minHeight: 44 },
  customBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, minHeight: 44, justifyContent: 'center' },
  customBtnTxt: { color: '#fff', fontWeight: '700' },
  big: {
    width: 260,
    height: 260,
    borderRadius: 130,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  bigNum: { color: '#fff', fontSize: 52, fontWeight: '800' },
  bigSub: { color: '#fff', fontSize: 18 },
  bigCap: { color: '#fff', fontSize: 11, marginTop: 6, textAlign: 'center', opacity: 0.95 },
  reset: { alignSelf: 'center', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: Radius.md, borderWidth: 1 },
  historyTitle: { fontSize: 16, fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.sm, paddingHorizontal: Spacing.md },
  histRow: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
});
