export type KanjiItem = {
  kanji: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
  note: string;
  category: 'number' | 'day' | 'person' | 'nature' | 'size';
  examples: { word: string; reading: string; meaning: string }[];
};

export const basicKanji: KanjiItem[] = [
  item('day', '日', 'matahari; hari', 'ニチ, ジツ', 'ひ, か', 'Dipakai buat hari, tanggal, dan kata soal Jepang.', [['日本', 'にほん', 'Jepang'], ['日曜日', 'にちようび', 'Minggu']]),
  item('day', '月', 'bulan; bulan kalender', 'ゲツ, ガツ', 'つき', 'Bulan langit dan nama bulan kalender.', [['月曜日', 'げつようび', 'Senin'], ['一月', 'いちがつ', 'Januari']]),
  item('day', '火', 'api', 'カ', 'ひ', 'Muncul di hari Selasa dan kata tentang api.', [['火曜日', 'かようび', 'Selasa'], ['火山', 'かざん', 'gunung api']]),
  item('day', '水', 'air', 'スイ', 'みず', 'Kanji dasar buat air dan hari Rabu.', [['水曜日', 'すいようび', 'Rabu'], ['水', 'みず', 'air']]),
  item('day', '木', 'pohon; kayu', 'モク, ボク', 'き', 'Buat pohon, kayu, dan hari Kamis.', [['木曜日', 'もくようび', 'Kamis'], ['木', 'き', 'pohon']]),
  item('day', '金', 'emas; uang', 'キン, コン', 'かね', 'Bisa berarti emas atau uang tergantung kata.', [['金曜日', 'きんようび', 'Jumat'], ['お金', 'おかね', 'uang']]),
  item('day', '土', 'tanah', 'ド, ト', 'つち', 'Buat tanah dan hari Sabtu.', [['土曜日', 'どようび', 'Sabtu'], ['土地', 'とち', 'tanah/lahan']]),
  item('person', '人', 'orang', 'ジン, ニン', 'ひと', 'Sering jadi akhiran orang/penduduk.', [['日本人', 'にほんじん', 'orang Jepang'], ['人', 'ひと', 'orang']]),
  item('person', '子', 'anak', 'シ, ス', 'こ', 'Sering muncul di kata anak atau nama.', [['子供', 'こども', 'anak'], ['女子', 'じょし', 'perempuan/gadis']]),
  item('person', '女', 'perempuan', 'ジョ, ニョ', 'おんな', 'Kanji dasar buat perempuan.', [['女の人', 'おんなのひと', 'perempuan'], ['女子', 'じょし', 'gadis/perempuan']]),
  item('person', '男', 'laki-laki', 'ダン, ナン', 'おとこ', 'Kanji dasar buat laki-laki.', [['男の人', 'おとこのひと', 'laki-laki'], ['男子', 'だんし', 'anak laki-laki']]),
  item('nature', '山', 'gunung', 'サン', 'やま', 'Bisa berdiri sendiri sebagai やま.', [['山', 'やま', 'gunung'], ['火山', 'かざん', 'gunung api']]),
  item('nature', '川', 'sungai', 'セン', 'かわ', 'Buat sungai dan nama tempat.', [['川', 'かわ', 'sungai'], ['小川', 'おがわ', 'sungai kecil']]),
  item('size', '大', 'besar', 'ダイ, タイ', 'おおきい', 'Buat ukuran besar atau hal penting.', [['大学', 'だいがく', 'universitas'], ['大きい', 'おおきい', 'besar']]),
  item('size', '小', 'kecil', 'ショウ', 'ちいさい, こ', 'Buat ukuran kecil.', [['小さい', 'ちいさい', 'kecil'], ['小学校', 'しょうがっこう', 'SD']]),
  item('size', '中', 'tengah; dalam', 'チュウ', 'なか', 'Dipakai buat tengah, dalam, atau sedang berlangsung.', [['中', 'なか', 'dalam'], ['中国', 'ちゅうごく', 'Tiongkok']]),
  item('number', '一', 'satu', 'イチ, イツ', 'ひと', 'Angka 1. Bacaan berubah tergantung kata.', [['一', 'いち', 'satu'], ['一人', 'ひとり', 'satu orang']]),
  item('number', '二', 'dua', 'ニ', 'ふた', 'Angka 2.', [['二', 'に', 'dua'], ['二人', 'ふたり', 'dua orang']]),
  item('number', '三', 'tiga', 'サン', 'みっ', 'Angka 3.', [['三', 'さん', 'tiga'], ['三日', 'みっか', 'tanggal 3 / tiga hari']]),
  item('number', '四', 'empat', 'シ', 'よん, よ', 'Pakai よん biar aman; し kadang dihindari.', [['四', 'よん', 'empat'], ['四月', 'しがつ', 'April']]),
  item('number', '五', 'lima', 'ゴ', 'いつ', 'Angka 5.', [['五', 'ご', 'lima'], ['五日', 'いつか', 'tanggal 5 / lima hari']]),
  item('number', '六', 'enam', 'ロク', 'むっ', 'Angka 6.', [['六', 'ろく', 'enam'], ['六日', 'むいか', 'tanggal 6 / enam hari']]),
  item('number', '七', 'tujuh', 'シチ', 'なな', 'Pakai なな sering lebih aman dari しち.', [['七', 'なな', 'tujuh'], ['七月', 'しちがつ', 'Juli']]),
  item('number', '八', 'delapan', 'ハチ', 'やっ', 'Angka 8.', [['八', 'はち', 'delapan'], ['八日', 'ようか', 'tanggal 8 / delapan hari']]),
  item('number', '九', 'sembilan', 'キュウ, ク', 'ここの', 'Angka 9.', [['九', 'きゅう', 'sembilan'], ['九月', 'くがつ', 'September']]),
  item('number', '十', 'sepuluh', 'ジュウ', 'とお', 'Angka 10.', [['十', 'じゅう', 'sepuluh'], ['十日', 'とおか', 'tanggal 10 / sepuluh hari']])
];

function item(category: KanjiItem['category'], kanji: string, meaning: string, onyomi: string, kunyomi: string, note: string, examples: [string, string, string][]): KanjiItem {
  return { category, kanji, meaning, onyomi, kunyomi, note, examples: examples.map(([word, reading, meaning]) => ({ word, reading, meaning })) };
}
