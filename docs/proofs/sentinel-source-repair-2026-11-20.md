# AXIOM Sentinel — Genuine Kane Failure → Source Fix → Kane Acceptance

**Date:** 20 November 2026 UTC. **Tested system:** an expressly **synthetic in-memory** payment laboratory, not a real payment processor. **Actor:** ChatGPT AI assistant directed source modifications using authorized developer tools. This is *not* an unattended, general-purpose autonomous repair capability.

## Claim and independent evidence

1. **Introduced a narrow, documented regression**, only on the isolated reproduction branch, exempting invoice `pay-invoice-042` from protected idempotency checks. Source: [broken commit](https://github.com/musitu-hackathons/axiom-verify-kanecli-2026/commit/a55e8ec0b9f2d89bae87033d2830559b3d5257c0). The source branch CI gave **51 pass / 3 fail** out of 54 tests (intentionally red).
2. **Ran real TestMu Kane CLI v0.10.6** against the isolated, explicitly labelled [broken reproduction](https://axiom-sentinel-idempotency-bug-reproduction-f7ftag.v2.appdeploy.ai/) while the vulnerable source was deployed. [GitHub run (failure)](https://github.com/musitu-hackathons/axiom-verify-kanecli-2026/actions/runs/44708979561) contains TestMu browser NDJSON and case links. Kane's unsafe-mode demonstration passed, while its **guarded-mode acceptance failed**: repeated `$7,500` settlement, `2 SETTLED`, `RELEASE BLOCKED`, only `6/8` controls. [Failed Kane case report](https://test-manager.lambdatest.com/projects/01M7VY86Q3814EVERRJ7DZJG3X/test-cases/01M7W3V7R0V793A8WGC6YXRGXJ/dashboard/share/US_YXRB07RAD1EN1HTDYLQ0V9VXAVV59W1XDX5CDWJCG41Q869ENVU1XO7XY7P6NW48?type=summary&agentView=true&fqdn=summary-page). The runner correctly marked the overall acceptance **NOT VERIFIED**.
3. **Patched source in response to the observed Kane error:** [one-file repair commit](https://github.com/musitu-hackathons/axiom-verify-kanecli-2026/commit/3c1c6522d34084e5d9ff4cddd455f89aea049dda) removes the explicit idempotency bypass and reinstates the `this.idempotency.has(requestId)` check for every invoice. Local Node test result: **54 pass / 0 fail**; `npm run sentinel:gate` confirms **5/5 expected vulnerable blocks and 5/5 guarded accepts**.
4. **Redeployed the exact same reproduction app URL** with the repaired source. Independently reran Kane CLI v0.10.6: [GitHub run (success)](https://github.com/musitu-hackathons/axiom-verify-kanecli-2026/actions/runs/44710070648). All four browser objectives had `stream_start`, `run_end: passed`, exit code `0` and a provider case URL. In particular, the [repaired guarded test](https://test-manager.lambdatest.com/projects/01M7VY86Q3814EVERRJ7DZJG3X/test-cases/01M7W4A9BH9CDCEWHMYH4W4XP1/dashboard/share/US_2CX3Z53E0PVFP3IW59VV4XPULYEMW0GNNZANQHX6NME2COOI7O13PBDFKGI3AF8Q?type=summary&agentView=true&fqdn=summary-page) now reported **RELEASE SAFE**, **1 SETTLED**, expected balances and **8/8 controls**.

## Artifact integrity

| Evidence | GitHub artifact ID | SHA-256 | Retention |
| --- | --- | --- | --- |
| Actual failed Kane browser run | `14616781272` | `f57d98c482cd6fb118a4f1cefd01b4c8ce98a2eaa6b89853a6d6d381de0a260d` | GitHub's seven-day Actions policy |
| Actual repaired Kane browser run | `14617033607` | `b47aa9aab47a1500570d4cfd9336a86a40823daeff75815288557db81f6d3b07` | GitHub's seven-day Actions policy |

Public-safe structured findings, provider test URLs, source commit IDs and verification status are preserved in [`sentinel-source-repair-2026-11-20.json`](sentinel-source-repair-2026-11-20.json). Full raw Kane stdout/stderr are stored in GitHub Actions artifacts and are **not committed** to the public repository.

## Separate historical proofs

The clean feature branch's original hosted Sentinel demo already passed four real Kane objectives: [`sentinel-kane-2026-11-20.json`](sentinel-kane-2026-11-20.json). Those tests demonstrate normal browser behavior and are distinct from the intentionally broken reproduction and post-patch acceptance above.

## Limits and authenticity

- This incident was **deliberately introduced and disclosed** to provide a reproducible adversarial test. It is not a reported real customer loss.
- The idempotency correction was performed by an AI assistant with developer tool calls, **not** by a self-operating agent that automatically repairs arbitrary external repositories.
- Local `npm test` and the independent synthetic oracle are helpful regression checks but are **not** replacements for TestMu's genuine browser results.
- The public `main` branch remains the previous stable AXIOM Verify entry; Sentinel remains in draft [PR #2](https://github.com/musitu-hackathons/axiom-verify-kanecli-2026/pull/2) until separately approved.