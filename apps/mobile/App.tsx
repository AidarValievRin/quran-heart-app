import React from 'react';
import { StatusBar } from 'expo-status-bar';
import './src/i18n';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#FBF8F1" />
      <AppNavigator />
    </>
  );
}
