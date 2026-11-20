import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateMatrix } from '../src/sentinel/gate.mjs';

test('full adversarial matrix must detect all five faulty cases and approve all guarded cases', () => {
  const report=evaluateMatrix();
  assert.equal(report.kind,'SENTINEL_SYNTHETIC_CI_GATE');
  assert.equal(report.allPassed,true);
  assert.equal(report.cases.length,5);
  assert.equal(report.detectedFaults,5);
  assert.equal(report.passedProtected,5);
  for(const item of report.cases){
    assert.equal(item.vulnerable.verdict,'BLOCK');
    assert.ok(item.vulnerable.failures.length>=1);
    assert.equal(item.guarded.verdict,'SAFE');
    assert.equal(item.guarded.failures.length,0);
    assert.equal(item.guarded.checksPassed,8);
  }
});

test('matrix reports failure when a regression is allowed through independent oracle', () => {
  const output=evaluateMatrix({evaluate: () => ({safeToRelease:true,status:'SAFE',passedCount:8,totalCount:8,failures:[]})});
  assert.equal(output.allPassed,false);
  assert.equal(output.detectedFaults,0);
});

test('matrix fails if the protected processor fails even one requirement', () => {
  const output=evaluateMatrix({evaluate: run => ({safeToRelease:run.mode==='protected'?false:true,status:run.mode==='protected'?'BLOCK':'SAFE',passedCount:0,totalCount:8,failures:[{key:'policy_outcome'}]})});
  assert.equal(output.allPassed,false);
  assert.equal(output.passedProtected,0);
});