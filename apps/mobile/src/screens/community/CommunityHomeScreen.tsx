import React from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

type Nav = { navigate: (name: string) => void };

export function CommunityHomeScreen({ navigation }: { navigation: Nav }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const row = (label: string, screen: string) => (
    <TouchableOpacity
      key={screen}
      style={[styles.row, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
      onPress={() => navigation.navigate(screen)}
    >
      <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{label}</Text>
      <Text style={{ color: colors.textSecondary }}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>{t('community.subtitle')}</Text>
        {row(t('community.family.title'), 'FamilyCircle')}
        {row(t('community.ramadan.title'), 'Ramadan')}
        {row(t('community.friday.title'), 'Friday')}
        {row(t('community.share.title'), 'ShareSnippet')}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  sub: { fontSize: 13, marginBottom: Spacing.lg, lineHeight: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
});
