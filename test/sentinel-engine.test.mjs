import test from 'node:test';
import assert from 'node:assert/strict';
import { runScenario, SCENARIOS, SandboxLedger, createOpeningAccounts } from '../src/sentinel/engine.mjs';

const settled = run => run.journal.length;
const account = (run, id) => run.accounts.find(x => x.id === id);

test('five declared adversarial scenarios have nonempty explanations', () => {
  assert.deepEqual(SCENARIOS.map(s => s.id), ['duplicate', 'overdraft', 'cross-tenant', 'imbalance', 'key-collision']);
  for (const s of SCENARIOS) assert.ok(s.title.length > 8 && s.description.length > 12);
});

test('duplicate $7,500 retry settles exactly once in protected mode', () => {
  const run = runScenario('duplicate', 'protected');
  assert.equal(run.attempts.length, 2);
  assert.equal(settled(run), 1);
  assert.equal(account(run, 'acme-operating').balanceCents, 1_250_000);
  assert.equal(account(run, 'acme-vendor').balanceCents, 900_000);
  assert.equal(run.attempts[1].status, 'duplicate');
});

test('deliberately vulnerable duplicate retry pays twice', () => {
  const run = runScenario('duplicate', 'vulnerable');
  assert.equal(settled(run), 2);
  assert.equal(account(run, 'acme-operating').balanceCents, 500_000);
  assert.equal(account(run, 'acme-vendor').balanceCents, 1_650_000);
  assert.ok(run.journal.every(x => x.requestId === 'pay-invoice-042'));
});

test('insufficient funds request cannot overdraw in protected mode', () => {
  const run = runScenario('overdraft', 'protected');
  assert.equal(settled(run), 0);
  assert.equal(run.attempts[0].code, 'INSUFFICIENT_FUNDS');
  assert.equal(account(run, 'acme-reserve').balanceCents, 200_000);
});

test('synthetic vulnerability can overdraw in insufficient funds attack', () => {
  const run = runScenario('overdraft', 'vulnerable');
  assert.equal(settled(run), 1);
  assert.equal(account(run, 'acme-reserve').balanceCents, -150_000);
});

test('protected mode denies a cross-tenant transfer', () => {
  const run = runScenario('cross-tenant', 'protected');
  assert.equal(settled(run), 0);
  assert.equal(run.attempts[0].code, 'CROSS_TENANT_DENIED');
});

test('synthetic legacy cross-tenant bypass is visible in journal', () => {
  const run = runScenario('cross-tenant', 'vulnerable');
  assert.equal(settled(run), 1);
  assert.equal(run.journal[0].to, 'zenith-external');
});

test('protected journal has equal debit and credit legs', () => {
  const run = runScenario('imbalance', 'protected');
  assert.equal(settled(run), 1);
  assert.equal(run.journal[0].debitCents, run.journal[0].creditCents);
});

test('synthetic journal imbalance credits more than debits', () => {
  const run = runScenario('imbalance', 'vulnerable');
  assert.equal(run.journal[0].debitCents, 300_000);
  assert.equal(run.journal[0].creditCents, 305_000);
});

test('idempotency key reused with different payload is denied', () => {
  const run = runScenario('key-collision', 'protected');
  assert.equal(settled(run), 1);
  assert.equal(run.attempts[1].code, 'IDEMPOTENCY_CONFLICT');
});

test('unsafe key reuse with different payload settles twice', () => {
  const run = runScenario('key-collision', 'vulnerable');
  assert.equal(settled(run), 2);
});

test('bad requests are rejected without ledger mutation in both modes', () => {
  for (const mode of ['protected','vulnerable']) {
    for (const amount of [0, -1, 1.2, NaN, Infinity, 2**53]) {
      const ledger = new SandboxLedger(createOpeningAccounts(), mode);
      const before = ledger.snapshot();
      const response = ledger.transfer({requestId:'bad', tenantId:'acme', from:'acme-operating', to:'acme-vendor', amountCents:amount});
      assert.equal(response.status, 'rejected');
      assert.equal(response.code, 'INVALID_AMOUNT');
      assert.equal(ledger.journal.length, 0);
      assert.deepEqual(ledger.snapshot(), before);
    }
  }
});

test('unknown scenario or mode fails closed', () => {
  assert.throws(() => runScenario('not-a-case','protected'), /unknown scenario/i);
  assert.throws(() => runScenario('duplicate','wild'), /unknown execution mode/i);
});