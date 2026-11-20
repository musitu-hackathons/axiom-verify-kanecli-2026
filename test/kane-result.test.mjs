import test from 'node:test';
import assert from 'node:assert/strict';
import {parseKaneStream} from '../scripts/kane-result.mjs';
const start = {type:'stream_start',surface:'run',v:1};
const end = status => ({type:'run_end',status,reason:status==='passed'?'Objective completed':'Assertion failed',test_url:'https://test-manager.example/test/123',v:1});
const lines = (...rows) => rows.map(x=>JSON.stringify(x)).join('\n');
test('accepts a real-format started Kane passed run with zero exit',()=>{
  const r=parseKaneStream(lines(start,{step:1,status:'done',remark:'assert: NPV is $41.32'},end('passed')),0,{id:'baseline',expect:'passed'});
  assert.equal(r.good,true);
});
test('accepts a deliberate regression only as an explicit Kane assertion failure',()=>{
  const r=parseKaneStream(lines(start,{step:1,status:'failed',remark:'assert: expected NPV $41.32 but found $90.91'},end('failed')),1,{id:'regression',expect:'failed'});
  assert.equal(r.good,true);
});
test('rejects generic failed Kane runs when regression assertion not evidenced',()=>{
  const r=parseKaneStream(lines(start,{step:1,status:'failed',remark:'login error'},end('failed')),1,{id:'regression',expect:'failed'});
  assert.equal(r.good,false);
});
test('rejects failed run when expected status is passed',()=>{
  const r=parseKaneStream(lines(start,end('failed')),1,{id:'baseline',expect:'passed'});
  assert.equal(r.good,false);
});
test('rejects fake pass without a Kane stream_start',()=>{
  const r=parseKaneStream(lines(end('passed')),0,{id:'baseline',expect:'passed'});
  assert.equal(r.good,false);
});
test('rejects non-started CLI errors and missing results',()=>{
  const r=parseKaneStream('Error: Kane CLI authentication unavailable',2,{id:'baseline',expect:'passed'});
  assert.equal(r.good,false);
});
test('rejects Kane error event even if final status is passed',()=>{
  const r=parseKaneStream(lines(start,{type:'error',message:'unauthorized'},end('passed')),0,{id:'baseline',expect:'passed'});
  assert.equal(r.good,false);
});
test('rejects missing process exit code',()=>{
  const r=parseKaneStream(lines(start,end('passed')),null,{id:'baseline',expect:'passed'});
  assert.equal(r.good,false);
});