export type BasicLesson = {
  title: string;
  subtitle: string;
  use: string;
  right: string;
  wrong: string;
  meaning: string;
  note: string;
};

export const BASIC_LESSONS: BasicLesson[] = [
  {
    title: 'は',
    subtitle: 'wa · topik kalimat',
    use: 'Pakai は buat ngomong “tentang X…”. Dia nunjukin topik, bukan selalu subjek.',
    right: 'わたしはがくせいです。',
    wrong: 'わたしががくせいです。',
    meaning: 'Saya siswa.',
    note: 'が bisa benar kalau menjawab “siapa yang siswa?”. Untuk perkenalan biasa, は lebih natural.'
  },
  {
    title: 'が',
    subtitle: 'ga · subjek/fokus baru',
    use: 'Pakai が buat hal yang jadi fokus, baru muncul, atau jawaban “siapa/apa yang…”.',
    right: 'ねこがいます。',
    wrong: 'ねこはいます。',
    meaning: 'Ada kucing.',
    note: 'は terdengar seperti “kalau soal kucing, dia ada”. Untuk bilang ada sesuatu, が lebih aman.'
  },
  {
    title: 'を',
    subtitle: 'o · objek aksi',
    use: 'Pakai を untuk benda yang kena aksi langsung.',
    right: 'みずをのみます。',
    wrong: 'みずがのみます。',
    meaning: 'Saya minum air.',
    note: 'Air bukan yang melakukan aksi. Air yang diminum, jadi pakai を.'
  },
  {
    title: 'に',
    subtitle: 'ni · tujuan/waktu/lokasi ada',
    use: 'Pakai に buat arah tujuan, waktu spesifik, atau lokasi keberadaan.',
    right: 'がっこうにいきます。',
    wrong: 'がっこうでいきます。',
    meaning: 'Saya pergi ke sekolah.',
    note: 'で dipakai lokasi aksi terjadi. 行きます butuh tujuan, jadi に.'
  },
  {
    title: 'で',
    subtitle: 'de · tempat aksi / alat',
    use: 'Pakai で untuk tempat aksi dilakukan atau alat yang dipakai.',
    right: 'いえでべんきょうします。',
    wrong: 'いえにべんきょうします。',
    meaning: 'Saya belajar di rumah.',
    note: 'Belajar terjadi di rumah, jadi で. Kalau “ada di rumah”, baru いえにいます.'
  },
  {
    title: 'の',
    subtitle: 'no · kepunyaan/penjelas',
    use: 'Pakai の buat “punya X” atau menghubungkan kata benda.',
    right: 'わたしのほんです。',
    wrong: 'わたしをほんです。',
    meaning: 'Ini buku saya.',
    note: 'の itu mirip “-nya/milik”. を cuma objek aksi, bukan kepunyaan.'
  },
  {
    title: 'か',
    subtitle: 'ka · penanda tanya',
    use: 'Taruh か di akhir kalimat sopan buat bikin pertanyaan.',
    right: 'がくせいですか。',
    wrong: 'がくせいかです。',
    meaning: 'Apakah kamu siswa?',
    note: 'か taruh di akhir. Pola sopan dasar: 〜ですか / 〜ますか.'
  }
];
