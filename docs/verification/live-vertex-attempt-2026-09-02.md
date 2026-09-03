# Live Vertex integration attempt — 2026-09-02

## What was verified

- Local FastAPI health returned `status: ok`, Google ADK `2.8.0`, model `gemini-2.5-flash`, Vertex configuration present, and location `global`.
- The web proxy sent the labeled synthetic WAV to `POST /v1/reconcile`.
- ADK reached the Vertex AI API using Application Default Credentials.
- Vertex returned `403 PERMISSION_DENIED` with reason `BILLING_DISABLED` for the configured project.
- The API translated that external failure to HTTP 503.
- The browser displayed: `Vertex AI billing is disabled for the configured Google Cloud project`.
- No local or seeded result was substituted for the failed live call.

## Current blocker

The available Google Cloud billing accounts are closed. Enabling or attaching a paid billing account is a user-authorized financial action and was not performed automatically.

This file is failure evidence, not proof of a successful model inference. Replace or supplement it with a sanitized successful request/readback after billing or credits are available.
