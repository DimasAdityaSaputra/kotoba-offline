const fs = require('fs');
const path = require('path');
const { svgPathProperties } = require('svg-path-properties');
const svgpath = require('svgpath');

const root = path.join(__dirname, '..');
const dir = '/tmp/animCJK-readme/svgsJaKana';
const out = path.join(root, 'src/animCjkStrokeGuide.ts');
const data = {};

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.svg')) continue;
  const code = Number(path.basename(file, '.svg'));
  const char = String.fromCodePoint(code);
  const svg = fs.readFileSync(path.join(dir, file), 'utf8');
  const fills = extractFills(svg);
  const strokes = extractStrokes(svg, fills).map(makeStep).filter(Boolean);
  if (strokes.length) data[char] = strokes;
}

fs.writeFileSync(out, `import type { StrokeStep } from './strokeGuide';\n\nexport const animCjkStrokeGuides: Record<string, StrokeStep[]> = ${JSON.stringify(data, null, 2)};\n`);
console.log(`generated ${Object.keys(data).length} animCJK kana guides`);

function extractFills(svg) {
  const fills = {};
  for (const m of svg.matchAll(/<path\b[^>]*id="([^"]+)"[^>]*d="([^"]+)"[^>]*\/?>/g)) fills[m[1]] = m[2];
  return fills;
}

function extractStrokes(svg, fills) {
  const raw = [];
  for (const m of svg.matchAll(/<path\b([^>]*)clip-path="url\(#([^)]+)\)"[^>]*d="([^"]+)"[^>]*\/?>/g)) {
    const attrs = m[1];
    const delay = attrs.match(/--d:\s*([^;]+);/)?.[1] ?? String(raw.length + 1);
    const fillId = svg.match(new RegExp(`<clipPath\\b[^>]*id="${m[2]}"[\\s\\S]*?<use\\b[^>]*href="#([^"]+)"`))?.[1];
    raw.push({ delay, d: m[3], fill: fillId ? fills[fillId] : undefined });
  }
  const groups = [];
  for (const item of raw) {
    const last = groups[groups.length - 1];
    if (last && last.delay === item.delay) last.items.push(item);
    else groups.push({ delay: item.delay, items: [item] });
  }
  return groups;
}

function makeStep(group, index) {
  const visible = group.items.find((item) => samplePath(item.d).some((p) => p.x >= 0 && p.x <= 1024 && p.y >= 0 && p.y <= 1024)) ?? group.items[0];
  const points = samplePath(visible.d);
  const start = points[0];
  const end = points[points.length - 1];
  if (!start || !end) return null;
  return {
    path: scalePath(visible.d),
    fillPaths: group.items.map((item) => item.fill).filter(Boolean).map(scalePath),
    points: points.map(scalePoint),
    start: scalePoint(start),
    end: scalePoint(end),
    hint: `Stroke ${index + 1}: ikuti dot biru, lalu bentuk akan ke-fill otomatis.`
  };
}

function samplePath(d) {
  try {
    const props = new svgPathProperties(d);
    const len = props.getTotalLength();
    const count = Math.max(8, Math.ceil(len / 80));
    return Array.from({ length: count }, (_, i) => props.getPointAtLength((len * i) / (count - 1)));
  } catch {
    return [];
  }
}

function scalePath(d) {
  return svgpath(d).scale(320 / 1024).round(1).toString();
}

function scalePoint(point) {
  return { x: +(point.x / 1024 * 320).toFixed(1), y: +(point.y / 1024 * 320).toFixed(1) };
}
