/** Real TestMu Kane CLI runner. Never simulates provider results or bypasses failed assertions. */
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseKaneStream } from './kane-result.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const url = process.env.AXIOM_VERIFY_URL || 'https://axiom-verify-kanecli-zhpdm6.v2.appdeploy.ai/';
const timeoutMs = 360000;
const tests = [
  { id:'baseline', expect:'passed', objective:
    'Open the AXIOM Verify page. If Inject calculation fault is on, turn it OFF. Select Baseline investment and click Evaluate scenario. Assert Net present value is exactly $41.32 and the decision is ACCEPT. Report the actual visible amount.' },
  { id:'regression', expect:'failed', objective:
    'Open the AXIOM Verify page. Select Baseline investment. Turn ON Inject calculation fault and click Evaluate scenario. Assert that Net present value is exactly $41.32. This ASSERTION MUST FAIL because the deliberately injected regression displays $90.91 instead of $41.32. Report the discrepancy explicitly as an assertion failure, not a success.' },
  { id:'recovery', expect:'passed', objective:
    'Open the AXIOM Verify page. Turn OFF Inject calculation fault. Select Baseline investment, click Evaluate scenario and assert $41.32. Then select Zero discount rate and assert $200.00. Select Loss-making case, assert REJECT and -$392.56. Report each visible assertion.' }
];

function runRealKane(objective) {
  return new Promise(resolveRun => {
    const args = ['run', objective, '--url', url, '--agent', '--headless', '--mode', 'action', '--final-validation', 'on', '--max-steps', '50', '--timeout', '280'];
    if (process.env.TESTMU_USERNAME && process.env.TESTMU_ACCESS_KEY) {
      args.push('--username', process.env.TESTMU_USERNAME, '--access-key', process.env.TESTMU_ACCESS_KEY);
    }
    const child = spawn('kane-cli', args, {
      cwd: root, env: { ...process.env, KANE_CLI_USER_AGENT:'axiom-verify-hackathon' },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '', stderr = '', error = null, timedOut = false, settled = false;
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, timeoutMs);
    child.stdout?.on('data', d => {
      stdout += String(d);
      if (stdout.length > 1500000) { timedOut = true; child.kill('SIGKILL'); }
    });
    child.stderr?.on('data', d => {
      stderr += String(d);
      if (stderr.length > 1500000) { timedOut = true; child.kill('SIGKILL'); }
    });
    child.on('error', e => { error = e.message; });
    child.on('close', code => {
      clearTimeout(timer);
      if (!settled) {
        settled = true;
        resolveRun({ code, stdout, stderr, error, timedOut });
      }
    });
  });
}

function redact(text) {
  let sanitized = String(text);
  for (const secret of [process.env.TESTMU_ACCESS_KEY, process.env.TESTMU_USERNAME]) {
    if (typeof secret === 'string' && secret.length >= 4) sanitized = sanitized.replaceAll(secret, '[REDACTED]');
  }
  return sanitized;
}

await mkdir(resolve(root, 'evidence'), { recursive: true });
const runs = [];
for (const spec of tests) {
  const raw = await runRealKane(spec.objective);
  const parsed = parseKaneStream(raw.stdout, raw.code, spec);
  const item = {
    ...parsed, good: parsed.good && !raw.error && !raw.timedOut,
    process_error: raw.error ? redact(raw.error) : null, timed_out: raw.timedOut
  };
  runs.push(item);
  await writeFile(resolve(root, `evidence/${spec.id}.ndjson`), redact(raw.stdout));
  await writeFile(resolve(root, `evidence/${spec.id}.stderr.log`), redact(raw.stderr));
  console.log(`${spec.id}: ${item.good ? 'ACCEPTANCE CONDITION MET' : 'NOT VERIFIED'} (Kane: ${item.actual}; exit: ${raw.code})`);
  // Do not spend credits on later cases if CLI is unavailable or the baseline is invalid.
  if (!item.good) break;
}
const summary = {
  checked_at: new Date().toISOString(), app_url: url,
  provider: 'TestMu Kane CLI', verified: runs.length === tests.length && runs.every(x => x.good),
  requires_human_review: true, runs
};
await writeFile(resolve(root, 'evidence/kane-summary.json'), JSON.stringify(summary, null, 2));
console.log(summary.verified
  ? 'Kane acceptance conditions satisfied; inspect evidence before release.'
  : 'NOT VERIFIED: inspect Kane evidence. Never substitute a third-party smoke test.');
if (!summary.verified) process.exitCode = 1;