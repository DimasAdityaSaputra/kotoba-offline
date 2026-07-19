import * as SQLite from 'expo-sqlite';
import { DEFAULT_VOCAB } from './seed';
import type { SourceType, VocabFilters, VocabInput, VocabItem } from './types';

const db = SQLite.openDatabaseSync('kotoba.db');

export function initDb() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS vocab (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kana TEXT NOT NULL,
      romaji TEXT NOT NULL DEFAULT '',
      meaning_id TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'uncategorized',
      jlpt_level TEXT NOT NULL DEFAULT 'uncategorized',
      script_type TEXT NOT NULL CHECK(script_type IN ('hiragana', 'katakana')),
      source TEXT NOT NULL CHECK(source IN ('default', 'user')),
      "group" TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_vocab_search ON vocab(kana, romaji, meaning_id);
  `);

  // Migration: add group column if not exists
  try {
    const checkCol = db.getFirstSync<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM pragma_table_info('vocab') WHERE name = 'group'`);
    if (checkCol?.cnt === 0) {
      db.execSync(`ALTER TABLE vocab ADD COLUMN "group" TEXT NOT NULL DEFAULT ''`);
    }
  } catch (e) {
    // Column already exists or pragma not supported, ignore
  }

  const count = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM vocab WHERE source = ?', 'default')?.count ?? 0;
  if (count === 0) insertMany(DEFAULT_VOCAB, 'default');
}

export function insertMany(items: VocabInput[], source: SourceType = 'user') {
  const now = new Date().toISOString();
  db.withTransactionSync(() => {
    for (const item of items) {
      db.runSync(
        `INSERT INTO vocab (kana, romaji, meaning_id, category, jlpt_level, script_type, source, "group", created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        item.kana.trim(),
        item.romaji.trim(),
        item.meaning_id.trim(),
        item.category.trim() || 'uncategorized',
        item.jlpt_level,
        item.script_type,
        source,
        item.group.trim() || '',
        now,
        now
      );
    }
  });
}

export function addVocab(item: VocabInput) {
  insertMany([item], 'user');
}

export function updateVocab(id: number, item: VocabInput) {
  db.runSync(
    `UPDATE vocab SET kana = ?, romaji = ?, meaning_id = ?, category = ?, jlpt_level = ?, script_type = ?, "group" = ?, updated_at = ?
     WHERE id = ? AND source = 'user'`,
    item.kana.trim(), item.romaji.trim(), item.meaning_id.trim(), item.category.trim() || 'uncategorized', item.jlpt_level, item.script_type, item.group.trim() || '', new Date().toISOString(), id
  );
}

export function deleteVocab(id: number) {
  db.runSync(`DELETE FROM vocab WHERE id = ? AND source = 'user'`, id);
}

export function resetDefaultVocab() {
  db.withTransactionSync(() => {
    db.runSync(`DELETE FROM vocab WHERE source = 'default'`);
    insertMany(DEFAULT_VOCAB, 'default');
  });
}

export function listVocab(filters: VocabFilters): VocabItem[] {
  const clauses: string[] = [];
  const args: (string | number)[] = [];
  const query = filters.query.trim().toLowerCase();

  if (query) {
    clauses.push(`(LOWER(kana) LIKE ? OR LOWER(romaji) LIKE ? OR LOWER(meaning_id) LIKE ?)`);
    args.push(`%${query}%`, `%${query}%`, `%${query}%`);
  }
  if (filters.script_type !== 'all') {
    clauses.push(`script_type = ?`);
    args.push(filters.script_type);
  }
  if (filters.jlpt_level !== 'all') {
    clauses.push(`jlpt_level = ?`);
    args.push(filters.jlpt_level);
  }
  if (filters.category.trim()) {
    clauses.push(`LOWER(category) = ?`);
    args.push(filters.category.trim().toLowerCase());
  }
  if (filters.group.trim()) {
    clauses.push(`LOWER("group") = ?`);
    args.push(filters.group.trim().toLowerCase());
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return db.getAllSync<VocabItem>(`SELECT * FROM vocab ${where} ORDER BY script_type, kana`, ...args);
}

export function allVocab(): VocabItem[] {
  return db.getAllSync<VocabItem>('SELECT * FROM vocab ORDER BY script_type, kana');
}
