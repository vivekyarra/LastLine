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
