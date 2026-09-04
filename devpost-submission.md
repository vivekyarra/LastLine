# Title

LastLine — Hold for Sound

## One-line Summary

LastLine is an actor-release agent that reconciles the script against today's production audio and catches owed dialogue while the performer is still on set—turning tomorrow's ADR problem into a 20-second wild-line pickup today.

## Problem

The most expensive missing line is often discovered after the cheapest fix has disappeared.

Production dialogue coverage is scattered across script revisions, take recordings, sound reports, and human memory. At wrap, a First AD needs a binary operational answer: **can this actor leave?** If one required sentence has no usable production-audio path, discovering it days later can trigger actor coordination, an ADR stage, an engineer, dialogue editorial, performance matching, approvals, and remixing. While the actor is still standing on set, the same gap may take three wild reads and 20 seconds.

Existing tools document sound or repair dialogue in post. LastLine intervenes at the point of no return.

## Solution

LastLine opens directly on an actor-release request. It resolves the actor's required scripted lines, maps each obligation to recorded evidence, exposes uncertainty and sound notes, and applies a deterministic release policy.

If every line has a complete, human-approved path, the actor is **SAFE TO RELEASE**. If even one line does not, LastLine shows **HOLD FOR SOUND**, identifies the exact owed sentence, and produces the minimum wild-line pickup. After capture, the agent rechecks the new evidence and asks production sound—not the model—to approve the path.

The complete judge flow is:

**HOLD FOR SOUND → capture one owed line → recheck → sound approval → SAFE TO RELEASE**

## Why This Matters

LastLine protects a real operational moment where timing changes the cost by orders of magnitude. It does not ask a crew to adopt an “AI studio” or surrender professional judgment. It performs one repetitive reconciliation task, makes its evidence inspectable, escalates uncertainty, and closes the loop before the actor and location disappear.

The product is deliberately narrow enough to be credible on set, memorable to judges, and extensible later to real sound-report and slate integrations.

## How We Used AI

Gemini 3.5 Flash Lite is used where deterministic string matching fails: aligning imperfect spoken performances with scripted obligations, evaluating semantic completeness, combining audio evidence with take notes, and proposing candidate evidence paths in a strict schema.

The public judge path sends the synthetic WAV from a same-origin server route to the Gemini Developer API and requests strict structured output. The repository also includes a Google ADK + Vertex AI FastAPI service and an independent executable `@google/genai` SDK verifier. TypeScript/Pydantic validation rejects malformed output and any line or recording ID outside the supplied inventory. Gemini can return `verified`, `sound_check`, or `missing` evidence recommendations, but it cannot release an actor.

The final verdict is computed by deterministic policy: every required line must have a complete, non-missing, explicitly human-approved evidence path. Cloud failure, partial dialogue, invalid model output, and missing approval all fail closed.

**Runtime verification status:** a fresh production-route request and a separate official `@google/genai` SDK request both transcribed the synthetic line exactly. The production route returned one complete evidence candidate and the deterministic policy correctly held release at `0/1` without human approval. The sanitized readback is checked into `docs/verification/live-gemini-2026-09-04.md`. Cloud Run/Vertex remains an optional path and is not claimed as deployed.

## How We Used Codex

Codex helped convert an adversarially researched idea into a tightly scoped product, PRD, technical specification, and executable build checklist. It implemented the console and backend, extracted the safety policy into independently tested TypeScript and Python modules, repaired issues found by fresh-process builds, exercised the browser flow, and created reproducible verification and submission artifacts.

The most valuable iteration was not code generation: a policy test exposed that an incomplete-but-human-approved candidate could incorrectly count toward release in the first frontend implementation. The policy was corrected to require completeness, non-missing recommendation, and approval together. A later fresh-source build caught missing UI modules and stale CSS imports that a long-running development server had masked.

## Key Features

- Verdict-first release console understandable in the first viewport.
- Per-actor dialogue coverage with stable scene and line identifiers.
- Inspectable evidence cards with take IDs, confidence, completeness, and sound concerns.
- Visible agent trace separating Gemini reasoning, tools, deterministic policy, and human authority.
- Minimum pickup list instead of a generic analysis report.
- Three-state close-the-loop flow: recording, sound review, and authorized release.
- Network-independent seeded judge scenario, clearly labeled and kept separate from live cloud proof.
- Fail-closed live route with no fake fallback results.
- Server-only credentials, bounded request schemas, strict inventory validation, and fail-closed cloud errors.
- Synthetic demonstration audio; no real performer voice or production material.

## Architecture

```text
script obligations + take notes/audio
                ↓
      LastLine release console
         ↙ seeded       ↘ live
 deterministic UI       same-origin proxy
                              ↓
                 same-origin server proxy
                              ↓
             Gemini 3.5 Flash Lite / Google API
                              ↓
                schema + inventory validation
                              ↓
human sound approval → deterministic release policy
                         ↙              ↘
               HOLD + pickup      SAFE TO RELEASE
```

Web: React 19, TypeScript, Vinext, Tailwind CSS. Agent API: Python 3.12, FastAPI, Pydantic, Google ADK and Google Gen AI. Runtime: server-side Gemini Developer API on a restricted Google Cloud project, with a Sites-hosted web console and a Cloud Run-compatible optional agent container. Partner track: IBM Bob audited the release boundary and added the phantom-recording regression test documented in `docs/ibm-bob/usage-2026-09-03.md`.

