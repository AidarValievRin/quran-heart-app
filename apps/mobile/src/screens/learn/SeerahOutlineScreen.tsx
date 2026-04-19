import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

const KEYS = ['birth', 'prophethood', 'hijra', 'madina', 'farewell'] as const;

export function SeerahOutlineScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>{t('content.seerah.disclaimer')}</Text>
      <FlatList
        data={[...KEYS]}
        keyExtractor={(k) => k}
        contentContainerStyle={{ padding: Spacing.md }}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
            <Text style={{ color: colors.accentGreen, fontWeight: '700' }}>{t(`content.seerah.items.${item}.title`)}</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 6, lineHeight: 20 }}>
              {t(`content.seerah.items.${item}.body`)}
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
