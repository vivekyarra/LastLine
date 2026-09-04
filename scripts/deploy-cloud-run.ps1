param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectId,
    [string]$Region = "us-central1",
    [string]$ServiceName = "lastline-agent"
)

$ErrorActionPreference = "Stop"

if (-not $env:LASTLINE_GATE_TOKEN -or $env:LASTLINE_GATE_TOKEN.Length -lt 32) {
    throw "Set LASTLINE_GATE_TOKEN to a random value of at least 32 characters before deploying."
}

$billingEnabled = gcloud billing projects describe $ProjectId --format="value(billingEnabled)"
if ($billingEnabled -ne "True") {
    throw "Google Cloud billing is not enabled for '$ProjectId'. No deployment was attempted."
}

gcloud services enable `
    aiplatform.googleapis.com `
    artifactregistry.googleapis.com `
    cloudbuild.googleapis.com `
    run.googleapis.com `
    --project $ProjectId

gcloud run deploy $ServiceName `
    --source agent `
    --project $ProjectId `
    --region $Region `
    --allow-unauthenticated `
    --min-instances 0 `
    --max-instances 1 `
    --concurrency 4 `
    --cpu 1 `
    --memory 512Mi `
    --timeout 60 `
    --set-env-vars "GOOGLE_GENAI_USE_VERTEXAI=TRUE,GOOGLE_CLOUD_PROJECT=$ProjectId,GOOGLE_CLOUD_LOCATION=global,LASTLINE_GEMINI_MODEL=gemini-3.5-flash-lite,LASTLINE_GATE_TOKEN=$env:LASTLINE_GATE_TOKEN"

gcloud run services describe $ServiceName `
    --project $ProjectId `
    --region $Region `
    --format="yaml(status.url,status.latestReadyRevisionName,spec.template.metadata.annotations,spec.template.spec.containerConcurrency)"
