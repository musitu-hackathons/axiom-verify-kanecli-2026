import fs from 'node:fs';
import { constants, createDecipheriv, privateDecrypt } from 'node:crypto';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const enc = JSON.parse(fs.readFileSync('/tmp/corzly.enc.json', 'utf8'));
const key = privateDecrypt({
  key: fs.readFileSync('/tmp/corzly-ephemeral-private.pem'),
  padding: constants.RSA_PKCS1_OAEP_PADDING,
  oaepHash: 'sha256'
}, Buffer.from(enc.wrappedKey, 'base64'));
const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(enc.nonce, 'base64'));
decipher.setAuthTag(Buffer.from(enc.tag, 'base64'));
const plaintext = Buffer.concat([decipher.update(Buffer.from(enc.ciphertext, 'base64')), decipher.final()]);
const packet = JSON.parse(plaintext.toString('utf8'));
if (!packet?.profile || !packet?.cv_pdf_base64) throw Error('Secure application packet incomplete');
const pdf = Buffer.from(packet.cv_pdf_base64, 'base64');
if (pdf.subarray(0, 5).toString() !== '%PDF-') throw Error('Invalid résumé PDF');
fs.writeFileSync('/tmp/corzly-private-cv.pdf', pdf, { mode: 0o600 });
fs.writeFileSync('/tmp/corzly-private-context.md',
  '# Private candidate facts for one authorized Corzly application\n' +
  JSON.stringify(packet.profile, null, 2) + '\n' +
  'Use only truthful statements in this context. No fabricated work experience, work authorization, tax residency, or qualifications. Ask or stop if a required answer is unknown.\n' +
  'The résumé is attached automatically when the file input appears on a later form step; do not navigate away.\n',
  { mode: 0o600 });
plaintext.fill(0);
key.fill(0);

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
if (!context) throw Error('Chrome browser context missing');
const page = context.pages()[0] || await context.newPage();
await page.goto('https://careers.corzly.com/careers/sales-development-rep/apply', {waitUntil:'domcontentloaded', timeout:45000});
await page.waitForTimeout(1800);
const p=packet.profile || {};
const rawName=String(p.full_name || p.name || 'Evans Musitu').trim();
const parts=rawName.split(/\s+/);
const firstName=parts.shift();
const lastName=parts.join(' ');
const input=page.locator('input');
if ((await input.count()) < 5) throw Error('Corzly Step 1 fields not rendered');
await input.nth(0).fill(firstName);
await input.nth(1).fill(lastName);
await input.nth(2).fill(String(p.email || 'evansmusitu5@gmail.com'));
await input.nth(3).fill(String(p.phone || '+263 78 157 2008'));
await input.nth(4).fill('Harare, Zimbabwe');
await page.getByRole('button', {name:'Continue'}).click();
await page.waitForTimeout(1600);
const stage = (await page.locator('body').innerText()).match(/Step\s+\d\s+of\s+4/i)?.[0] || 'UNKNOWN';
console.log('APPLICATION_STEP: '+stage+' (private personal fields entered, not logged)');
let watcherActive = true;
let resumeStaged = false;
const watcher = (async () => {
  const deadline = Date.now() + 350000;
  while (watcherActive && !resumeStaged && Date.now() < deadline) {
    for (const tab of context.pages()) {
      try {
        const inputs = tab.locator('input[type=file]');
        if ((await inputs.count()) > 0) {
          await inputs.first().setInputFiles({name:'Evans_Musitu_Sales_Development_CV.pdf',mimeType:'application/pdf',buffer:pdf},{timeout:12000});
          resumeStaged = await inputs.first().evaluate(el => !!(el.files && el.files.length));
          if (resumeStaged) {
            console.log('RESUME_STAGED: yes, privately in active application browser');
            break;
          }
        }
      } catch { /* Form may be rerendering while moving between steps. */ }
    }
    if (!resumeStaged) await new Promise(resolve => setTimeout(resolve, 250));
  }
})();

