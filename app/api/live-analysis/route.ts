import {
  buildGeminiContents,
  candidateResponseSchema,
  evaluateLiveRelease,
  parseCandidateBatch,
  parseLiveRequest,
} from '@/lib/live-analysis';

const systemInstruction = `You are LastLine's dialogue evidence reconciler. Inspect only supplied line and recording IDs. Align spoken performance to required dialogue, report completeness and concrete acoustic concerns conservatively, and return evidence candidates only. Never decide actor release, claim professional usability, invent evidence, or infer human approval. Use sound_check for complete matches with unresolved concerns, missing for partial or materially uncertain dialogue, and verified only for complete candidates with no identified concern.`;

const retryableStatuses = new Set([429, 500, 502, 503, 504]);
const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function POST(request: Request) {
  const apiUrl = process.env.LASTLINE_API_URL?.replace(/\/$/, '');

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ detail: 'Request must contain JSON.' }, { status: 400 });
  }

  if (apiUrl) try {
    const gateToken = process.env.LASTLINE_GATE_TOKEN;
    const upstream = await fetch(`${apiUrl}/v1/reconcile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(gateToken ? { 'X-LastLine-Token': gateToken } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(45_000),
    });
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
    });
  } catch {
    return Response.json(
      { detail: 'Live Vertex endpoint could not be reached. No fallback result was substituted.' },
      { status: 502 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { detail: 'Live Gemini endpoint is not configured. The seeded judge demo remains available.' },
      { status: 503 },
    );
  }

  let input;
  try {
    input = parseLiveRequest(payload);
  } catch (error) {
    return Response.json({ detail: error instanceof Error ? error.message : 'Invalid request.' }, { status: 422 });
  }

  const model = process.env.LASTLINE_GEMINI_MODEL ?? 'gemini-3.5-flash-lite';
  try {
    const requestBody = JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: buildGeminiContents(input),
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseJsonSchema: candidateResponseSchema,
      },
    });
    let upstream: Response | undefined;
    let response: {
      error?: { message?: string };
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number };
    } = {};
    for (let attempt = 0; attempt < 3; attempt += 1) {
      upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: requestBody,
        signal: AbortSignal.timeout(40_000),
      });
      response = await upstream.json() as typeof response;
      if (upstream.ok || !retryableStatuses.has(upstream.status) || attempt === 2) break;
      await wait(750 * (2 ** attempt));
    }
    if (!upstream!) throw new Error('Gemini API did not return a response');
    if (!upstream.ok) throw new Error(response.error?.message ?? `Gemini API returned ${upstream.status}`);
    const responseText = response.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
    const candidates = parseCandidateBatch(responseText, input);
    const decision = evaluateLiveRelease(input, candidates);
    const runId = `run_${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`;
    return Response.json({
      run_id: runId,
      model,
      runtime: 'Gemini Developer API · server-side REST',
      candidates,
      decision,
      trace: [
        { name: 'Resolve script obligation', owner: 'deterministic', status: 'complete', detail: `${input.required_lines.length} required actor line` },
        { name: 'Index production audio', owner: 'tool', status: 'complete', detail: `${input.recordings.length} supplied recording` },
        { name: 'Align dialogue evidence', owner: `Gemini · ${model}`, status: 'complete', detail: `${candidates.length} candidate path` },
        { name: 'Apply release policy', owner: 'deterministic policy', status: 'complete', detail: `${decision.covered}/${decision.total} human-approved paths` },
      ],
      usage: {
        input_tokens: response.usageMetadata?.promptTokenCount ?? null,
        output_tokens: response.usageMetadata?.candidatesTokenCount ?? null,
        total_tokens: response.usageMetadata?.totalTokenCount ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('Gemini reconciliation failed safely', message);
    return Response.json({
      detail: process.env.NODE_ENV === 'development'
        ? `Gemini reconciliation failed safely: ${message}`
        : 'Gemini reconciliation failed safely. No fallback result was substituted.',
    }, { status: 502 });
  }
}
