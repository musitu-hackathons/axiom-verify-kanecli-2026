/** Pure Kane CLI NDJSON classification. This module never runs Kane or fabricates evidence. */
export function parseKaneStream(stdout, code, spec) {
  const records = String(stdout).split(/\r?\n/).flatMap(line => {
    try {
      const obj = JSON.parse(line);
      return obj && typeof obj === 'object' && !Array.isArray(obj) ? [obj] : [];
    } catch { return []; }
  });
  const begin = records.find(x => x.type === 'stream_start' && x.surface === 'run');
  const ends = records.filter(x => x.type === 'run_end');
  const final = ends.at(-1) ?? null;
  const failed = records.filter(x => x.status === 'failed' && typeof x.remark === 'string');
  const warnings = records.filter(x => x.type === 'warning').map(x => String(x.code ?? x.message ?? 'unknown warning'));
  const errors = records.filter(x => x.type === 'error').map(x => String(x.message ?? 'unknown error'));
  const status = final && typeof final.status === 'string' ? final.status.toLowerCase() : 'no-result';
  const explicitMismatch = failed.some(x => /\b(npv|net present|41[.,]32|assert|expected|value|amount|result|differ|mismatch|not equal)\b/i.test(x.remark));
  const started = Boolean(begin && final);
  const expectedFailure = spec.expect === 'failed';
  const good = started && errors.length === 0 && (expectedFailure
    ? code === 1 && status === 'failed' && explicitMismatch
    : code === 0 && status === 'passed' && failed.length === 0);
  return {
    id: spec.id,
    expected: spec.expect,
    actual: status,
    exit_code: code,
    good,
    reason: typeof final?.reason === 'string' ? final.reason : null,
    summary: typeof final?.summary === 'string' ? final.summary : null,
    test_url: typeof final?.test_url === 'string' ? final.test_url : null,
    session_dir: typeof final?.session_dir === 'string' ? final.session_dir : null,
    failed_steps: failed.map(x => x.remark),
    warnings,
    errors,
    source: 'kane-cli --agent NDJSON',
    stream_started: Boolean(begin),
    result_present: Boolean(final)
  };
}