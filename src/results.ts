import { finite, identifier, isoDate, list, record } from './validation.js';

export type ResultStatus = 'finished' | 'withdrawn' | 'eliminated' | 'disqualified' | 'not-started';
export interface CompetitionResult {
  readonly id: string;
  readonly date: string;
  /** Caller-defined comparison group, e.g. technical test and rule version. */
  readonly testId: string;
  readonly status: ResultStatus;
  readonly percentage: number | null;
  readonly place: number | null;
}
export interface ResultSummary {
  readonly records: number; readonly starts: number; readonly finished: number; readonly scored: number;
  readonly wins: number; readonly podiums: number;
  readonly meanPercentage: number | null; readonly bestPercentage: number | null;
  readonly worstPercentage: number | null;
}

function validateResults(results: readonly CompetitionResult[]): void {
  list(results, 'results', true);
  const ids = new Set<string>();
  for (const result of results) {
    record(result, 'result'); identifier(result.id, 'result.id'); identifier(result.testId, 'testId'); isoDate(result.date);
    if (ids.has(result.id)) throw new RangeError('duplicate result id');
    ids.add(result.id);
    if (!['finished', 'withdrawn', 'eliminated', 'disqualified', 'not-started'].includes(result.status)) throw new RangeError('unknown result status');
    if (result.percentage !== null) finite(result.percentage, 'percentage', 0, 100);
    if (result.place !== null) {
      finite(result.place, 'place', 1, Number.MAX_SAFE_INTEGER);
      if (!Number.isInteger(result.place)) throw new RangeError('place must be an integer');
    }
    if (result.status !== 'finished' && (result.percentage !== null || result.place !== null)) {
      throw new RangeError('non-finished results must have null percentage and place');
    }
  }
}

function summarize(results: readonly CompetitionResult[]): ResultSummary {
  const completed = results.filter(result => result.status === 'finished');
  const scores = completed.flatMap(result => result.percentage === null ? [] : [result.percentage]);
  return { records: results.length, starts: results.filter(result => result.status !== 'not-started').length,
    finished: completed.length, scored: scores.length,
    wins: completed.filter(result => result.place === 1).length,
    podiums: completed.filter(result => result.place !== null && result.place <= 3).length,
    meanPercentage: scores.length ? scores.reduce((sum, score) => sum + score / scores.length, 0) : null,
    bestPercentage: scores.length ? Math.max(...scores) : null,
    worstPercentage: scores.length ? Math.min(...scores) : null };
}

/** Separate comparison groups; never pool different tests into a misleading mean. */
export function summarizeByTest(results: readonly CompetitionResult[]): ReadonlyMap<string, ResultSummary> {
  validateResults(results);
  const groups = new Map<string, CompetitionResult[]>();
  for (const result of results) {
    const group = groups.get(result.testId) ?? []; group.push(result); groups.set(result.testId, group);
  }
  return new Map([...groups].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([id, group]) => [id, summarize(group)]));
}

/** Date-ordered observations in one test. No prediction, causal inference or readiness score. */
export function scoreHistory(results: readonly CompetitionResult[], testId: string): readonly { id: string; date: string; percentage: number }[] {
  validateResults(results); identifier(testId, 'testId');
  return results.filter(result => result.testId === testId && result.status === 'finished' && result.percentage !== null)
    .sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    .map(result => ({ id: result.id, date: result.date, percentage: result.percentage! }));
}
