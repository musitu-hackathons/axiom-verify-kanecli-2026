# AXIOM Sentinel MVP Implementation Plan

> **For agentic workers:** Use the host's available task-by-task implementation workflow. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public, usable adversarial financial-ledger verification simulator that demonstrates real financial invariants, independent of a green application UI, while preserving the existing AXIOM Verify submission and Kane evidence.

**Architecture:** A browser-only synthetic ledger engine executes five deterministic incidents in either intentionally vulnerable or guarded mode. An independently implemented accounting oracle evaluates immutable opening/closing account snapshots and the resulting transfer journal, reports explicit violated controls, and refuses to equate a UI success message with accounting safety. A self-contained control-room page visualizes trace, balances, and release gate. An isolated Kane CLI runner will verify actual browser behavior using real TestMu credentials via manually triggered GitHub Actions only.

**Tech Stack:** Node.js 22, native ES modules, `node:test`, CSS, JavaScript, existing zero-dependency HTTP server and GitHub Actions; TestMu Kane CLI for real-browser acceptance.

## Global Constraints

- Develop on a new isolated branch of `musitu-hackathons/axiom-verify-kanecli-2026`; do not change `main` or the original AXIOM Verify demo.
- All accounts are synthetic and client-side only. No real transactions, user information, provider API calls, credentials, persistence or uncontrolled financial actions.
- Explicitly label vulnerable execution as a synthetic fault injection; never represent a scripted incident as an unauthorized real attack.
- Reject invalid amounts before any ledger mutation. Amounts are safe integer cents, strictly positive. Requests carry immutable request IDs, initiating tenants, sender and recipient IDs.
- Independent oracle must detect duplicates, overdrafts, cross-tenant settlement, unbalanced entries, unexplained balance changes, and idempotency-key conflicts. Protected mode must leave only policy-authorized transfers settled.
- A Kane result is **unverified** until genuinely executed; synthetic `node:test` fixtures cannot be cited as Kane evidence. A real repair loop requires actual source modification, a repeat Kane run, and retained failure/pass artifacts.

---

### Task 1: Deterministic synthetic payment ledger and independent oracle

**Files:**
- Create: `src/sentinel/engine.mjs`, `src/sentinel/oracle.mjs`, `test/sentinel-engine.test.mjs`, `test/sentinel-oracle.test.mjs`.

**Interfaces:**
- Produces: `SCENARIOS`, `runScenario(scenarioId,mode)` returning opening accounts, ending accounts, attempts, journal and trace; `evaluateLedger(run)` returning checks, failures, and release-blocking verdict.

- [x] **Step 1: Add failing focused tests:** for a duplicate `$7,500` retry, protected mode settles once and vulnerable mode settles twice; invalid/colliding request IDs, insufficient balance, cross-tenant send, ledger drift and negative cents; oracle checks fail on vulnerable and pass on protected runs.
- [x] **Step 2: Verify focused failure:** `node --test test/sentinel-engine.test.mjs test/sentinel-oracle.test.mjs` must fail because modules are absent.
- [x] **Step 3: Implement engine:** separate synthetic scenarios and nonpersisted balances, journal with debit/credit amounts and attempts; protected mode validates every policy before mutations; vulnerable mode purposefully bypasses exactly one policy per scenario; amounts never use floating-point dollars.
- [x] **Step 4: Implement independently replayed oracle:** derive expected deltas from journal, scan duplicate request IDs, tenant constraints and overdrafts, compare opening and closing supply, and verify per-scenario expected dispositions.
- [x] **Step 5: Verify:** run focused tests, then `npm test`, expect zero failures.
- [ ] **Step 6: Commit passing source and tests to an isolated branch only; preserve original demo.**

### Task 2: Interactive browser-based financial incident control room

**Files:**
- Create: `public/sentinel.html`, `public/sentinel.css`, `public/sentinel.js`, `test/sentinel-server.test.mjs`.
- Modify: `server.mjs` (explicit static route allowlist only).

**Interfaces:**
- Consumes: `runScenario` and `evaluateLedger`; outputs accessible browser controls for scenario and execution mode, balances, trace, journal, violation list, and explicit BLOCK / SAFE verdict.

