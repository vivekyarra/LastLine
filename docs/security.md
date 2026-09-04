# Security notes

- The repository contains no credentials. `.env*`, virtual environments, build output, Wrangler state, and deployment metadata are ignored.
- The API accepts only bounded Pydantic schemas, unique stable IDs, supported audio MIME types, notes of at most 500 characters, at most 8 MiB per recording, and at most 16 MiB of decoded audio per request.
- Model output is schema-validated and cross-checked against request recording IDs before policy evaluation.
- The model cannot set the release verdict. Cloud failure, malformed output, partial dialogue, and missing human approval all fail closed.
- The sample WAV is synthetic and contains no real performer or production data.
- The web proxy has bounded timeouts plus limited retry/backoff for 429 and transient 5xx responses, and does not expose cloud credentials to the browser.
- The public API requires a server-only `X-LastLine-Token`; the deployment script uses zero minimum and one maximum Cloud Run instance.

For a studio production deployment, add authenticated production membership, object storage with short-lived URLs instead of inline audio, provider-level rate limits, retention controls, audit export, and studio-specific data-processing terms. The public hackathon runtime is intentionally restricted to synthetic demonstration material.
