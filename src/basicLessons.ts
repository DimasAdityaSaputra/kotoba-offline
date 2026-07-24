export type BasicLesson = {
  title: string;
  subtitle: string;
  use: string;
  right: string;
  wrong: string;
  meaning: string;
  note: string;
};

export type BasicPattern = {
  title: string;
  formula: string;
  use: string;
  example: string;
  meaning: string;
  note: string;
};

export type BasicDrill = {
  prompt: string;
  answer: string;
  reason: string;
};

export const BASIC_FLOW = [
  'Baca contoh pakai kana dulu. Jangan buru-buru kanji.',
  'Pahami pola kalimat: topik + keterangan + kata kerja/desu.',
  'Partikel dibaca sebagai fungsi kata, bukan diterjemahin satu-satu.',
  'Latih 1 pola sampai otomatis. Baru lanjut pola lain.'
];

export const BASIC_PATTERNS: BasicPattern[] = [
  {
    title: 'A は B です',
    formula: 'A は B です。',
    use: 'Pakai buat perkenalan, identitas, atau “A itu B”.',
    example: 'わたしはがくせいです。',
    meaning: 'Saya siswa.',
    note: 'は nunjukin topik. です bikin kalimat sopan dan rapi.'
  },
  {
    title: 'A は B じゃないです',
    formula: 'A は B じゃないです。',
    use: 'Pakai buat bilang “A bukan B”.',
    example: 'わたしはいしゃじゃないです。',
    meaning: 'Saya bukan dokter.',
    note: 'Versi sopan ringan. Di percakapan pemula, ini cukup aman.'
  },
  {
    title: '〜を します',
    formula: 'もの を します。',
    use: 'Pakai ketika melakukan aksi ke objek.',
    example: 'べんきょうをします。',
    meaning: 'Saya belajar.',
    note: 'を menandai benda/kegiatan yang kena aksi.'
  },
  {
    title: '〜に いきます',
    formula: 'ばしょ に いきます。',
    use: 'Pakai buat pergi ke suatu tujuan.',
    example: 'がっこうにいきます。',
    meaning: 'Saya pergi ke sekolah.',
    note: 'Tujuan pakai に. Tempat aksi pakai で.'
  },
  {
    title: '〜で します',
    formula: 'ばしょ で します。',
    use: 'Pakai buat aksi yang terjadi di suatu tempat.',
    example: 'いえでべんきょうします。',
    meaning: 'Saya belajar di rumah.',
    note: 'Aksinya terjadi di rumah, jadi で.'
  }
];

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
    note: 'で dipakai lokasi aksi terjadi. いきます butuh tujuan, jadi に.'
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


export type BasicSentence = {
  category: string;
  pattern: string;
  polite: string;
  casual: string;
  meaning: string;
  note: string;
};

