import type { VocabInput, VocabItem } from './types';

const HEADER = 'kana,romaji,meaning_id,category,jlpt_level,script_type';

function clean(value: string) {
  return value.trim().replace(/^"|"$/g, '').replace(/""/g, '"');
}

function cell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function parseCsv(text: string): { rows: VocabInput[]; skipped: number } {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const body = lines[0]?.toLowerCase() === HEADER ? lines.slice(1) : lines;
  const rows: VocabInput[] = [];
  let skipped = 0;

  for (const line of body) {
    const parts = line.split(',').map(clean);
    const [kana, romaji, meaning_id, category, jlpt_level, script_type] = parts;
    const validJlpt = jlpt_level === 'N5' || jlpt_level === 'N4' || jlpt_level === 'uncategorized';
    const validScript = script_type === 'hiragana' || script_type === 'katakana';

    if (!kana || !meaning_id || !validJlpt || !validScript) {
      skipped += 1;
      continue;
    }

    rows.push({ kana, romaji: romaji || '', meaning_id, category: category || 'uncategorized', jlpt_level, script_type });
  }

  return { rows, skipped };
}

export function toCsv(items: VocabItem[]) {
  const lines = [HEADER];
  for (const item of items) {
    lines.push([item.kana, item.romaji, item.meaning_id, item.category, item.jlpt_level, item.script_type].map(cell).join(','));
  }
  return `${lines.join('\n')}\n`;
}
