import test from 'node:test';
import assert from 'node:assert/strict';
import { SENTINEL_KANE_OBJECTIVES } from '../src/sentinel/kane-objectives.mjs';
import { parseKaneStream } from '../scripts/kane-result.mjs';

test('real Kane objectives cover incident failure and guarded repair across five scenarios', () => {
  const ids=SENTINEL_KANE_OBJECTIVES.map(o=>o.id);
  assert.deepEqual(ids,['duplicate-unsafe','duplicate-guarded','overdraft-and-tenant','accounting-and-key']);
  for(const objective of SENTINEL_KANE_OBJECTIVES){
    assert.equal(objective.expect,'passed');
    assert.ok(objective.objective.length>100);
    assert.match(objective.objective,/assert|verify/i);
  }
  const objectiveText=SENTINEL_KANE_OBJECTIVES.map(o=>o.objective).join(' ');
  for(const label of ['double payment','Reserve overdraft','Cross-tenant transfer','Phantom credit','Idempotency collision']){
    assert.ok(objectiveText.includes(label), `Missing Kane objective for ${label}`);
  }
});

test('Kane acceptance never marks generic failure as an expected Sentinel pass', () => {
  const spec=SENTINEL_KANE_OBJECTIVES[0];
  const out=[{type:'stream_start',surface:'run'},{type:'step',status:'failed',remark:'browser timed out'}, {type:'run_end',status:'failed'}].map(JSON.stringify).join('\n');
  assert.equal(parseKaneStream(out,1,spec).good,false);
});