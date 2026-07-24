import * as SQLite from 'expo-sqlite';
import { DEFAULT_VOCAB } from './seed';
import type { SourceType, VocabFilters, VocabInput, VocabItem } from './types';

const db = SQLite.openDatabaseSync('kotoba.db');
let initialized = false;

export function initDb() {
  if (initialized) return;
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
      review_status TEXT NOT NULL DEFAULT 'new' CHECK(review_status IN ('new', 'hard', 'known')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_vocab_search ON vocab(kana, romaji, meaning_id);
    CREATE TABLE IF NOT EXISTS profile (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS quiz_result (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      modes TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  addColumnIfMissing('group', `ALTER TABLE vocab ADD COLUMN "group" TEXT NOT NULL DEFAULT ''`);
  addColumnIfMissing('review_status', `ALTER TABLE vocab ADD COLUMN review_status TEXT NOT NULL DEFAULT 'new' CHECK(review_status IN ('new', 'hard', 'known'))`);

  const count = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM vocab WHERE source = ?', 'default')?.count ?? 0;
  if (count === 0) insertMany(DEFAULT_VOCAB, 'default');
  initialized = true;
}

function insertRows(items: VocabInput[], source: SourceType, now: string) {
  for (const item of items) {
    db.runSync(
      `INSERT INTO vocab (kana, romaji, meaning_id, category, jlpt_level, script_type, source, "group", review_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`,
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
}

export function insertMany(items: VocabInput[], source: SourceType = 'user') {
  const now = new Date().toISOString();
  db.withTransactionSync(() => insertRows(items, source, now));
}

export function addVocab(item: VocabInput) {
  insertMany([item], 'user');
}

function addColumnIfMissing(name: string, sql: string) {
  const exists = db.getFirstSync<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM pragma_table_info('vocab') WHERE name = ?`, name)?.cnt ?? 0;
  if (exists === 0) db.execSync(sql);
}

export function updateVocab(id: number, item: VocabInput) {
  db.runSync(
    `UPDATE vocab SET kana = ?, romaji = ?, meaning_id = ?, category = ?, jlpt_level = ?, script_type = ?, "group" = ?, updated_at = ?
     WHERE id = ? AND source = 'user'`,
    item.kana.trim(), item.romaji.trim(), item.meaning_id.trim(), item.category.trim() || 'uncategorized', item.jlpt_level, item.script_type, item.group.trim() || '', new Date().toISOString(), id
  );
}

export function setReviewStatus(id: number, status: VocabItem['review_status']) {
  db.runSync(`UPDATE vocab SET review_status = ?, updated_at = ? WHERE id = ?`, status, new Date().toISOString(), id);
}

export function deleteVocab(id: number) {
  db.runSync(`DELETE FROM vocab WHERE id = ? AND source = 'user'`, id);
}

export function resetDefaultVocab() {
  const now = new Date().toISOString();
  db.withTransactionSync(() => {
    db.runSync(`DELETE FROM vocab`);
    insertRows(DEFAULT_VOCAB, 'default', now);
  });
}

export function listGroups(): string[] {
  return db.getAllSync<{ name: string }>(`
    SELECT DISTINCT TRIM("group") AS name
    FROM vocab
    WHERE TRIM("group") != ''
    ORDER BY LOWER(TRIM("group"))
  `).map(row => row.name);
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
  if (filters.review_status !== 'all') {
    clauses.push(`review_status = ?`);
    args.push(filters.review_status);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return db.getAllSync<VocabItem>(`SELECT * FROM vocab ${where} ORDER BY script_type, kana`, ...args);
}

export function getProfile() {
  const rows = db.getAllSync<{ key: string; value: string }>('SELECT key, value FROM profile');
  const profile = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    username: profile.username || 'Dimas',
    avatar: profile.avatar || 'D',
    avatarUri: profile.avatarUri || ''
  };
}

export function saveProfile(profile: { username: string; avatar: string; avatarUri: string }) {
  db.withTransactionSync(() => {
    db.runSync('INSERT OR REPLACE INTO profile (key, value) VALUES (?, ?)', 'username', profile.username.trim() || 'Dimas');
    db.runSync('INSERT OR REPLACE INTO profile (key, value) VALUES (?, ?)', 'avatar', (profile.avatar.trim() || 'D').slice(0, 2).toUpperCase());
    db.runSync('INSERT OR REPLACE INTO profile (key, value) VALUES (?, ?)', 'avatarUri', profile.avatarUri);
  });
}

export function allVocab(): VocabItem[] {
  return db.getAllSync<VocabItem>('SELECT * FROM vocab ORDER BY script_type, kana');
}


export function saveQuizResult(modes: string[], score: number, total: number) {
  db.runSync('INSERT INTO quiz_result (modes, score, total, created_at) VALUES (?, ?, ?, ?)', modes.join(', '), score, total, new Date().toISOString());
}

export function quizStats() {
  const row = db.getFirstSync<{ attempts: number; bestScore: number | null; bestTotal: number | null; answered: number | null }>(`
    SELECT COUNT(*) AS attempts,
      (SELECT score FROM quiz_result ORDER BY CAST(score AS REAL) / NULLIF(total, 0) DESC, score DESC LIMIT 1) AS bestScore,
      (SELECT total FROM quiz_result ORDER BY CAST(score AS REAL) / NULLIF(total, 0) DESC, score DESC LIMIT 1) AS bestTotal,
      SUM(total) AS answered
    FROM quiz_result
  `);
  return { attempts: row?.attempts ?? 0, bestScore: row?.bestScore ?? 0, bestTotal: row?.bestTotal ?? 0, answered: row?.answered ?? 0 };
}


export function getProfileValue(key: string) {
  return db.getFirstSync<{ value: string }>('SELECT value FROM profile WHERE key = ?', key)?.value ?? '';
}

export function saveProfileValue(key: string, value: string) {
  db.runSync('INSERT OR REPLACE INTO profile (key, value) VALUES (?, ?)', key, value);
}
