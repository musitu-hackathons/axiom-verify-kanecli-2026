/** Deterministic synthetic release-check matrix. Separate from remote Kane browser acceptance. */
import { SCENARIOS, runScenario } from './engine.mjs';
import { evaluateLedger } from './oracle.mjs';

export function evaluateMatrix({ evaluate = evaluateLedger } = {}) {
  if (typeof evaluate !== 'function') throw new TypeError('Independent oracle evaluator must be a function');
  const cases = SCENARIOS.map(scenario => {
    const vulnerableRun = runScenario(scenario.id, 'vulnerable');
    const guardedRun = runScenario(scenario.id, 'protected');
    const vulnerable = evaluate(vulnerableRun), guarded = evaluate(guardedRun);
    const detected = vulnerable.safeToRelease === false && vulnerable.status === 'BLOCK' && vulnerable.failures.length > 0;
    const protectedPassed = guarded.safeToRelease === true && guarded.status === 'SAFE' && guarded.failures.length === 0 && guarded.totalCount === 8;
    const match = guardedRun.journal.length === scenario.expectedSettlements;
    return {
      id: scenario.id, title: scenario.title,
      vulnerable: {verdict:vulnerable.status,failures:vulnerable.failures.map(f=>f.key),settlements:vulnerableRun.journal.length,detected},
      guarded: {verdict:guarded.status,failures:guarded.failures.map(f=>f.key),checksPassed:guarded.passedCount,settlements:guardedRun.journal.length,protectedPassed},
      expectedSettlements:scenario.expectedSettlements,
      passed:detected && protectedPassed && match
    };
  });
  return {
    kind:'SENTINEL_SYNTHETIC_CI_GATE',
    status:cases.every(c=>c.passed)?'PASS':'BLOCK',
    allPassed:cases.every(c=>c.passed),
    detectedFaults:cases.filter(c=>c.vulnerable.detected).length,
    passedProtected:cases.filter(c=>c.guarded.protectedPassed).length,
    scenarios:SCENARIOS.length,
    cases,
    disclaimer:'This is a synthetic, in-process policy matrix. External Kane CLI browser evidence is a separate release gate.'
  };
}