# AXIOM VERIFY — Evidence-led release gate

**MUSITU / KaneCLI Online Hackathon 2026 · new project developed November 19, 2026**

A standalone financial-calculation app and verification harness. The core interaction is a two-period net-present-value decision. A visible, explicitly labelled **sandbox fault switch** intentionally introduces a discounting regression so a real Kane CLI browser run can expose the incorrect UI output. An agent feedback loop preserves the Kane evidence, drafts a repair request, and only declares acceptance after genuine browser reruns. It does **not** borrow the production MUSITU AXIOM source code, use customer data, or call financial/trading APIs.

## What to look for

- Correct baseline: initial investment $1,000, two inflows of $600, rate 10% → **NPV $41.32 / ACCEPT**.
- Deliberate regression: turning on the sandbox fault makes the second period incorrectly discounted as year one → Kane's assertion for $41.32 should fail on the real UI.
- Recovery: turn the fault off, verify $41.32 again; change rate to 0% → $200.00; loss-making scenario → **REJECT / -$392.56**.
- `scripts/verify-kane.mjs` invokes the **actual** TestMu CLI in strict action mode, requires `stream_start` plus `run_end` NDJSON evidence, captures failed assertion steps and exit codes, and blocks release if authentication, execution or assertions cannot be verified. Parser tests use synthetic *fixtures only* and are not substituted for a real Kane run. `scripts/verify-loop.mjs` passes the report into a coding-agent repair request and can call Codex CLI in a trusted sandbox if explicitly configured.

## Run

Requires Node.js >= 20; no npm dependencies for the web app itself.

```bash
npm test
npm start
# open http://localhost:4173/
```

## Real Kane CLI browser acceptance

```bash
npm install -g @testmuai/kane-cli
kane-cli login  # TestMu AI OAuth or basic authentication; not needed if CI username/access key secrets are configured
npm run verify:kane
```

By default, the Kane test targets the published public demo URL. To test source code currently checked out in CI, first launch `npm start` and set `AXIOM_VERIFY_URL=http://127.0.0.1:4173/`. For GitHub Actions, configure `TESTMU_USERNAME` and `TESTMU_ACCESS_KEY` as repository Actions secrets, never commit them. Use Actions → AXIOM Verify checks → Run workflow, set `kane=true` to invoke the real Kane provider. The workflow tests the publicly reachable demo URL; unit tests cover the checked-out source. Do not expose any production MUSITU credentials. Real browser testing uses `--agent --headless --mode action --final-validation on` and stores `evidence/*.ndjson` and `evidence/kane-summary.json` locally (ignored in Git). Inspect artifacts; **absence of real Kane results = unverified**.

## Closed loop

```bash
npm run verify:loop
# On a failure, inspect evidence/agent-repair-request.md and have your coding agent address the actual failure.
# When trusted Codex CLI is present, opt into automated repair:
RUN_CODEX_REPAIR=1 npm run verify:loop
```

The simulator fault is *intentional, transparent and isolated*. It is not claimed to be an accidental historical bug or a completed AI remediation. A live agent → Kane → actual modification → Kane pass demonstration must be recorded before final hackathon submission.

## Hackathon eligibility and submission status

- [x] New independent hackathon code (created November 19, 2026)
- [x] Functional web app, 19 passing local numeric/parser unit tests and runnable setup
- [x] Real Kane CLI invocation and fail-closed report parser **implemented**
- [x] Genuine TestMu Kane CLI runs verified with NDJSON and GitHub Actions artifacts (20 Nov 2026)
- [x] AI-assisted repair committed after genuine Kane failure, with TDD red/green proof and independent Kane rerun
- [x] Separate **public GitHub repository** created on November 19, 2026 under the new `musitu-hackathons` organization: https://github.com/musitu-hackathons/axiom-verify-kanecli-2026
- [ ] Recorded YouTube video (3–5 minutes)
- [x] Two public LinkedIn launch posts published 19 November (see `docs/submission-kit.md`)
- [ ] Submission receipt from official website

Do not mark pending checklist items complete without evidence. Official: https://www.kaneclihack.sh/ ; https://www.testmuai.com/docs/kane-cli-introduction .

## Security and scope

Static UI, no login, no user telemetry, no customer details, no external requests, no investment recommendations, no production AXIOM access. CSP restricts resource origins; `server.mjs` serves only four explicitly allowlisted paths. Inputs are numerically validated and kept client-side. The test harness redacts supplied TestMu access keys from collected stdout/stderr. GitHub Actions Kane job requires explicitly provided TestMu credentials and fail rather than claiming a fake pass.

## AI assistance disclosure

ChatGPT (GPT-6) assisted with original code generation, tests, acceptance objectives, research, and documentation. Human participation and final public submissions remain the entrant's responsibility.

## Repository isolation and public safety

This is an independent competition repository within the dedicated `musitu-hackathons` GitHub organization. It contains **only** this new code and tests, not a copy or fork of any production MUSITU repository. It does not give viewers access to any private repository or rights to modify other code. Other already-public repositories elsewhere on GitHub remain independently publicly accessible. TestMu credentials are absent from version control; use repository-specific Actions secrets. GitLab remains an optional private development mirror.

**The original and repaired genuine Kane CLI verification runs passed their respective acceptance criteria. Official hackathon submission is still pending the 3–5 minute YouTube video and final form.**

## Agent response to actual Kane failure (20 November 2026)

The original deployed page and its 19-test baseline remain available as **before** evidence. See [AI-assisted source repair and test evidence](docs/agent-repair-evidence.md) for genuine TestMu Kane CLI v0.10.6 assertion failure, the minimal source patch, a recorded red-green test cycle, and follow-up verification. The separately published **repaired** app is https://axiom-verify-agent-repaired-mqlpg4.v2.appdeploy.ai/. The independent post-repair Kane rerun passed 3/3 live browser objectives on 20 November 2026: https://github.com/musitu-hackathons/axiom-verify-kanecli-2026/actions/runs/44698630143. The revised source has 22 passing local tests. No private MUSITU production files, credentials or customer data were used.

## Genuine Kane browser evidence links

- **Bug reproduced and reported:** https://github.com/musitu-hackathons/axiom-verify-kanecli-2026/actions/runs/44696347231 (baseline PASS, deliberate mismatch FAIL, recovery PASS).
- **Agent source repair independently accepted:** https://github.com/musitu-hackathons/axiom-verify-kanecli-2026/actions/runs/44698630143 (3/3 repaired scenarios PASS).
- **Repaired live app:** https://axiom-verify-agent-repaired-mqlpg4.v2.appdeploy.ai/
- **Reproduction instructions, evidence digests and source diff:** [docs/agent-repair-evidence.md](docs/agent-repair-evidence.md).