from fastapi.testclient import TestClient

from app.main import app
from app.models import CandidateBatch, EvidenceCandidate, TraceStep, Usage

client = TestClient(app)


def test_health_exposes_runtime_without_credentials() -> None:
    response = client.get("/healthz")
    assert response.status_code == 200
    body = response.json()
    assert body["service"] == "lastline-reconciliation-api"
    assert body["adk_version"] == "2.8.0"
    assert "time" in body


def test_reconcile_applies_policy_after_agent(monkeypatch) -> None:
    async def fake_run(_request):
        batch = CandidateBatch(
            candidates=[
                EvidenceCandidate(
                    line_id="S12-L7",
                    recording_id="WL-001",
                    confidence=0.98,
                    completeness="complete",
                    transcript="Because he followed you.",
                    concerns=[],
                    recommendation="verified",
                    reasoning="Complete match.",
                )
            ]
        )
        return "run_test", batch, Usage(total_tokens=42), [TraceStep(name="Align", owner="ADK", status="complete", detail="1 candidate")]

    monkeypatch.setattr("app.main.run_reconciler", fake_run)
    response = client.post(
        "/v1/reconcile",
        json={
            "actor": {"id": "maya", "name": "Maya Chen"},
            "required_lines": [{"id": "S12-L7", "scene": "12", "text": "Because he followed you."}],
            "recordings": [{"id": "WL-001", "filename": "wl.wav", "human_approved": True, "approved_by": "Nora Patel"}],
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["runtime"].startswith("Google ADK 2.8.0")
    assert body["decision"]["status"] == "clear"
    assert body["trace"][-1]["owner"] == "deterministic policy"


def test_reconcile_fails_visibly_without_vertex(monkeypatch) -> None:
    async def fake_failure(_request):
        raise RuntimeError("Vertex AI is not configured")

    monkeypatch.setattr("app.main.run_reconciler", fake_failure)
    response = client.post(
        "/v1/reconcile",
        json={
            "actor": {"id": "maya", "name": "Maya Chen"},
            "required_lines": [{"id": "S12-L7", "scene": "12", "text": "Because he followed you."}],
            "recordings": [{"id": "T4", "filename": "t4.wav"}],
        },
    )
    assert response.status_code == 503
    assert response.json()["detail"] == "Vertex AI is not configured"
