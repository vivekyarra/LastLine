from __future__ import annotations

import os
import uuid

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from .models import CandidateBatch, ReconcileRequest, TraceStep, Usage
from .prompts import SYSTEM_INSTRUCTION, build_request_prompt

APP_NAME = "lastline_release_gate"
MODEL = os.getenv("LASTLINE_GEMINI_MODEL", "gemini-2.5-flash")

os.environ.setdefault("GOOGLE_GENAI_USE_VERTEXAI", "TRUE")

reconciler = LlmAgent(
    name="lastline_dialogue_reconciler",
    description="Reconciles required scripted dialogue against production-audio evidence.",
    model=MODEL,
    instruction=SYSTEM_INSTRUCTION,
    output_schema=CandidateBatch,
    mode="task",
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True,
)

session_service = InMemorySessionService()
runner = Runner(app_name=APP_NAME, agent=reconciler, session_service=session_service)


def vertex_configured() -> bool:
    return bool(os.getenv("GOOGLE_CLOUD_PROJECT") and os.getenv("GOOGLE_CLOUD_LOCATION"))


def _message_parts(request: ReconcileRequest) -> list[types.Part]:
    line_payload = [{"id": line.id, "scene": line.scene, "text": line.text} for line in request.required_lines]
    recording_payload = [{"id": item.id, "filename": item.filename, "notes": item.notes} for item in request.recordings]
    parts: list[types.Part] = [
        types.Part(text=build_request_prompt(request.actor.name, line_payload, recording_payload))
    ]
    for recording in request.recordings:
        audio = recording.audio_bytes()
        if audio and recording.mime_type:
            parts.append(types.Part(text=f"Audio bytes for recording ID {recording.id}:"))
            parts.append(types.Part.from_bytes(data=audio, mime_type=recording.mime_type))
    return parts


async def run_reconciler(request: ReconcileRequest) -> tuple[str, CandidateBatch, Usage, list[TraceStep]]:
    if not vertex_configured():
        raise RuntimeError("Vertex AI is not configured")

    run_id = f"run_{uuid.uuid4().hex[:12]}"
    session = await session_service.create_session(
        app_name=APP_NAME,
        user_id="lastline-api",
        session_id=run_id,
    )
    message = types.Content(role="user", parts=_message_parts(request))
    response_text = ""
    usage = Usage()

    async for event in runner.run_async(
        user_id="lastline-api",
        session_id=session.id,
        new_message=message,
    ):
        if event.usage_metadata:
            usage = Usage(
                input_tokens=event.usage_metadata.prompt_token_count,
                output_tokens=event.usage_metadata.candidates_token_count,
                total_tokens=event.usage_metadata.total_token_count,
            )
        if event.is_final_response() and event.content and event.content.parts:
            response_text = "".join(part.text or "" for part in event.content.parts)

    if not response_text:
        raise RuntimeError("ADK completed without a structured final response")

    batch = CandidateBatch.model_validate_json(response_text)
    known_lines = {line.id for line in request.required_lines}
    known_recordings = {recording.id for recording in request.recordings}
    for candidate in batch.candidates:
        if candidate.line_id not in known_lines or candidate.recording_id not in known_recordings:
            raise RuntimeError("Gemini returned an evidence ID outside the supplied inventory")

    trace = [
        TraceStep(name="Resolve script obligation", owner="deterministic", status="complete", detail=f"{len(request.required_lines)} required actor lines"),
        TraceStep(name="Index production audio", owner="tool", status="complete", detail=f"{len(request.recordings)} supplied recordings"),
        TraceStep(name="Align dialogue evidence", owner=f"ADK · {MODEL}", status="complete", detail=f"{len(batch.candidates)} candidate paths"),
        TraceStep(name="Triage acoustic concerns", owner=f"ADK · {MODEL}", status="complete", detail="Conservative concern labels emitted"),
    ]
    return run_id, batch, usage, trace
