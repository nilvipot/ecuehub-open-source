import { analyzeScorecard, parsePercentage, summarizeByTest, scoreHistory } from '../dist/index.js';

// Invented practice movements, not a federation test sheet or real athlete data.
const score = analyzeScorecard(
  [{ id: 'entry', coefficient: 1 }, { id: 'walk', coefficient: 2 }],
  [{ id: 'C', marks: { entry: 7, walk: 8 } }, { id: 'E', marks: { entry: 6, walk: 7 } }],
  { penaltyPercentagePoints: 2 },
);
const results = [{ id: 'practice-1', date: '2026-06-01', testId: 'practice-v1',
  status: 'finished', percentage: parsePercentage('69,667', ','), place: null }];
console.log(JSON.stringify({ score, summaries: Object.fromEntries(summarizeByTest(results)), history: scoreHistory(results, 'practice-v1') }, null, 2));
