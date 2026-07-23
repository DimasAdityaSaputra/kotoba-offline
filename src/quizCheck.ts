import { romajiToKana } from './kana';
import { normalizeAnswer } from './numberQuiz';

export function isQuizAnswerCorrect(given: string, expected: string, alt = '', inputKana = false, inputScript: 'hiragana' | 'katakana' = 'hiragana') {
  const normalizedGiven = normalizeAnswer(inputKana ? romajiToKana(given, inputScript, true) : given);
  const normalizedExpected = normalizeAnswer(expected);
  const normalizedAlt = normalizeAnswer(alt);
  return normalizedGiven === normalizedExpected || (!!normalizedAlt && normalizedGiven === normalizedAlt);
}
