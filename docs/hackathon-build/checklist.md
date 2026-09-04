# Build Checklist

## Build Preferences

- **Build mode:** Autonomous
- **Comprehension checks:** N/A
- **Git:** Commit at coherent verified milestones; push only after complete end-to-end verification.
- **Verification:** Yes—automated checks plus browser review at major product milestones.
- **Check-in cadence:** Speed-run with concise progress updates; do not stop for routine visual approval.

## Winning Reference Decisions

- Open on the gate, not a marketing page.
- Seeded demo is synchronous and cannot be blocked by live API latency.
- One source of truth for deterministic release policy across UI and backend.
- Visible evidence locker and trace; no black-box “AI says bad audio.”
- Public repo treats tests, architecture, demo script, and limitations as first-class deliverables.

## Checklist

- [x] **1. Build the verdict-first product slice**
  Spec ref: `spec.md > Components And Responsibilities > Release Console`
  What to build: Replace the starter with the production-sound console, seeded Maya data, coverage rail, selected-line evidence, HOLD verdict, agent trace, and pickup CTA.
  Acceptance: Epic 1 first-viewport criteria and exact unresolved dialogue are visible synchronously.
  Verify: `npm run build`; open at 1280×720 and inspect text hierarchy and primary action.

- [x] **2. Implement the complete local release loop**
  Spec ref: `spec.md > Data Flow`
  What to build: Add capture, recheck, sound approval, CLEAR, reset, error, and accessibility states using a deterministic state machine.
  Acceptance: Epic 4 HOLD → pickup → recheck → approval → CLEAR works repeatedly without network.
  Verify: UI tests and browser click-through twice from reset.

- [x] **3. Extract domain types and deterministic policy**
  Spec ref: `spec.md > Components And Responsibilities > Release Policy`
  What to build: Shared typed evidence model, seeded scenario, pure policy engine, and invariant tests.
  Acceptance: Gemini confidence alone can never return CLEAR; every required line needs an approved path.
  Verify: Unit tests cover no-lines, missing, uncertain, approved, duplicate, and all-clear cases.

- [x] **4. Build the Cloud Run reconciliation service**
  Spec ref: `spec.md > Components And Responsibilities > Reconciliation Agent API`
  What to build: FastAPI/Pydantic service, health endpoint, policy module, structured reconcile endpoint, Dockerfile, and local deterministic fallback for tests.
  Acceptance: API contracts validate and malformed inputs fail safely.
  Verify: `pytest`; local Uvicorn health and reconcile smoke tests. Container build is part of the Cloud Run deployment gate.

- [x] **5. Integrate Gemini/Vertex AI reasoning**
  Spec ref: `spec.md > AI Usage`
  What to build: Narrow ADK/Gemini orchestration, structured response schema, retries/timeouts, provenance, and safe error handling.
  Acceptance: A real model call maps a supplied line to candidate audio/metadata and returns traceable evidence; model cannot set release status.
  Verify: Fresh live call with sanitized request/readback saved under `docs/verification/`.

- [x] **6. Connect web live mode to Cloud Run**
  Spec ref: `spec.md > API Contracts`
  What to build: Same-origin proxy/live analysis control, input validation, loading/error/success states, and visible `LIVE VERTEX` provenance.
  Acceptance: Seeded demo remains independent; live mode never labels fallback output as a cloud run.
  Verify: Browser/API end-to-end request and console/network error check.

- [x] **7. Deploy and harden public runtime**
  Spec ref: `spec.md > Stack`
  What to build: Sites frontend, same-origin Gemini server route, environment wiring, least-secret setup, visible live-proof telemetry, and anonymous judge access. Preserve the ADK/Cloud Run service as an optional deployable path without claiming an unavailable deployment.
  Acceptance: Hosted URL works without login; the live route identifies model/runtime/run ID and returns validated evidence; no secrets are exposed.
  Verify: No-cookie readback, live analysis, release-loop browser checks, and tracked-secret scan.

- [x] **8. Produce IBM Bob track evidence**
  Spec ref: `spec.md > Stack`
  What to build: Bob context, focused Bob task, resulting code/docs improvement, and honest dated prompt/output/diff evidence.
  Acceptance: Repo and submission identify the phantom-recording regression test Bob added, its 6/6 focused verification, and the dated evidence log; no runtime IBM claim.
  Verify: Run the artifact's relevant tests and preserve the checked-in evidence log.

- [x] **9. Add submission-grade quality gates**
  Spec ref: `spec.md > Risks And Verification`
  What to build: Web/API tests, CI workflow, license, security notes, sample data provenance, and public demo reset reliability.
  Acceptance: Build, lint, tests, and smoke checks pass from a clean install; no forbidden secrets or private assets are tracked.
  Verify: Clean CI-equivalent command and secret scan.

- [x] **10. Prepare the judge-facing repository and Devpost package**
  Spec ref: `prd.md > Submission Proof Points`
  What to build: Winner-pattern README, architecture diagram, screenshots, ≤3-minute demo script, Devpost draft, and exact track/runtime evidence mapping.
  Acceptance: A judge can grasp the problem, try the app, verify tech, and reproduce it from the top of the README.
  Verify: Link/readback audit and rubric-by-rubric checklist.

- [x] **11. Publish code and create the Devpost draft**
  Spec ref: `prd.md > Submission Proof Points`
  What to build: Initialize git, commit verified work, push to `vivekyarra/LastLine`, create/update the Devpost project draft, and attach hosted/repo links without final submission.
  Acceptance: GitHub default branch contains exact verified files; live Devpost project readback matches the draft.
  Verify: GitHub API/readback, clean worktree, and Devpost `get_project` readback.

- [x] **12. Prepare final submission handoff**
  Spec ref: `prd.md > Submission Proof Points`
  What to build: Gather final live URLs, video URL placeholder/status, required field answers, screenshots, and explicit unresolved blockers for `$prepare-submission` / `$submit-project`.
  Acceptance: Everything automatable is complete; only human-only facts, video upload, or explicit final-submit consent remain.
  Verify: Run the live submission requirements preflight and confirm next action without submitting.
