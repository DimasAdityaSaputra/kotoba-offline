import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../../src/theme';

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: t.bg } }}>
      <Tabs.Screen name="index" options={{ title: 'Kotoba', tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="flashcard" options={{ title: 'Cards', tabBarIcon: ({ color, size }) => <Ionicons name="albums-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="quiz" options={{ title: 'Quiz', tabBarIcon: ({ color, size }) => <Ionicons name="help-circle-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="write" options={{ title: 'Write', tabBarIcon: ({ color, size }) => <Ionicons name="pencil-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="add" options={{ title: 'Add', tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} /> }} />
    </Tabs>
  );
}

function FloatingTabBar({ state, descriptors, navigation }: any) {
  const t = useTheme();
  const tabWidth = 54;
  const gap = 4;
  const step = tabWidth + gap;
  const indicatorX = useRef(new Animated.Value(state.index * step)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const tabScales = useRef(state.routes.map(() => new Animated.Value(1))).current;
  const startX = useRef(0);
  const [visualIndex, setVisualIndex] = useState(state.index);

  useEffect(() => {
    setVisualIndex(state.index);
    Animated.parallel([
      Animated.spring(indicatorX, { toValue: state.index * step, useNativeDriver: true, stiffness: 260, damping: 28, mass: 0.8 }),
      ...tabScales.map((scale: Animated.Value, index: number) => Animated.spring(scale, { toValue: state.index === index ? 1.08 : 1, useNativeDriver: true, stiffness: 300, damping: 24, mass: 0.7 }))
    ]).start();
  }, [state.index, step, indicatorX, tabScales]);

  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5 && Math.abs(g.dy) < 24,
    onPanResponderGrant: () => {
      startX.current = state.index * step;
      indicatorX.stopAnimation();
      Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true, stiffness: 350, damping: 24, mass: 0.6 }).start();
    },
    onPanResponderMove: (_, g) => {
      const max = (state.routes.length - 1) * step;
      const raw = startX.current + g.dx;
      const rubber = raw < 0 ? raw * 0.28 : raw > max ? max + (raw - max) * 0.28 : raw;
      indicatorX.setValue(rubber);
      setVisualIndex(Math.max(0, Math.min(state.routes.length - 1, Math.round(rubber / step))));
    },
    onPanResponderRelease: (_, g) => {
      const maxIndex = state.routes.length - 1;
      const projected = startX.current + g.dx + g.vx * 90;
      const next = Math.max(0, Math.min(maxIndex, Math.round(projected / step)));
      setVisualIndex(next);
      Animated.parallel([
        Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, stiffness: 260, damping: 20, mass: 0.7 }),
        Animated.spring(indicatorX, { toValue: next * step, useNativeDriver: true, stiffness: 260, damping: 26, mass: 0.75 })
      ]).start();
      if (next !== state.index) navigation.navigate(state.routes[next].name);
    },
    onPanResponderTerminate: () => {
      Animated.parallel([
        Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, stiffness: 260, damping: 20, mass: 0.7 }),
        Animated.spring(indicatorX, { toValue: state.index * step, useNativeDriver: true, stiffness: 260, damping: 26, mass: 0.75 })
      ]).start();
      setVisualIndex(state.index);
    }
  }), [state.index, state.routes.length, step, indicatorX, pressScale, navigation]);

  return (
    <View pointerEvents="box-none" style={styles.shell}>
      <Animated.View style={[styles.dock, { backgroundColor: t.dock, borderColor: t.border, shadowColor: t.dark ? '#000' : '#94a3b8', transform: [{ scale: pressScale }] }]} {...pan.panHandlers}>
        <Animated.View pointerEvents="none" style={[styles.indicator, { width: tabWidth, backgroundColor: t.primary, transform: [{ translateX: indicatorX }] }]} />
        {state.routes.map((route: any, index: number) => {
          const active = visualIndex === index;
          const options = descriptors[route.key]?.options ?? {};
          const color = active ? '#fff' : t.sub;
          return (
            <Animated.View key={route.key} style={{ transform: [{ scale: tabScales[index] }] }}>
              <Pressable style={[styles.item, { width: tabWidth }]} onPress={() => navigation.navigate(route.name)}>
                {options.tabBarIcon?.({ color, size: active ? 19 : 18, focused: active })}
                <Text style={[styles.label, { color, fontFamily: t.font }]} numberOfLines={1}>{options.title ?? route.name}</Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { position: 'absolute', left: 0, right: 0, bottom: 16, alignItems: 'center' },
  dock: { flexDirection: 'row', gap: 4, padding: 6, borderRadius: 999, borderWidth: 1, shadowOpacity: 0.2, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 10, overflow: 'hidden' },
  indicator: { position: 'absolute', left: 6, top: 6, bottom: 6, borderRadius: 999 },
  item: { height: 46, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, zIndex: 1 },
  label: { fontSize: 9, fontWeight: '700', marginTop: 2 }
});
