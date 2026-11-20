# Kane CLI finding → AI coding agent repair → independent rerun

**Branch:** `agent-repair-kane-2026-11-20` (MUSITU hackathon source only)  
**Original failing demonstration:** https://axiom-verify-kanecli-zhpdm6.v2.appdeploy.ai/  
**Repaired public deployment:** https://axiom-verify-agent-repaired-mqlpg4.v2.appdeploy.ai/  
**Original real Kane run:** https://github.com/musitu-hackathons/axiom-verify-kanecli-2026/actions/runs/44696347231

## Evidence received by the coding agent

TestMu Kane CLI v0.10.6 (20 Nov 2026) observed the baseline **$41.32** (PASS), reported an assertion failure when the disclosed fault path displayed **$90.91** instead of **$41.32** (expected FAIL, exit 1), then verified the fault-off recovery (PASS). The real `run_end` NDJSON streams and `kane-summary.json` were uploaded by GitHub Actions as artifact `kane-evidence` (artifact ID 14611081061, SHA-256 `e22d6e6820c7fe95b22e49af176dc3ae02a58cd7f2291c01c8c721ed267842f4`). The original run consumed TestMu credits; no simulated data substitutes for this record.

Kane's recorded feedback: *“The enabled fault uses the wrong cash-flow calculation, so the page shows an incorrect net present value for the Baseline investment scenario. Treat this as a failed acceptance check and fix the faulty discounting logic.”*

## Source-level repair made in response

The calculation in `src/finance.mjs` previously discounted **every** future cash flow as if it arrived after year one:

```js
futureCashFlows.reduce((sum, cf) => sum + cf / (1 + r), -initial)
```

The coding agent changed the historical regression adapter to call the existing validated `npv(initial, ratePercent, futureCashFlows)` function, which discounts cash flows by their actual period `i + 1` and applies all input validation. The UI now labels the historical test path as *REGRESSION PATCHED*, not as an injected active bug. No customer data, credentials or external finance API are involved.

## Recorded red–green verification

- **RED:** `node --test test/repair.test.mjs` → 3 failed assertions against the old buggy adapter (exit 1).
- **GREEN:** the same command after the minimal repair → 3 passed, 0 failed (exit 0).
- **REGRESSION:** `npm test` → 22 passed, 0 failed (exit 0). The original intentionally-buggy test was replaced with the corrected adapter contract, while the before-patch source and Kane failure remain in the repository history and original deployment.
- **Browser before/after:** The original public demo remains available. The repaired deployment was independently smoke-tested by a public browser run at https://agent.tinyfish.ai/runs/95281b19-e0e5-4369-851b-2c5c576ae2a9, confirming baseline $41.32, the historical fault path ON also $41.32 with `REGRESSION PATCHED`, zero rate $200.00 and loss-making -$392.56 / REJECT. This smoke test is not Kane evidence.

## Remaining gate

Run `AXIOM_VERIFY_URL=https://axiom-verify-agent-repaired-mqlpg4.v2.appdeploy.ai/ npm run verify:repaired` with real TestMu credentials in GitHub Actions. Record the new run's genuine NDJSON and only then mark repair verified. Do not infer this from the local test suite.