# Live Gemini verification — 2026-09-04

This is a sanitized record of a fresh, real LastLine request using the fictional Maya scenario and the synthetic WAV in `public/demo-maya-wild-line.wav`. No API key, request header, or raw audio bytes are included.

## Production-code route

- Endpoint exercised: `POST /api/live-analysis` from a fresh Vinext development server
- Google model: `gemini-3.5-flash-lite`
- Runtime: Gemini Developer API, server-side REST
- Run ID: `run_822ef8379e8a`
- Candidate paths: `1`
- Transcript: “Because he followed you.”
- Completeness: `complete`
- Confidence: `0.98`
- Decision: `hold`
- Coverage: `0/1`; unresolved line `S12-L7`
- Usage: 285 input tokens, 138 output tokens, 423 total tokens

The deterministic decision is deliberately `hold`: the supplied recording was not human-approved. A complete, high-confidence Gemini match still cannot release the actor.

## Independent official-SDK route

`npm run verify:gemini` used the official `@google/genai` package against the same synthetic WAV. It returned the exact transcript “Because he followed you.” with 76 input tokens, 5 output tokens, and 81 total tokens.

The first call to `gemini-3.5-flash` returned Google's transient `503 UNAVAILABLE` high-demand response. LastLine now uses `gemini-3.5-flash-lite` for the public demo and applies bounded retry/backoff for 429 and transient 5xx responses. No seeded or fabricated response is substituted when live inference fails.
