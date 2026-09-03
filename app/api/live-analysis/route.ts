export async function POST(request: Request) {
  const apiUrl = process.env.LASTLINE_API_URL?.replace(/\/$/, '');
  if (!apiUrl) {
    return Response.json(
      { detail: 'Live Vertex endpoint is not configured. The seeded judge demo remains available.' },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ detail: 'Request must contain JSON.' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${apiUrl}/v1/reconcile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
}
