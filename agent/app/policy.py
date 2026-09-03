from __future__ import annotations

from .models import EvidenceCandidate, ReconcileRequest, ReleaseDecision


def evaluate_release(request: ReconcileRequest, candidates: list[EvidenceCandidate]) -> ReleaseDecision:
    """Apply the model-free actor release rule.

    A candidate satisfies a line only when its source recording was explicitly
    approved by a human and Gemini aligned it as a complete, non-missing read.
    """

    approved_recording_ids = {recording.id for recording in request.recordings if recording.human_approved}
    covered_line_ids = {
        candidate.line_id
        for candidate in candidates
        if candidate.recording_id in approved_recording_ids
        and candidate.completeness == "complete"
        and candidate.recommendation != "missing"
    }
    required_ids = [line.id for line in request.required_lines]
    unresolved = [line_id for line_id in required_ids if line_id not in covered_line_ids]
    return ReleaseDecision(
        status="clear" if not unresolved else "hold",
        covered=len(required_ids) - len(unresolved),
        total=len(required_ids),
        unresolved_line_ids=unresolved,
    )
