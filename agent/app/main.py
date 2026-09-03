from __future__ import annotations

import os
import logging
from datetime import UTC, datetime
from importlib.metadata import version

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .agent import MODEL, run_reconciler, vertex_configured
from .models import ReconcileRequest, ReconcileResponse, TraceStep
from .policy import evaluate_release

logger = logging.getLogger("lastline.api")

app = FastAPI(
    title="LastLine Reconciliation API",
    version="0.1.0",
    description="ADK + Gemini dialogue evidence reconciliation with a deterministic human-authorized release gate.",
)

allowed_origins = [origin.strip() for origin in os.getenv("LASTLINE_ALLOWED_ORIGINS", "http://localhost:3000").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get("/healthz")
async def healthz() -> dict[str, object]:
    return {
        "service": "lastline-reconciliation-api",
        "status": "ok",
        "revision": os.getenv("K_REVISION", "local"),
        "vertex_configured": vertex_configured(),
        "google_cloud_project": os.getenv("GOOGLE_CLOUD_PROJECT"),
        "google_cloud_location": os.getenv("GOOGLE_CLOUD_LOCATION"),
        "adk_version": version("google-adk"),
        "model": MODEL,
        "time": datetime.now(UTC).isoformat(),
    }


@app.post("/v1/reconcile", response_model=ReconcileResponse)
async def reconcile(request: ReconcileRequest) -> ReconcileResponse:
    try:
        run_id, batch, usage, trace = await run_reconciler(request)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        if "requires billing to be enabled" in str(exc).lower():
            raise HTTPException(
                status_code=503,
                detail="Vertex AI billing is disabled for the configured Google Cloud project",
            ) from exc
        logger.exception("Gemini reconciliation failed")
        raise HTTPException(status_code=502, detail="Gemini reconciliation failed safely") from exc

    decision = evaluate_release(request, batch.candidates)
    trace.append(
        TraceStep(
            name="Apply release policy",
            owner="deterministic policy",
            status="complete",
            detail=f"{decision.covered}/{decision.total} human-approved paths",
        )
    )
    return ReconcileResponse(
        run_id=run_id,
        model=MODEL,
        runtime=f"Google ADK {version('google-adk')} on Vertex AI",
        candidates=batch.candidates,
        decision=decision,
        trace=trace,
        usage=usage,
    )
