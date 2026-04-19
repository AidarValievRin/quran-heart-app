import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';
import sample from '../../data/content/names99.sample.json';

type Item = (typeof sample.items)[number];

export function Names99Screen() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const lang = i18n.language.startsWith('ru') ? 'ru' : 'en';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>{t('tools.names99.disclaimer')}</Text>
      <Text style={[styles.attr, { color: colors.textSecondary }]}>{sample.attribution}</Text>
      <FlatList
        data={sample.items as Item[]}
        keyExtractor={(it) => String(it.order)}
        contentContainerStyle={{ padding: Spacing.md }}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
            <Text style={{ color: colors.accentGreen, fontWeight: '700' }}>{item.order}</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 16, marginTop: 4 }}>{item.transliteration}</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
              {lang === 'ru' ? item.meaningRu : item.meaningEn}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  disclaimer: { fontSize: 11, paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  attr: { fontSize: 10, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  card: { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.sm },
});
