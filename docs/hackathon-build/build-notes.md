# Build Notes

## 2026-09-02 — verified product slice

- Built and visually inspected the verdict-first production-sound console.
- Exercised HOLD → capture → recheck → approval → SAFE TO RELEASE in the browser.
- Added the FastAPI/ADK reconciliation service and 12 passing backend tests.
- Added six web policy tests; they caught and drove a fix for incomplete-but-approved evidence incorrectly clearing the actor.
- Added a separate live Vertex control. The request reached Vertex AI, failed with `BILLING_DISABLED`, returned a safe 503, and surfaced that exact status in the browser without fallback substitution.
- Upgraded the inherited web stack to patched releases; `npm audit` now reports zero known vulnerabilities.
- `npm run verify` passes lint, tests, and the production build.

## 2026-09-02 — Onboard through checklist

- The participant supplied an unusually complete adversarial brain dump, so the mandatory scope/PRD questions were answered in the initial brief and no redundant interview was run.
- Build mode: autonomous, verified, win-first. Deepening rounds: effectively 1 extensive participant-authored round plus a winner benchmark pass.
- Active shaping moments: “don’t just participate; dominate and win” and “research relevant winners before UI/README/repo decisions.” These became explicit checklist constraints.
- Live Devpost preflight: registered account; submissions open; deadline 2026-09-09 21:00 UTC; four equal-weight criteria; hosted app, public repo + OSI license, ≤3-minute public demo, real Google Cloud + partner use required.
- Winner benchmark: Launch Control (verdict/evidence/remediation), ORION (operational console + visible agent/tool trace + Cloud Run), mnemosyne (one orchestrator with deterministic blocking), and LORE (product completeness + tests + story).
- Important negative evidence: Launch Control’s public `Try Live Demo` path hung during browser inspection. LastLine therefore ships a synchronous seeded demo separate from live cloud analysis.
- Partner integrity rule: IBM Bob evidence remains pending until Bob is actually used; the repo must not claim otherwise.

## 2026-09-02 — Checklist item 1

- Replaced the Sites starter with a synchronous verdict-first production-sound console.
- Verified `npm run build` after repairing a corrupt Windows Rolldown optional dependency. The old generated dependency tree was moved outside the workspace as a recoverable backup.
- Verified HTTP 200 and inspected the 1280px judge viewport in Chrome. HOLD, 4/5 coverage, the exact owed line, candidate evidence, minimum pickup, and agent/policy boundary are visible without a landing-page detour.
- First meaningful preview passed. The retained local tab will be reused for HMR checks.
