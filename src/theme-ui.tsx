import { createContext, useContext, useState, type ReactNode } from 'react';
import { Appearance, Platform, useColorScheme } from 'react-native';

type ThemeMode = 'system' | 'light' | 'dark';
const ThemeModeContext = createContext<{ mode: ThemeMode; setMode: (mode: ThemeMode) => void }>({ mode: 'system', setMode: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  function setMode(next: ThemeMode) {
    setModeState(next);
    Appearance.setColorScheme(next === 'system' ? null : next);
  }
  return <ThemeModeContext.Provider value={{ mode, setMode }}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

export function useTheme() {
  const { mode } = useThemeMode();
  const scheme = useColorScheme();
  const dark = mode === 'dark' || (mode === 'system' && scheme === 'dark');
  return {
    dark,
    bg: dark ? '#09090b' : '#f8fafc',
    card: dark ? '#18181b' : '#ffffff',
    card2: dark ? '#27272a' : '#e2e8f0',
    dock: dark ? 'rgba(24,24,27,0.94)' : 'rgba(255,255,255,0.94)',
    text: dark ? '#f8fafc' : '#0f172a',
    sub: dark ? '#a1a1aa' : '#64748b',
    label: dark ? '#d4d4d8' : '#334155',
    border: dark ? '#3f3f46' : '#e2e8f0',
    primary: '#2563eb',
    primarySoft: dark ? '#1e3a8a' : '#dbeafe',
    danger: '#dc2626',
    success: '#16a34a',
    warn: '#ea580c',
    font: Platform.select({ ios: 'SFCompact', android: 'SFCompact', default: 'SFCompact' })
  };
}
