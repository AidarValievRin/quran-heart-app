import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

function parseNum(s: string): number {
  const n = parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export function ZakatScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [cash, setCash] = useState('');
  const [tradeGoods, setTradeGoods] = useState('');
  const [goldG, setGoldG] = useState('');
  const [silverG, setSilverG] = useState('');
  const [goldPrice, setGoldPrice] = useState('70');
  const [silverPrice, setSilverPrice] = useState('1');

  const result = useMemo(() => {
    const cashV = parseNum(cash);
    const tradeV = parseNum(tradeGoods);
    const g = parseNum(goldG);
    const s = parseNum(silverG);
    const gp = parseNum(goldPrice);
    const sp = parseNum(silverPrice);
    const goldValue = g * gp;
    const silverValue = s * sp;
    const nisabGold = 85 * gp;
    const nisabSilver = 595 * sp;
    const zakatable =
      cashV +
      tradeV +
      (goldValue >= nisabGold ? goldValue : 0) +
      (silverValue >= nisabSilver ? silverValue : 0);
    const zakat = zakatable > 0 ? zakatable * 0.025 : 0;
    return { zakat, nisabGold, nisabSilver };
  }, [cash, tradeGoods, goldG, silverG, goldPrice, silverPrice]);

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    keyboard: 'numeric' | 'decimal-pad' = 'decimal-pad'
  ) => (
    <View style={{ marginBottom: Spacing.md }}>
      <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        placeholderTextColor={colors.textSecondary}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: Radius.md,
          padding: Spacing.md,
          color: colors.textPrimary,
          backgroundColor: colors.bgCard,
        }}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
        <Text style={[styles.warn, { color: colors.accentGold }]}>{t('tools.zakat.disclaimer')}</Text>
        {field(t('tools.zakat.cash'), cash, setCash)}
        {field(t('tools.zakat.tradeGoods'), tradeGoods, setTradeGoods)}
        {field(t('tools.zakat.goldGrams'), goldG, setGoldG)}
        {field(t('tools.zakat.silverGrams'), silverG, setSilverG)}
        {field(t('tools.zakat.goldPricePerGram'), goldPrice, setGoldPrice)}
        {field(t('tools.zakat.silverPricePerGram'), silverPrice, setSilverPrice)}
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          {t('tools.zakat.nisabHint', { gold: Math.round(result.nisabGold), silver: Math.round(result.nisabSilver) })}
        </Text>
        <Text style={[styles.out, { color: colors.textPrimary }]}>
          {t('tools.zakat.result', { amount: result.zakat.toFixed(2) })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  warn: { fontSize: 12, lineHeight: 18, marginBottom: Spacing.lg },
  out: { fontSize: 22, fontWeight: '700', marginTop: Spacing.lg },
});
