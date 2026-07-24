import assert from 'node:assert/strict';
import { parseCsv, toCsv } from './csv';
import type { VocabItem } from './types';

const parsed = parseCsv('kana,romaji,meaning_id,category,jlpt_level,script_type,group\nおはよう,ohayou,selamat pagi,greeting,N5,hiragana,Bab 1\nBAD,,,,N9,kanji,');
assert.equal(parsed.rows.length, 1);
assert.equal(parsed.skipped, 1);
assert.equal(parsed.rows[0].kana, 'おはよう');

const csv = toCsv([{
  id: 1,
  kana: 'コーヒー',
  romaji: 'koohii',
  meaning_id: 'kopi',
  category: 'food',
  jlpt_level: 'N5',
  script_type: 'katakana',
  group: 'Default',
  source: 'default',
  review_status: 'new',
  created_at: '2026-07-19T00:00:00.000Z',
  updated_at: '2026-07-19T00:00:00.000Z',
  correct_count: 0,
  last_correct_at: ''
} satisfies VocabItem]);
assert.ok(csv.includes('コーヒー'));
assert.ok(csv.startsWith('kana,romaji,meaning_id'));

console.log('selfcheck passed');
