/** Genuine TestMu Kane CLI browser acceptance; never fabricate provider evidence. */
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const out=resolve('lifeline-capture','kane-evidence');
await mkdir(out,{recursive:true});
const username=process.env.TESTMU_USERNAME||'', key=process.env.TESTMU_ACCESS_KEY||'';
const redact=s=>[username,key].reduce((t,x)=>x.length>=4?t.replaceAll(x,'[REDACTED]'):t,String(s));
const result={provider:'TestMu Kane CLI',url:'https://lifeline.mftintelligence.com/',checked_at:new Date().toISOString(),verified:false};
if(!username||!key){result.reason='Missing repository Actions secrets';await writeFile(resolve(out,'summary.json'),JSON.stringify(result,null,2));process.exit(1)}
const goal="Open the real public LIFELINE AI CONCIERGE website and find Tari's TEXT CHAT only (not video call). Ask 'Hi Tari, can you help a salon manage customer enquiries and booking requests?' and assert a genuine Tari reply. Open https://lifeline.mftintelligence.com/demos/salon-spa-booking. Verify it explicitly uses sample data and simulated payments and WhatsApp messages. Select knotless braids, Zara or any available stylist, an available time, input only fictional Demo User / 082 123 4567 and ONLY IF explicitly simulated complete the demo deposit and confirmation. Verify the demo booking appears on team calendar and review loyalty rewards. NEVER make a real payment, send a real WhatsApp, or contact any live customer. Report real observed status, not guesses.";
const args=['run',goal,'--url','https://lifeline.mftintelligence.com/','--agent','--headless','--mode','action','--final-validation','on','--max-steps','40','--timeout','240','--username',username,'--access-key',key];
const p=spawn('kane-cli',args,{stdio:['ignore','pipe','pipe'],env:{...process.env,KANE_CLI_USER_AGENT:'lifeline-public-demo-ci'}});
let stdout='',stderr='',timeout=false;
const stop=setTimeout(()=>{timeout=true;p.kill('SIGKILL')},300000);
p.stdout.on('data',b=>{stdout+=String(b);if(stdout.length>1200000){timeout=true;p.kill('SIGKILL')}});
p.stderr.on('data',b=>{stderr+=String(b);if(stderr.length>1200000){timeout=true;p.kill('SIGKILL')}});
const exit=await new Promise(r=>{p.on('error',e=>r({code:null,error:e.message}));p.on('close',code=>r({code,error:null}))});
clearTimeout(stop);
await writeFile(resolve(out,'kane.ndjson'),redact(stdout));
await writeFile(resolve(out,'kane.stderr.log'),redact(stderr));
result.verified=!exit.error&&!timeout&&exit.code===0&&stdout.includes('stream_start')&&stdout.includes('run_end');
result.exit_code=exit.code;result.reason=result.verified?'Provider stream completed; review assertion evidence':'NOT VERIFIED: provider error, incomplete stream or failed browser assertion';
result.timeout=timeout;result.error=exit.error?redact(exit.error):null;
await writeFile(resolve(out,'summary.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));if(!result.verified)process.exitCode=1;
