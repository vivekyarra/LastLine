from app.models import CandidateBatch, EvidenceCandidate, ReconcileRequest
from app.policy import evaluate_release


def request(*, approved: bool = False) -> ReconcileRequest:
    return ReconcileRequest.model_validate(
        {
            "actor": {"id": "maya", "name": "Maya Chen"},
            "required_lines": [{"id": "S12-L7", "scene": "12", "text": "Because he followed you."}],
            "recordings": [
                {
                    "id": "WL-001",
                    "filename": "wl-001.wav",
                    "notes": [],
                    "human_approved": approved,
                    "approved_by": "Nora Patel" if approved else None,
                }
            ],
        }
    )


def candidate(*, completeness: str = "complete", recommendation: str = "verified") -> EvidenceCandidate:
    return EvidenceCandidate.model_validate(
        {
            "line_id": "S12-L7",
            "recording_id": "WL-001",
            "confidence": 0.99,
            "completeness": completeness,
            "transcript": "Because he followed you.",
            "concerns": [],
            "recommendation": recommendation,
            "reasoning": "Complete semantic match.",
        }
    )


def test_high_confidence_model_candidate_cannot_clear_without_human_approval() -> None:
    decision = evaluate_release(request(approved=False), [candidate()])
    assert decision.status == "hold"
    assert decision.unresolved_line_ids == ["S12-L7"]


def test_human_approved_complete_candidate_clears() -> None:
    decision = evaluate_release(request(approved=True), [candidate()])
    assert decision.status == "clear"
    assert decision.covered == 1


def test_partial_candidate_does_not_clear_even_when_recording_is_approved() -> None:
    decision = evaluate_release(request(approved=True), [candidate(completeness="partial")])
    assert decision.status == "hold"


def test_missing_recommendation_does_not_clear() -> None:
    decision = evaluate_release(request(approved=True), [candidate(recommendation="missing")])
    assert decision.status == "hold"


def test_empty_candidate_batch_holds_every_line() -> None:
    decision = evaluate_release(request(approved=True), CandidateBatch(candidates=[]).candidates)
    assert decision.status == "hold"
    assert decision.covered == 0
