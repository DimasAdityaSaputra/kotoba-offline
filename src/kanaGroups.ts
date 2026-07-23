export type KanaScript = 'hiragana' | 'katakana';

type KanaGroup = { label: string; romaji: string[]; hiragana: string[]; katakana: string[] };

export const kanaGroups: KanaGroup[] = [
  group('a i u e o', ['a','i','u','e','o'], ['あ','い','う','え','お'], ['ア','イ','ウ','エ','オ']),
  group('ka ki ku ke ko', ['ka','ki','ku','ke','ko'], ['か','き','く','け','こ'], ['カ','キ','ク','ケ','コ']),
  group('sa shi su se so', ['sa','shi','su','se','so'], ['さ','し','す','せ','そ'], ['サ','シ','ス','セ','ソ']),
  group('ta chi tsu te to', ['ta','chi','tsu','te','to'], ['た','ち','つ','て','と'], ['タ','チ','ツ','テ','ト']),
  group('na ni nu ne no', ['na','ni','nu','ne','no'], ['な','に','ぬ','ね','の'], ['ナ','ニ','ヌ','ネ','ノ']),
  group('ha hi fu he ho', ['ha','hi','fu','he','ho'], ['は','ひ','ふ','へ','ほ'], ['ハ','ヒ','フ','ヘ','ホ']),
  group('ma mi mu me mo', ['ma','mi','mu','me','mo'], ['ま','み','む','め','も'], ['マ','ミ','ム','メ','モ']),
  group('ya yu yo', ['ya','yu','yo'], ['や','ゆ','よ'], ['ヤ','ユ','ヨ']),
  group('ra ri ru re ro', ['ra','ri','ru','re','ro'], ['ら','り','る','れ','ろ'], ['ラ','リ','ル','レ','ロ']),
  group('wa wo', ['wa','wo'], ['わ','を'], ['ワ','ヲ']),
  group('n', ['n'], ['ん'], ['ン']),

  group('ga gi gu ge go', ['ga','gi','gu','ge','go'], ['が','ぎ','ぐ','げ','ご'], ['ガ','ギ','グ','ゲ','ゴ']),
  group('za ji zu ze zo', ['za','ji','zu','ze','zo'], ['ざ','じ','ず','ぜ','ぞ'], ['ザ','ジ','ズ','ゼ','ゾ']),
  group('da ji zu de do', ['da','ji','zu','de','do'], ['だ','ぢ','づ','で','ど'], ['ダ','ヂ','ヅ','デ','ド']),
  group('ba bi bu be bo', ['ba','bi','bu','be','bo'], ['ば','び','ぶ','べ','ぼ'], ['バ','ビ','ブ','ベ','ボ']),
  group('pa pi pu pe po', ['pa','pi','pu','pe','po'], ['ぱ','ぴ','ぷ','ぺ','ぽ'], ['パ','ピ','プ','ペ','ポ']),

  group('kya kyu kyo', ['kya','kyu','kyo'], ['きゃ','きゅ','きょ'], ['キャ','キュ','キョ']),
  group('gya gyu gyo', ['gya','gyu','gyo'], ['ぎゃ','ぎゅ','ぎょ'], ['ギャ','ギュ','ギョ']),
  group('sha shu sho', ['sha','shu','sho'], ['しゃ','しゅ','しょ'], ['シャ','シュ','ショ']),
  group('ja ju jo', ['ja','ju','jo'], ['じゃ','じゅ','じょ'], ['ジャ','ジュ','ジョ']),
  group('cha chu cho', ['cha','chu','cho'], ['ちゃ','ちゅ','ちょ'], ['チャ','チュ','チョ']),
  group('nya nyu nyo', ['nya','nyu','nyo'], ['にゃ','にゅ','にょ'], ['ニャ','ニュ','ニョ']),
  group('hya hyu hyo', ['hya','hyu','hyo'], ['ひゃ','ひゅ','ひょ'], ['ヒャ','ヒュ','ヒョ']),
  group('bya byu byo', ['bya','byu','byo'], ['びゃ','びゅ','びょ'], ['ビャ','ビュ','ビョ']),
  group('pya pyu pyo', ['pya','pyu','pyo'], ['ぴゃ','ぴゅ','ぴょ'], ['ピャ','ピュ','ピョ']),
  group('mya myu myo', ['mya','myu','myo'], ['みゃ','みゅ','みょ'], ['ミャ','ミュ','ミョ']),
  group('rya ryu ryo', ['rya','ryu','ryo'], ['りゃ','りゅ','りょ'], ['リャ','リュ','リョ']),

  group('small kana', ['small a','small i','small u','small e','small o','small tsu','small ya','small yu','small yo'], ['ぁ','ぃ','ぅ','ぇ','ぉ','っ','ゃ','ゅ','ょ'], ['ァ','ィ','ゥ','ェ','ォ','ッ','ャ','ュ','ョ']),
  group('katakana loan: fa/va', ['fa','fi','fe','fo','va','vi','vu','ve','vo'], ['ふぁ','ふぃ','ふぇ','ふぉ','ゔぁ','ゔぃ','ゔ','ゔぇ','ゔぉ'], ['ファ','フィ','フェ','フォ','ヴァ','ヴィ','ヴ','ヴェ','ヴォ']),
  group('katakana loan: tsa/ti/di', ['tsa','tsi','tse','tso','ti','tu','di','du'], ['つぁ','つぃ','つぇ','つぉ','てぃ','とぅ','でぃ','どぅ'], ['ツァ','ツィ','ツェ','ツォ','ティ','トゥ','ディ','ドゥ']),
  group('katakana loan: she/che/je', ['she','che','je'], ['しぇ','ちぇ','じぇ'], ['シェ','チェ','ジェ']),
  group('marks', ['long vowel mark'], ['ー'], ['ー'])
];

export function kanaItems(script: KanaScript) {
  return kanaGroups.flatMap((item) => item.romaji.map((romaji, index) => ({ romaji, kana: item[script][index], group: item.label })));
}

function group(label: string, romaji: string[], hiragana: string[], katakana: string[]): KanaGroup {
  return { label, romaji, hiragana, katakana };
}
