import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, Pressable, ScrollView, StyleSheet, Text, View, type View as ViewType } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { kanaGroups, kanaItems } from '../../src/kanaGroups';
import { guideForKana, judgeStroke, strokeGuides, type Point } from '../../src/strokeGuide';
import { useTheme } from '../../src/theme';

const hiraganaItems = kanaItems('hiragana');
const katakanaItems = kanaItems('katakana');

type Script = 'hiragana' | 'katakana';

export default function WriteScreen() {
  const t = useTheme();
  const [script, setScript] = useState<Script>('hiragana');
  const [index, setIndex] = useState(0);
  const [groupLabel, setGroupLabel] = useState('Semua');
  const [guided, setGuided] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [strokes, setStrokes] = useState<{ path: string; fill?: boolean }[]>([]);
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState('Ikuti stroke terang. Titik hijau = mulai, merah = akhir.');
  const [showAnimation, setShowAnimation] = useState(true);
  const [snap, setSnap] = useState<{ from: string; to: { path: string; fill?: boolean }[] } | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const draftRef = useRef('');
  const pointsRef = useRef<Point[]>([]);
  const padRef = useRef<ViewType>(null);
  const padSize = useRef({ width: 320, height: 320 });
  const drawingRef = useRef(false);
  const allChars = script === 'hiragana' ? hiraganaItems : katakanaItems;
  const chars = groupLabel === 'Semua' ? allChars : allChars.filter((item) => item.group === groupLabel);
  const item = chars[index] ?? chars[0];
  const char = item.kana;
  const guide = guideForKana(char) ?? strokeGuides[baseKana(char)];
  const step = guide?.[stepIndex];
  const canGuide = guided && !!guide;
  const animInput = step?.points?.map((_, i) => i / Math.max(1, step.points!.length - 1)) ?? [0, 1];
  const animX = step?.points?.length ? anim.interpolate({ inputRange: animInput, outputRange: step.points.map((point) => point.x) }) : undefined;
  const animY = step?.points?.length ? anim.interpolate({ inputRange: animInput, outputRange: step.points.map((point) => point.y) }) : undefined;
  const snapOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const correctOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  useEffect(() => { runAnimation(); }, [char, stepIndex, showAnimation]);

  function runAnimation() {
    anim.stopAnimation();
    anim.setValue(0);
    if (!showAnimation || !step?.points?.length) return;
    Animated.loop(Animated.timing(anim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }), { iterations: 2 }).start();
  }

  const pan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (event, gesture) => {
      if (event.nativeEvent.touches.length > 1 || gesture.numberActiveTouches > 1) return;
      drawingRef.current = true;
      const point = touchPoint(event.nativeEvent.locationX, event.nativeEvent.locationY, padSize.current);
      pointsRef.current = [point];
      const path = `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
      draftRef.current = path;
      setDraft(path);
    },
    onPanResponderMove: (event, gesture) => {
      if (!drawingRef.current || event.nativeEvent.touches.length > 1 || gesture.numberActiveTouches > 1) return;
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
    const path = draftRef.current;
    const points = pointsRef.current;
    drawingRef.current = false;
    draftRef.current = '';
    pointsRef.current = [];
    setDraft('');
    if (!path) return;

    if (canGuide && step) {
      if (!judgeStroke(points, step)) {
        setMessage(`Belum pas. Mulai di titik hijau, selesai di titik merah, ikuti dot biru lebih dekat.`);
        return;
      }
      const done = step.fillPaths?.length ? step.fillPaths.map((path) => ({ path, fill: true })) : [{ path: step.path }];
      setSnap({ from: path, to: done });
      anim.stopAnimation();
      anim.setValue(0);
      Animated.timing(anim, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
        setSnap(null);
        setStrokes((current) => [...current, ...done]);
        if (stepIndex + 1 >= guide.length) setMessage('Mantap, bentuknya masuk. Bisa lanjut huruf berikutnya.');
        else setMessage(guide[stepIndex + 1].hint);
        setStepIndex((current) => Math.min(current + 1, guide.length));
      });
      return;
    }

    setStrokes((current) => [...current, { path }]);
  }

  function resetCanvas() {
    setStrokes([]);
    setStepIndex(0);
    setDraft('');
    draftRef.current = '';
    pointsRef.current = [];
    setMessage(step?.hint ?? 'Free draw. Guide stroke belum ada buat huruf ini.');
  }

  function next(delta: number) {
    setIndex((current) => (current + delta + chars.length) % chars.length);
    setStrokes([]);
    setStepIndex(0);
    setDraft('');
    draftRef.current = '';
    pointsRef.current = [];
    setMessage('Ikuti stroke terang. Titik hijau = mulai, merah = akhir.');
  }

  function changeScript(nextScript: Script) {
    setScript(nextScript);
    setIndex(0);
    setStrokes([]);
    setStepIndex(0);
    setDraft('');
    draftRef.current = '';
    pointsRef.current = [];
    setMessage('Ikuti stroke terang. Titik hijau = mulai, merah = akhir.');
  }

  function changeGroup(nextGroup: string) {
    setGroupLabel(nextGroup);
    setIndex(0);
    resetCanvas();
  }

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}> 
      <Text style={[styles.note, { color: t.sub, fontFamily: t.font }]}>Autocorrect stroke offline. Huruf tanpa data stroke tetap bisa latihan free draw dulu.</Text>

      <View style={styles.row}>
        <Chip label="Hiragana" active={script === 'hiragana'} onPress={() => changeScript('hiragana')} />
        <Chip label="Katakana" active={script === 'katakana'} onPress={() => changeScript('katakana')} />
        <Chip label={guided ? 'Auto on' : 'Free draw'} active={guided} onPress={() => { setGuided(!guided); resetCanvas(); }} />
        <Chip label={showAnimation ? 'Anim on' : 'Anim off'} active={showAnimation} onPress={() => setShowAnimation(!showAnimation)} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupRow}>
        {['Semua', ...kanaGroups.map((item) => item.label)].map((label) => <Chip key={label} label={label} active={groupLabel === label} onPress={() => changeGroup(label)} />)}
      </ScrollView>

      <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}> 
        <Text style={[styles.counter, { color: t.sub, fontFamily: t.font }]}>{index + 1} / {chars.length}{guide ? ` · stroke ${Math.min(stepIndex + 1, guide.length)} / ${guide.length}` : ' · free'}</Text>
        <Text style={[styles.target, { color: t.text, fontFamily: t.font }]}>{char}</Text>
        <Text style={[styles.romaji, { color: t.primary, fontFamily: t.font }]}>{item.romaji}</Text>
        <Text style={[styles.message, { color: t.sub, fontFamily: t.font }]}>{step?.hint ?? message}</Text>
      </View>

      <View ref={padRef} collapsable={false} onLayout={(event) => { padSize.current = event.nativeEvent.layout; }} style={[styles.pad, { backgroundColor: t.card, borderColor: t.border }]} {...pan.panHandlers}>
        <View pointerEvents="none" collapsable={false} style={StyleSheet.absoluteFill}>
          <View style={[styles.midV, { backgroundColor: t.border }]} />
          <View style={[styles.midH, { backgroundColor: t.border }]} />
          <Svg width="100%" height="100%" viewBox="0 0 320 320">
            {guide?.flatMap((item, i) => item.fillPaths?.length
              ? item.fillPaths.map((path, fillIndex) => <Path key={`guide-${i}-${fillIndex}`} d={path} fill={i === stepIndex ? t.warn : t.border} opacity={i < stepIndex ? 0.12 : i === stepIndex ? 0.34 : 0.18} />)
              : [<Path key={`guide-${i}`} d={item.path} stroke={i === stepIndex ? t.warn : t.border} strokeWidth={i === stepIndex ? 3.5 : 2} strokeDasharray={i === stepIndex ? undefined : '4 10'} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={i < stepIndex ? 0.04 : i === stepIndex ? 0.82 : 0.1} />]
            )}
            {step && <Path d={`M ${step.start.x} ${step.start.y} L ${step.start.x + 0.1} ${step.start.y + 0.1}`} stroke="#22c55e" strokeWidth={14} strokeLinecap="round" />}
            {step && <Path d={`M ${step.end.x} ${step.end.y} L ${step.end.x + 0.1} ${step.end.y + 0.1}`} stroke="#ef4444" strokeWidth={14} strokeLinecap="round" />}
            {strokes.map((item, i) => item.fill ? <Path key={i} d={item.path} fill={t.primary} opacity={0.95} /> : <Path key={i} d={item.path} stroke={t.primary} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" fill="none" />)}
            {snap?.to.map((item, i) => item.fill ? <AnimatedPath key={`snap-to-${i}`} d={item.path} fill={t.primary} opacity={correctOpacity} /> : <AnimatedPath key={`snap-to-${i}`} d={item.path} stroke={t.primary} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={correctOpacity} />)}
            {snap && <AnimatedPath d={snap.from} stroke={t.primary} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={snapOpacity} />}
            {!!draft && !snap && <Path d={draft} stroke={t.primary} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.8} />}
            {showAnimation && animX && animY && <AnimatedCircle cx={animX} cy={animY} r={7} fill={t.primary} />}
          </Svg>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.button, { backgroundColor: t.card2 }]} onPress={resetCanvas}><Text style={[styles.buttonText, { color: t.label, fontFamily: t.font }]}>Bersihkan</Text></Pressable>
        <Pressable style={[styles.button, { backgroundColor: t.primary }]} onPress={() => next(1)}><Text style={[styles.buttonText, { color: 'white', fontFamily: t.font }]}>Lanjut</Text></Pressable>
      </View>
      <View style={styles.actions}>
        <Pressable style={[styles.button, { backgroundColor: t.card2 }]} onPress={() => next(-1)}><Text style={[styles.buttonText, { color: t.label, fontFamily: t.font }]}>Prev</Text></Pressable>
        <Pressable style={[styles.button, { backgroundColor: t.warn }]} onPress={() => next(1)}><Text style={[styles.buttonText, { color: 'white', fontFamily: t.font }]}>Skip</Text></Pressable>
      </View>
    </ScrollView>
  );
}


function baseKana(value: string) {
  const map: Record<string, string> = {
    が: 'か', ぎ: 'き', ぐ: 'く', げ: 'け', ご: 'こ',
    ざ: 'さ', じ: 'し', ず: 'す', ぜ: 'せ', ぞ: 'そ',
    だ: 'た', ぢ: 'ち', づ: 'つ', で: 'て', ど: 'と',
    ば: 'は', び: 'ひ', ぶ: 'ふ', べ: 'へ', ぼ: 'ほ',
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
    y: clamp((y / size.height) * 320, 0, 320)
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: active ? t.primary : t.card2 }]}><Text style={[styles.chipText, { color: active ? 'white' : t.label, fontFamily: t.font }]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 132 },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 6 },
  note: { lineHeight: 20, marginBottom: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  groupRow: { gap: 8, paddingBottom: 14 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 },
  chipText: { fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 22, padding: 16, marginBottom: 14, alignItems: 'center' },
  counter: { fontWeight: '800', marginBottom: 4 },
  target: { fontSize: 72, fontWeight: '900' },
  romaji: { fontSize: 18, fontWeight: '900', marginTop: -4, marginBottom: 6 },
  message: { textAlign: 'center', lineHeight: 18 },
  pad: { height: 320, borderWidth: 1, borderRadius: 28, overflow: 'hidden' },
  ghost: { position: 'absolute', alignSelf: 'center', top: 42, fontSize: 210, fontWeight: '900' },
  midV: { position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, opacity: 0.55 },
  midH: { position: 'absolute', left: 0, right: 0, top: '50%', height: 1, opacity: 0.55 },
  animDot: { position: 'absolute', left: -7, top: -7, width: 14, height: 14, borderRadius: 7 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  button: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 16 },
  buttonText: { fontWeight: '900' }
});
