import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, StyleSheet, Text, View, type View as ViewType } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { judgeStroke, strokeGuides, type Point } from './strokeGuide';
import { useTheme } from './theme';

export function KanaStrokePad({ char, misses, revealAfter = 5, height = 300, onCorrect, onMiss }: { char: string; misses: number; revealAfter?: number; height?: number; onCorrect: () => void; onMiss: () => void }) {
  const t = useTheme();
  const [stepIndex, setStepIndex] = useState(0);
  const [strokes, setStrokes] = useState<{ path: string; fill?: boolean }[]>([]);
  const [draft, setDraft] = useState('');
  const anim = useRef(new Animated.Value(0)).current;
  const draftRef = useRef('');
  const pointsRef = useRef<Point[]>([]);
  const padRef = useRef<ViewType>(null);
  const padSize = useRef({ width: 320, height });
  const guide = strokeGuides[char] ?? strokeGuides[baseKana(char)];
  const step = guide?.[stepIndex];
  const hasGuide = !!guide && !!step;
  const showGuide = hasGuide && misses >= revealAfter;
  const animInput = step?.points?.map((_, i) => i / Math.max(1, step.points!.length - 1)) ?? [0, 1];
  const animX = showGuide && step?.points?.length ? anim.interpolate({ inputRange: animInput, outputRange: step.points.map((point) => point.x) }) : undefined;
  const animY = showGuide && step?.points?.length ? anim.interpolate({ inputRange: animInput, outputRange: step.points.map((point) => point.y) }) : undefined;

  useEffect(() => {
    setStepIndex(0);
    setStrokes([]);
    setDraft('');
    draftRef.current = '';
    pointsRef.current = [];
  }, [char]);

  useEffect(() => {
    anim.stopAnimation();
    anim.setValue(0);
    if (!showGuide || !step?.points?.length) return;
    Animated.loop(Animated.timing(anim, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }), { iterations: 2 }).start();
  }, [showGuide, stepIndex, char]);

  const pan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (event) => {
      const point = touchPoint(event.nativeEvent.locationX, event.nativeEvent.locationY, padSize.current);
      pointsRef.current = [point];
      const path = `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
      draftRef.current = path;
      setDraft(path);
    },
    onPanResponderMove: (event) => {
      const point = touchPoint(event.nativeEvent.locationX, event.nativeEvent.locationY, padSize.current);
      pointsRef.current.push(point);
      const path = smoothPath(pointsRef.current);
      draftRef.current = path;
      setDraft(path);
    },
    onPanResponderRelease: () => finishStroke(),
    onPanResponderTerminate: () => finishStroke()
  });

  function finishStroke() {
    const points = pointsRef.current;
    draftRef.current = '';
    pointsRef.current = [];
    setDraft('');
    if (!points.length) return;
    if (!hasGuide) {
      setStrokes((current) => [...current, { path: smoothPath(points) }]);
      onCorrect();
      return;
    }
    if (!judgeStroke(points, step)) {
      onMiss();
      return;
    }
    const done = step.fillPaths?.length ? step.fillPaths.map((path) => ({ path, fill: true })) : [{ path: step.path }];
    setStrokes((current) => [...current, ...done]);
    if (stepIndex + 1 >= guide.length) onCorrect();
    else setStepIndex((current) => current + 1);
  }

  return (
    <View ref={padRef} collapsable={false} onLayout={(event) => { padSize.current = event.nativeEvent.layout; }} style={[styles.pad, { height, backgroundColor: t.card, borderColor: t.border }]} {...pan.panHandlers}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.midV, { backgroundColor: t.border }]} />
        <View style={[styles.midH, { backgroundColor: t.border }]} />
        <Svg width="100%" height="100%" viewBox={`0 0 320 ${height}`}>
          {showGuide && guide.flatMap((item, i) => item.fillPaths?.length
            ? item.fillPaths.map((path, fillIndex) => <Path key={`guide-${i}-${fillIndex}`} d={path} fill={i === stepIndex ? t.warn : t.border} opacity={i < stepIndex ? 0.1 : i === stepIndex ? 0.32 : 0.16} />)
            : [<Path key={`guide-${i}`} d={item.path} stroke={i === stepIndex ? t.warn : t.border} strokeWidth={i === stepIndex ? 18 : 12} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={i < stepIndex ? 0.14 : 0.42} />]
          )}
          {showGuide && <Path d={`M ${step.start.x} ${step.start.y} L ${step.start.x + 0.1} ${step.start.y + 0.1}`} stroke="#22c55e" strokeWidth={13} strokeLinecap="round" />}
          {showGuide && <Path d={`M ${step.end.x} ${step.end.y} L ${step.end.x + 0.1} ${step.end.y + 0.1}`} stroke="#ef4444" strokeWidth={13} strokeLinecap="round" />}
          {strokes.map((item, i) => item.fill ? <Path key={i} d={item.path} fill={t.primary} opacity={0.95} /> : <Path key={i} d={item.path} stroke={t.primary} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" fill="none" />)}
          {!!draft && <Path d={draft} stroke={t.primary} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.8} />}
        </Svg>
        {animX && animY && <Animated.View style={[styles.animDot, { backgroundColor: t.primary, transform: [{ translateX: animX }, { translateY: animY }] }]} />}
      </View>
      {!guide && <Text style={[styles.fallback, { color: t.sub, fontFamily: t.font }]}>Guide belum ada · free draw dihitung benar</Text>}
    </View>
  );
}

function baseKana(value: string) {
  const map: Record<string, string> = {
    が: 'か', ぎ: 'き', ぐ: 'く', げ: 'け', ご: 'こ', ざ: 'さ', じ: 'し', ず: 'す', ぜ: 'せ', ぞ: 'そ',
    だ: 'た', ぢ: 'ち', づ: 'つ', で: 'て', ど: 'と', ば: 'は', び: 'ひ', ぶ: 'ふ', べ: 'へ', ぼ: 'ほ',
    ぱ: 'は', ぴ: 'ひ', ぷ: 'ふ', ぺ: 'へ', ぽ: 'ほ'
  };
  return map[value] ?? value;
}

function smoothPath(points: Point[]) {
  if (points.length < 3) return points.map((point, index) => `${index ? 'L' : 'M'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
  const parts = [`M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`];
  for (let i = 1; i < points.length - 1; i += 1) {
    const mid = { x: (points[i].x + points[i + 1].x) / 2, y: (points[i].y + points[i + 1].y) / 2 };
    parts.push(`Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${mid.x.toFixed(1)} ${mid.y.toFixed(1)}`);
  }
  const last = points[points.length - 1];
  parts.push(`L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`);
  return parts.join(' ');
}

function touchPoint(x: number, y: number, size: { width: number; height: number }) {
  return {
    x: clamp((x / size.width) * 320, 0, 320),
    y: clamp((y / size.height) * size.height, 0, size.height)
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const styles = StyleSheet.create({
  pad: { borderWidth: 1, borderRadius: 24, overflow: 'hidden' },
  midV: { position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, opacity: 0.45 },
  midH: { position: 'absolute', left: 0, right: 0, top: '50%', height: 1, opacity: 0.45 },
  animDot: { position: 'absolute', left: -7, top: -7, width: 14, height: 14, borderRadius: 7 },
  fallback: { position: 'absolute', alignSelf: 'center', top: 132, fontWeight: '800' }
});
