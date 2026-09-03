# Security notes

- The repository contains no credentials. `.env*`, virtual environments, build output, Wrangler state, and deployment metadata are ignored.
- The API accepts only bounded Pydantic schemas, unique stable IDs, supported audio MIME types, and at most 8 MiB per inline audio payload.
- Model output is schema-validated and cross-checked against request recording IDs before policy evaluation.
- The model cannot set the release verdict. Cloud failure, malformed output, partial dialogue, and missing human approval all fail closed.
- The sample WAV is synthetic and contains no real performer or production data.
- The web proxy has a 45-second upstream timeout and does not expose cloud credentials to the browser.

For a production deployment, add authenticated production membership, object storage with short-lived URLs instead of inline audio, rate limits, retention controls, audit export, and studio-specific data-processing terms.
