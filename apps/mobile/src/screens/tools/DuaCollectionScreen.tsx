import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

const CATS = ['food', 'travel', 'home', 'health'] as const;

export function DuaCollectionScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xl }}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('tools.dua.title')}</Text>
        <Text style={[styles.p, { color: colors.textSecondary }]}>{t('tools.dua.intro')}</Text>
        {CATS.map((c) => (
          <View key={c} style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
            <Text style={{ color: colors.accentGreen, fontWeight: '700' }}>{t(`tools.dua.categories.${c}.title`)}</Text>
            <Text style={{ color: colors.textSecondary, marginTop: Spacing.sm, lineHeight: 20 }}>
              {t(`tools.dua.categories.${c}.body`)}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: Spacing.md, fontStyle: 'italic' }}>
              {t('tools.dua.sourceHint')}
            </Text>
          </View>
        ))}
        <TouchableOpacity style={[styles.footer, { borderColor: colors.border }]} disabled>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t('tools.dua.offlineNote')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: Spacing.sm },
  p: { fontSize: 13, lineHeight: 20, marginBottom: Spacing.lg },
  card: { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.md },
  footer: { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginTop: Spacing.sm },
});
