import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HeartScreen } from '../screens/HeartScreen';
import { SurahScreen } from '../screens/SurahScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { ProfileStack } from './ProfileStack';
import { ToolsStack } from './ToolsStack';
import { useAppTheme } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HeartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HeartMain" component={HeartScreen} />
      <Stack.Screen name="Surah" component={SurahScreen} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { t } = useTranslation();
  const { colors, resolvedScheme } = useAppTheme();
  const navTheme = resolvedScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer
      theme={{
        ...navTheme,
        colors: {
          ...navTheme.colors,
          background: colors.bgMain,
          card: colors.bgCard,
          text: colors.textPrimary,
          border: colors.border,
          primary: colors.accentGreen,
        },
      }}
    >
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.bgCard,
            borderTopColor: colors.border,
            height: 60,
          },
          tabBarActiveTintColor: colors.accentGreen,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: { fontSize: 11, marginBottom: 6 },
        }}
      >
        <Tab.Screen
          name="Heart"
          component={HeartStack}
          options={{
            tabBarLabel: t('tabs.heart'),
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>♡</Text>,
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarLabel: t('tabs.search'),
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⌕</Text>,
          }}
        />
        <Tab.Screen
          name="Tools"
          component={ToolsStack}
          options={{
            tabBarLabel: t('tabs.tools'),
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>☆</Text>,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          options={{
            tabBarLabel: t('tabs.profile'),
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>◎</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
