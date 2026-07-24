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
    right: '私は学生です。',
    wrong: '私が学生です。',
    meaning: 'Saya siswa.',
    note: 'が bisa benar kalau menjawab “siapa yang siswa?”. Untuk perkenalan biasa, は lebih natural.'
  },
  {
    title: 'が',
    subtitle: 'ga · subjek/fokus baru',
    use: 'Pakai が buat hal yang jadi fokus, baru muncul, atau jawaban “siapa/apa yang…”.',
    right: '猫がいます。',
    wrong: '猫はいます。',
    meaning: 'Ada kucing.',
    note: 'は terdengar seperti “kalau soal kucing, dia ada”. Untuk bilang ada sesuatu, が lebih aman.'
  },
  {
    title: 'を',
    subtitle: 'o · objek aksi',
    use: 'Pakai を untuk benda yang kena aksi langsung.',
    right: '水を飲みます。',
    wrong: '水が飲みます。',
    meaning: 'Saya minum air.',
    note: 'Air bukan yang melakukan aksi. Air yang diminum, jadi pakai を.'
  },
  {
    title: 'に',
    subtitle: 'ni · tujuan/waktu/lokasi ada',
    use: 'Pakai に buat arah tujuan, waktu spesifik, atau lokasi keberadaan.',
    right: '学校に行きます。',
    wrong: '学校で行きます。',
    meaning: 'Saya pergi ke sekolah.',
    note: 'で dipakai lokasi aksi terjadi. 行きます butuh tujuan, jadi に.'
  },
  {
    title: 'で',
    subtitle: 'de · tempat aksi / alat',
    use: 'Pakai で untuk tempat aksi dilakukan atau alat yang dipakai.',
    right: '家で勉強します。',
    wrong: '家に勉強します。',
    meaning: 'Saya belajar di rumah.',
    note: 'Belajar terjadi di rumah, jadi で. Kalau “ada di rumah”, baru 家にいます.'
  },
  {
    title: 'の',
    subtitle: 'no · kepunyaan/penjelas',
    use: 'Pakai の buat “punya X” atau menghubungkan kata benda.',
    right: '私の本です。',
    wrong: '私を本です。',
    meaning: 'Ini buku saya.',
    note: 'の itu mirip “-nya/milik”. を cuma objek aksi, bukan kepunyaan.'
  },
  {
    title: 'か',
    subtitle: 'ka · penanda tanya',
    use: 'Taruh か di akhir kalimat sopan buat bikin pertanyaan.',
    right: '学生ですか。',
    wrong: '学生かです。',
    meaning: 'Apakah kamu siswa?',
    note: 'か taruh di akhir. Pola sopan dasar: 〜ですか / 〜ますか.'
  }
];
