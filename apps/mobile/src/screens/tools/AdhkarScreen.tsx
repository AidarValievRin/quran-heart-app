import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';
import { ADHKAR_ROUTINE_ITEMS, type AdhkarRoutinePeriod } from '../../data/adhkarRoutine';
import { useAdhkarDailyStore } from '../../store/adhkarDailyStore';

type Nav = {
  navigate: (name: string, params?: object) => void;
  getParent: () => { navigate: (n: string, p?: object) => void } | undefined;
};

const QUICK: { key: string; surahId: number }[] = [
  { key: 'fatiha', surahId: 1 },
  { key: 'bakara255', surahId: 2 },
  { key: 'falaq', surahId: 113 },
  { key: 'nas', surahId: 114 },
];

export function AdhkarScreen({ navigation }: { navigation: Nav }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [tab, setTab] = useState<AdhkarRoutinePeriod | 'quick'>('morning');
  const toggleDone = useAdhkarDailyStore((s) => s.toggleDoneToday);
  const isDone = useAdhkarDailyStore((s) => s.isDoneToday);
  const incrementRead = useAdhkarDailyStore((s) => s.incrementReadToday);
  const readCount = useAdhkarDailyStore((s) => s.readCountToday);

  const openSurah = (surahId: number, ayah?: number) => {
    navigation.getParent()?.navigate('Heart', { screen: 'Surah', params: { surahId, ayah } });
  };

  const routineList =
    tab === 'quick' ? [] : ADHKAR_ROUTINE_ITEMS.filter((x) => x.period === tab);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xl }}>
        <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>{t('tools.adhkar.disclaimer')}</Text>

        <View style={styles.tabs}>
          {(['morning', 'evening', 'quick'] as const).map((k) => (
            <TouchableOpacity
              key={k}
              style={[
                styles.tab,
                { borderColor: colors.border },
                tab === k && { backgroundColor: colors.accentGreen },
              ]}
              onPress={() => setTab(k)}
            >
              <Text style={{ color: tab === k ? '#fff' : colors.textPrimary, fontSize: 12, fontWeight: '600' }}>
                {t(`tools.adhkar.tabs.${k}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab !== 'quick' ? (
          <>
            <Text style={[styles.section, { color: colors.textSecondary }]}>{t('tools.adhkar.routineSection')}</Text>
            {routineList.map((it) => {
              const done = isDone(it.id);
              const rc = readCount(it.id);
              return (
                <View key={it.id} style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
                  <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                    {t(`tools.adhkar.routine.${it.titleKey}.title`)}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                    {t(`tools.adhkar.routine.${it.titleKey}.hint`)}
                  </Text>
                  {it.repeats > 1 ? (
                    <Text style={{ color: colors.accentGold, marginTop: 6, fontSize: 12 }}>
                      {t('tools.adhkar.repeatProgress', { current: rc, total: it.repeats })}
                    </Text>
                  ) : null}
                  <View style={styles.rowBtns}>
                    <TouchableOpacity
                      style={[styles.btn, { backgroundColor: colors.accentGreen }]}
                      onPress={() => openSurah(it.surah, it.ayah)}
                    >
                      <Text style={styles.btnTxt}>{t('tools.adhkar.openReader')}</Text>
                    </TouchableOpacity>
                    {it.repeats > 1 ? (
                      <TouchableOpacity
                        style={[styles.btn, { backgroundColor: colors.accentGold }]}
                        onPress={() => incrementRead(it.id, it.repeats)}
                      >
                        <Text style={[styles.btnTxt, { color: '#1a1a1a' }]}>{t('tools.adhkar.logRead')}</Text>
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity
                      style={[styles.btn, { borderWidth: 1, borderColor: colors.border, backgroundColor: 'transparent' }]}
                      onPress={() => toggleDone(it.id)}
                    >
                      <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                        {done ? t('tools.adhkar.markUndone') : t('tools.adhkar.markDone')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        ) : (
          <>
            <Text style={[styles.section, { color: colors.textSecondary }]}>{t('tools.adhkar.quickSection')}</Text>
            {QUICK.map((it) => (
              <TouchableOpacity
                key={it.key}
                style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}
                onPress={() => openSurah(it.surahId)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{t(`tools.adhkar.items.${it.key}.title`)}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                    {t(`tools.adhkar.items.${it.key}.hint`)}
                  </Text>
                </View>
                <Text style={{ color: colors.accentGreen }}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        <Text style={[styles.note, { color: colors.textSecondary }]}>{t('tools.adhkar.hisnNote')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  disclaimer: { fontSize: 11, lineHeight: 16, marginBottom: Spacing.md },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  tab: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.full, borderWidth: 1 },
  section: { fontSize: 12, fontWeight: '700', marginBottom: Spacing.sm },
  card: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  rowBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  btn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.md },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },
  note: { fontSize: 11, marginTop: Spacing.lg },
});
