import { finite, identifier, list, record } from './validation.js';

export interface Movement { readonly id: string; readonly coefficient: number }
export interface JudgeCard { readonly id: string; readonly marks: Readonly<Record<string, number>> }
export interface ScoringOptions { readonly penaltyPercentagePoints?: number }
export interface ScoredCard { readonly id: string; readonly earnedPoints: number; readonly maximumPoints: number; readonly percentage: number }
export interface MovementAnalysis { readonly id: string; readonly meanMark: number; readonly spread: number; readonly availablePercentagePoints: number }
export interface ScoreAnalysis {
  readonly cards: readonly ScoredCard[];
  readonly movements: readonly MovementAnalysis[];
  readonly grossPercentage: number;
  readonly penaltyPercentagePoints: number;
  readonly finalPercentage: number;
  readonly judgeSpreadPercentagePoints: number;
}

/** Arithmetic for a complete technical scorecard. No federation rule engine or rounding. */
export function analyzeScorecard(movements: readonly Movement[], cards: readonly JudgeCard[], options: ScoringOptions = {}): ScoreAnalysis {
  list(movements, 'movements'); list(cards, 'cards'); record(options, 'options');
  const ids = new Set<string>();
  let coefficientSum = 0;
  for (const movement of movements) {
    record(movement, 'movement'); identifier(movement.id, 'movement.id');
    finite(movement.coefficient, 'coefficient', 0.001, 100);
    if (ids.has(movement.id)) throw new RangeError('duplicate movement id');
    ids.add(movement.id); coefficientSum += movement.coefficient;
  }
  const maximumPoints = coefficientSum * 10;
  if (!Number.isFinite(maximumPoints) || maximumPoints === 0) throw new RangeError('invalid maximum points');
  const cardIds = new Set<string>();
  const scored = cards.map(card => {
    record(card, 'card'); identifier(card.id, 'card.id'); record(card.marks, 'marks');
    if (cardIds.has(card.id)) throw new RangeError('duplicate judge id');
    cardIds.add(card.id);
    if (Object.keys(card.marks).length !== ids.size || Object.keys(card.marks).some(id => !ids.has(id))) {
      throw new RangeError('each judge must score exactly the supplied movements');
    }
    let earnedPoints = 0;
    for (const movement of movements) {
      if (!Object.hasOwn(card.marks, movement.id)) throw new RangeError('missing movement mark');
      const mark = card.marks[movement.id]; finite(mark, 'mark', 0, 10);
      earnedPoints += mark * movement.coefficient;
    }
    return { id: card.id, earnedPoints, maximumPoints, percentage: earnedPoints / maximumPoints * 100 };
  });
  const grossPercentage = scored.reduce((sum, card) => sum + card.percentage / scored.length, 0);
  const penalty = options.penaltyPercentagePoints === undefined ? 0 : options.penaltyPercentagePoints;
  finite(penalty, 'penaltyPercentagePoints', 0, 100);
  const percentages = scored.map(card => card.percentage);
  const analysis = movements.map(movement => {
    const marks = cards.map(card => card.marks[movement.id]!);
    const meanMark = marks.reduce((sum, mark) => sum + mark / marks.length, 0);
    return { id: movement.id, meanMark, spread: Math.max(...marks) - Math.min(...marks),
      availablePercentagePoints: (10 - meanMark) * movement.coefficient / maximumPoints * 100 };
  });
  return { cards: scored, movements: analysis, grossPercentage, penaltyPercentagePoints: penalty,
    finalPercentage: grossPercentage - penalty,
    judgeSpreadPercentagePoints: Math.max(...percentages) - Math.min(...percentages) };
}
