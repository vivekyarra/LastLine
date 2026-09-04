# Agentic Cinema compliance map

Verified against the live Agentic Cinema submission requirements and official rules on 2026-09-04.

| Requirement | LastLine evidence |
| --- | --- |
| Functional production-ready AI agent for a media workflow | The public actor-release gate performs a complete HOLD → pickup → review → human authorization → CLEAR workflow. |
| Hosted project URL | `https://lastline-release-gate.cinevault7.chatgpt.site` is anonymously accessible and the same-origin live route performs a real audio-backed Gemini request. The rules require a hosted web project; they do not require Cloud Run hosting. |
| Gemini and Google Cloud runtime use | `app/api/live-analysis/route.ts` calls Gemini's `generateContent` API with audio and a strict response schema. `scripts/verify-gemini-sdk.mjs` imports `@google/genai` and calls `ai.models.generateContent`. `agent/app/agent.py` imports `google-adk` and `google-genai`, constructs an `LlmAgent` and `Runner`, and calls `runner.run_async`. Both accepted Python packages are pinned in `agent/requirements.txt`. |
| Google Cloud Agent Builder / agent framework | The Cloud Run-compatible FastAPI service is built around Google ADK's `LlmAgent`, session service, and `Runner`. Its API and policy are covered by the 16-test Python suite. The public web slice uses the Gemini API directly because Cloud Run billing is unavailable; no undeployed runtime is claimed. |
| IBM partner-track requirement | IBM Bob Shell 2.0.2 was used during development to audit the release boundary and author the phantom-recording regression test. The exact dated task, contribution, and focused 6/6 verification are in `docs/ibm-bob/usage-2026-09-03.md`. The IBM rule requires Bob development usage; Confluent is optional. |
| Actual imported/called partner evidence | IBM Bob's contribution is present as executable test code in `agent/tests/test_policy.py`, with its development transcript summarized in the dated evidence artifact. IBM has no runtime-integration requirement for this track. |
| Only permitted AI tooling | Runtime inference uses Gemini only. `@openai/sites-vite-plugin` is a non-AI build/hosting adapter, which the rules permit as a standard non-AI third-party service. No OpenAI, Anthropic, Microsoft, or AWS model/API is used. |
| Public source and OSI license | `https://github.com/vivekyarra/LastLine` is public and GitHub detects the repository's MIT license. |
| Reproducible and consistent | `npm ci`, lint, 12 TypeScript tests, production build, 16 Python tests, and a high-severity dependency audit are release gates. CI runs the same commands on GitHub Actions. |
| Demonstration video | Required public YouTube/Vimeo video is intentionally left for the submitter to record. This is the only incomplete mandatory deliverable. |

## Hosting decision

The dedicated Google Cloud project `lastline-agentic-cinema` is active, but Cloud Billing is disabled. Google Cloud Run therefore rejects deployment before build. The official rules require a hosted project and actual Google/partner use in code; they do not require the hosted web platform itself to be a Google service. LastLine keeps the working public Sites deployment and treats Cloud Run as an optional architecture, avoiding a false deployment claim or an unnecessary paid dependency.
