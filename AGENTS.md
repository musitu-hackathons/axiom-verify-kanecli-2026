# AXIOM Verify agent instructions

This is a **new, independent November 2026 hackathon implementation**, not production MUSITU AXIOM. Use Kane CLI from the terminal as a real-browser acceptance verifier after edits. Read `docs/kane-objectives.md`.

- Do not invent Kane execution evidence, pass statuses, video links or third-party test results.
- `npm test` checks deterministic calculations but is NOT a substitute for Kane CLI.
- `npm run verify:kane` requires a signed-in Kane CLI or `TESTMU_USERNAME` and `TESTMU_ACCESS_KEY` injected securely via CI secrets. Do not commit credentials.
- For any failure, examine `evidence/kane-summary.json`, propose and apply the minimal real fix, and repeat the genuine Kane run. `npm run verify:loop` writes a direct remediation prompt; set `RUN_CODEX_REPAIR=1` only in a trusted sandbox where Codex CLI exists.
- Treat authorization errors, missing browser, invalid credentials, timeout, and absent JSON as **NOT VERIFIED**. Never convert nonzero exit codes to "PASS".
- Maintain 3 genuine Kane browser objectives: correct baseline, deliberate sandbox regression caught, recovery. The 19 local tests include numeric and *synthetic parser* checks only.
- Do not modify upstream MUSITU AXIOM, existing customer records, production credentials or financial APIs. No live trades.

## AXIOM Sentinel feature branch

- Read `docs/sentinel-runbook.md` and `docs/plans/2026-11-20-axiom-sentinel-mvp.md` before changing Sentinel.
- Sentinel sandbox paths: `src/sentinel/engine.mjs`, `src/sentinel/oracle.mjs`, `public/sentinel.html`, `public/sentinel.js`, `public/sentinel.css` and `test/sentinel-*.test.mjs`. Browser route: `/sentinel`, with the original `/` finance demo untouched.
- All synthetic incidents must be visibly marked as deliberate fault injection; no genuine customer accounts, transfer APIs or external requests.
- The browser's guarded mode is not autonomous code repair. Genuine `npm run verify:sentinel` requires a deployed public HTTPS URL plus TestMu secrets; an independent Kane result must be inspected before declaring Sentinel verified.