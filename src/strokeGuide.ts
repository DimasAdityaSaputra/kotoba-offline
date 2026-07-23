import { animCjkStrokeGuides } from './animCjkStrokeGuide';

export type Point = { x: number; y: number };
export type StrokeStep = { path: string; fillPaths?: string[]; points?: Point[]; start: Point; end: Point; hint: string };

const manualStrokeGuides: Record<string, StrokeStep[]> = {};


export const strokeGuides: Record<string, StrokeStep[]> = { ...animCjkStrokeGuides, ...manualStrokeGuides };

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
