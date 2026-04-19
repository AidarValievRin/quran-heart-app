import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TextInput, FlatList, TouchableOpacity,
} from 'react-native';
import { SURAHS } from '../data/surahsMeta';
import { Colors, Spacing, Radius } from '../theme';

export function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const colors = Colors.light;

  const results = query.length < 2 ? [] : SURAHS.filter((s) =>
    s.nameRu.toLowerCase().includes(query.toLowerCase()) ||
    s.nameEn.toLowerCase().includes(query.toLowerCase()) ||
    s.nameTranslit.toLowerCase().includes(query.toLowerCase()) ||
    String(s.number).includes(query)
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgMain }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Поиск</Text>
      <View style={[styles.searchBox, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <TextInput
          style={{ flex: 1, fontSize: 16, color: colors.textPrimary }}
          placeholder="Название суры или номер..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>
      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Heart', { screen: 'Surah', params: { surahId: item.id } })}
          >
            <Text style={[styles.itemNameAr, { color: colors.accentGreen }]}>{item.nameAr}</Text>
            <Text style={[styles.itemNameRu, { color: colors.textPrimary }]}>{item.nameRu}</Text>
            <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
              № {item.number} · {item.ayahCount} аятов
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: Spacing.md, gap: 8 }}
        ListEmptyComponent={
          query.length >= 2 ? (
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
              Ничего не найдено
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', padding: Spacing.lg },
  searchBox: {
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
  },
  item: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  itemNameAr: { fontSize: 22, fontWeight: '600', textAlign: 'right' },
  itemNameRu: { fontSize: 16, marginTop: 2 },
  itemMeta: { fontSize: 13, marginTop: 2 },
});
