import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing } from '../../theme';

export function SyncStatusScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
        <Text style={[styles.p, { color: colors.textPrimary }]}>{t('sync.p1')}</Text>
        <Text style={[styles.p, { color: colors.textSecondary }]}>{t('sync.p2')}</Text>
        <Text style={[styles.p, { color: colors.textSecondary }]}>{t('sync.p3')}</Text>
        <View style={[styles.box, { borderColor: colors.border, backgroundColor: colors.bgCard }]}>
          <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{t('sync.apiStub')}</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 6, fontSize: 12 }}>GET /v1/health</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  p: { fontSize: 14, lineHeight: 22, marginBottom: Spacing.md },
  box: { padding: Spacing.md, borderRadius: 8, borderWidth: 1 },
});
