import test from 'node:test';
import assert from 'node:assert/strict';
import { npv, injectedRegression } from '../src/finance.mjs';

// The failing Kane assertion exposed a second-period discounting defect in the
// previously named 'injectedRegression' route. This route must now be safe.
test('repaired historical fault path matches the trusted NPV for two annual flows', () => {
  const expected = npv(1000, 10, [600, 600]);
  assert.ok(Math.abs(injectedRegression(1000, 10, [600, 600]) - expected) < 1e-9);
});

test('repaired historical path matches the trusted NPV for three periods', () => {
  const expected = npv(1000, 12, [200, 400, 800]);
  assert.ok(Math.abs(injectedRegression(1000, 12, [200, 400, 800]) - expected) < 1e-9);
});

test('repaired path enforces the same input validation', () => {
  assert.throws(() => injectedRegression(100, -100, [120]), /Discount rate/);
});