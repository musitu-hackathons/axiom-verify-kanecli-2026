# AXIOM Sentinel — Four-Minute Evidence-First Hackathon Demonstration

**Status:** A filming/runbook document, **not** a recorded video or submission. Record only authentic screen interactions, actual Kane CLI artifacts and the real source diff. This is a **synthetic, in-memory** ledger; no real bank account, live payment or customer data exists.

**One-line pitch:** *Before AI-generated payment logic goes live, an adversarial browser agent tries to break it—and a financial oracle refuses to accept a green UI unless the journal balances.*

## 00:00–00:25 — The hook: a $7,500 payment happens twice

Footage: show the **intentionally broken reproduction** in the GitHub failed run and the real Kane `duplicate-guarded` report. Overlay `SIMULATED FINANCIAL INCIDENT` throughout. Show the two `SETTLED` journal entries sharing `pay-invoice-042`, the $5,000 operating balance and `RELEASE BLOCKED / 6 of 8` controls. State: “This is not a design animation: TestMu Kane CLI saw the flaw in a browser and its independent acceptance check failed.” Do not imply real money was lost.

## 00:25–00:55 — What AXIOM Sentinel is

Footage: open https://axiom-sentinel-payment-integrity-lab-eq0z0z.v2.appdeploy.ai/ in a real browser. Show five selectable attacks, one protected execution mode, a transaction journal, and eight financial controls. Narration: “Many generated interfaces can display a successful payment. We challenge the underlying financial state, not the success banner.”

## 00:55–01:35 — Attack the ledger

Footage: select the $7,500 duplicate payment in **Fault injected**, trigger `Run adversarial scenario` and scroll through duplicate rows; repeat in **Guarded build** to show only one settlement. Quickly show reserve overdraft and cross-tenant transfer, then the $50 phantom-credit mismatch. Use no cut that hides the selected processor mode.

## 01:35–02:10 — Explain the independent oracle

Footage: show the eight checks and total-supply/double-entry assertions plus a `sentinel-ci-gate.json` artifact. State: “Every scenario replays the journal, verifies opening-to-closing balances and enforces tenant isolation, overdraft denial, idempotency and intent integrity. Ten synthetic CI paths run for free.” **Do not call synthetic CI a TestMu browser result.**

## 02:10–03:10 — Show the actual Kane failure-to-code-fix sequence

Evidence 1: https://github.com/musitu-hackathons/axiom-verify-kanecli-2026/actions/runs/44708979561 — real Kane `duplicate-unsafe` pass, `duplicate-guarded` fail; source-reproduction branch CI also red.

Evidence 2: source-level defect in `repro/sentinel-idempotency-closedloop`: `requestId !== 'pay-invoice-042'` incorrectly bypasses the existing idempotency check. Show the single-line patch commit `3c1c6522d34084e5d9ff4cddd455f89aea049dda` removing the bypass, preserving the algorithm's intended duplicate suppression.

Evidence 3: present the local test sequence `51/54` red → `54/54` green; `npm run sentinel:gate` 5/5 deliberately vulnerable blocked and 5/5 guarded accepted. State clearly that ChatGPT assisted this source repair; it is **not a claim of unattended autonomous software production**.

## 03:10–03:40 — Independent browser re-verification

**This segment is conditional until TestMu's actual fixed-app Kane rerun completes.** Record the actual follow-up Actions run URL, TestMu report, and displayed guarded `RELEASE SAFE / 1 SETTLED / 8 of 8 controls`; do not record a “passed” caption until the result and provider events are independently inspected. If the rerun fails, show the failure and continue debugging instead of editing the footage to hide it.

## 03:40–04:05 — Developer workflow and why it matters

Footage: repository on isolated `musitu-hackathons` GitHub organization; run `npm test` and `npm run sentinel:gate`; show draft PR #2 and the public live demo. State: “This is an intentionally limited sandbox, not a certified banking system. The deliverable is a repeatable pattern: adversarial browser verification, independent domain invariants and an auditable code-repair gate.”

## Video verification checklist

- [ ] Run Kane before/after tests against the actual deployed URLs and show provider reports without inventing timestamps.
- [ ] Include the full remediation source diff and actual before/after code commits.
- [ ] Use an authentic screen recording for hosted UI and GitHub evidence; do not present animation as live execution.
- [ ] Keep `SIMULATED / NO REAL MONEY` visible during financial incidents.
- [ ] Confirm total duration 3–5 minutes and legible mobile-sized captions.
- [ ] Upload to a genuinely reachable YouTube video; provide its exact URL.
- [ ] Submit official hackathon form and preserve the submission receipt; neither action has occurred yet.