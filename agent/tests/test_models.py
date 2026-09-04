import base64

import pytest
from pydantic import ValidationError

from app.models import ReconcileRequest


def payload() -> dict:
    return {
        "actor": {"id": "maya", "name": "Maya Chen"},
        "required_lines": [{"id": "S12-L7", "scene": "12", "text": "Because he followed you."}],
        "recordings": [{"id": "T4", "filename": "t4.wav", "notes": []}],
    }


def test_duplicate_line_ids_are_rejected() -> None:
    data = payload()
    data["required_lines"].append(data["required_lines"][0].copy())
    with pytest.raises(ValidationError, match="unique"):
        ReconcileRequest.model_validate(data)


def test_audio_and_mime_type_must_arrive_together() -> None:
    data = payload()
    data["recordings"][0]["audio_base64"] = base64.b64encode(b"RIFFdemo").decode()
    with pytest.raises(ValidationError, match="together"):
        ReconcileRequest.model_validate(data)


def test_invalid_audio_base64_is_rejected() -> None:
    data = payload()
    data["recordings"][0].update({"audio_base64": "not-base64", "mime_type": "audio/wav"})
    with pytest.raises(ValidationError, match="valid base64"):
        ReconcileRequest.model_validate(data)


def test_human_approval_requires_named_approver() -> None:
    data = payload()
    data["recordings"][0]["human_approved"] = True
    with pytest.raises(ValidationError, match="approved_by"):
        ReconcileRequest.model_validate(data)


def test_recording_notes_are_bounded() -> None:
    data = payload()
    data["recordings"][0]["notes"] = ["x" * 501]
    with pytest.raises(ValidationError, match="500 characters"):
        ReconcileRequest.model_validate(data)


def test_combined_audio_payload_is_bounded() -> None:
    data = payload()
    eight_mib = base64.b64encode(b"x" * (8 * 1024 * 1024)).decode()
    data["recordings"] = [
        {"id": "T1", "filename": "t1.wav", "audio_base64": eight_mib, "mime_type": "audio/wav"},
        {"id": "T2", "filename": "t2.wav", "audio_base64": eight_mib, "mime_type": "audio/wav"},
        {
            "id": "T3",
            "filename": "t3.wav",
            "audio_base64": base64.b64encode(b"x").decode(),
            "mime_type": "audio/wav",
        },
    ]
    with pytest.raises(ValidationError, match="combined audio payload"):
        ReconcileRequest.model_validate(data)
