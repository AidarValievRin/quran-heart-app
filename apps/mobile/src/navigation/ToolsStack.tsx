import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../theme/ThemeContext';
import { ToolsHomeScreen } from '../screens/tools/ToolsHomeScreen';
import { PrayerTimesScreen } from '../screens/tools/PrayerTimesScreen';
import { QiblaScreen } from '../screens/tools/QiblaScreen';
import { TasbihScreen } from '../screens/tools/TasbihScreen';
import { AdhkarScreen } from '../screens/tools/AdhkarScreen';
import { HijriScreen } from '../screens/tools/HijriScreen';
import { Names99Screen } from '../screens/tools/Names99Screen';
import { ZakatScreen } from '../screens/tools/ZakatScreen';
import { MosqueScreen } from '../screens/tools/MosqueScreen';
import { TajweedScreen } from '../screens/tools/TajweedScreen';
import { CommunityHomeScreen } from '../screens/community/CommunityHomeScreen';
import { FamilyCircleScreen } from '../screens/community/FamilyCircleScreen';
import { RamadanScreen } from '../screens/community/RamadanScreen';
import { FridayScreen } from '../screens/community/FridayScreen';
import { ShareSnippetScreen } from '../screens/community/ShareSnippetScreen';
import { AyahOfDayScreen } from '../screens/learn/AyahOfDayScreen';
import { SeerahOutlineScreen } from '../screens/learn/SeerahOutlineScreen';
import { LecturesScreen } from '../screens/learn/LecturesScreen';
import { HajjGuideScreen } from '../screens/learn/HajjGuideScreen';
import { SyncStatusScreen } from '../screens/tools/SyncStatusScreen';

const Stack = createStackNavigator();

export function ToolsStack() {
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
      <Stack.Screen name="ToolsHome" component={ToolsHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PrayerTimes" component={PrayerTimesScreen} options={{ title: t('tools.prayer.title') }} />
      <Stack.Screen name="Qibla" component={QiblaScreen} options={{ title: t('tools.qibla.title') }} />
      <Stack.Screen name="Tasbih" component={TasbihScreen} options={{ title: t('tools.tasbih.title') }} />
      <Stack.Screen name="Adhkar" component={AdhkarScreen} options={{ title: t('tools.adhkar.title') }} />
      <Stack.Screen name="Hijri" component={HijriScreen} options={{ title: t('tools.hijri.title') }} />
      <Stack.Screen name="Names99" component={Names99Screen} options={{ title: t('tools.names99.title') }} />
      <Stack.Screen name="Zakat" component={ZakatScreen} options={{ title: t('tools.zakat.title') }} />
      <Stack.Screen name="Mosque" component={MosqueScreen} options={{ title: t('tools.mosque.title') }} />
      <Stack.Screen name="Tajweed" component={TajweedScreen} options={{ title: t('tajweed.title') }} />
      <Stack.Screen name="CommunityHome" component={CommunityHomeScreen} options={{ title: t('community.title') }} />
      <Stack.Screen name="FamilyCircle" component={FamilyCircleScreen} options={{ title: t('community.family.title') }} />
      <Stack.Screen name="Ramadan" component={RamadanScreen} options={{ title: t('community.ramadan.title') }} />
      <Stack.Screen name="Friday" component={FridayScreen} options={{ title: t('community.friday.title') }} />
      <Stack.Screen name="ShareSnippet" component={ShareSnippetScreen} options={{ title: t('community.share.title') }} />
      <Stack.Screen name="AyahOfDay" component={AyahOfDayScreen} options={{ title: t('content.ayahDay.title') }} />
      <Stack.Screen name="SeerahOutline" component={SeerahOutlineScreen} options={{ title: t('content.seerah.title') }} />
      <Stack.Screen name="Lectures" component={LecturesScreen} options={{ title: t('content.lectures.title') }} />
      <Stack.Screen name="HajjGuide" component={HajjGuideScreen} options={{ title: t('content.hajj.title') }} />
      <Stack.Screen name="SyncStatus" component={SyncStatusScreen} options={{ title: t('sync.title') }} />
    </Stack.Navigator>
  );
}
