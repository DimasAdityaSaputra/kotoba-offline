const ONES = ['', 'ichi', 'ni', 'san', 'yon', 'go', 'roku', 'nana', 'hachi', 'kyuu'];
const TENS = ['', 'juu', 'nijuu', 'sanjuu', 'yonjuu', 'gojuu', 'rokujuu', 'nanajuu', 'hachijuu', 'kyuujuu'];
const HUNDREDS = ['', 'hyaku', 'nihyaku', 'sanbyaku', 'yonhyaku', 'gohyaku', 'roppyaku', 'nanahyaku', 'happyaku', 'kyuuhyaku'];
const THOUSANDS = ['', 'sen', 'nisen', 'sanzen', 'yonsen', 'gosen', 'rokusen', 'nanasen', 'hassen', 'kyuusen'];

function under10000(value: number) {
  const parts = [
    THOUSANDS[Math.floor(value / 1000)],
    HUNDREDS[Math.floor(value % 1000 / 100)],
    TENS[Math.floor(value % 100 / 10)],
    ONES[value % 10]
  ].filter(Boolean);
  return parts.join(' ');
}

export function numberToJapanese(value: number) {
  if (value === 0) return 'zero';
  if (!Number.isInteger(value) || value < 0 || value > 100000) return '';
  const man = Math.floor(value / 10000);
  const rest = value % 10000;
  return [man ? `${man === 1 ? 'ichi' : under10000(man)}man` : '', rest ? under10000(rest) : ''].filter(Boolean).join(' ');
}

export function randomInt(max: number) {
  return Math.floor(Math.random() * (max + 1));
}

export function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}
