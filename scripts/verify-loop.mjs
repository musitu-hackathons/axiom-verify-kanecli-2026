/** Fail-closed agent feedback loop: Kane evidence => agent repair prompt => explicit re-run. */
import { spawn } from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
function execute(cmd,args){return new Promise((resolveRun)=>{const cp=spawn(cmd,args,{cwd:root,stdio:'inherit'});cp.on('error',e=>resolveRun({code:127,error:e.message}));cp.on('close',code=>resolveRun({code}));});}
await mkdir(resolve(root,'evidence'),{recursive:true});
const first=await execute(process.execPath,['scripts/verify-kane.mjs']);
if(first.code===0){console.log('Kane passed. Feedback loop closed without code edits.');process.exit(0);}
let summary;
try{summary=JSON.parse(await readFile(resolve(root,'evidence/kane-summary.json'),'utf8'));}catch{summary={error:'Kane produced no readable report'};}
const prompt=`You are the coding agent repairing AXIOM Verify, a new hackathon demo. Kane CLI returned the attached genuine result (never invent a pass):\n${JSON.stringify(summary,null,2)}\n\nInspect only the app under this project root. If auth is missing, ask for CI credentials; do not change app logic to suppress tests. If a real app regression exists, make the smallest correct fix, run npm test, then run npm run verify:kane. Do not disable, fake, or remove Kane checks. Leave deliberate regression injection available for the negative test. Provide the source change and before/after Kane evidence.\n`;
await writeFile(resolve(root,'evidence/agent-repair-request.md'),prompt);
console.log('Agent feedback prompt written to evidence/agent-repair-request.md.');
if(process.env.RUN_CODEX_REPAIR==='1'){
  const agent=await execute('codex',['exec','--sandbox','workspace-write',prompt]);
  if(agent.code!==0){console.error('Agent repair failed; refusing release.');process.exit(1);}
  const rerun=await execute(process.execPath,['scripts/verify-kane.mjs']);
  process.exit(rerun.code===0?0:1);
}
console.error('Release blocked. Repair must be performed by a configured coding agent then verified with Kane.');
process.exit(1);