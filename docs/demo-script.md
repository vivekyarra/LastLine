# LastLine demo script — 2:35 target

## 0:00–0:18 — The irreversible moment

“At 7:58 PM, Maya is about to wrap. Tomorrow, one missing sentence means agents, an ADR stage, editorial, and performance matching. Tonight it is a 20-second wild line. LastLine has one job: do not send the actor home while dialogue is still owed.”

Show the first viewport already on **HOLD FOR SOUND**. Do not start on slides or a landing page.

## 0:18–0:48 — Evidence, not an AI opinion

Point to `4 / 5`, then Scene 12 / Line 7. Open the three candidate takes.

“Gemini reconciles the script against the day's recordings. It found two complete reads and one partial read, but none is approved. LastLine does not pretend to replace production sound.”

Point to the trace and the “Human authority preserved” card.

## 0:48–1:22 — Minimum remediation

Click **Capture wild line**.

“It produces no report and no giant pickup list: one owed sentence, three wild reads, about 20 seconds.”

Click **Finish reads & recheck**.

## 1:22–1:50 — Human gate and closure

“The new read maps cleanly, but confidence alone still cannot release Maya.”

Click **Approve WL-001 & release**. Pause on **SAFE TO RELEASE**, `5 / 5`, and the approval record.

## 1:50–2:18 — Real architecture

Show `docs/architecture.md` or a brief terminal/API shot.

“The live path is FastAPI, Google ADK, and Gemini on Vertex AI. Gemini proposes structured evidence; Pydantic validates it; deterministic policy owns HOLD or CLEAR. Six web policy tests and twelve API tests prove the release invariant.”

Click **Run live Vertex** only if the deployed call is green before recording. Never record a failing cloud call.

## 2:18–2:35 — Close

Return to **SAFE TO RELEASE**.

“LastLine turns tomorrow's ADR problem into a 20-second pickup today. One actor. One gate. No owed dialogue left behind.”

## Recording rules

- Record at 1440p or higher; browser zoom 90–100%.
- Use the seeded route for the uninterrupted story.
- Keep the cursor still while speaking; move only before a click.
- Never call the synthetic WAV real production audio.
- End by 2:45, leaving margin under Devpost's three-minute maximum.
