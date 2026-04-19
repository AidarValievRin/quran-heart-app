import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

const PRESETS = [33, 33, 34, 100] as const;

export function TasbihScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [target, setTarget] = useState<number>(33);
  const [count, setCount] = useState(0);

  const tap = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCount((c) => {
      const n = c + 1;
      if (n >= target) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return 0;
      }
      return n;
    });
  };

  const reset = () => {
    void Haptics.selectionAsync();
    setCount(0);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('tools.tasbih.hint')}</Text>
      <View style={styles.presets}>
        {PRESETS.map((n) => (
          <TouchableOpacity
            key={n}
            style={[
              styles.preset,
              { borderColor: colors.border, backgroundColor: target === n ? colors.statusRead : colors.bgCard },
            ]}
            onPress={() => {
              setTarget(n);
              setCount(0);
            }}
          >
            <Text style={{ color: colors.textPrimary }}>×{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.big, { backgroundColor: colors.accentGreen }]}
        onPress={tap}
        accessibilityRole="button"
      >
        <Text style={styles.bigNum}>{count}</Text>
        <Text style={styles.bigSub}>/ {target}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.reset, { borderColor: colors.border }]} onPress={reset}>
        <Text style={{ color: colors.textPrimary }}>{t('tools.tasbih.reset')}</Text>
      </TouchableOpacity>
      <Text style={[styles.custom, { color: colors.textSecondary }]}>{t('tools.tasbih.customNote')}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.md, alignItems: 'center' },
  hint: { textAlign: 'center', marginBottom: Spacing.md },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center', marginBottom: Spacing.lg },
  preset: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1 },
  big: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  bigNum: { color: '#fff', fontSize: 48, fontWeight: '800' },
  bigSub: { color: '#fff', fontSize: 16 },
  reset: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: Radius.md, borderWidth: 1 },
  custom: { marginTop: Spacing.lg, fontSize: 12, textAlign: 'center' },
});
