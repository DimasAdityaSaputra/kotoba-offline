import assert from 'node:assert/strict';
import { numberToJapanese } from './numberQuiz';

assert.equal(numberToJapanese(0), 'zero');
assert.equal(numberToJapanese(1), 'ichi');
assert.equal(numberToJapanese(10), 'juu');
assert.equal(numberToJapanese(21), 'nijuu ichi');
assert.equal(numberToJapanese(105), 'hyaku go');
assert.equal(numberToJapanese(300), 'sanbyaku');
assert.equal(numberToJapanese(600), 'roppyaku');
assert.equal(numberToJapanese(800), 'happyaku');
assert.equal(numberToJapanese(1000), 'sen');
assert.equal(numberToJapanese(3000), 'sanzen');
assert.equal(numberToJapanese(8000), 'hassen');
assert.equal(numberToJapanese(10000), 'ichiman');
assert.equal(numberToJapanese(12345), 'ichiman nisen sanbyaku yonjuu go');
assert.equal(numberToJapanese(100000), 'juuman');

console.log('number quiz selfcheck passed');
