import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

/** Dev default; on device set your machine LAN IP in a future setting. */
const DEV_HEALTH = Platform.OS === 'android' ? 'http://10.0.2.2:8787/v1/health' : 'http://127.0.0.1:8787/v1/health';

export function SyncStatusScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const ping = async () => {
    setPinging(true);
    setPingResult(null);
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 5000);
      const res = await fetch(DEV_HEALTH, { signal: ctrl.signal });
      clearTimeout(tid);
      const json = await res.json();
      setPingResult(t('sync.pingOk', { json: JSON.stringify(json) }));
    } catch {
      setPingResult(t('sync.pingFail'));
    } finally {
      setPinging(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
        <Text style={[styles.p, { color: colors.textPrimary }]}>{t('sync.p1')}</Text>
        <Text style={[styles.p, { color: colors.textSecondary }]}>{t('sync.p2')}</Text>
        <Text style={[styles.p, { color: colors.textSecondary }]}>{t('sync.p3')}</Text>

        <Text style={[styles.h, { color: colors.textPrimary }]}>{t('sync.endpointsTitle')}</Text>
        <Text style={[styles.li, { color: colors.textSecondary }]}>• {t('sync.epHealth')}</Text>
        <Text style={[styles.li, { color: colors.textSecondary }]}>• {t('sync.epSyncStatus')}</Text>
        <Text style={[styles.li, { color: colors.textSecondary }]}>• {t('sync.epAuthAnon')}</Text>
        <Text style={[styles.li, { color: colors.textSecondary }]}>• {t('sync.epSyncPush')}</Text>

        <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('sync.pingHint')}</Text>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.accentGreen }]}
          onPress={() => void ping()}
          disabled={pinging}
        >
          {pinging ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>{t('sync.pingBtn')}</Text>}
        </TouchableOpacity>
        {pingResult ? (
          <Text style={[styles.pingOut, { color: colors.textPrimary }]}>{pingResult}</Text>
        ) : null}

        <View style={[styles.box, { borderColor: colors.border, backgroundColor: colors.bgCard, marginTop: Spacing.lg }]}>
          <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{t('sync.apiStub')}</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 6, fontSize: 12 }}>{DEV_HEALTH}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  p: { fontSize: 14, lineHeight: 22, marginBottom: Spacing.md },
  h: { fontSize: 15, fontWeight: '700', marginTop: Spacing.md, marginBottom: Spacing.sm },
  li: { fontSize: 13, lineHeight: 20, marginBottom: 4, paddingLeft: Spacing.sm },
  hint: { fontSize: 12, lineHeight: 17, marginTop: Spacing.md, marginBottom: Spacing.sm },
  btn: { padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center', minHeight: 48, justifyContent: 'center' },
  btnTxt: { color: '#fff', fontWeight: '700' },
  pingOut: { marginTop: Spacing.md, fontSize: 13, lineHeight: 20 },
  box: { padding: Spacing.md, borderRadius: 8, borderWidth: 1 },
});
