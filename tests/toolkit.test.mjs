import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeScorecard, parsePercentage, summarizeByTest, scoreHistory } from '../dist/index.js';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);
const movements = [{ id: 'entry', coefficient: 1 }, { id: 'walk', coefficient: 2 }];
const cards = [{ id: 'C', marks: { entry: 7, walk: 8 } }, { id: 'E', marks: { entry: 6, walk: 7 } }];
const result = (overrides = {}) => ({ id: 'r1', date: '2026-06-01', testId: 'practice-v1', status: 'finished', percentage: 70, place: 1, ...overrides });

test('weighted scorecard matches independent hand calculation', () => {
  const actual = analyzeScorecard(movements, cards, { penaltyPercentagePoints: 2 });
  near(actual.cards[0].earnedPoints, 23); near(actual.cards[1].earnedPoints, 20);
  near(actual.cards[0].maximumPoints, 30); near(actual.grossPercentage, 71.66666666666667);
  near(actual.finalPercentage, 69.66666666666667); near(actual.judgeSpreadPercentagePoints, 10);
  near(actual.movements[0].meanMark, 6.5); near(actual.movements[1].spread, 1);
  near(actual.movements[1].availablePercentagePoints, 16.666666666666668);
});
test('unearned contributions sum to 100 minus gross percentage', () => {
  const actual = analyzeScorecard(movements, cards);
  near(actual.movements.reduce((sum, m) => sum + m.availablePercentagePoints, 0), 100 - actual.grossPercentage);
});
test('all-zero and perfect marks retain boundaries; no hidden clipping', () => {
  near(analyzeScorecard(movements, [{ id: 'C', marks: { entry: 0, walk: 0 } }]).finalPercentage, 0);
  near(analyzeScorecard(movements, [{ id: 'C', marks: { entry: 10, walk: 10 } }]).finalPercentage, 100);
  near(analyzeScorecard(movements, [{ id: 'C', marks: { entry: 0, walk: 0 } }], { penaltyPercentagePoints: 2 }).finalPercentage, -2);
});
test('inputs are unchanged and reordering judges does not change mean', () => {
  const before = JSON.stringify({ movements, cards });
  near(analyzeScorecard(movements, cards).grossPercentage, analyzeScorecard(movements, [...cards].reverse()).grossPercentage);
  assert.equal(JSON.stringify({ movements, cards }), before);
});
test('coefficient scaling preserves percentages', () => {
  near(analyzeScorecard(movements, cards).grossPercentage,
    analyzeScorecard(movements.map(m => ({ ...m, coefficient: m.coefficient * 3 })), cards).grossPercentage);
});
for (const [label, ms, cs, opts] of [
  ['empty movements', [], cards, {}], ['empty cards', movements, [], {}],
  ['duplicate movements', [movements[0], movements[0]], cards, {}],
  ['duplicate judges', movements, [cards[0], cards[0]], {}],
  ['missing mark', movements, [{ id: 'C', marks: { entry: 7 } }], {}],
  ['extra mark', movements, [{ id: 'C', marks: { entry: 7, walk: 8, other: 6 } }], {}],
  ['inherited mark', movements, [{ id: 'C', marks: Object.assign(Object.create({ walk: 8 }), { entry: 7 }) }], {}],
  ['negative coefficient', [{ id: 'entry', coefficient: -1 }], cards, {}],
  ['zero coefficient', [{ id: 'entry', coefficient: 0 }], cards, {}],
  ['tiny coefficient', [{ id: 'entry', coefficient: Number.MIN_VALUE }], cards, {}],
  ['NaN mark', movements, [{ id: 'C', marks: { entry: NaN, walk: 8 } }], {}],
  ['infinite mark', movements, [{ id: 'C', marks: { entry: Infinity, walk: 8 } }], {}],
  ['out of range mark', movements, [{ id: 'C', marks: { entry: 11, walk: 8 } }], {}],
  ['invalid penalty', movements, cards, { penaltyPercentagePoints: -1 }],
  ['null card', movements, [null], {}], ['null marks', movements, [{ id: 'C', marks: null }], {}],
  ['null options', movements, cards, null], ['wrong array type', {}, cards, {}],
  ['null penalty', movements, cards, { penaltyPercentagePoints: null }],
  ['sparse cards', movements, Array(1), {}],
]) test(`rejects ${label}`, () => assert.throws(() => analyzeScorecard(ms, cs, opts)));

