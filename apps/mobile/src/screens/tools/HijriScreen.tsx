import React, { useMemo } from 'react';
import { Text, StyleSheet, SafeAreaView, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme';

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function hijriParts(d: Date): { day: number; month: number; year: number } | null {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-civil', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).formatToParts(d);
    const get = (type: string) => parseInt(parts.find((p) => p.type === type)?.value ?? '', 10);
    const day = get('day');
    const month = get('month');
    const year = get('year');
    if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null;
    return { day, month, year };
  } catch {
    return null;
  }
}

function gregWeekday(d: Date): number {
  return d.getDay();
}

export function HijriScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const today = useMemo(() => new Date(), []);
  const days = useMemo(() => {
    const out: Date[] = [];
    for (let i = -7; i <= 28; i++) out.push(addDays(today, i));
    return out;
  }, [today]);

  const gLine = (d: Date) =>
    d.toLocaleDateString(i18n.language.startsWith('ru') ? 'ru-RU' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xl }}>
        <Text style={[styles.purpose, { color: colors.textSecondary }]}>{t('tools.hijri.purpose')}</Text>
        <Text style={[styles.legend, { color: colors.textSecondary }]}>{t('tools.hijri.legend')}</Text>
        {days.map((d) => {
          const h = hijriParts(d);
          const wd = gregWeekday(d);
          const isMonThu = wd === 1 || wd === 4;
          const isWhite = h && h.day >= 13 && h.day <= 15;
          const isRamadan = h && h.month === 9;
          const isToday = d.toDateString() === today.toDateString();
          return (
            <View
              key={d.toISOString()}
              style={[
                styles.row,
                {
                  borderColor: colors.border,
                  backgroundColor: isToday ? colors.statusRead : colors.bgCard,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{gLine(d)}</Text>
                <Text style={{ color: colors.accentGreen, marginTop: 4, fontSize: 13 }}>
                  {h ? t('tools.hijri.hijriLine', { d: h.day, m: h.month, y: h.year }) : t('tools.hijri.unsupported')}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, maxWidth: 140, justifyContent: 'flex-end' }}>
                {isMonThu ? (
                  <Badge label={t('tools.hijri.badgeMonThu')} colors={colors} variant="muted" />
                ) : null}
                {isWhite ? <Badge label={t('tools.hijri.badgeWhite')} colors={colors} variant="gold" /> : null}
                {isRamadan ? <Badge label={t('tools.hijri.badgeRamadan')} colors={colors} variant="green" /> : null}
              </View>
            </View>
          );
        })}
        <Text style={[styles.note, { color: colors.textSecondary }]}>{t('tools.hijri.note')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Badge({
  label,
  colors,
  variant,
}: {
  label: string;
  colors: { accentGold: string; accentGreen: string; textSecondary: string; border: string };
  variant: 'muted' | 'gold' | 'green';
}) {
  const bg =
    variant === 'gold'
      ? 'rgba(212,175,55,0.2)'
      : variant === 'green'
        ? 'rgba(31,107,94,0.25)'
        : 'rgba(128,128,128,0.15)';
  const fg = variant === 'green' ? colors.accentGreen : variant === 'gold' ? colors.accentGold : colors.textSecondary;
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: colors.border }]}>
      <Text style={{ color: fg, fontSize: 10, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  purpose: { fontSize: 13, lineHeight: 20, marginBottom: Spacing.md },
  legend: { fontSize: 11, lineHeight: 16, marginBottom: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  badge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: Radius.full, borderWidth: StyleSheet.hairlineWidth },
  note: { fontSize: 11, marginTop: Spacing.lg, lineHeight: 16 },
});
