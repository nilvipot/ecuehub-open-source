/** Fail explicitly rather than silently dropping malformed observations. */
export function finite(value: unknown, name: string, min: number, max: number): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${name} must be a finite number between ${min} and ${max}`);
  }
}

export function identifier(value: unknown, name: string): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > 200) {
    throw new TypeError(`${name} must be a nonempty string of at most 200 characters`);
  }
}

export function list(value: unknown, name: string, allowEmpty = false): asserts value is readonly unknown[] {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0) || value.length > 10000) {
    throw new RangeError(`${name} must be an array with ${allowEmpty ? 0 : 1} to 10000 entries`);
  }
  for (let index = 0; index < value.length; index++) {
    if (!Object.hasOwn(value, index)) throw new TypeError(`${name} must not contain sparse entries`);
  }
}

export function record(value: unknown, name: string): asserts value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${name} must be an object`);
}

export function isoDate(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '0001-01-01') {
    throw new RangeError('date must be a valid YYYY-MM-DD calendar date');
  }
  const time = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== value) {
    throw new RangeError('date must be a valid YYYY-MM-DD calendar date');
  }
}
