from __future__ import annotations

import base64
import binascii
from enum import StrEnum

from pydantic import BaseModel, Field, field_validator, model_validator


class Completeness(StrEnum):
    COMPLETE = "complete"
    PARTIAL = "partial"


class Recommendation(StrEnum):
    VERIFIED = "verified"
    SOUND_CHECK = "sound_check"
    MISSING = "missing"


class Actor(BaseModel):
    id: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=120)


class RequiredLineInput(BaseModel):
    id: str = Field(min_length=1, max_length=80)
    scene: str = Field(min_length=1, max_length=40)
    text: str = Field(min_length=1, max_length=1000)


class RecordingInput(BaseModel):
    id: str = Field(min_length=1, max_length=120)
    filename: str = Field(min_length=1, max_length=255)
    notes: list[str] = Field(default_factory=list, max_length=20)
    audio_base64: str | None = None
    mime_type: str | None = None
    human_approved: bool = False
    approved_by: str | None = Field(default=None, max_length=160)

    @field_validator("notes")
    @classmethod
    def bounded_notes(cls, notes: list[str]) -> list[str]:
        if any(len(note) > 500 for note in notes):
            raise ValueError("recording notes must be 500 characters or fewer")
        return notes

    @model_validator(mode="after")
    def validate_audio_pair(self) -> "RecordingInput":
        if bool(self.audio_base64) != bool(self.mime_type):
            raise ValueError("audio_base64 and mime_type must be supplied together")
        if self.mime_type and self.mime_type not in {"audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp4", "audio/ogg"}:
            raise ValueError("unsupported audio mime type")
        if self.audio_base64:
            try:
                decoded = base64.b64decode(self.audio_base64, validate=True)
            except (binascii.Error, ValueError) as exc:
                raise ValueError("audio_base64 must be valid base64") from exc
            if len(decoded) > 8 * 1024 * 1024:
                raise ValueError("audio payload exceeds 8 MiB")
        if self.human_approved and not self.approved_by:
            raise ValueError("approved_by is required for human-approved recordings")
        return self

    def audio_bytes(self) -> bytes | None:
        return base64.b64decode(self.audio_base64) if self.audio_base64 else None


class ReconcileRequest(BaseModel):
    actor: Actor
    required_lines: list[RequiredLineInput] = Field(min_length=1, max_length=100)
    recordings: list[RecordingInput] = Field(min_length=1, max_length=100)

    @model_validator(mode="after")
    def bounded_audio_batch(self) -> "ReconcileRequest":
        total_audio_bytes = sum(len(audio) for item in self.recordings if (audio := item.audio_bytes()))
        if total_audio_bytes > 16 * 1024 * 1024:
            raise ValueError("combined audio payload exceeds 16 MiB")
        return self

    @field_validator("required_lines")
    @classmethod
    def unique_lines(cls, lines: list[RequiredLineInput]) -> list[RequiredLineInput]:
        ids = [line.id for line in lines]
        if len(ids) != len(set(ids)):
            raise ValueError("required line IDs must be unique")
        return lines

    @field_validator("recordings")
    @classmethod
    def unique_recordings(cls, recordings: list[RecordingInput]) -> list[RecordingInput]:
        ids = [recording.id for recording in recordings]
        if len(ids) != len(set(ids)):
            raise ValueError("recording IDs must be unique")
        return recordings


class EvidenceCandidate(BaseModel):
    line_id: str
    recording_id: str
    confidence: float = Field(ge=0, le=1)
    completeness: Completeness
    transcript: str = Field(max_length=2000)
    concerns: list[str] = Field(default_factory=list, max_length=20)
    recommendation: Recommendation
    reasoning: str = Field(max_length=500)


class CandidateBatch(BaseModel):
    candidates: list[EvidenceCandidate]


class ReleaseDecision(BaseModel):
    status: str
    covered: int
    total: int
    unresolved_line_ids: list[str]
    rule: str = "every required line needs a human-approved evidence path"


class TraceStep(BaseModel):
    name: str
    owner: str
    status: str
    detail: str


class Usage(BaseModel):
    input_tokens: int | None = None
    output_tokens: int | None = None
    total_tokens: int | None = None


class ReconcileResponse(BaseModel):
    run_id: str
    model: str
    runtime: str
    candidates: list[EvidenceCandidate]
    decision: ReleaseDecision
    trace: list[TraceStep]
    usage: Usage
