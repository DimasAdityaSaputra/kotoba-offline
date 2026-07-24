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
      updated_at TEXT NOT NULL,
      correct_count INTEGER NOT NULL DEFAULT 0,
      last_correct_at TEXT NOT NULL DEFAULT ''
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
    CREATE TABLE IF NOT EXISTS progress_event (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL
    );
  `);

  addColumnIfMissing('group', `ALTER TABLE vocab ADD COLUMN "group" TEXT NOT NULL DEFAULT ''`);
  addColumnIfMissing('review_status', `ALTER TABLE vocab ADD COLUMN review_status TEXT NOT NULL DEFAULT 'new' CHECK(review_status IN ('new', 'hard', 'known'))`);
  addColumnIfMissing('correct_count', `ALTER TABLE vocab ADD COLUMN correct_count INTEGER NOT NULL DEFAULT 0`);
  addColumnIfMissing('last_correct_at', `ALTER TABLE vocab ADD COLUMN last_correct_at TEXT NOT NULL DEFAULT ''`);
  ensureProgressEventSchema();

  const count = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM vocab WHERE source = ?', 'default')?.count ?? 0;
  if (count === 0) insertMany(DEFAULT_VOCAB, 'default');
  initialized = true;
}

function insertRows(items: VocabInput[], source: SourceType, now: string) {
  for (const item of items) {
    db.runSync(
      `INSERT INTO vocab (kana, romaji, meaning_id, category, jlpt_level, script_type, source, "group", review_status, created_at, updated_at, correct_count, last_correct_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, 0, '')`,
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

function ensureProgressEventSchema() {
  const columns = db.getAllSync<{ name: string; notnull: number }>(`SELECT name, notnull FROM pragma_table_info('progress_event')`);
  const vocabId = columns.find((column) => column.name === 'vocab_id');
  if (!vocabId?.notnull) return;

  db.execSync(`
    CREATE TABLE progress_event_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL
    );
    INSERT INTO progress_event_new (created_at) SELECT created_at FROM progress_event;
    DROP TABLE progress_event;
    ALTER TABLE progress_event_new RENAME TO progress_event;
  `);
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

export function markCorrect(id: number) {
  const now = new Date().toISOString();
  db.runSync(`UPDATE vocab SET review_status = 'known', correct_count = correct_count + 1, last_correct_at = ?, updated_at = ? WHERE id = ?`, now, now, id);
}

export function recordProgress() {
  db.runSync('INSERT INTO progress_event (created_at) VALUES (?)', new Date().toISOString());
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

export type BackupData = { version: 1; exportedAt: string; profile: Record<string, string>; userVocab: VocabItem[]; quizResults: { modes: string; score: number; total: number; created_at: string }[]; progressEvents?: { created_at: string }[]; };

export function createBackup(): BackupData {
  initDb();
  const profileRows = db.getAllSync<{ key: string; value: string }>('SELECT key, value FROM profile');
  return { version: 1, exportedAt: new Date().toISOString(), profile: Object.fromEntries(profileRows.map((row) => [row.key, row.value])), userVocab: db.getAllSync<VocabItem>(`SELECT * FROM vocab WHERE source = 'user' ORDER BY id`), quizResults: db.getAllSync<{ modes: string; score: number; total: number; created_at: string }>('SELECT modes, score, total, created_at FROM quiz_result ORDER BY id'), progressEvents: db.getAllSync<{ created_at: string }>('SELECT created_at FROM progress_event ORDER BY id') };
}

export function restoreBackup(data: BackupData) {
  initDb();
  if (!data || data.version !== 1 || !Array.isArray(data.userVocab) || !Array.isArray(data.quizResults) || typeof data.profile !== 'object') throw new Error('Invalid backup');
  const now = new Date().toISOString();
  db.withTransactionSync(() => {
    for (const [key, value] of Object.entries(data.profile)) db.runSync('INSERT OR REPLACE INTO profile (key, value) VALUES (?, ?)', key, String(value));
    for (const item of data.userVocab) {
      db.runSync(`INSERT INTO vocab (kana, romaji, meaning_id, category, jlpt_level, script_type, source, "group", review_status, created_at, updated_at, correct_count, last_correct_at)
        SELECT ?, ?, ?, ?, ?, ?, 'user', ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM vocab WHERE source = 'user' AND kana = ? AND meaning_id = ?)`,
        item.kana, item.romaji, item.meaning_id, item.category || 'uncategorized', item.jlpt_level || 'uncategorized', item.script_type, item.group || '', item.review_status || 'new', item.created_at || now, item.updated_at || now, item.correct_count || 0, item.last_correct_at || '', item.kana, item.meaning_id);
    }
    for (const row of data.quizResults) db.runSync('INSERT INTO quiz_result (modes, score, total, created_at) VALUES (?, ?, ?, ?)', row.modes, row.score, row.total, row.created_at || now);
    for (const row of data.progressEvents ?? []) db.runSync('INSERT INTO progress_event (created_at) VALUES (?)', row.created_at || now);
  });
}

export function progressEvents() {
  initDb();
  return db.getAllSync<{ date: string; count: number }>(`
    SELECT substr(created_at, 1, 10) AS date, COUNT(*) AS count
    FROM progress_event
    GROUP BY date
    ORDER BY date DESC
  `);
}