export const BASIC_SENTENCES: BasicSentence[] = [
  { category: 'Kata benda positif', pattern: 'A は B です', polite: 'わたしはがくせいです。', casual: 'わたしはがくせい。', meaning: 'Saya siswa.', note: 'です = sopan. Casual sering buang です.' },
  { category: 'Kata benda negatif', pattern: 'A は B じゃないです', polite: 'わたしはがくせいじゃないです。', casual: 'わたしはがくせいじゃない。', meaning: 'Saya bukan siswa.', note: 'じゃないです umum. ではありません lebih formal.' },
  { category: 'Kata benda negatif formal', pattern: 'A は B ではありません', polite: 'わたしはいしゃではありません。', casual: 'わたしはいしゃじゃない。', meaning: 'Saya bukan dokter.', note: 'ではありません cocok tulisan/presentasi.' },
  { category: 'Iya / bukan', pattern: 'はい / いいえ', polite: 'はい、そうです。', casual: 'うん、そう。', meaning: 'Ya, benar.', note: 'はい sopan. うん casual.' },
  { category: 'Bukan / salah', pattern: 'いいえ / ちがいます', polite: 'いいえ、ちがいます。', casual: 'ううん、ちがう。', meaning: 'Tidak, bukan.', note: 'ちがいます = “beda/salah/bukan itu”.' },
  { category: 'Ada benda', pattern: 'もの が あります', polite: 'つくえがあります。', casual: 'つくえがある。', meaning: 'Ada meja.', note: 'あります buat benda/tumbuhan/hal abstrak.' },
  { category: 'Tidak ada benda', pattern: 'もの が ありません', polite: 'おかねがありません。', casual: 'おかねがない。', meaning: 'Tidak ada uang.', note: 'ありません sopan. ない casual.' },
  { category: 'Ada makhluk hidup', pattern: 'ひと/どうぶつ が います', polite: 'ねこがいます。', casual: 'ねこがいる。', meaning: 'Ada kucing.', note: 'います buat manusia/hewan.' },
  { category: 'Tidak ada makhluk hidup', pattern: 'ひと/どうぶつ が いません', polite: 'せんせいがいません。', casual: 'せんせいがいない。', meaning: 'Guru tidak ada.', note: 'いません sopan. いない casual.' },
  { category: 'Kata sifat い positif', pattern: 'A は 〜いです', polite: 'このほんはおもしろいです。', casual: 'このほんはおもしろい。', meaning: 'Buku ini menarik.', note: 'Kata sifat い langsung + です untuk sopan.' },
  { category: 'Kata sifat い negatif', pattern: '〜くないです', polite: 'このほんはおもしろくないです。', casual: 'このほんはおもしろくない。', meaning: 'Buku ini tidak menarik.', note: 'Akhir い berubah jadi くない.' },
  { category: 'Kata sifat な positif', pattern: 'A は 〜です', polite: 'このまちはしずかです。', casual: 'このまちはしずかだ。', meaning: 'Kota ini tenang.', note: 'Casual kata sifat な bisa pakai だ.' },
  { category: 'Kata sifat な negatif', pattern: '〜じゃないです', polite: 'このまちはしずかじゃないです。', casual: 'このまちはしずかじゃない。', meaning: 'Kota ini tidak tenang.', note: 'Pola negatif mirip kata benda.' },
  { category: 'Kata kerja positif', pattern: '〜ます', polite: 'みずをのみます。', casual: 'みずをのむ。', meaning: 'Saya minum air.', note: 'ます sopan. Bentuk kamus/casual: のむ.' },
  { category: 'Kata kerja negatif', pattern: '〜ません', polite: 'みずをのみません。', casual: 'みずをのまない。', meaning: 'Saya tidak minum air.', note: 'ません sopan. Casual negatif beda bentuk: のまない.' },
  { category: 'Pergi positif', pattern: '〜にいきます', polite: 'がっこうにいきます。', casual: 'がっこうにいく。', meaning: 'Saya pergi ke sekolah.', note: 'Tujuan pakai に.' },
  { category: 'Pergi negatif', pattern: '〜にいきません', polite: 'がっこうにいきません。', casual: 'がっこうにいかない。', meaning: 'Saya tidak pergi ke sekolah.', note: 'いきません sopan. いかない casual.' },
  { category: 'Melakukan positif', pattern: '〜をします', polite: 'べんきょうをします。', casual: 'べんきょうをする。', meaning: 'Saya belajar.', note: 'します/する = melakukan.' },
  { category: 'Melakukan negatif', pattern: '〜をしません', polite: 'べんきょうをしません。', casual: 'べんきょうをしない。', meaning: 'Saya tidak belajar.', note: 'しません sopan. しない casual.' },
  { category: 'Suka positif', pattern: 'A がすきです', polite: 'にほんごがすきです。', casual: 'にほんごがすき。', meaning: 'Saya suka bahasa Jepang.', note: 'すき biasanya pakai が.' },
  { category: 'Suka negatif', pattern: 'A がすきじゃないです', polite: 'からいものがすきじゃないです。', casual: 'からいものがすきじゃない。', meaning: 'Saya tidak suka makanan pedas.', note: 'Bukan をすき. Pakai が.' },
  { category: 'Mau positif', pattern: '〜たいです', polite: 'にほんにいきたいです。', casual: 'にほんにいきたい。', meaning: 'Saya ingin pergi ke Jepang.', note: 'たい nempel ke akar kata kerja.' },
  { category: 'Mau negatif', pattern: '〜たくないです', polite: 'きょうはいきたくないです。', casual: 'きょうはいきたくない。', meaning: 'Hari ini saya tidak ingin pergi.', note: 'たい negatif jadi たくない.' },
  { category: 'Bisa positif', pattern: '〜できます', polite: 'ひらがなができます。', casual: 'ひらがなができる。', meaning: 'Saya bisa hiragana.', note: 'できる = bisa/mampu.' },
  { category: 'Bisa negatif', pattern: '〜できません', polite: 'かんじができません。', casual: 'かんじができない。', meaning: 'Saya tidak bisa kanji.', note: 'Di sini かんじ dipakai sebagai istilah; boleh kenal kata ini dulu.' }
];

export const BASIC_DRILLS: BasicDrill[] = [
  { prompt: 'みず＿のみます。', answer: 'を', reason: 'みず adalah objek yang diminum.' },
  { prompt: 'がっこう＿いきます。', answer: 'に', reason: 'がっこう adalah tujuan pergi.' },
  { prompt: 'いえ＿べんきょうします。', answer: 'で', reason: 'いえ adalah tempat aksi belajar.' },
  { prompt: 'わたし＿ほんです。', answer: 'の', reason: 'Maksudnya buku milik saya.' },
  { prompt: 'がくせいです＿', answer: 'か', reason: 'か di akhir bikin kalimat tanya.' }
];
