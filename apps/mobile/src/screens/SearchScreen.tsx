import React, { useDeferredValue, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { searchQuranSections } from '../lib/quranSearch';
import { HighlightedText } from '../lib/searchHighlight';
import { useAppTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme';

export function SearchScreen({ navigation }: { navigation: { navigate: (a: string, b?: object) => void } }) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const [query, setQuery] = React.useState('');
  const deferredQuery = useDeferredValue(query);

  const { surahs, ayahs } = useMemo(
    () => searchQuranSections(deferredQuery),
    [deferredQuery]
  );

  const showEmptyHint = query.length > 0 && query.length < 2;
  const showNoResults =
    query.length >= 2 && surahs.length === 0 && ayahs.length === 0 && deferredQuery === query;

  const goSurah = (surahId: number, ayah?: number) => {
    navigation.navigate('Heart', { screen: 'Surah', params: { surahId, ayah } });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{t('search.title')}</Text>
      <View style={[styles.searchBox, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <TextInput
          style={{ flex: 1, fontSize: 16, color: colors.textPrimary }}
          placeholder={t('search.placeholder')}
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xl }}>
        {showEmptyHint ? (
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.lg }}>
            {t('search.empty')}
          </Text>
        ) : null}
        {showNoResults ? (
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.lg }}>
            {t('search.noResults')}
          </Text>
        ) : null}

        {surahs.length > 0 ? (
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('search.sectionSurahs')}
          </Text>
        ) : null}
        {surahs.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.item, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            onPress={() => goSurah(item.id)}
          >
            <Text style={[styles.itemNameAr, { color: colors.accentGreen }]}>{item.nameAr}</Text>
            <Text style={[styles.itemNameRu, { color: colors.textPrimary }]}>
              {i18n.language.startsWith('en') ? item.nameEn : item.nameRu}
            </Text>
            <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
              № {item.number} · {item.ayahCount} {t('surahCard.ayahs')}
            </Text>
          </TouchableOpacity>
        ))}

        {ayahs.length > 0 ? (
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textSecondary, marginTop: surahs.length ? Spacing.lg : 0 },
            ]}
          >
            {t('search.sectionAyahs')}
          </Text>
        ) : null}
        {ayahs.map((hit) => (
          <TouchableOpacity
            key={`${hit.surah}:${hit.ayah}`}
            style={[styles.item, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            onPress={() => goSurah(hit.surah, hit.ayah)}
          >
            <Text style={[styles.itemMeta, { color: colors.accentGreen, marginBottom: 4 }]}>
              {t('search.ayahMeta', { surah: hit.surah, ayah: hit.ayah })}
            </Text>
            <HighlightedText
              text={hit.preview}
              query={query}
              numberOfLines={4}
              style={[styles.preview, { color: colors.textPrimary }]}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', padding: Spacing.lg, paddingBottom: Spacing.sm },
  searchBox: {
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
  },
  sectionTitle: { fontSize: 12, fontWeight: '700', marginBottom: Spacing.sm, letterSpacing: 0.5 },
  item: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  itemNameAr: { fontSize: 22, fontWeight: '600', textAlign: 'right' },
  itemNameRu: { fontSize: 16, marginTop: 2 },
  itemMeta: { fontSize: 13, marginTop: 2 },
  preview: { fontSize: 14, lineHeight: 20 },
});
