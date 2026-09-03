# Project Scope

## Project Name Candidates

- **LastLine** — selected; short, cinematic, and directly tied to dialogue coverage.
- Hold for Sound — retained as the primary blocked-state phrase.

## One-Line Summary

LastLine is an actor-release agent that reconciles the script against today's production audio and catches owed dialogue while the performer is still on set—turning tomorrow's ADR problem into a 20-second wild-line pickup today.

## Target User

The production sound mixer, script supervisor, and First AD making a time-pressured actor-release decision at the end of a shoot day.

## Problem

Dialogue coverage is distributed across the script, take recordings, sound reports, and human memory. The costly failure is discovered only after the actor and location are gone. Existing tools record what happened or repair dialogue in post; LastLine reconciles evidence at the point of no return.

## Time Budget

Seven days to the September 9, 2026 deadline. Scope is controlled around a dependable 20-second judge demo and one real Gemini/Google Cloud path.

## Core Workflow

1. Request release for one actor.
2. Resolve the actor's required scripted lines.
3. Map each line to candidate takes or wild recordings.
4. Show evidence, uncertainty, and deterministic policy outcome.
5. If any line lacks an approved path, show **HOLD FOR SOUND** and generate the minimum pickup list.
6. Capture or upload the wild line, recheck, obtain human sound approval, and show **SAFE TO RELEASE**.

## What We Are Building

- One working release console with an instantly available seeded demo.
- Script-line and take evidence model with three states: verified, sound check required, no evidence.
- Gemini-backed reconciliation endpoint using Vertex AI and structured output.
- Deterministic release policy that Gemini cannot override.
- Human approval for ambiguous audio and final release.
- Wild-line capture/upload loop with recheck.
- Visible agent trace, evidence provenance, confidence, timing, and model/runtime labels.
- Public deployment, public OSI-licensed repository, tests, architecture evidence, demo script, and Devpost draft.
- Honest IBM Bob development evidence if and only if Bob is actually used.

## What We Are Not Building

- Shot coverage, room tone, VFX plates, continuity, scheduling, rights, localization, editing, ADR generation, voice cloning, or broad production management.
- A claim that AI can replace a production mixer or autonomously judge artistic audio quality.
- Persistent multi-production accounts, billing, enterprise permissions, or a giant analytics dashboard.

## Inspiration And References

- Launch Control (GitLab AI Hackathon 2026, Easiest to Use): verdict-first release gate, evidence locker, deterministic scoring, and remediation.
- ORION (Gemini Live Agent Challenge Grand Prize): operational console, visible agent/tool activity, constrained grounding, and Cloud Run proof.
- mnemosyne (Rapid Agent Hackathon winner): one orchestrator with named phases, structured output, deterministic blocking, and real cloud deployment.
- LORE (GitLab AI Hackathon Grand Prize): product-level completeness, strong story, transparent limitations, and an unusually serious test suite.

## Demo Path

Maya Chen has five required lines. Four have approved production-audio paths; Scene 12 / Line 7 has only a plane-contaminated candidate. LastLine holds Maya, asks for three wild reads, ingests the new recording, maps it to the owed line, requests human approval, and clears Maya. The state transition must work without external network latency; the live Gemini path is shown separately and can be rerun.

## Submission Story

“Don't send the actor home while dialogue is still owed.” The demo makes the before/after cost asymmetry visible, then proves a narrow observe → reason → gate → act → verify loop using Gemini, Google Cloud, deterministic policy, and human authorization.
