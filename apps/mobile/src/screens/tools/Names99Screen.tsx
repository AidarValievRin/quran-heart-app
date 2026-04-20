import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useFonts, Amiri_400Regular } from '@expo-google-fonts/amiri';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';
import bundle from '../../data/content/names99.bundle.json';

type Item = (typeof bundle.items)[number] & { descriptionRu?: string };

export function Names99Screen() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const lang = i18n.language.startsWith('ru') ? 'ru' : 'en';
  const [fontsLoaded] = useFonts({ Amiri_400Regular });
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (order: number) => {
    setOpen((o) => (o === order ? null : order));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>{t('tools.names99.disclaimer')}</Text>
      <Text style={[styles.attr, { color: colors.textSecondary }]}>{bundle.attribution}</Text>
      <FlatList
        data={bundle.items as Item[]}
        keyExtractor={(it) => String(it.order)}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xl }}
        renderItem={({ item }) => {
          const expanded = open === item.order;
          const meaning =
            lang === 'ru' && item.meaningRu?.trim()
              ? item.meaningRu
              : item.meaningEn;
          return (
            <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
              <TouchableOpacity onPress={() => toggle(item.order)} activeOpacity={0.7}>
                <Text style={{ color: colors.accentGreen, fontWeight: '700' }}>{item.order}</Text>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 22,
                    marginTop: 6,
                    textAlign: 'right',
                    writingDirection: 'rtl',
                    fontFamily: fontsLoaded ? 'Amiri_400Regular' : undefined,
                  }}
                >
                  {item.nameAr}
                </Text>
                <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{item.transliteration}</Text>
                <Text style={{ color: colors.textPrimary, marginTop: 6 }}>{meaning}</Text>
                <Text style={{ color: colors.accentGreen, marginTop: 8, fontSize: 12 }}>
                  {expanded ? t('tools.names99.tapCollapse') : t('tools.names99.tapExpand')}
                </Text>
              </TouchableOpacity>
              {expanded ? (
                <View style={{ marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}>
                  {item.descriptionRu ? (
                    <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: Spacing.sm }}>
                      {item.descriptionRu}
                    </Text>
                  ) : null}
                  <Text style={{ color: colors.textSecondary, fontSize: 11, fontStyle: 'italic', lineHeight: 16 }}>
                    {t('tools.names99.detailNote')}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        }}
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
