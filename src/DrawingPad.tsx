import { useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View, type View as ViewType } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from './theme';

type Stroke = string;

export function DrawingPad({ guide, height = 300 }: { guide?: string; height?: number }) {
  const t = useTheme();
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [draft, setDraft] = useState('');
  const draftRef = useRef('');
  const padRef = useRef<ViewType>(null);
  const padOffset = useRef({ x: 0, y: 0 });

  function finishStroke() {
    const path = draftRef.current;
    if (path) setStrokes((current) => [...current, path]);
    draftRef.current = '';
    setDraft('');
  }

  const pan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (event) => {
      padRef.current?.measureInWindow((x, y) => { padOffset.current = { x, y }; });
      const point = touchPoint(event.nativeEvent.pageX, event.nativeEvent.pageY, padOffset.current);
      const path = `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
      draftRef.current = path;
      setDraft(path);
    },
    onPanResponderMove: (event) => {
      const point = touchPoint(event.nativeEvent.pageX, event.nativeEvent.pageY, padOffset.current);
      const path = `${draftRef.current} L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
      draftRef.current = path;
      setDraft(path);
    },
    onPanResponderRelease: finishStroke,
    onPanResponderTerminate: finishStroke
  });

  return (
    <View ref={padRef} collapsable={false} style={[styles.pad, { height, backgroundColor: t.card, borderColor: t.border }]} {...pan.panHandlers}>
      {!!guide && <Text style={[styles.ghost, { color: t.dark ? '#3f3f46' : '#e2e8f0', fontFamily: t.font }]}>{guide}</Text>}
      <View pointerEvents="none" collapsable={false} style={StyleSheet.absoluteFill}>
        <View style={[styles.midV, { backgroundColor: t.border }]} />
        <View style={[styles.midH, { backgroundColor: t.border }]} />
        <Svg width="100%" height="100%">
          {strokes.map((path, i) => <Path key={i} d={path} stroke={t.primary} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />)}
          {!!draft && <Path d={draft} stroke={t.primary} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
        </Svg>
      </View>
    </View>
  );
}

function touchPoint(pageX: number, pageY: number, offset: { x: number; y: number }) {
  return { x: clamp(pageX - offset.x, 0, 999), y: clamp(pageY - offset.y, 0, 999) };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const styles = StyleSheet.create({
  pad: { borderWidth: 1, borderRadius: 28, overflow: 'hidden' },
  ghost: { position: 'absolute', alignSelf: 'center', top: 42, fontSize: 190, fontWeight: '900' },
  midV: { position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, opacity: 0.55 },
  midH: { position: 'absolute', left: 0, right: 0, top: '50%', height: 1, opacity: 0.55 }
});
