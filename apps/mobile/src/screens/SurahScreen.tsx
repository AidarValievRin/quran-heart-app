import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { SURAHS } from '../data/surahsMeta';
import { Colors, Spacing } from '../theme';

export function SurahScreen({ route, navigation }: any) {
  const { surahId } = route.params as { surahId: number };
  const surah = SURAHS[surahId - 1];
  const colors = Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgMain }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={{ color: colors.accentGreen, fontSize: 16 }}>← Назад</Text>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={[styles.nameAr, { color: colors.accentGreen }]}>{surah.nameAr}</Text>
        <Text style={[styles.nameTranslit, { color: colors.textSecondary }]}>{surah.nameTranslit}</Text>
        <Text style={[styles.nameRu, { color: colors.textPrimary }]}>{surah.nameRu}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          Сура {surah.number} · {surah.ayahCount} аятов · {surah.revelationPlace === 'meccan' ? 'Мекканская' : 'Мединская'}
        </Text>
      </View>
      <View style={styles.placeholder}>
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
          Текст аятов загружается...{'\n'}
          (Будет подключён после загрузки данных с Tanzil.net)
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  back: { padding: Spacing.md },
  header: { alignItems: 'center', paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: '#E8E1D2' },
  nameAr: { fontSize: 42, fontWeight: '700' },
  nameTranslit: { fontSize: 18, marginTop: 4 },
  nameRu: { fontSize: 22, fontWeight: '600', marginTop: 4 },
  meta: { fontSize: 14, marginTop: 8 },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
});
