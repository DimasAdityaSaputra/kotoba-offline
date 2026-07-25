# Kotoba Offline v2

Offline Android app buat belajar bahasa Jepang dasar: kotoba, kana, angka Jepang, kanji basic, flashcard, quiz, dan latihan tulis. Semua data utama jalan lokal/offline pakai SQLite.

## Apa yang berubah dari app versi 1

Versi 1 fokus ke pondasi:

- kosakata hiragana/katakana offline
- flashcard
- tambah/import/export kotoba
- quiz dasar
- latihan tulis kana dengan data stroke animCJK
- profile, progress, dark mode, floating dock

Versi 2 nambah dan ngerapihin bagian yang paling kerasa dipakai:

- Kanji basic masuk menu Kotoba, bareng Basic/Huruf/Nomor.
- Kanji dipisah kategori: Semua, Nomor, Hari/alam, Orang, Alam, Ukuran.
- Kanji card punya arti, onyomi, kunyomi, contoh kata, dan catatan pemakaian pendek.
- Write screen punya filter group kana: a, ka, sa, ta, dan seterusnya.
- Compound kana seperti kya/gya/mya bisa latihan auto-correct dalam satu kotak.
- Drawing dua jari di-ignore supaya canvas tidak menggambar garis aneh.
- Stroke user yang benar sekarang morph ke stroke target, lalu animasi masuk ke fill asli.
- Stroke biru/draft ditipisin supaya tidak kelihatan seperti stabilo brutal.
- Progress harian balik stabil: quiz benar dan tambah kotoba user masuk progress.
- Progress target 30/hari dengan tier warna biru.
- Quiz Jepang → romaji diperbaiki, contoh `byouin` diterima tanpa harus input `byouinn`.
- Add Kotoba sekarang bisa pilih Group/Bab yang sudah ada.
- Profile lebih bersih: ganti foto cukup tap avatar, field bawah jadi Bio.
- Migrasi DB lama diperbaiki supaya app tidak force close setelah update.

## Fitur utama

- Offline SQLite storage
- Default vocabulary seed N5/N4-ish
- Kotoba library dengan search, filter, edit user vocab, dan group/bab
- Add Kotoba dengan romaji → kana converter
- Flashcard memorization
- Quiz: angka, kotoba, huruf/kana, mixed practice
- Write training: kana stroke guide, group filter, auto-correct, morph animation
- Kanji basic: arti, onyomi, kunyomi, contoh kata, kategori
- Basic Japanese lesson cards
- Progress dashboard dan contribution graph
- Profile avatar + bio
- CSV import/export
- Backup/restore JSON
- Japanese TTS voice selection
- Dark mode
- Floating bottom dock

## Kanji basic yang tersedia

Kategori awal masih basic, bukan kamus penuh:

- Nomor: 一 二 三 四 五 六 七 八 九 十
- Hari/alam: 日 月 火 水 木 金 土
- Orang: 人 子 女 男
- Alam: 山 川
- Ukuran/posisi: 大 小 中

Kanji di app dijelasin pakai pola simpel:

- bentuk kanji
- arti Indonesia
- onyomi: bacaan China-Jepang, sering dipakai di gabungan kanji
- kunyomi: bacaan Jepang asli, sering dipakai saat kanji berdiri sendiri atau pakai okurigana
- contoh kata biar bacaan tidak dihafal kosong

## Run development

```bash
npm install
npm run start
```

Open with Expo Go on Android, atau press `a` kalau Android emulator ready.

## Checks

```bash
npm run selfcheck
npm run typecheck
```

## Build Android release

WSL setup yang dipakai project ini:

```bash
cd android
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 \
ANDROID_HOME=/mnt/c/Users/dimas/AppData/Local/Android/Sdk \
./gradlew assembleRelease
```

APK output:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Install ke device lokal:

```bash
/mnt/c/Users/dimas/AppData/Local/Android/Sdk/platform-tools/adb.exe install -r android/app/build/outputs/apk/release/app-release.apk
```

## CSV format

```csv
kana,romaji,meaning_id,category,jlpt_level,script_type,group
おはよう,ohayou,selamat pagi,greeting,N5,hiragana,bab 1
コーヒー,koohii,kopi,food,N5,katakana,bab 1
```

Valid `jlpt_level`: `N5`, `N4`, `uncategorized`.

Valid `script_type`: `hiragana`, `katakana`.

`group` optional. Kalau kosong, app tetap jalan.

## License notes

Kana stroke data uses animCJK-derived data. Keep `NOTICE.md` and `licenses/animCJK-LGPL-3.0.txt` with releases.
