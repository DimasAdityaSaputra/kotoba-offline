import { animCjkStrokeGuides } from './animCjkStrokeGuide';

export type Point = { x: number; y: number };
export type StrokeStep = { path: string; fillPaths?: string[]; points?: Point[]; start: Point; end: Point; hint: string };

const manualStrokeGuides: Record<string, StrokeStep[]> = {};


export const strokeGuides: Record<string, StrokeStep[]> = { ...animCjkStrokeGuides, ...manualStrokeGuides };

export function guideForKana(char: string) {
  const direct = strokeGuides[char];
  if (direct) return direct;
  const chars = [...char];
  const parts = chars.map((item) => strokeGuides[item]);
  if (parts.length !== 2 || parts.some((item) => !item)) return undefined;
  return parts.flatMap((guide, index) => {
    const box = index === 0 ? { x: 18, y: 26, width: 178, height: 238 } : { x: 184, y: 116, width: 112, height: 146 };
    return fitGuide(guide!, box);
  });
}

export function judgeStroke(points: Point[], step: StrokeStep) {
  if (points.length < 4) return false;
  const first = points[0];
  const last = points[points.length - 1];
  const intendedPath = step.points?.length ? step.points : parsePathPoints(step.path);
  const drawnLen = pathLength(points);
  const intendedLen = pathLength(intendedPath);
  const startOk = distance(first, step.start) < 54;
  const endOk = distance(last, step.end) < 66;
  const lengthOk = drawnLen > intendedLen * 0.58 && drawnLen < intendedLen * 1.55;
  const directionOk = directionSimilarity(points, intendedPath) > 0.52;
  const shapeOk = shapeDistance(points, intendedPath) < 52;
  return startOk && endOk && lengthOk && directionOk && shapeOk;
}

function fitGuide(guide: StrokeStep[], box: { x: number; y: number; width: number; height: number }) {
  const bounds = guideBounds(guide);
  const scale = Math.min(box.width / (bounds.maxX - bounds.minX || 1), box.height / (bounds.maxY - bounds.minY || 1));
  const dx = box.x + (box.width - (bounds.maxX - bounds.minX) * scale) / 2 - bounds.minX * scale;
  const dy = box.y + (box.height - (bounds.maxY - bounds.minY) * scale) / 2 - bounds.minY * scale;
  return guide.map((step) => transformStep(step, scale, dx, dy));
}

function guideBounds(guide: StrokeStep[]) {
  const nums = guide.flatMap((step) => [step.path, ...(step.fillPaths ?? [])].flatMap((path) => [...path.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]))));
  const xs = nums.filter((_, i) => i % 2 === 0);
  const ys = nums.filter((_, i) => i % 2 === 1);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

function transformStep(step: StrokeStep, scale: number, dx: number, dy: number): StrokeStep {
  const point = (p: Point) => ({ x: p.x * scale + dx, y: p.y * scale + dy });
  return {
    ...step,
    path: transformPath(step.path, scale, dx, dy),
    fillPaths: step.fillPaths?.map((path) => transformPath(path, scale, dx, dy)),
    points: step.points?.map(point),
    start: point(step.start),
    end: point(step.end)
  };
}

function transformPath(path: string, scale: number, dx: number, dy: number) {
  let index = 0;
  return path.replace(/-?\d+(?:\.\d+)?/g, (value) => {
    const n = Number(value);
    const next = index % 2 === 0 ? n * scale + dx : n * scale + dy;
    index += 1;
    return Number(next.toFixed(1)).toString();
  });
}

function parsePathPoints(path: string) {
  const nums = [...path.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
  const points: Point[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) points.push({ x: nums[i], y: nums[i + 1] });
  return points;
}

function shapeDistance(a: Point[], b: Point[]) {
  const aa = resample(a, 18);
  const bb = resample(b, 18);
  return aa.reduce((sum, point, index) => sum + distance(point, bb[index]), 0) / aa.length;
}

function directionSimilarity(a: Point[], b: Point[]) {
  const aa = resample(a, 12);
  const bb = resample(b, 12);
  let good = 0;
  for (let i = 1; i < aa.length; i += 1) {
    const av = { x: aa[i].x - aa[i - 1].x, y: aa[i].y - aa[i - 1].y };
    const bv = { x: bb[i].x - bb[i - 1].x, y: bb[i].y - bb[i - 1].y };
    const denom = Math.hypot(av.x, av.y) * Math.hypot(bv.x, bv.y) || 1;
    if ((av.x * bv.x + av.y * bv.y) / denom > 0.38) good += 1;
  }
  return good / Math.max(1, aa.length - 1);
}

function resample(points: Point[], count: number) {
  if (points.length <= 1) return Array.from({ length: count }, () => points[0] ?? { x: 0, y: 0 });
  const total = pathLength(points);
  const result = [points[0]];
  let target = total / (count - 1);
  let walked = 0;
  for (let i = 1; i < points.length && result.length < count - 1; i += 1) {
    const prev = points[i - 1];
    const next = points[i];
    const segment = distance(prev, next);
    while (walked + segment >= target && result.length < count - 1) {
      const ratio = (target - walked) / segment;
      result.push({ x: prev.x + (next.x - prev.x) * ratio, y: prev.y + (next.y - prev.y) * ratio });
      target += total / (count - 1);
    }
    walked += segment;
  }
  result.push(points[points.length - 1]);
  while (result.length < count) result.push(points[points.length - 1]);
  return result;
}

function pathLength(points: Point[]) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += distance(points[i - 1], points[i]);
  return total;
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
