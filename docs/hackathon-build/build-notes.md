# Build Notes

## 2026-09-04 — live Gemini recovery and hardening

- Recovered and read every LastLine task transcript before continuing the interrupted release.
- Reproduced a transient `503 UNAVAILABLE` from `gemini-3.5-flash`, selected the live-catalog sibling `gemini-3.5-flash-lite`, and added bounded retry/backoff for 429 and transient 5xx responses.
- Proved the exact production route with synthetic audio: one complete candidate, exact transcript, `0/1` approved paths, and a fail-closed `hold` verdict.
- Independently proved the official `@google/genai` SDK path against the same WAV.
- Expanded public-request bounds and added two regression tests; 12 TypeScript tests and 16 Python tests pass.
- Reinstalled all 274 Node packages from the lockfile with `npm ci`, then reran lint, 12 tests, the production build, 16 backend tests, the official-SDK call, a tracked-file secret scan, and a zero-vulnerability audit.

## 2026-09-03 — Fresh-source and cost-boundary pass

- Rebuilt from a fresh process and found two missing UI source modules plus stale CSS imports that the earlier hot-reload session had masked.
- Restored the minimal Button/Badge source, removed unused stylesheet imports, and verified a clean production build.
- Added a server-only Cloud Run gate token and a deployment script that fails closed without billing, scales to zero, and caps the service at one instance.
- Replayed HOLD → capture → recheck → human approval → SAFE TO RELEASE in a fresh browser and captured all three product states.
- Verified 6 TypeScript policy tests, 16 Python API/schema/policy tests, production build, and zero npm audit vulnerabilities.

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
- IBM Bob Shell 2.0.2 was used under the free trial to audit the actor-release boundary. Bob added a focused phantom-recording regression test; the policy suite passed 6/6. Exact evidence is preserved in `docs/ibm-bob/usage-2026-09-03.md`.

## 2026-09-02 — Checklist item 1

- Replaced the Sites starter with a synchronous verdict-first production-sound console.
- Verified `npm run build` after repairing a corrupt Windows Rolldown optional dependency. The old generated dependency tree was moved outside the workspace as a recoverable backup.
- Verified HTTP 200 and inspected the 1280px judge viewport in Chrome. HOLD, 4/5 coverage, the exact owed line, candidate evidence, minimum pickup, and agent/policy boundary are visible without a landing-page detour.
- First meaningful preview passed. The retained local tab will be reused for HMR checks.
