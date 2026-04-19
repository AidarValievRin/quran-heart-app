import React from 'react';
import {
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../theme/ThemeContext';
import type { ThemePreference } from '../theme/types';
import { Spacing, Radius } from '../theme';
import { useSettingsStore } from '../store/settingsStore';
import { OrnamentAvatar } from '../components/profile/OrnamentAvatar';

export function SettingsScreen() {
  const { t } = useTranslation();
  const { colors, preference, setPreference } = useAppTheme();
  const profileDisplayName = useSettingsStore((s) => s.profileDisplayName);
  const setProfileDisplayName = useSettingsStore((s) => s.setProfileDisplayName);
  const profileOrnamentId = useSettingsStore((s) => s.profileOrnamentId);
  const setProfileOrnamentId = useSettingsStore((s) => s.setProfileOrnamentId);

  const set = (p: ThemePreference) => () => setPreference(p);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{t('settings.title')}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{t('settings.profileSection')}</Text>
      <Text style={[styles.subLabel, { color: colors.textSecondary }]}>{t('settings.profileNameHint')}</Text>
      <TextInput
        style={[
          styles.input,
          { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgCard },
        ]}
        placeholder={t('settings.profileNamePlaceholder')}
        placeholderTextColor={colors.textSecondary}
        value={profileDisplayName}
        onChangeText={setProfileDisplayName}
        maxLength={80}
      />
      <Text style={[styles.subLabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>
        {t('settings.profileOrnamentHint')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.lg }}>
        <View style={{ flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.sm }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((id) => (
            <TouchableOpacity
              key={id}
              onPress={() => setProfileOrnamentId(id)}
              style={[
                styles.ornamentPick,
                {
                  borderColor: profileOrnamentId === id ? colors.accentGold : colors.border,
                  backgroundColor: colors.bgCard,
                },
              ]}
            >
              <OrnamentAvatar presetId={id} size={56} stroke={colors.accentGreen} fill={colors.bgMain} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Text style={[styles.label, { color: colors.textSecondary }]}>{t('settings.appearance')}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: Spacing.sm }}>
        {t('settings.themeCurrent', { value: preference })}
      </Text>
      {(['system', 'light', 'dark'] as const).map((p) => (
        <TouchableOpacity
          key={p}
          style={[
            styles.row,
            {
              backgroundColor: preference === p ? colors.statusRead : colors.bgCard,
              borderColor: colors.border,
            },
          ]}
          onPress={set(p)}
        >
          <Text style={{ color: colors.textPrimary }}>{t(`settings.theme.${p}`)}</Text>
        </TouchableOpacity>
      ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.md },
  title: { fontSize: 22, fontWeight: '700', marginBottom: Spacing.lg },
  label: { marginBottom: Spacing.xs, fontWeight: '600' },
  subLabel: { fontSize: 12, marginBottom: Spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.sm,
  },
  ornamentPick: {
    borderRadius: Radius.md,
    borderWidth: 2,
    padding: Spacing.xs,
  },
  row: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
});
