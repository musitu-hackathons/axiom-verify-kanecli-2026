# KaneCLI Hackathon: AXIOM Verify 4-minute demonstration runbook

**Status:** Script ready; video not recorded or uploaded. Show actual live sites and completed real GitHub Actions evidence. Record a continuous screen capture or clearly edited clips. Avoid simulated terminal outputs.

## Screen order and narration

**00:00–00:25 — Hook (open the original live app)**  
"AI agents can build software quickly, but a green interface doesn't prove a financial calculation is correct. We built AXIOM Verify during the KaneCLI Hackathon to demonstrate an evidence-led release gate: an actual regression, independent browser detection, a coding-agent repair, and a verified rerun."

**00:25–01:00 — Baseline on https://axiom-verify-kanecli-zhpdm6.v2.appdeploy.ai/**  
"Our example invests one thousand dollars, returning six hundred dollars in each of two years at a ten percent discount rate. Correctly discounted, the net present value is forty-one dollars and thirty-two cents, so the illustrative decision is ACCEPT. The application and its tests are isolated from production MUSITU systems."

**01:00–01:30 — Inject bug on original demo**  
"Now I deliberately turn on a disclosed sandbox regression. The broken implementation discounts both cash flows as if they arrived after just one year. The same model incorrectly displays ninety dollars and ninety-one cents. A confident-looking interface now produces the wrong number."

**01:30–02:05 — Original real Kane GitHub job https://github.com/musitu-hackathons/axiom-verify-kanecli-2026/actions/runs/44696347231**  
"TestMu's genuine Kane CLI version zero point ten point six checked the real browser. Its baseline case passed. Its injected regression case failed exactly as intended, with a recorded assertion against forty-one dollars and thirty-two cents. The recovery case passed when the fault was removed. The raw NDJSON and signed GitHub Actions execution record are preserved."

**02:05–02:40 — Coding agent source diff and TDD**  
"We passed the failure evidence to ChatGPT as a coding agent. The original regression route ignored the cash-flow period; the repair delegates to our validated period-aware NPV function. Three dedicated tests first failed on the buggy implementation, then passed after the patch. Our complete local test suite now passes twenty-two cases. This is a real recorded code change, not a mocked success."

**02:40–03:20 — Repaired live app at https://axiom-verify-agent-repaired-mqlpg4.v2.appdeploy.ai/**  
"Here is the separately deployed repaired version. I turn the historical fault path on again, and the result stays forty-one dollars and thirty-two cents. A zero percent rate gives two hundred dollars. A loss-making case produces negative three hundred and ninety-two dollars and fifty-six cents with a REJECT decision."

**03:20–03:50 — Post-fix real Kane job https://github.com/musitu-hackathons/axiom-verify-kanecli-2026/actions/runs/44698630143**  
"We ran a second independent TestMu Kane CLI job against the patched deployment. All three repaired-browser objectives passed, including the previously faulty route while enabled. The success is backed by Kane's actual stream-start and run-end events, the exit codes, and a downloadable evidence artifact."

**03:50–04:10 — Close on GitHub source https://github.com/musitu-hackathons/axiom-verify-kanecli-2026**  
"The isolated, public repository contains the implementation, 22 unit tests, Kane acceptance harness, source repair and reproducible CI. No customer data, live trading or secret keys were used. Our principle is simple: agents write code; independent evidence decides whether it ships."

## Direct URLs for screen recording

- Original bug demo: https://axiom-verify-kanecli-zhpdm6.v2.appdeploy.ai/
- First real Kane test run: https://github.com/musitu-hackathons/axiom-verify-kanecli-2026/actions/runs/44696347231
- Repaired app: https://axiom-verify-agent-repaired-mqlpg4.v2.appdeploy.ai/
- Independent post-repair Kane rerun: https://github.com/musitu-hackathons/axiom-verify-kanecli-2026/actions/runs/44698630143
- Public GitHub source: https://github.com/musitu-hackathons/axiom-verify-kanecli-2026

## Mobile recording and delivery

On Android, enable Screen Recorder (microphone on), turn on Do Not Disturb, choose landscape where possible, enlarge browser text for source/log readability, and record in the chronological order above. Trim notifications/loading gaps; preserve genuine Kane screenshots/steps. Upload the resulting **3–5-minute video to YouTube as Public or Unlisted** (not Private) so the judges can access the link, then use that YouTube URL on the official submission form. Do not claim the video has been uploaded until YouTube confirms.