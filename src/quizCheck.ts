import { romajiToKana } from './kana';
import { normalizeAnswer } from './numberQuiz';

export function isQuizAnswerCorrect(given: string, expected: string, alt = '', inputKana = false, inputScript: 'hiragana' | 'katakana' = 'hiragana') {
  const normalizedGiven = normalizeAnswer(inputKana ? romajiToKana(given, inputScript, true) : given);
  const normalizedExpected = normalizeAnswer(expected);
  const normalizedAlt = normalizeAnswer(alt);
  const direct = normalizedGiven === normalizedExpected || (!!normalizedAlt && normalizedGiven === normalizedAlt);
  if (direct || inputKana || !looksLikeRomaji(expected)) return direct;

  const givenKana = normalizeAnswer(romajiToKana(given, inputScript, true));
  const expectedKana = normalizeAnswer(romajiToKana(expected, inputScript, true));
  const altKana = normalizeAnswer(romajiToKana(alt, inputScript, true));
  return givenKana === expectedKana || (!!alt && givenKana === altKana);
}

function looksLikeRomaji(value: string) {
  return /^[a-z' -]+$/i.test(value.trim()) && /[aiueo]/i.test(value);
}
