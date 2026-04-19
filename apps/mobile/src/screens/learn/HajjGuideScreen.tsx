import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

const STEPS = ['ihram', 'tawaf', 'sai', 'arafat', 'muzdalifa', 'stoning', 'eid'] as const;

export function HajjGuideScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>{t('content.hajj.disclaimer')}</Text>
      <FlatList
        data={[...STEPS]}
        keyExtractor={(s) => s}
        contentContainerStyle={{ padding: Spacing.md }}
        renderItem={({ item, index }) => (
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
            <Text style={{ color: colors.accentGreen, fontWeight: '700' }}>
              {index + 1}. {t(`content.hajj.steps.${item}.title`)}
            </Text>
            <Text style={{ color: colors.textSecondary, marginTop: 6, lineHeight: 20 }}>
              {t(`content.hajj.steps.${item}.body`)}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  disclaimer: { fontSize: 11, lineHeight: 16, padding: Spacing.md },
  card: { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.sm },
});
