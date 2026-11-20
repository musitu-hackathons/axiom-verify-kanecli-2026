import test from 'node:test';
import assert from 'node:assert/strict';
import { runScenario, SCENARIOS } from '../src/sentinel/engine.mjs';
import { evaluateLedger } from '../src/sentinel/oracle.mjs';

for (const scenario of SCENARIOS) {
  test(`${scenario.id}: vulnerable run must BLOCK with an independent invariant violation`, () => {
    const verdict = evaluateLedger(runScenario(scenario.id, 'vulnerable'));
    assert.equal(verdict.safeToRelease, false);
    assert.equal(verdict.status, 'BLOCK');
    assert.ok(verdict.failures.length >= 1);
  });
  test(`${scenario.id}: protected run must PASS all independent controls`, () => {
    const verdict = evaluateLedger(runScenario(scenario.id, 'protected'));
    assert.equal(verdict.safeToRelease, true);
    assert.equal(verdict.status, 'SAFE');
    assert.equal(verdict.failures.length, 0);
    assert.ok(verdict.checks.length >= 6);
  });
}

test('oracle detects tampered closing account without trusting a green transaction status', () => {
  const run = runScenario('duplicate','protected');
  run.accounts.find(a => a.id === 'acme-vendor').balanceCents += 50000;
  assert.equal(evaluateLedger(run).safeToRelease, false);
  assert.ok(evaluateLedger(run).failures.some(f => /conservation|reconciliation/i.test(f.key)));
});

test('oracle rejects a missing debit from journal even when balances are unchanged', () => {
  const run = runScenario('imbalance','protected');
  run.journal[0].debitCents = 0;
  assert.equal(evaluateLedger(run).safeToRelease, false);
});

test('oracle rejects an empty or unrecognized ledger result', () => {
  assert.throws(() => evaluateLedger(null), /invalid|missing/i);
  const run = runScenario('duplicate','protected');
  run.scenarioId = 'invented';
  assert.throws(() => evaluateLedger(run), /unknown scenario/i);
});