import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2563eb' }}>
      <Tabs.Screen name="index" options={{ title: 'Kotoba', tabBarIcon: ({ color, size }) => <Ionicons name="book" color={color} size={size} /> }} />
      <Tabs.Screen name="flashcard" options={{ title: 'Flashcard', tabBarIcon: ({ color, size }) => <Ionicons name="albums" color={color} size={size} /> }} />
      <Tabs.Screen name="add" options={{ title: 'Tambah', tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} /> }} />
    </Tabs>
  );
}
