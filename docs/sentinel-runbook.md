# AXIOM Sentinel — Synthetic Payment Integrity Lab

**Status: hosted working prototype in an isolated hackathon feature branch.** It has an interactive browser UI, five deterministic incidents, a separate financial oracle, unit and UI smoke checks. **A genuine Sentinel-specific TestMu Kane CLI browser run has been initiated and remains unverified until the provider artifact is inspected.** The previously completed Kane Verify runs (original and repaired NPV demos) are separate historical evidence and must not be used as proof that Sentinel was tested by Kane.

## Public preview and local setup

**Public prototype:** https://axiom-sentinel-payment-integrity-lab-eq0z0z.v2.appdeploy.ai/ (standalone static deployment of the feature code, served at its root). GitHub Node server serves the same Sentinel feature under `/sentinel`. The static deployment uses relative module imports for Vite but retains the same synthetic ledger and oracle algorithms. The original NPV demo remains separate.

## Run the app locally

Requires Node.js 20+ (22 recommended), with no runtime npm dependencies:

```bash
npm test
npm start
# Open http://localhost:4173/sentinel
```

The old AXIOM Verify NPV demonstration remains at `/` for reproducibility. No backend database, authentication service, external payment processor, external financial API, or background polling is used. This app cannot move real money.

## Five reproducible incidents

| Incident | Deliberate vulnerable result | Guarded result | Independent control |
| --- | --- | --- | --- |
| Duplicate $7,500 | Two settlements for `pay-invoice-042`; sender falls from $20,000 to $5,000 | One settlement; sender $12,500 | ID settled at most once |
| Reserve overdraft | $3,500 debited from $2,000 reserve; closes at −$1,500 | No settlement; `INSUFFICIENT_FUNDS` | No overdraft |
| Cross-tenant transfer | Payment from Acme to Zenith accepted | No settlement; `CROSS_TENANT_DENIED` | Tenant isolation |
| Phantom credit | $3,000 debit, $3,050 credit | Equal $3,000 legs | Money conservation + double entry |
| Idempotency collision | Two different amounts settle with one key | Original settles, second rejected | No duplicate settlement + payload integrity |

Use **Fault injected** to see a synthetic bug and **Guarded build** to see the policy enforcement. The oracle independently verifies closing supply, double-entry equality, idempotency, tenant isolation, solvency, journal replay, request matching and scenario settlement count. It must show `RELEASE BLOCKED` if a control fails. This is not a production security test.

## Real Kane CLI browser checks (provider evidence acceptance pending)

1. The standalone Sentinel prototype is published at https://axiom-sentinel-payment-integrity-lab-eq0z0z.v2.appdeploy.ai/. Do not update the old repaired NPV deployment in place, since its historical Kane results depend on the previous code.
2. In GitHub Actions, use existing repository secrets `TESTMU_USERNAME` and `TESTMU_ACCESS_KEY`. The feature-branch workflow pins `AXIOM_SENTINEL_URL` to the public static Sentinel deployment; a user can also override the variable in a trusted CLI shell.
3. Open `.github/workflows/verify.yml` → **Run workflow** → select `sentinel=true` and `main` *only after the feature PR is merged and verified*. Until then select the isolated feature branch (if Actions allows dispatch on the branch), or run the CLI from a trusted temporary branch checkout. The `kane_sentinel` job runs only from explicit `workflow_dispatch` with `inputs.sentinel`. Normal pushes do not spend TestMu credits.
4. The Kane runner invokes the genuine TestMu CLI (`kane-cli run ... --agent --headless`) with real provider credentials, fails closed on authentication, browser or assertion errors, and stores redacted `.ndjson` stream evidence in `evidence/sentinel-*.ndjson` and `evidence/sentinel-summary.json`. Do not claim pass from `npm test` or synthetic fixtures.
5. After execution, inspect each actual test URL, `stream_start`, `run_end`, exit code, verification assertion and artifact checksum. Verify the external browser touched the deployed Sentinel URL, not the original `/` NPV app.

```bash
# On a trusted environment with the TestMu CLI installed:
export AXIOM_SENTINEL_URL='https://axiom-sentinel-payment-integrity-lab-eq0z0z.v2.appdeploy.ai/'
# Inject TESTMU_USERNAME and TESTMU_ACCESS_KEY as environment secrets.
npm run verify:sentinel
```

## Closed-loop development, not a magic toggle

The browser mode switch shows **a deliberately instrumented vulnerable implementation versus a separately implemented guarded policy**. Switching modes is **not** an autonomous code edit, and we must not present it as such. To meet the hackathon's closed-loop challenge at Sentinel level, an agent must (a) receive a genuine failed Kane assertion against a deliberately vulnerable checkout, (b) modify source, (c) run deterministic tests, and (d) request a fresh Kane browser run on the amended deployed source. Preserve before/after source commits and both provider artifacts. The earlier NPV closed-loop evidence demonstrates that process for the original AXIOM Verify project but does not certify Sentinel incidents.

## Threat model and limits

All accounts are fabricated and stored only in browser memory. Requests, transaction IDs and scenarios are fixed fixtures; there is no customer input or real money. The protected model denies cross-tenant transfers and overdrafts, but it does not implement authorization, database transactions, storage durability, concurrent atomicity, or network-replay handling in a real production payments environment. Ledger replay and invariants here are educational evidence of one narrow algorithm, not proof of banking compliance or financial security.

## Synthetic CI release gate (no TestMu credits used)

Run `npm run sentinel:gate` to execute all five deliberately vulnerable incidents and five guarded runs from an independent Node process. The command exits nonzero unless all five faults are independently detected and every guarded ledger satisfies its policy. It writes `evidence/sentinel-ci-gate.json` with per-scenario verdicts and an unsigned SHA-256 digest. The GitHub `unit` job runs this synthetic gate on pushes and pull requests and retains the report as an artifact. **This is not a Kane CLI browser run.**

## Testing

- `npm test` — numeric and Kane parser tests plus Sentinel ledger, oracle, HTTP route, and Kane objective-spec tests.
- Offline browser smoke — execute `public/sentinel.js` as a module against `sentinel.html` and `sentinel.css` with a local browser fixture. For this project, localhost Chromium navigation can be administratively blocked; this is not a substitute for a real deployed browser test.
- Static route allowlist: `/` remains original NPV app; `/sentinel`, `/sentinel.js`, `/sentinel.css`, `/sentinel/engine.mjs`, `/sentinel/oracle.mjs` expose only intended sandbox code. `POST` is 405 and unknown routes 404.

## Submission and release decision

Only promote AXIOM Sentinel to the official contest entry after its deployed UI, real Kane browser evidence, real code repair/reverification loop and video are verified. Do not replace the original AXIOM Verify submission artifacts while Sentinel remains a prototype.