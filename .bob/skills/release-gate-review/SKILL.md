---
name: release-gate-review
description: Adversarially review LastLine's actor-release safety invariant
metadata:
  user-invocable: true
  disable-model-invocation: true
---

Review @lib/release-policy.ts, @agent/app/policy.py, @tests/release-policy.test.ts,
and @agent/tests as a safety-critical workflow reviewer.

The invariant is: Gemini may propose evidence, but an actor can be cleared only
when every required dialogue line has at least one complete, non-missing,
human-approved evidence path.

Find one concrete divergence, unsafe edge case, or missing regression test.
Make the smallest useful repository change, run the relevant tests, and report:

1. the risk found;
2. the exact files changed;
3. the verification result;
4. any remaining limitation.

Do not change product scope, UI styling, dependencies, deployment, or cloud state.
