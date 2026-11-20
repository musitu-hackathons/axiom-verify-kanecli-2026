/** Genuine TestMu Kane browser runner for the public AXIOM SENTINEL lab; no substitute pass fixtures. */
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { parseKaneStream } from './kane-result.mjs';
import { SENTINEL_KANE_OBJECTIVES } from '../src/sentinel/kane-objectives.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const url=process.env.AXIOM_SENTINEL_URL;
if(!url || !/^https:\/\/[a-z0-9.-]+(?:\/[\w/%.-]*)?$/i.test(url)) {
  console.error('NOT VERIFIED: AXIOM_SENTINEL_URL must be an explicit public HTTPS URL for the deployed /sentinel application.');
  process.exit(2);
}
const user=process.env.TESTMU_USERNAME, accessKey=process.env.TESTMU_ACCESS_KEY;
if(!user || !accessKey) {
  console.error('NOT VERIFIED: TESTMU_USERNAME and TESTMU_ACCESS_KEY must be present in private CI secrets.');
  process.exit(2);
}
function redact(input){let output=String(input);for(const value of [user,accessKey])if(value?.length>=4)output=output.replaceAll(value,'[REDACTED]');return output;}
async function executeKane(objective){
  return await new Promise(resolveRun=>{
    const args=['run',objective,'--url',url,'--agent','--headless','--mode','action','--final-validation','on','--max-steps','60','--timeout','280','--username',user,'--access-key',accessKey];
    const child=spawn('kane-cli',args,{cwd:root,env:{...process.env,KANE_CLI_USER_AGENT:'musitu-sentinel-hackathon'},stdio:['ignore','pipe','pipe']});
    let stdout='',stderr='',error=null,timedOut=false;
    const timeout=setTimeout(()=>{timedOut=true;child.kill('SIGKILL');},360_000);
    child.stdout?.on('data',chunk=>{stdout+=String(chunk);if(stdout.length>1_500_000){timedOut=true;child.kill('SIGKILL');}});
    child.stderr?.on('data',chunk=>{stderr+=String(chunk);if(stderr.length>1_500_000){timedOut=true;child.kill('SIGKILL');}});
    child.on('error',e=>{error=e.message;});
    child.on('close',code=>{clearTimeout(timeout);resolveRun({code,stdout,stderr,error,timedOut});});
  });
}
await mkdir(resolve(root,'evidence'),{recursive:true});
const runs=[];
for(const spec of SENTINEL_KANE_OBJECTIVES){
  const raw=await executeKane(spec.objective),parsed=parseKaneStream(raw.stdout,raw.code,spec);
  const result={...parsed,good:parsed.good&&!raw.error&&!raw.timedOut,process_error:raw.error?redact(raw.error):null,timed_out:raw.timedOut};
  runs.push(result);
  await writeFile(resolve(root,`evidence/sentinel-${spec.id}.ndjson`),redact(raw.stdout));
  await writeFile(resolve(root,`evidence/sentinel-${spec.id}.stderr.log`),redact(raw.stderr));
  console.log(`sentinel-${spec.id}: ${result.good?'KANE OBJECTIVE VERIFIED':'NOT VERIFIED'} (${result.actual}; exit ${raw.code})`);
  if(!result.good)break; // Fail closed and preserve scarce provider credits.
}
const summary={provider:'TestMu Kane CLI',target:'AXIOM SENTINEL / synthetic ledger',app_url:url,checked_at:new Date().toISOString(),verified:runs.length===SENTINEL_KANE_OBJECTIVES.length&&runs.every(r=>r.good),requires_human_review:true,runs};
await writeFile(resolve(root,'evidence/sentinel-summary.json'),JSON.stringify(summary,null,2));
if(!summary.verified){console.error('NOT VERIFIED: inspect genuine Kane evidence before claiming this Sentinel browser gate passed.');process.exitCode=1;}
else console.log('Kane browser acceptance conditions met; independent evidence review still required.');