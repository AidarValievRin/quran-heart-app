import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/settingsStore';
import { useAppTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme';

const STEPS = 6;

export function OnboardingScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const [step, setStep] = useState(0);
  const intentionDraft = useSettingsStore((s) => s.intentionText);
  const setIntentionText = useSettingsStore((s) => s.setIntentionText);
  const setLang = useSettingsStore((s) => s.setInterfaceLang);
  const setTrans = useSettingsStore((s) => s.setQuranTranslation);
  const setReader = useSettingsStore((s) => s.setReader);
  const finish = useSettingsStore((s) => s.setOnboardingCompleted);
  const [localIntention, setLocalIntention] = useState(intentionDraft);

  const next = () => setStep((s) => Math.min(STEPS - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const complete = () => {
    setIntentionText(localIntention);
    finish(true);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.progress, { color: colors.textSecondary }]}>
          {t('onboarding.stepProgress', { current: step + 1, total: STEPS })}
        </Text>

        {step === 0 && (
          <View style={styles.block}>
            <Text style={[styles.bism, { color: colors.accentGreen }]}>{t('onboarding.bismillah')}</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>
              {t('onboarding.bismillahTranslation')}
            </Text>
          </View>
        )}

        {step === 1 && (
          <View style={styles.block}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{t('onboarding.step1.title')}</Text>
            <TouchableOpacity
              style={[styles.btn, { borderColor: colors.border, backgroundColor: colors.bgCard }]}
              onPress={() => {
                setLang('ru');
                void i18n.changeLanguage('ru');
                next();
              }}
            >
              <Text style={{ color: colors.textPrimary }}>Русский</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { borderColor: colors.border, backgroundColor: colors.bgCard }]}
              onPress={() => {
                setLang('en');
                void i18n.changeLanguage('en');
                next();
              }}
            >
              <Text style={{ color: colors.textPrimary }}>English</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.block}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{t('onboarding.step2.title')}</Text>
            <TouchableOpacity
              style={[styles.btn, { borderColor: colors.border, backgroundColor: colors.bgCard }]}
              onPress={() => {
                setTrans('kuliev');
                next();
              }}
            >
              <Text style={{ color: colors.textPrimary }}>{t('onboarding.step2.kuliev')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { borderColor: colors.border, backgroundColor: colors.bgCard }]}
              onPress={() => {
                setTrans('sahih');
                next();
              }}
            >
              <Text style={{ color: colors.textPrimary }}>{t('onboarding.step2.sahih')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { borderColor: colors.border, backgroundColor: colors.bgCard }]}
              onPress={() => {
                setTrans('none');
                next();
              }}
            >
              <Text style={{ color: colors.textPrimary }}>{t('onboarding.step2.none')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.block}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{t('onboarding.step3.title')}</Text>
            <TouchableOpacity
              style={[styles.btn, { borderColor: colors.border, backgroundColor: colors.bgCard }]}
              onPress={() => {
                setReader('mishari');
                next();
              }}
            >
              <Text style={{ color: colors.textPrimary }}>{t('onboarding.step3.mishari')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 4 && (
          <View style={styles.block}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{t('onboarding.step4.title')}</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>{t('onboarding.step4.hint')}</Text>
            <TouchableOpacity style={[styles.primary, { backgroundColor: colors.accentGreen }]} onPress={next}>
              <Text style={styles.primaryTxt}>{t('onboarding.step4.skip')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 5 && (
          <View style={styles.block}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{t('onboarding.intentionScreen.title')}</Text>
            {(['memorize', 'understand', 'connect', 'remember'] as const).map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.btn, { borderColor: colors.border, backgroundColor: colors.bgCard }]}
                onPress={() => {
                  setLocalIntention(t(`onboarding.intentionScreen.${key}`));
                }}
              >
                <Text style={{ color: colors.textPrimary }}>{t(`onboarding.intentionScreen.${key}`)}</Text>
              </TouchableOpacity>
            ))}
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.bgCard },
              ]}
              placeholder={t('onboarding.intentionScreen.custom')}
              placeholderTextColor={colors.textSecondary}
              value={localIntention}
              onChangeText={setLocalIntention}
              multiline
            />
            <TouchableOpacity style={[styles.primary, { backgroundColor: colors.accentGold }]} onPress={complete}>
              <Text style={styles.primaryTxt}>{t('onboarding.start')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 0 && (
          <TouchableOpacity style={[styles.primary, { backgroundColor: colors.accentGreen }]} onPress={next}>
            <Text style={styles.primaryTxt}>{t('onboarding.next')}</Text>
          </TouchableOpacity>
        )}

        {step > 0 && step < 5 && step !== 1 && step !== 2 && step !== 3 && (
          <TouchableOpacity onPress={back}>
            <Text style={{ color: colors.accentGreen, textAlign: 'center', marginTop: Spacing.md }}>
              {t('onboarding.back')}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  progress: { textAlign: 'center', marginBottom: Spacing.md },
  block: { marginBottom: Spacing.lg },
  title: { fontSize: 20, fontWeight: '700', marginBottom: Spacing.md },
  bism: { fontSize: 26, textAlign: 'center', marginBottom: Spacing.sm },
  sub: { textAlign: 'center', marginBottom: Spacing.md, lineHeight: 22 },
  btn: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  primary: { padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center', marginTop: Spacing.md },
  primaryTxt: { color: '#fff', fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 80,
    marginTop: Spacing.md,
    textAlignVertical: 'top',
  },
});
