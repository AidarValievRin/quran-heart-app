import React, { useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { AppNavigator } from './AppNavigator';
import { getDatabase } from '../db/database';
import i18n from '../i18n';

export function RootNavigator() {
  const onboardingCompleted = useSettingsStore((s) => s.onboardingCompleted);
  const interfaceLang = useSettingsStore((s) => s.interfaceLang);

  useEffect(() => {
    void getDatabase();
  }, []);

  useEffect(() => {
    void i18n.changeLanguage(interfaceLang);
  }, [interfaceLang]);

  if (!onboardingCompleted) {
    return <OnboardingScreen />;
  }

  return <AppNavigator />;
}
