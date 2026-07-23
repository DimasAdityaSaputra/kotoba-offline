export type KanaScript = 'hiragana' | 'katakana';

const HIRA: Record<string, string> = {
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
  ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
  sa: 'さ', shi: 'し', si: 'し', su: 'す', se: 'せ', so: 'そ',
  za: 'ざ', ji: 'じ', zi: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
  ta: 'た', chi: 'ち', ti: 'ち', tsu: 'つ', tu: 'つ', te: 'て', to: 'と',
  da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
  na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
  ha: 'は', hi: 'ひ', fu: 'ふ', hu: 'ふ', he: 'へ', ho: 'ほ',
  ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
  pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
  ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
  ya: 'や', yu: 'ゆ', yo: 'よ',
  ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
  wa: 'わ', wo: 'を', nn: 'ん',
  kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ',
  gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ',
  sha: 'しゃ', shu: 'しゅ', sho: 'しょ', sya: 'しゃ', syu: 'しゅ', syo: 'しょ',
  ja: 'じゃ', ju: 'じゅ', jo: 'じょ', jya: 'じゃ', jyu: 'じゅ', jyo: 'じょ', zya: 'じゃ', zyu: 'じゅ', zyo: 'じょ',
  cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ', tya: 'ちゃ', tyu: 'ちゅ', tyo: 'ちょ',
  nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ',
  hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ',
  bya: 'びゃ', byu: 'びゅ', byo: 'びょ',
  pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ',
  mya: 'みゃ', myu: 'みゅ', myo: 'みょ',
  rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ',
  fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ',
  va: 'ゔぁ', vi: 'ゔぃ', vu: 'ゔ', ve: 'ゔぇ', vo: 'ゔぉ',
  wi: 'うぃ', we: 'うぇ',
  she: 'しぇ', je: 'じぇ', che: 'ちぇ',
  tsa: 'つぁ', tsi: 'つぃ', tse: 'つぇ', tso: 'つぉ',
  la: 'ぁ', li: 'ぃ', lu: 'ぅ', le: 'ぇ', lo: 'ぉ', xa: 'ぁ', xi: 'ぃ', xu: 'ぅ', xe: 'ぇ', xo: 'ぉ',
  lya: 'ゃ', lyu: 'ゅ', lyo: 'ょ', xya: 'ゃ', xyu: 'ゅ', xyo: 'ょ', ltsu: 'っ', xtsu: 'っ',
};

const VOWELS = 'aiueo';
const CONSONANTS = 'bcdfghjklmpqrstvwxyz';

function toKatakana(text: string) {
  return text.replace(/[ぁ-ゖ]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60));
}

function katakanaLongVowels(text: string) {
  return text.replace(/([アカサタナハマヤラワガザダバパャァ])ア/g, '$1ー')
    .replace(/([イキシチニヒミリギジヂビピィ])イ/g, '$1ー')
    .replace(/([ウクスツヌフムユルグズヅブプュゥヴ])ウ/g, '$1ー')
    .replace(/([エケセテネヘメレゲゼデベペェ])エ/g, '$1ー')
    .replace(/([オコソトノホモヨロヲゴゾドボポョォ])オ/g, '$1ー');
}

export function romajiToKana(input: string, script: KanaScript = 'hiragana', singleN = false) {
  const text = input.trim().toLowerCase().replace(/\s+/g, "'");
  let out = '';
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const next = text[i + 1];

    if (/^[ぁ-ゖァ-ヺー]$/.test(char)) {
      out += char;
      i += 1;
      continue;
    }
    if (char === '-' || char === "'" || !/[a-z]/.test(char)) {
      i += 1;
      continue;
    }
    if (char === 'n' && next === 'n') {
      out += 'ん';
      i += 2;
      continue;
    }
    if (char === next && CONSONANTS.includes(char) && char !== 'n') {
      out += 'っ';
      i += 1;
      continue;
    }
    if ((singleN || (next && !VOWELS.includes(next) && next !== 'y')) && char === 'n' && (!next || (!VOWELS.includes(next) && next !== 'y'))) {
      out += 'ん';
      i += 1;
      continue;
    }

    const key3 = text.slice(i, i + 3);
    const key2 = text.slice(i, i + 2);
    const key1 = text.slice(i, i + 1);
    const kana = HIRA[key3] ?? HIRA[key2] ?? HIRA[key1];
    if (!kana) {
      out += char;
      i += 1;
      continue;
    }
    out += kana;
    i += kana === HIRA[key3] ? 3 : kana === HIRA[key2] ? 2 : 1;
  }

  const kana = script === 'katakana' ? katakanaLongVowels(toKatakana(out)) : out;
  return kana;
}
