export type ScriptType = 'hiragana' | 'katakana';
export type SourceType = 'default' | 'user';
export type JlptLevel = 'N5' | 'N4' | 'uncategorized';
export type ReviewStatus = 'new' | 'hard' | 'known';

export type VocabInput = {
  kana: string;
  romaji: string;
  meaning_id: string;
  category: string;
  jlpt_level: JlptLevel;
  script_type: ScriptType;
  group: string;
};

export type VocabItem = VocabInput & {
  id: number;
  source: SourceType;
  review_status: ReviewStatus;
  created_at: string;
  updated_at: string;
  correct_count: number;
  last_correct_at: string;
};

export type VocabFilters = {
  query: string;
  script_type: 'all' | ScriptType;
  jlpt_level: 'all' | JlptLevel;
  category: string;
  group: string;
  review_status: 'all' | ReviewStatus;
};
