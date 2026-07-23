import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { initDb } from '../src/db';
import { setupStudyNotifications } from '../src/notifications';
import { ThemeProvider } from '../src/theme';

export default function RootLayout() {
  const [loaded] = useFonts({ SFCompact: require('../assets/fonts/SF-Compact.ttf') });
  useEffect(() => {
    initDb();
    setupStudyNotifications().catch(() => {});
  }, []);
  if (!loaded) return null;
  return <ThemeProvider><Stack screenOptions={{ headerShown: false }} /></ThemeProvider>;
}
