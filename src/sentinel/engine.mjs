/** AXIOM Sentinel: deterministic synthetic payment processor. NO real funds, APIs or persistence. */
const ACCOUNT_FIXTURE = Object.freeze([
  { id: 'acme-operating', name: 'Acme · Operating', tenantId: 'acme', balanceCents: 2_000_000 },
  { id: 'acme-vendor', name: 'Acme · Vendor', tenantId: 'acme', balanceCents: 150_000 },
  { id: 'acme-reserve', name: 'Acme · Reserve', tenantId: 'acme', balanceCents: 200_000 },
  { id: 'zenith-external', name: 'Zenith · Client', tenantId: 'zenith', balanceCents: 340_000 },
]);

export const SCENARIOS = Object.freeze([
  { id: 'duplicate', title: 'The $7,500 double payment', eyebrow: 'IDEMPOTENCY · CRITICAL', description: 'A network retry sends the same payment instruction twice. Does the processor settle it again?', amountCents: 750_000, expectedSettlements: 1, brokenRule: 'A payment request must settle at most once.' },
  { id: 'overdraft', title: 'Reserve overdraft', eyebrow: 'SOLVENCY · HIGH', description: 'A $3,500 transfer tries to leave an account that holds just $2,000.', amountCents: 350_000, expectedSettlements: 0, brokenRule: 'An account cannot debit more than its available funds.' },
  { id: 'cross-tenant', title: 'Cross-tenant transfer', eyebrow: 'ISOLATION · CRITICAL', description: 'A tenant A request attempts to route funds into a different company’s account.', amountCents: 90_000, expectedSettlements: 0, brokenRule: 'A tenant cannot settle a payment to another tenant’s account.' },
  { id: 'imbalance', title: 'Phantom credit', eyebrow: 'ACCOUNTING · HIGH', description: 'A processor credits $3,050 while debiting $3,000: $50 appears from nowhere.', amountCents: 300_000, expectedSettlements: 1, brokenRule: 'Every settled transaction must have balanced debit and credit legs.' },
  { id: 'key-collision', title: 'Idempotency collision', eyebrow: 'INTEGRITY · HIGH', description: 'The same request ID is reused with a different amount; the second instruction must be denied.', amountCents: 50_000, expectedSettlements: 1, brokenRule: 'An idempotency key cannot authorize a different payment payload.' },
]);

export function createOpeningAccounts() {
  return ACCOUNT_FIXTURE.map(a => ({ ...a }));
}

function requestFingerprint(request) {
  return [request.tenantId, request.from, request.to, request.amountCents].join('|');
}