test('groups results by test without blending levels; zero is a valid score', () => {
  const results = [result(), result({ id: 'r2', percentage: 0, place: 3 }),
    result({ id: 'r3', status: 'eliminated', percentage: null, place: null }),
    result({ id: 'r4', status: 'not-started', percentage: null, place: null }),
    result({ id: 'r5', percentage: null, place: null }), result({ id: 'r6', testId: 'other', percentage: 95 })];
  const summary = summarizeByTest(results).get('practice-v1');
  assert.deepEqual(summary, { records: 5, starts: 4, finished: 3, scored: 2, wins: 1, podiums: 2,
    meanPercentage: 35, bestPercentage: 70, worstPercentage: 0 });
  assert.equal(summarizeByTest(results).get('other').meanPercentage, 95);
});
test('empty and entirely unscored groups preserve missing values', () => {
  assert.equal(summarizeByTest([]).size, 0);
  const summary = summarizeByTest([result({ percentage: null })]).get('practice-v1');
  assert.equal(summary.meanPercentage, null); assert.equal(summary.bestPercentage, null);
  assert.equal(summary.worstPercentage, null);
});
test('history sorts on date then ID without mutating input or mixing tests', () => {
  const input = [result({ id: 'z', date: '2026-06-03' }), result({ id: 'b' }), result({ id: 'a' }), result({ id: 'x', testId: 'other' })];
  const before = JSON.stringify(input);
  assert.deepEqual(scoreHistory(input, 'practice-v1').map(r => r.id), ['a', 'b', 'z']);
  assert.equal(JSON.stringify(input), before);
});
for (const [label, overrides] of [
  ['invalid day', { date: '2026-02-30' }], ['invalid leap day', { date: '2025-02-29' }],
  ['invalid month', { date: '2026-13-01' }], ['year zero', { date: '0000-01-01' }],
  ['timestamp', { date: '2026-06-01T00:00:00Z' }], ['negative place', { place: -1 }],
  ['fractional place', { place: 1.5 }], ['NaN percentage', { percentage: NaN }],
  ['unknown status', { status: 'unknown' }], ['elimination with score', { status: 'eliminated' }],
  ['missing percentage', { percentage: undefined }], ['missing place', { place: undefined }],
  ['empty test', { testId: '' }], ['infinite percentage', { percentage: Infinity }],
]) test(`result rejects ${label}`, () => assert.throws(() => summarizeByTest([result(overrides)])));
test('duplicate results are rejected to prevent double counting', () => assert.throws(() => summarizeByTest([result(), result()])));
test('valid leap day is accepted', () => assert.equal(summarizeByTest([result({ date: '2024-02-29' })]).size, 1));
test('prototype-looking identifiers remain ordinary map keys', () => assert.equal(summarizeByTest([result({ testId: '__proto__' })]).get('__proto__').records, 1));
test('withdrawals and disqualifications count as starts, not finishes', () => {
  const s = summarizeByTest(['withdrawn', 'disqualified'].map((status, i) => result({ id: String(i), status, percentage: null, place: null }))).get('practice-v1');
  assert.equal(s.starts, 2); assert.equal(s.finished, 0);
});
test('strict decimal conventions and percent symbol', () => {
  assert.equal(parsePercentage(' 74,250 % ', ','), 74.25);
  assert.equal(parsePercentage('74.250'), 74.25); assert.equal(parsePercentage(0), 0);
  assert.equal(parsePercentage('100%'), 100);
});
for (const input of ['', ' ', '74,2.5', '1,234.56', '74abc', '74%%', '1e2', '-1', '101', Infinity, NaN, null, {}, '7 4', '0x10']) {
  test(`parser rejects ${String(input)}`, () => assert.throws(() => parsePercentage(input)));
}
test('comma input requires comma convention', () => assert.throws(() => parsePercentage('74,25')));
test('invalid decimal configuration is rejected', () => assert.throws(() => parsePercentage('74', ';')));
test('oversized arrays and identifiers are rejected', () => {
  assert.throws(() => summarizeByTest(Array(10001).fill(result())));
  assert.throws(() => summarizeByTest([result({ id: 'x'.repeat(201) })]));
});
