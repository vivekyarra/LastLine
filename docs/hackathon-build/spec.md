# Technical Spec

## Overview

LastLine uses a dependable local-first demo surface plus a real cloud inference path. The browser owns only transient demo state. A Python FastAPI service on Google Cloud Run hosts the reconciliation agent and Vertex AI integration. The final release verdict is always computed by shared deterministic policy after candidate evidence and human approvals are known.

## Stack

- **Web:** React 19, TypeScript 5.9, Vinext/Next-compatible App Router, Tailwind CSS 4, shadcn/Base UI, Lucide.
- **Agent API:** Python 3.12, FastAPI, Pydantic, Google ADK, Google Gen AI/Vertex AI.
- **Cloud:** Vertex AI, Cloud Run, Artifact Registry, Cloud Build; Secret Manager only if an API secret becomes necessary.
- **Partner track:** IBM Bob as a real development partner with checked-in context and a dated evidence log. No runtime IBM claim unless an IBM runtime is actually integrated.
- **Tests:** Vitest/React Testing Library for web, pytest for agent/policy, HTTP smoke tests for deployed endpoints.

## Architecture

```text
Production script + take metadata/audio
                 │
                 ▼
      LastLine release console
        │                 │
 seeded instant demo      │ live reconcile request
        │                 ▼
        │        Cloud Run / FastAPI / ADK
        │                 │
        │                 ▼
        │       Vertex AI Gemini reasoning
        │          structured candidates
        └──────────────┬──┘
                       ▼
          deterministic release policy
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
       HOLD FOR SOUND      SOUND CHECK REQUIRED
             │                   │
             └──── pickup/approve┘
                       │
                       ▼
                SAFE TO RELEASE
```

## File Structure

```text
app/
  page.tsx                    release console and seeded state machine
  globals.css                 production-console design tokens and utilities
  api/live-analysis/route.ts  same-origin proxy to Cloud Run
components/
  lastline/                   verdict, coverage, evidence, trace, pickup components
lib/
  domain.ts                   shared TypeScript domain types
  demo-data.ts                stable Maya release scenario
  release-policy.ts           deterministic client mirror for UI/demo
agent/
  app/
    main.py                   FastAPI routes
    agent.py                  ADK/Gemini orchestration
    models.py                 Pydantic request/result schemas
    policy.py                 authoritative deterministic release gate
    prompts.py                narrow evidence-reconciliation instructions
  tests/                      policy, schema, parser, and route tests
  Dockerfile                  Cloud Run image
docs/
  architecture.md             accurate architecture and trust boundary
  demo-script.md              ≤3-minute shot-by-shot narration
  verification/               sanitized live request/readback evidence
  ibm-bob/                    prompts and verified usage log
tests/                        web policy and state tests
```

## Data Flow

1. The request identifies an actor and supplies required dialogue lines.
2. Take metadata and optional audio bytes are normalized into stable recording IDs.
3. Gemini receives only the selected actor's lines and candidate recordings, then returns structured match candidates with transcript, completeness, semantic match, acoustic concern labels, confidence, and explanation.
4. Pydantic rejects malformed model output. Candidates are evidence, never release decisions.
5. The policy engine marks each line `verified`, `sound_check`, or `missing` from candidate state and human approval.
6. Any missing/unapproved line produces HOLD and a minimal pickup list.
7. New wild audio is reconciled, then a human approval promotes that evidence path.
8. Only when every required line has an approved path does the policy return CLEAR.

## Components And Responsibilities

### Release Console

Implements: `prd.md > Epic 1`, `Epic 4`

Renders verdict-first state, cost asymmetry, primary action, pickup progress, reset, and responsive layout. Seeded content is synchronous and cannot hang on network access.

### Coverage Rail

Implements: `prd.md > Epic 1`, `Epic 2`

Lists required lines and state, supports selection, and shows 4/5 → 5/5 transition.

### Evidence Inspector

Implements: `prd.md > Epic 2`

Shows exact dialogue, candidate take cards, waveform proxy, transcript/completeness, notes, confidence, and human-approval control.

### Agent Trace

Implements: `prd.md > Epic 5`

Shows named phases, input/output counts, tool/model labels, timestamps, and policy ownership. It must distinguish simulated demo steps from live cloud steps.

### Release Policy

Implements: `prd.md > Epic 3`

Pure function with no model call. Inputs are required lines, evidence candidates, and approval records. Output is HOLD or CLEAR plus unresolved lines and pickup request.

### Reconciliation Agent API

Implements: `prd.md > Epic 2`, `Epic 5`

Validates requests, invokes Gemini on Vertex AI through ADK or the Google Gen AI SDK, parses structured output, applies the authoritative policy, and returns evidence + trace + usage metadata.

## API Contracts

### `POST /v1/reconcile`

Request:

```json
{
  "actor": { "id": "maya-chen", "name": "Maya Chen" },
  "required_lines": [{ "id": "S12-L7", "scene": "12", "text": "Because he followed you." }],
  "recordings": [{ "id": "A007-T004", "filename": "A007_T004.wav", "notes": ["possible plane"] }],
  "mode": "metadata_and_audio"
}
```

Response:

```json
{
  "run_id": "run_...",
  "model": "gemini-3.5-flash-lite",
  "candidates": [{ "line_id": "S12-L7", "recording_id": "A007-T004", "confidence": 0.78, "completeness": "complete", "concerns": ["aircraft_noise"], "recommendation": "sound_check" }],
  "decision": { "status": "hold", "unresolved_line_ids": ["S12-L7"] },
  "trace": []
}
```

### `GET /healthz`

Returns service, revision, Vertex configuration presence, and current UTC time without exposing credentials.

## External APIs And Dependencies

- Google ADK documentation: https://google.github.io/adk-docs/
- Vertex AI Gemini: https://cloud.google.com/vertex-ai/generative-ai/docs
- Google Gen AI SDK: https://googleapis.github.io/js-genai/
- IBM Bob: https://bob.ibm.com/docs/ide
- FastAPI: https://fastapi.tiangolo.com/

## AI Usage

Gemini is necessary for semantic line alignment across imperfect performances/transcripts and multimodal interpretation of audio plus sound notes. It proposes evidence candidates in a strict schema. It is explicitly prohibited from making final release decisions, inventing missing recordings, or declaring professional usability. Named phases provide an auditable agent loop without multiplying agents for presentation value.

## Risks And Verification

- **Model output drift:** strict schema, bounded enums, parser tests, and raw-output capture in sanitized verification artifacts.
- **False confidence:** threshold only routes to human check; it never auto-clears ambiguous evidence.
- **Cloud/demo outage:** instant seeded demo works offline; live mode fails visibly and never substitutes fake cloud evidence.
- **Visual clutter:** first viewport limited to verdict, coverage, selected evidence, trace, and one action.
- **Partner credibility:** IBM evidence is added only after actual Bob interaction.
- **Cost/quota:** one actor and selected recordings per request; demo audio is short and pre-compressed.

## Demo And Submission Flow

0:00 problem and 30-second-vs-ADR asymmetry. 0:15 open console already showing HOLD. 0:35 inspect exact missing line and rejected takes. 0:55 show Gemini evidence phases and deterministic policy boundary. 1:15 capture three wild reads. 1:40 recheck and approve one candidate. 2:05 SAFE TO RELEASE and audit trail. 2:20 show live Vertex/Cloud Run proof and repo architecture. End before 2:55.