## Testing Instructions

### Hosted judge path

1. Open the public demo link.
2. Confirm Maya Chen shows `4 / 5`, `1 unresolved`, and **HOLD FOR SOUND**.
3. Inspect Scene 12 / Line 7 and its three candidate takes.
4. Click **Capture wild line**.
5. Click **Finish reads & recheck**.
6. Confirm the new wild line is mapped but release remains blocked pending sound authorization.
7. Click **Approve WL-001 & release**.
8. Confirm **SAFE TO RELEASE**, `5 / 5`, the approved evidence path, and the authorization trail.
9. Click **Run demo again** to verify reset reliability.

### Local verification

```bash
npm ci
npm run verify
cd agent
python -m venv .venv
# activate the environment, then:
pip install -r requirements.txt
python -m pytest -q
```

Verified locally: 12 TypeScript policy/live-boundary tests, 16 Python API/schema/policy tests, a clean production build, an exact audio-backed production-route request, an independent official-SDK request, a fresh browser replay at desktop and mobile widths, and a clean high-severity npm audit.

## Public Demo Link

https://lastline-release-gate.cinevault7.chatgpt.site

Status: public anonymous HTTP 200 verified, including the complete release workflow and a successful audio-backed live Gemini request.

## Public Repository Link

https://github.com/vivekyarra/LastLine

Status: repository is public with an OSI-approved MIT license; the final verified release commit is being published in this pass.

## Demo Video

Public YouTube URL: https://youtu.be/TkmqTKCA3CQ

Planned runtime: 2:35, safely below the three-minute limit.

1. 0:00–0:15 — “Do not send the actor home while dialogue is still owed.” Explain 20 seconds now versus ADR later.
2. 0:15–0:45 — Open directly on HOLD, 4/5 coverage, the exact owed line, and failed candidate evidence.
3. 0:45–1:05 — Show the agent trace and the Gemini-versus-policy trust boundary.
4. 1:05–1:35 — Capture three wild reads and recheck.
5. 1:35–1:55 — Show that mapped evidence still cannot release Maya until production sound approves it.
6. 1:55–2:15 — Approve, reach SAFE TO RELEASE, and show the audit trail.
7. 2:15–2:35 — Show the live Gemini proof, IBM Bob development evidence, tests, and architecture.

## Screenshot Shot List

1. `docs/lastline-hold.png` — first-viewport HOLD verdict, 4/5 coverage, exact owed line, minimum pickup, and trace.
2. `docs/lastline-recording.png` — three wild reads being captured.
3. `docs/lastline-sound-review.png` — new evidence mapped while human approval is still required.
4. `docs/lastline-safe-to-release.png` — 5/5 coverage, approved path, release authorization, and avoided ADR.
5. `docs/verification/mobile-390.png` — responsive release workflow at 390 px.

## Submission Readiness Notes

- Public hosted seeded flow: verified.
- Core product, tests, architecture, security notes, screenshots, and demo script: complete.
- Successful live Gemini production-route and official-SDK proof: complete and sanitized in `docs/verification/live-gemini-2026-09-04.md`.
- IBM Bob material development contribution: complete — Bob added and verified the phantom-recording fail-closed regression test; see `docs/ibm-bob/usage-2026-09-03.md`.
- Public GitHub source and Devpost draft readback: complete.
- Devpost project: https://devpost.com/software/lastline-hold-for-sound
- Public demo video and URL: complete — https://youtu.be/TkmqTKCA3CQ
- Submitted to Agentic Cinema as submission `1170562` on 2026-09-04; live readback is required before treating this status as final.

## Known Limitations

- The Maya scenario and WAV are synthetic demo assets, not real production material.
- LastLine does not replace a production mixer or certify subjective professional audio quality.
- The MVP accepts a bounded actor release packet rather than ingesting a full shooting-day sound-report ecosystem.
- Persistence, production accounts, encrypted object storage, studio retention policies, and role-based permissions are outside the hackathon MVP.
- The seeded path demonstrates the complete operational workflow; live Gemini evidence is separately labeled and never substituted on failure.

## TODO Official Form Fields

- Submitter Type: Individual
- Organization name: N/A
- Government employee: No
- Country of Residence: India
- Canadian province: N/A
- Project status before July 27, 2026: New
- Partner track: IBM
- Team size: 1
- Repository URL: https://github.com/vivekyarra/LastLine
- Hosted project URL: https://lastline-release-gate.cinevault7.chatgpt.site
- Google Cloud products: Gemini Developer API on project `lastline-agentic-cinema`, Google Gen AI SDK, Google Agent Development Kit, and a Vertex AI/Cloud Run-compatible agent path. Cloud Run is not claimed as deployed.
- Other tools: IBM Bob, FastAPI, Pydantic, React, TypeScript, Vinext, Tailwind CSS, Vitest, pytest, GitHub Actions, Sites.
- First time using IBM tools: Yes
- Non-selected track questions: N/A options.
- Optional IBM marketing consent: leave unchecked unless explicitly requested.
