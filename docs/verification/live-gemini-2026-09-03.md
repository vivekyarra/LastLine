# Live Gemini verification — 2026-09-03

This is a sanitized record of a real LastLine server-side request using the fictional Maya scenario and the synthetic WAV in `public/demo-maya-wild-line.wav`. No API key, request header, raw audio bytes, or billing identifier is included.

## Runtime result

- Local application endpoint: `POST /api/live-analysis`
- Google model: `gemini-3.5-flash`
- Run ID: `run_8c4d4c4c9064`
- Candidate paths returned: `1`
- Input tokens: `290`
- Output tokens: `82`
- Total tokens reported: `1004`

## Candidate evidence

- Required line: `S12-L7` — “Because he followed you.”
- Recording: `WL-MAYA-S12-L7-001`
- Transcript: “Because he followed you.”
- Completeness: `complete`
- Confidence: `1.0`
- Concerns: none returned
- Gemini recommendation: `verified`

## Release decision

The deterministic policy returned `hold`, with `0/1` human-approved paths and `S12-L7` unresolved. This is the intended trust boundary: even a complete, concern-free, high-confidence Gemini candidate cannot clear the actor until production sound explicitly approves the recording.

## Independent SDK proof

The repository includes `scripts/verify-gemini-sdk.mjs`, which uses the official `@google/genai` package server-side against the same synthetic WAV. A fresh execution returned the exact transcript “Because he followed you.” with 76 input tokens, 5 output tokens, and 197 total tokens. The public Sites route uses the Gemini Developer API REST transport because the Sites worker runtime does not expose the Node transport required by the SDK package; both paths use the same restricted Google API and no secret is committed.
