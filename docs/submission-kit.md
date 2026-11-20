# MUSITU Axiom — KaneCLI Hackathon Submission Kit

**Status on 19 November 2026:** Public GitHub repository available under the separate `musitu-hackathons` organization. Draft only. Do NOT claim hackathon submission or genuine Kane acceptance until actually performed.

## Entry fields

- **Team:** MUSITU Axiom (confirmed registered by organizer's email).
- **Project title:** AXIOM Verify — Evidence-Led Release Gate.
- **Category:** Apps that verify themselves / Verification baked into your workflow.
- **Coding agent:** ChatGPT (GPT-6). Include Codex only if its CLI actually runs in the repair demonstration.
- **Live demo:** https://axiom-verify-kanecli-zhpdm6.v2.appdeploy.ai/
- **Public GitHub repository:** https://github.com/musitu-hackathons/axiom-verify-kanecli-2026
- **YouTube demo:** [TO RECORD AND UPLOAD; target 3–5 minutes]
- **Two public posts (published 19 November 2026):**
  - https://www.linkedin.com/feed/update/urn:li:activity:7529050476605206528/
  - https://www.linkedin.com/feed/update/urn:li:activity:7529050887135064064/
- **Actual TestMu Kane result:** [VERIFICATION URL AND/OR REAL NDJSON ARTIFACT]

## One-paragraph submission draft (update after genuine Kane run)

AXIOM Verify is a new, standalone quantitative assurance application built by MUSITU during the November 2026 KaneCLI hackathon with assistance from ChatGPT (GPT-6). It gives users an interactive net-present-value decision workflow with numeric input validation, a zero-discount edge case, and a deliberately disclosed discounting regression that transforms a correct $41.32 result into an incorrect $90.91. The app is accompanied by pure-function unit tests and a fail-closed Kane CLI runner that drives real-browser assertions, records machine-readable evidence, flags discrepancies, and provides failure output to an AI coding agent for targeted remediation and retesting. [REPLACE THIS BRACKET WITH THE EXACT DEMONSTRATED REPAIR AND CONFIRMED KANE RESULT]. It uses no client data or production MUSITU AXIOM source and is available at the live demo URL.

## Public post 1 — LinkedIn (technical story)

**Can AI-generated financial software prove its own answers?**

We built AXIOM Verify for the TestMu AI KaneCLI Online Hackathon. It calculates NPV through a real browser interface, then allows us to deliberately introduce a discounting regression: the same scenario changes from the correct $41.32 to $90.91.

The challenge isn't just generating code. It's connecting developer agents to independent browser evidence so defects are visible before release.

Try the live demo: https://axiom-verify-kanecli-zhpdm6.v2.appdeploy.ai/

We're developing the Kane CLI test-and-feedback workflow and will share the verified run once it's completed. #KaneCLI #AIEngineering #SoftwareTesting #MUSITU

## Public post 2 — X/LinkedIn (business angle)

**A confident financial answer can still be wrong.**

In our new AXIOM Verify demo, $41.32 silently becomes $90.91 when a single calculation defect is injected. The interface can still say ACCEPT — which is why we need testing beyond a green UI.

We're building a fail-closed release gate for the KaneCLI Hackathon: browser verification, error evidence, agent repair, and retesting.

See the experiment: https://axiom-verify-kanecli-zhpdm6.v2.appdeploy.ai/

#KaneCLI #BuildWithAI #QualityEngineering

**Both truthful drafts were published on 19 November 2026** by the authorized LinkedIn browser session. Both explicitly avoid claiming Kane verification already happened. Keep the exact permalinks above for the entry.

## 3–5 minute demonstration video storyboard

1. **0:00–0:25 — Hook.** "What if an AI-built financial calculator looks right but silently changes the result?"
2. **0:25–1:05 — Show the real live app.** Open the public URL; baseline $1,000 investment, 10%, $600 and $600 → $41.32, ACCEPT.
3. **1:05–1:35 — Edge cases.** Zero-rate → $200.00; loss-making → -$392.56, REJECT.
4. **1:35–2:05 — Introduce regression.** Enable the visibly disclosed fault switch; the displayed result becomes $90.91. Explain that this is an intentionally wrong test fixture, not a historical production failure.
5. **2:05–2:50 — Show ACTUAL Kane CLI in terminal/GitHub Actions.** Run the committed baseline, mismatch and recovery objectives. Capture real Kane output, TestMu session link, and evidence of the failed assertion. If not available, do not fake the run or claim completion.
6. **2:50–3:35 — Show genuine agent feedback loop.** Display the captured failure delivered to the coding agent, the actual source edit it makes, and a real rerun. If the edit has not been done, this section is pending and final submission must wait.
7. **3:35–4:05 — Wrap up.** Show this isolated GitHub repository history, passing results and deployment URL; explain fail-closed behavior (missing credentials are NOT VERIFIED).

Record from the genuine app and CI/terminal, using screen capture. Avoid constructing fake browser console output or synthetic Kane pass reports.

## Blocking actions

1. ✅ Separate public GitHub repository created under `musitu-hackathons` during the competition; publish only this standalone release source.
2. ✅ Submission will use the official public GitHub repository URL; the earlier GitLab exception request is no longer needed.
3. In the TestMu dashboard, confirm the 10,000-credit license and obtain the TestMu username and access key without pasting credentials into chat.
4. Set `TESTMU_USERNAME` and `TESTMU_ACCESS_KEY` as repository-specific GitHub Actions secrets (or authenticate Kane CLI interactively on a trusted machine).
5. Manually trigger GitHub Actions with `kane=true` or run `npm run verify:kane` in a trusted Node environment. Capture real Kane events and actual repair/rerun evidence. Do not substitute synthetic unit-test fixtures.
6. Record and upload the 3–5-minute demo video to YouTube; keep URL.
7. ✅ Two distinct public LinkedIn launch posts published on 19 November 2026 (links above). Confirm TestMu signup matches the hackathon email.
8. Submit at https://kaneclihack.sh/o/submit before 26 November 2026, 11:59 PM IST (20:29 Africa/Harare). Verify receipt rather than assuming success.

## Evidence completed so far

- 19/19 local Node unit tests passed on 19 November 2026, including 8 synthetic parser-fixture tests that prove fail-closed classification; no actual Kane result exists.
- Local HTTP smoke: index 200, finance module 200, nonexistent route 404, rejected POST 405.
- Live AppDeploy status ready, with no frontend/network errors reported.
- Independent public browser smoke run (NOT Kane) succeeded: https://agent.tinyfish.ai/runs/cac64cce-adc8-4d0a-8ed2-077dec68e5c8 .
- GitLab isolated branch committed original 16-file project (`3be5833e`), submission kit (`cbf502e4`), and hardened NDJSON parser + 19-test suite (`d29085bb`).
- Both required public LinkedIn launch posts published, with verified permalinks above.
- Genuine `npm run verify:kane` invocation on 19 Nov correctly refused acceptance because Kane CLI was not installed (`ENOENT` / `no-result`).
- GitLab runner quota prevented GitLab CI job execution (`ci_quota_exceeded`); this is not evidence of code test failure or Kane execution.

## Repository security clarification

The public repo is intentionally isolated in its own organization and does not include any other repository contents or private credentials. Anyone can browse other repositories independently if those repositories are already public; this repo link does not grant collaborator permissions or private access. No personal or production repository visibility has been modified.