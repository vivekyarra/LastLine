# Product Requirements Document

## Product Summary

LastLine is a dialogue evidence agent for the moment a performer is about to leave set. It does not mix audio or make an unreviewable quality verdict. It assembles evidence, escalates uncertainty to sound, blocks release when proof is missing, and closes the loop with the minimum wild-line pickup.

## Target User

- Primary: production sound mixer or utility sound technician.
- Secondary: script supervisor and First AD.
- Demo judge: must understand the problem, current verdict, evidence, and next action in under 20 seconds.

## Core User Journey

The user opens directly on an actor release request. They see coverage count, one unresolved line, candidate recordings, why candidates failed, the agent's evidence trace, and the deterministic HOLD verdict. They start the pickup, attach or simulate a wild read, recheck it, approve the candidate as sound, and see SAFE TO RELEASE with a timestamped audit trail.

## Epics And User Stories

### Epic 1: Understand the release decision immediately

- As a First AD, I want the current actor and HOLD/CLEAR verdict to dominate the first viewport so that I can act under time pressure.
- As a sound professional, I want coverage totals and unresolved count without navigating a dashboard.

Acceptance criteria:

- The actor name, verdict, unresolved count, and primary next action are visible without scrolling at 1280×720.
- Seeded demo data appears immediately; no API call or loading gate is required.
- HOLD and CLEAR use redundant text, icon, and color—not color alone.

### Epic 2: Inspect a line's evidence path

- As a sound professional, I want each required line linked to specific recordings and notes so that I can verify the agent's recommendation.
- As a script supervisor, I want stable scene/line identifiers and exact dialogue text.

Acceptance criteria:

- Selecting a line shows exact text, candidate take IDs, completeness, confidence, sound note, and source.
- AI uncertainty is labeled **Sound check required** rather than failed or approved.
- The interface never labels a take professionally usable without human approval.

### Epic 3: Enforce a safe release policy

- As a production lead, I want missing or unapproved required lines to block release so that confidence scores cannot silently waive dialogue.
- As a sound professional, I want final authority over ambiguous evidence.

Acceptance criteria:

- Deterministic policy returns HOLD if any required line has no human-approved evidence path.
- Gemini output can propose candidates and reasons but cannot directly set SAFE TO RELEASE.
- Human approval and its timestamp/source appear in the audit trail.

### Epic 4: Close the pickup loop

- As a sound mixer, I want the minimum wild-line list and a fast record/upload action so that the problem is fixed before release.
- As a First AD, I want the same request automatically rechecked after capture.

Acceptance criteria:

- HOLD state presents exactly the unresolved lines, read count, and estimated pickup time.
- Starting pickup moves through visible capture and recheck states.
- After candidate mapping and explicit sound approval, coverage becomes complete and verdict becomes SAFE TO RELEASE.
- A reset control restores the seeded HOLD scenario for judges.

### Epic 5: Prove real agent execution

- As a technical judge, I want to see which phases ran, which sources were read, and which component made the final decision.

Acceptance criteria:

- Agent trace exposes script resolution, audio indexing, semantic alignment, acoustic triage, policy evaluation, and human authorization.
- Live mode sends structured script/take input to a Vertex AI Gemini endpoint and returns schema-validated evidence candidates.
- The repository includes code, tests, deployment instructions, architecture, partner evidence, and an OSI license.

## Edge Cases

- No required dialogue for the actor: clear only after the script query is shown as complete.
- No recordings found: HOLD all owed lines and create a pickup list.
- Candidate below threshold: never auto-approve; request sound check.
- Gemini/API unavailable: seeded demo remains functional; live analysis shows a specific error and does not fake a model result.
- Duplicate/tiny recordings: identify them by stable source IDs and do not double-count coverage.
- User records before selecting a line: bind capture to the current unresolved pickup request.
- User resets after clear: return all demo and audit state to the original HOLD case.

## What We Are Building

The five epics above, one seeded production scenario, one upload/live analysis path, and submission-grade evidence.

## What We Would Add With More Time

- Direct integrations with digital sound reports and slate metadata.
- Multi-actor release queues and cross-unit sync.
- Durable production storage, role-based approvals, and encrypted media handling.
- Learned noise/event classification calibrated against a production's own mixer decisions.

## Submission Proof Points

- Public hosted app and a public repo with all runtime source.
- ≤3-minute demo showing HOLD → pickup → recheck → human approval → CLEAR.
- Real Vertex AI request/response evidence and Cloud Run health/readback.
- Test suite for policy invariants, evidence mapping, API schema, and UI state transition.
- Architecture diagram and judge-oriented README that map directly to the four equal-weight criteria.
- IBM Bob usage log and authored artifact only after verified use; no fabricated partner claim.