- [x] **Step 1: Add failing HTTP route tests:** `/sentinel` returns HTML 200, `/sentinel.js`, `/sentinel.css` and `/sentinel/engine.mjs` serve content, POST returns 405 and unknown paths 404; original `/` remains unchanged.
- [x] **Step 2: Verify route tests fail:** `node --test test/sentinel-server.test.mjs` expects 404 before implementation.
- [x] **Step 3: Build responsive control room:** hero, sandbox badge, five attack selectors, vulnerable/guarded switch, Run button, account balances, actual transfer journal, oracle checks and deterministic trace, no live external API requests.
- [x] **Step 4: Serve allowlisted modules and assets:** validate `GET` and `HEAD` only, preserve restrictive CSP and original routes.
- [x] **Step 5: Verify:** test HTTP routes, run `npm test`, use an actual browser smoke test when available; no claims beyond observed output.
- [ ] **Step 6: Commit passing UI and server changes to isolated branch only.**

### Task 3: Genuine Kane CLI browser acceptance and evidence-gated development

**Files:**
- Create: `scripts/verify-kane-sentinel.mjs`, `test/sentinel-kane-spec.test.mjs`, `docs/sentinel-kane-objectives.md`.
- Modify: `package.json`, `.github/workflows/verify.yml`.

**Interfaces:**
- Consumes: `AXIOM_SENTINEL_URL`, `TESTMU_USERNAME`, `TESTMU_ACCESS_KEY`; produces `evidence/sentinel-*.ndjson`, `evidence/sentinel-summary.json` and nonzero exit when genuine Kane evidence is missing or contradictory.

- [x] **Step 1: Add failing objective-spec and parser contract tests:** selected incident must be identified and browser assertion must distinguish synthetic vulnerable failure from guarded pass.
- [x] **Step 2: Verify focused failures.**
- [x] **Step 3: Implement CLI runner reusing `parseKaneStream` with real TestMu CLI; manual `sentinel=true` workflow dispatch only, artifacts always uploaded, secrets never displayed.
- [x] **Step 4: Verify tests and CLI configuration statically; only invoke provider on a reachable deployed Sentinel build.**
- [ ] **Step 5: Record real Kane run URLs and artifact hashes only after successful execution.
- [ ] **Step 6: Commit changes to isolated branch only.**

### Task 4: Publish, validate, document and review

**Files:**
- Create: `docs/sentinel-runbook.md`; update `README.md` with `/sentinel` link and explicit outstanding gates.

**Interfaces:**
- Produces: reproducible source, test commands, security boundaries, and a demonstration path.

- [x] **Step 1: Validate baseline original page and source independence.**
- [ ] **Step 2: Verify new route and core scenarios in an independently deployed browser, test suite in CI.**
- [x] **Step 3: Deploy the demo if a controlled deployment path is available; never substitute a mocked screenshot for working UI.**
- [ ] **Step 4: Open a PR against `main` for review, not merge it without acceptance.**
- [ ] **Step 5: Reverify GitHub branch, review CI outcome, and report unfinished real Kane and autonomous-repair requirements accurately.**

## Observable decisions and limitations

- The word `vulnerable` always means **deliberately injected, synthetic policy bypass**. Neither mode touches external money.
- Default mode is `vulnerable`, making the incident detectable without claiming a production exploit. Protected mode is the demonstrable safe alternative.
- The browser route is `/sentinel`; original root remains AXIOM Verify to preserve historical Kane evidence.
- Refusal, duplicate-suppression and key-conflict attempts produce journal entries only for actual settled transfers; rejected attempts remain in the audit trace.
- Failed browser or API checks block release. If Kane API or deployment is unavailable, the public artifact is called a tested prototype, not an accepted Kane run.

## Additional executed CI deliverable

`src/sentinel/gate.mjs` and `scripts/sentinel-gate.mjs` implement a separate synthetic 10-run release matrix. `test/sentinel-gate.test.mjs` checks all five positive and five negative policy results plus two fail-closed oracle mutation cases. The GitHub unit workflow runs `npm run sentinel:gate` and attaches `evidence/sentinel-ci-gate.json`. This is **not** external Kane acceptance.