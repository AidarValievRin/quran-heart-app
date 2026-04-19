import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './src/i18n';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';

function StatusBarThemed() {
  const { resolvedScheme } = useAppTheme();
  return <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBarThemed />
        <RootNavigator />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