export class SandboxLedger {
  constructor(accounts = createOpeningAccounts(), mode = 'protected') {
    if (mode !== 'protected' && mode !== 'vulnerable') throw new RangeError(`Unknown execution mode: ${mode}`);
    if (!Array.isArray(accounts) || accounts.length === 0) throw new TypeError('Accounts must be a nonempty list');
    this.mode = mode;
    this.accounts = new Map(accounts.map(a => [a.id, { ...a }]));
    if (this.accounts.size !== accounts.length) throw new RangeError('Duplicate account ID');
    this.journal = [];
    this.attempts = [];
    this.trace = [];
    this.idempotency = new Map();
    this.record('info', 'SANDBOX_INITIALIZED', `Synthetic ledger initialized in ${mode.toUpperCase()} mode. No external payments.`);
  }
  snapshot() { return [...this.accounts.values()].map(a => ({ ...a })); }
  record(level, code, description) {
    const event = { order: this.trace.length + 1, level, code, description };
    this.trace.push(event);
    return event;
  }
  transfer(input, { fault = null } = {}) {
    const request = input && typeof input === 'object' ? { ...input } : {};
    const { requestId, tenantId, from, to, amountCents } = request;
    const attempt = { order: this.attempts.length + 1, requestId, tenantId, from, to, amountCents, status: 'rejected', code: '' };
    const deny = (code, message, status = 'rejected') => {
      attempt.status = status; attempt.code = code;
      this.attempts.push(attempt);
      this.record(status === 'duplicate' ? 'info' : 'blocked', code, message);
      return { ...attempt };
    };
    // Grossly malformed amounts are blocked even in the intentionally vulnerable sandbox.
    if (!Number.isSafeInteger(amountCents) || amountCents <= 0) return deny('INVALID_AMOUNT', 'Amount must be positive safe integer cents.');
    if (typeof requestId !== 'string' || !requestId.trim() || typeof tenantId !== 'string' || !tenantId.trim()) {
      return deny('INVALID_REQUEST', 'Payment requires a nonempty request ID and initiating tenant.');
    }
    const src = this.accounts.get(from), dst = this.accounts.get(to);
    if (!src || !dst || from === to) return deny('INVALID_ACCOUNTS', 'Source and destination must be distinct known accounts.');

    const fingerprint = requestFingerprint(request);
    if (this.mode === 'protected' && this.idempotency.has(requestId)) {
      if (this.idempotency.get(requestId) === fingerprint) return deny('DUPLICATE_SUPPRESSED', 'Retry ignored: payment already settled.', 'duplicate');
      return deny('IDEMPOTENCY_CONFLICT', 'Request ID reused with a changed amount or destination.');
    }
    if (this.mode === 'protected' && (src.tenantId !== tenantId || dst.tenantId !== tenantId)) {
      return deny('CROSS_TENANT_DENIED', 'Initiator may operate only accounts in its own tenant.');
    }
    if (this.mode === 'protected' && src.balanceCents < amountCents) {
      return deny('INSUFFICIENT_FUNDS', 'Available account balance is below payment amount.');
    }

    const creditCents = this.mode === 'vulnerable' && fault === 'phantom-credit' ? amountCents + 5_000 : amountCents;
    // Overflow is not a viable attack mode: this is a deterministic, safe-integer simulation.
    if (!Number.isSafeInteger(src.balanceCents - amountCents) || !Number.isSafeInteger(dst.balanceCents + creditCents)) {
      return deny('INTEGER_OVERFLOW', 'Transfer exceeds precise integer arithmetic range.');
    }
    src.balanceCents -= amountCents;
    dst.balanceCents += creditCents;
    const transfer = {
      sequence: this.journal.length + 1,
      requestId, tenantId, from, to, amountCents,
      debitCents: amountCents, creditCents,
      state: 'settled'
    };
    this.journal.push(transfer);
    this.idempotency.set(requestId, fingerprint);
    attempt.status = 'settled'; attempt.code = 'SETTLED';
    this.attempts.push(attempt);
    this.record(this.mode === 'vulnerable' ? 'warning' : 'success', 'PAYMENT_SETTLED',
      `Payment ${requestId} settled: ${from} debited ${amountCents}¢; ${to} credited ${creditCents}¢.`);
    return { ...attempt };
  }
}

export function runScenario(scenarioId = 'duplicate', mode = 'vulnerable') {
  const scenario = SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) throw new RangeError(`Unknown scenario: ${scenarioId}`);
  if (mode !== 'protected' && mode !== 'vulnerable') throw new RangeError(`Unknown execution mode: ${mode}`);
  const ledger = new SandboxLedger(createOpeningAccounts(), mode);
  const openingAccounts = ledger.snapshot();
  const base = { tenantId: 'acme', from: 'acme-operating', to: 'acme-vendor' };
  switch (scenarioId) {
    case 'duplicate': {
      const intent = { ...base, requestId: 'pay-invoice-042', amountCents: 750_000 };
      ledger.transfer(intent);
      ledger.record('info', 'NETWORK_RETRY', 'Simulated gateway timeout: the identical request is retried.');
      ledger.transfer(intent);
      break;
    }
    case 'overdraft':
      ledger.transfer({ ...base, from: 'acme-reserve', requestId: 'sweep-reserve-103', amountCents: 350_000 });
      break;
    case 'cross-tenant':
      ledger.transfer({ ...base, to: 'zenith-external', requestId: 'cross-tenant-061', amountCents: 90_000 });
      break;
    case 'imbalance':
      ledger.transfer({ ...base, requestId: 'cashout-119', amountCents: 300_000 }, { fault: 'phantom-credit' });
      break;
    case 'key-collision':
      ledger.transfer({ ...base, requestId: 'invoice-idem-009', amountCents: 50_000 });
      ledger.record('info', 'KEY_REUSED', 'A second payment instruction reuses the same idempotency key with a different payload.');
      ledger.transfer({ ...base, requestId: 'invoice-idem-009', amountCents: 70_000 });
      break;
  }
  return {
    kind: 'AXIOM_SENTINEL_SANDBOX', scenarioId, scenario: { ...scenario }, mode,
    openingAccounts, accounts: ledger.snapshot(),
    attempts: ledger.attempts.map(a => ({ ...a })),
    journal: ledger.journal.map(t => ({ ...t })),
    trace: ledger.trace.map(t => ({ ...t }))
  };
}