const goal = [
  'On the CURRENT OPEN browser tab, finish the official Corzly Sales Development Representative job application.',
  'The user explicitly authorized submission. The private local context contains verified applicant information.',
  'The form has multiple steps, starting at Step 1. The PDF résumé will be AUTO-UPLOADED when its file input appears on a later step. Continue through earlier steps and wait briefly if the résumé upload takes a moment. Do not leave the application domain.',
  'Enter full name, email, phone and Zimbabwe location from the private context.',
  'Answer only questions supported by that context; do not invent employment, references, US tax residency, legal work authorization, guarantees of equipment or schedule, or professional experience.',
  'Review all required fields and the uploaded PDF, then CLICK THE FINAL SUBMIT BUTTON ONCE when truthful and complete.',
  'If any mandatory answers are unsupported or the résumé field cannot be attached, STOP without submitting and report the blocker.',
  'After submitting, VERIFY the confirmation on the actual page, such as an application received thank-you screen. Do not claim success without evidence.',
  'Do not pay fees, consent to unrelated actions, or navigate to other companies.'
].join(' ');
const argv = [
  'run', goal, '--allow-missing-url', '--cdp-endpoint', 'http://127.0.0.1:9222',
  '--agent', '--headless', '--mode', 'action', '--final-validation', 'on',
  '--local-context', '/tmp/corzly-private-context.md', '--max-steps', '65',
  '--timeout', '320', '--username', process.env.TESTMU_USERNAME || '',
  '--access-key', process.env.TESTMU_ACCESS_KEY || ''
];
const out = fs.openSync('/tmp/kane-private-output.log', 'w', 0o600);
const err = fs.openSync('/tmp/kane-private-errors.log', 'w', 0o600);
const exitCode = await new Promise((resolve, reject) => {
  const child = spawn('kane-cli', argv, {stdio:['ignore',out,err], env:process.env});
  child.on('error', reject);
  child.on('exit', code => resolve(code));
});
fs.closeSync(out); fs.closeSync(err);
watcherActive = false;
await watcher;
const lines = fs.readFileSync('/tmp/kane-private-output.log','utf8').split('\n');
let finalEvent = null;
for (const line of lines) {
  if (!line.trim().startsWith('{')) continue;
  try { const v = JSON.parse(line); if (v.type === 'run_end') finalEvent = v; } catch {}
}
let screen = '';
let currentUrl = '';
try { currentUrl = page.url(); screen = await page.locator('body').innerText({timeout:15000}); }
catch {}
const positive = /(thank you.{0,90}(appl|interest)|application (has been )?(successfully )?(submitted|received)|we (have|'ve) received your application|your application was (sent|submitted)|successfully applied)/i.test(screen);
const negative = /(could not submit|application failed|please upload|upload required|missing required)/i.test(screen);
const verifiedSubmission = positive && !negative && resumeStaged;
const summary = String(finalEvent?.summary || '');
console.log('KANE_SAFE_REASON: '+JSON.stringify({reason_code:finalEvent?.reason_code||'unknown',result_code:finalEvent?.result_code||'unknown',status:finalEvent?.status||'unknown'}));
console.log('KANE_RESULT: ' + JSON.stringify({
  submission: verifiedSubmission ? 'CONFIRMED_SUBMITTED' : 'NOT_CONFIRMED',
  kaneExitCode: exitCode, kaneStatus: finalEvent?.status || 'not_reported',
  pageConfirmationVisible: positive,
  pageShowsBlocker: negative,
  resumeStaged,
  confirmationUrl: currentUrl.replace(/[?#].*$/, ''),
  kaneReportedSubmission: /\b(submitted successfully|application (submitted|received)|successfully applied)\b/i.test(summary) && !/\b(not submitted|did not submit)\b/i.test(summary)
}));
await browser.close();
if (!verifiedSubmission) process.exitCode = 1;
