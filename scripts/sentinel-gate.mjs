/** Synthetic ledger regression gate for CI; never claims real Kane execution. */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { evaluateMatrix } from '../src/sentinel/gate.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const report=evaluateMatrix();
const record={...report,generatedAt:new Date().toISOString()};
const serialized=JSON.stringify(record,null,2)+'\n';
record.sha256=createHash('sha256').update(serialized).digest('hex');
await mkdir(resolve(root,'evidence'),{recursive:true});
await writeFile(resolve(root,'evidence/sentinel-ci-gate.json'),JSON.stringify(record,null,2)+'\n');
for(const item of report.cases){
  console.log(`${item.passed?'PASS':'BLOCK'} ${item.id}: fault ${item.vulnerable.verdict}, guarded ${item.guarded.verdict}, guarded settlements ${item.guarded.settlements}/${item.expectedSettlements}`);
}
console.log(`${report.status}: ${report.detectedFaults}/${report.scenarios} faults detected; ${report.passedProtected}/${report.scenarios} guarded policies passed; SYNTHETIC REGRESSION ONLY`);
if(!report.allPassed)process.exitCode=1;