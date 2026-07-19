# Kotoba Offline

Offline Android vocabulary app for learning Japanese hiragana and katakana.

## Features

- Default N5/N4-ish vocabulary seed
- Add user vocabulary
- Search and filter
- Flashcard memorization
- CSV import/export
- Full offline SQLite storage

## Run

```bash
npm install
npm run start
```

Open with Expo Go on Android, or press `a` if Android emulator is ready.

## CSV format

```csv
kana,romaji,meaning_id,category,jlpt_level,script_type
おはよう,ohayou,selamat pagi,greeting,N5,hiragana
コーヒー,koohii,kopi,food,N5,katakana
```

Valid `jlpt_level`: `N5`, `N4`, `uncategorized`.

Valid `script_type`: `hiragana`, `katakana`.

## v2 ideas

- Kanji section
- Spaced repetition
- Quiz
- Audio
- Example sentences
```
