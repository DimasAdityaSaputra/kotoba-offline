# Kotoba Offline v2

Belajar bahasa Jepang dasar tanpa ribet internet. Kotoba Offline adalah APK Android offline untuk latihan kosakata, kana, angka Jepang, kanji basic, flashcard, quiz, dan menulis huruf Jepang.

Data utama disimpan lokal di device. Cocok buat belajar pelan-pelan, nambah kosakata sendiri, dan latihan harian tanpa akun.

## Highlight v2

- **Kanji basic** sekarang masuk menu belajar bareng Kotoba, Basic, Huruf, dan Nomor.
- **Kategori Kanji** dipisah: Semua, Nomor, Hari/alam, Orang, Alam, Ukuran.
- **Penjelasan Kanji** dibuat ramah pemula: arti, onyomi, kunyomi, contoh kata, dan catatan pemakaian.
- **Write training lebih enak**: filter group kana, perbaikan compound kana, single-touch drawing, dan animasi stroke correction.
- **Progress harian** lebih jelas dengan target 30/hari dan tier warna biru.
- **Quiz romaji diperbaiki**, termasuk jawaban seperti `byouin`.
- **Add Kotoba lebih praktis** dengan pilihan Group/Bab yang sudah ada.
- **Profile lebih bersih**: tap avatar buat ganti foto, tambah bio.
- **Database migration diperbaiki** supaya update app lebih aman dari force close.

## Fitur utama

- Offline Android APK
- Kosakata Jepang dasar bawaan
- Tambah kosakata sendiri
- Group/Bab kosakata
- Search dan filter kotoba
- Flashcard
- Quiz angka, kotoba, huruf/kana, dan latihan campuran
- Latihan tulis kana dengan stroke guide
- Auto-correct stroke dengan animasi morph/fill
- Kanji basic dengan kategori
- Basic Japanese lesson cards
- Progress harian dan contribution graph
- Profile avatar + bio
- CSV import/export
- Backup/restore data
- Japanese text-to-speech
- Dark mode

## Apa bedanya dari versi 1?

Versi 1 sudah jadi fondasi aplikasi belajar Jepang offline: kosakata, flashcard, quiz, latihan tulis kana, profile, progress, dark mode, import/export.

Versi 2 fokus ke polish dan materi belajar:

- Kanji basic ditambahkan.
- Menu belajar lebih lengkap.
- Write screen lebih halus dan lebih stabil.
- Progress belajar lebih kelihatan.
- Form tambah kotoba lebih cepat dipakai.
- Profile lebih rapi.
- Crash dari database lama diperbaiki.

Singkatnya: versi 1 bisa dipakai, versi 2 lebih nyaman dipakai tiap hari.

## Materi Kanji awal

Kanji awal masih basic, bukan kamus penuh.

- **Nomor:** 一 二 三 四 五 六 七 八 九 十
- **Hari/alam:** 日 月 火 水 木 金 土
- **Orang:** 人 子 女 男
- **Alam:** 山 川
- **Ukuran:** 大 小 中

Setiap Kanji berisi:

- huruf Kanji
- arti Indonesia
- onyomi
- kunyomi
- contoh kata
- catatan pemakaian singkat

## Format CSV import

```csv
kana,romaji,meaning_id,category,jlpt_level,script_type,group
おはよう,ohayou,selamat pagi,greeting,N5,hiragana,bab 1
コーヒー,koohii,kopi,food,N5,katakana,bab 1
```

`group` boleh kosong. App tetap jalan.

## Catatan lisensi

Kana stroke data memakai data turunan animCJK. File `NOTICE.md` dan lisensi animCJK tetap disertakan di project.
