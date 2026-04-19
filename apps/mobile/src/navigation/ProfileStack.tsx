import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { ProfileScreen } from '../screens/ProfileScreen';
import { BookmarksScreen } from '../screens/BookmarksScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { HifzQueueScreen } from '../screens/HifzQueueScreen';
import { TrainerContinueScreen } from '../screens/TrainerContinueScreen';
import { TrainerHiddenScreen } from '../screens/TrainerHiddenScreen';
import { TrainerChainScreen } from '../screens/TrainerChainScreen';
import { TrainerAudioScreen } from '../screens/TrainerAudioScreen';
import { HifzStatsScreen } from '../screens/HifzStatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SurahIndexScreen } from '../screens/SurahIndexScreen';
import { useAppTheme } from '../theme/ThemeContext';

const Stack = createStackNavigator();

export function ProfileStack() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.accentGreen,
        headerStyle: { backgroundColor: colors.bgCard },
        headerTitleStyle: { color: colors.textPrimary },
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Bookmarks" component={BookmarksScreen} options={{ title: t('bookmarks.title') }} />
      <Stack.Screen name="Notes" component={NotesScreen} options={{ title: t('notes.title') }} />
      <Stack.Screen name="HifzQueue" component={HifzQueueScreen} options={{ title: t('hifz.queueTitle') }} />
      <Stack.Screen
        name="TrainerContinue"
        component={TrainerContinueScreen}
        options={{ title: t('hifz.trainerContinueTitle') }}
      />
      <Stack.Screen
        name="TrainerHidden"
        component={TrainerHiddenScreen}
        options={{ title: t('hifz.trainerHiddenTitle') }}
      />
      <Stack.Screen
        name="TrainerChain"
        component={TrainerChainScreen}
        options={{ title: t('hifz.trainerChainTitle') }}
      />
      <Stack.Screen
        name="TrainerAudio"
        component={TrainerAudioScreen}
        options={{ title: t('hifz.trainerAudioTitle') }}
      />
      <Stack.Screen name="HifzStats" component={HifzStatsScreen} options={{ title: t('hifz.statsTitle') }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings.title') }} />
      <Stack.Screen name="SurahIndex" component={SurahIndexScreen} options={{ title: t('surahIndex.title') }} />
    </Stack.Navigator>
  );
}
