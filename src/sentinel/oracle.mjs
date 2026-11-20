/** AXIOM Sentinel oracle: independent accounting checks; does not import or execute the payment engine. */
const EXPECTED_SETTLEMENTS = Object.freeze({
  duplicate: 1,
  overdraft: 0,
  'cross-tenant': 0,
  imbalance: 1,
  'key-collision': 1
});

function assertShape(run) {
  if (!run || typeof run !== 'object' || !Array.isArray(run.openingAccounts) || !Array.isArray(run.accounts) || !Array.isArray(run.journal) || !Array.isArray(run.attempts)) {
    throw new TypeError('Invalid or missing ledger run');
  }
  if (!(run.scenarioId in EXPECTED_SETTLEMENTS)) throw new RangeError(`Unknown scenario in ledger run: ${run.scenarioId}`);
  const accounts = [...run.openingAccounts, ...run.accounts];
  if (accounts.some(a => typeof a.id !== 'string' || typeof a.tenantId !== 'string' || !Number.isSafeInteger(a.balanceCents))) {
    throw new TypeError('Invalid account snapshot');
  }
}

export function evaluateLedger(run) {
  assertShape(run);
  const start = new Map(run.openingAccounts.map(a => [a.id, a]));
  const finish = new Map(run.accounts.map(a => [a.id, a]));
  const journal = run.journal;
  const attempts = run.attempts;
  const checks = [];
  const add = (key, label, passed, detail) => checks.push({ key, label, passed: Boolean(passed), detail });
  const sum = items => items.reduce((total, a) => total + a.balanceCents, 0);
  const openingCents = sum(run.openingAccounts), endingCents = sum(run.accounts);

  add('conservation', 'Total money supply conserved', openingCents === endingCents,
      `Opening ${openingCents}¢ · Closing ${endingCents}¢ · Drift ${endingCents - openingCents}¢`);
  const entryBalanced = journal.every(t => Number.isSafeInteger(t.debitCents) && t.debitCents > 0 && t.debitCents === t.creditCents);
  add('double_entry', 'Debit and credit legs balance', entryBalanced,
      entryBalanced ? `${journal.length} of ${journal.length} transfers balanced` : 'One or more settled journal entries have mismatched legs');
  const ids = new Set(), duplicates = [];
  for (const tx of journal) {
    if (ids.has(tx.requestId)) duplicates.push(tx.requestId);
    ids.add(tx.requestId);
  }
  add('idempotency', 'Each payment ID settles at most once', duplicates.length === 0,
      duplicates.length ? `Duplicate settled ID(s): ${[...new Set(duplicates)].join(', ')}` : `${ids.size} unique settlement IDs`);
  const badTenant = journal.filter(t => !start.has(t.from) || !start.has(t.to) || start.get(t.from).tenantId !== t.tenantId || start.get(t.to).tenantId !== t.tenantId);
  add('tenant_isolation', 'No cross-tenant settlements', badTenant.length === 0,
      badTenant.length ? `${badTenant.length} unauthorized cross-tenant settlement(s)` : 'All settled accounts remain inside initiating tenant');

  // Replay money changes independently of the processor, checking spendable balances before each debit.
  const replay = new Map(run.openingAccounts.map(a => [a.id, a.balanceCents]));
  let replayValid = true, overdrafts = 0, invalidEntries = 0;
  for (const t of journal) {
    if (!replay.has(t.from) || !replay.has(t.to) || !Number.isSafeInteger(t.debitCents) || !Number.isSafeInteger(t.creditCents) || !Number.isSafeInteger(t.amountCents) || t.debitCents <= 0 || t.creditCents <= 0) {
      replayValid = false; invalidEntries++; continue;
    }
    if (replay.get(t.from) < t.debitCents) overdrafts++;
    const nextFrom = replay.get(t.from) - t.debitCents;
    const nextTo = replay.get(t.to) + t.creditCents;
    if (!Number.isSafeInteger(nextFrom) || !Number.isSafeInteger(nextTo)) replayValid = false;
    replay.set(t.from, nextFrom); replay.set(t.to, nextTo);
  }
  const finalOverdrafts = run.accounts.filter(a => a.balanceCents < 0).length;
  add('no_overdraft', 'Balances cannot fall below zero', overdrafts === 0 && finalOverdrafts === 0,
      overdrafts ? `${overdrafts} overdraft settlement(s)` : finalOverdrafts ? `${finalOverdrafts} negative closing balance(s)` : 'No overdraft');
  const allIdsEqual = replay.size === finish.size && [...replay.entries()].every(([id, cents]) => finish.get(id)?.balanceCents === cents);
  add('reconciliation', 'Closing balances match journal replay', replayValid && allIdsEqual && invalidEntries === 0,
      replayValid && allIdsEqual ? 'Every closing balance reconciles to its opening value plus journal entries' : 'A ledger delta is missing, invalid, or inconsistent');

  const matchingAttempts = journal.every(t => attempts.some(a => a.status === 'settled' && a.requestId === t.requestId && a.from === t.from && a.to === t.to && a.tenantId === t.tenantId && a.amountCents === t.amountCents && t.debitCents === a.amountCents));
  add('intent_integrity', 'Settlement matches an authorized intent record', matchingAttempts,
      matchingAttempts ? 'Settlements match attempted payment amounts and destinations' : 'A settled journal entry lacks a matching attempted payment');
  const expected = EXPECTED_SETTLEMENTS[run.scenarioId];
  // Separate, scenario-specific expected outcome is a key part of catching a flawed UI claiming success.
  add('policy_outcome', 'Expected policy decision observed', journal.length === expected,
      `Scenario ${run.scenarioId} requires ${expected} settlement(s); observed ${journal.length}`);

  const failures = checks.filter(c => !c.passed);
  return {
    status: failures.length ? 'BLOCK' : 'SAFE',
    safeToRelease: failures.length === 0,
    checks,
    failures,
    passedCount: checks.length - failures.length,
    totalCount: checks.length,
    checkedScenario: run.scenarioId,
    evaluatedBy: 'independent-journal-oracle-v1'
  };
}