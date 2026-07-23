import assert from 'node:assert/strict';
import { isQuizAnswerCorrect } from './quizCheck';

assert.equal(isQuizAnswerCorrect('よn', 'よん', 'yon', true), true);
assert.equal(isQuizAnswerCorrect('yon', 'よん', 'yon', true), true);
assert.equal(isQuizAnswerCorrect('よん', 'よん', 'yon', true), true);
assert.equal(isQuizAnswerCorrect('yo', 'よん', 'yon', true), false);
assert.equal(isQuizAnswerCorrect('pan', 'パン', 'pan', true, 'katakana'), true);

console.log('quiz check selfcheck passed');
