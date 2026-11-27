import { finite } from './validation.js';

/** Strict percentage parsing with an explicit decimal convention; no grouping separators. */
export function parsePercentage(input: string | number, decimal: '.' | ',' = '.'): number {
  if (decimal !== '.' && decimal !== ',') throw new RangeError('decimal must be dot or comma');
  if (typeof input === 'number') { finite(input, 'percentage', 0, 100); return input; }
  if (typeof input !== 'string' || input.length > 100) throw new TypeError('percentage must be a number or short string');
  const text = input.trim().replace(/%$/, '').trim();
  const pattern = decimal === '.' ? /^\d+(?:\.\d+)?$/ : /^\d+(?:,\d+)?$/;
  if (!pattern.test(text)) throw new RangeError('invalid percentage or decimal convention');
  const value = Number(text.replace(',', '.')); finite(value, 'percentage', 0, 100); return value;
}
