export type LiveRecording = {
  id: string;
  filename: string;
  notes?: string[];
  audio_base64?: string;
  mime_type?: string;
  human_approved?: boolean;
  approved_by?: string;
};

export type LiveRequest = {
  actor: { id: string; name: string };
  required_lines: Array<{ id: string; scene: string; text: string }>;
  recordings: LiveRecording[];
};

export type LiveCandidate = {
  line_id: string;
  recording_id: string;
  confidence: number;
  completeness: 'complete' | 'partial';
  transcript: string;
  concerns: string[];
  recommendation: 'verified' | 'sound_check' | 'missing';
  reasoning: string;
};

export const candidateResponseSchema = {
  type: 'object',
  properties: {
    candidates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          line_id: { type: 'string' },
          recording_id: { type: 'string' },
          confidence: { type: 'number' },
          completeness: { type: 'string', enum: ['complete', 'partial'] },
          transcript: { type: 'string' },
          concerns: { type: 'array', items: { type: 'string' } },
          recommendation: { type: 'string', enum: ['verified', 'sound_check', 'missing'] },
          reasoning: { type: 'string' },
        },
        required: ['line_id', 'recording_id', 'confidence', 'completeness', 'transcript', 'concerns', 'recommendation', 'reasoning'],
      },
    },
  },
  required: ['candidates'],
} as const;

const allowedMimeTypes = new Set(['audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/mp4', 'audio/ogg']);

function requireBoundedString(value: unknown, label: string, maxLength: number): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > maxLength) {
    throw new Error(`${label} must be a non-empty string of at most ${maxLength} characters.`);
  }
}

export function parseLiveRequest(value: unknown): LiveRequest {
  if (!value || typeof value !== 'object') throw new Error('Request must be an object.');
  const request = value as Partial<LiveRequest>;
  requireBoundedString(request.actor?.id, 'Actor ID', 128);
  requireBoundedString(request.actor?.name, 'Actor name', 200);
  if (!Array.isArray(request.required_lines) || request.required_lines.length < 1 || request.required_lines.length > 100) {
    throw new Error('Between 1 and 100 required lines are required.');
  }
  if (!Array.isArray(request.recordings) || request.recordings.length < 1 || request.recordings.length > 100) {
    throw new Error('Between 1 and 100 recordings are required.');
  }

  const lineIds = new Set<string>();
  for (const line of request.required_lines) {
    requireBoundedString(line?.id, 'Line ID', 128);
    requireBoundedString(line.scene, 'Scene', 100);
    requireBoundedString(line.text, 'Line text', 1000);
    if (lineIds.has(line.id)) throw new Error('Required line IDs must be unique.');
    lineIds.add(line.id);
  }

  const recordingIds = new Set<string>();
  let audioBytes = 0;
  for (const recording of request.recordings) {
    requireBoundedString(recording?.id, 'Recording ID', 128);
    requireBoundedString(recording.filename, 'Recording filename', 255);
    if (recordingIds.has(recording.id)) throw new Error('Recording IDs must be unique.');
    recordingIds.add(recording.id);
    if (recording.notes !== undefined) {
      if (!Array.isArray(recording.notes) || recording.notes.length > 20) throw new Error('Recording notes must contain at most 20 entries.');
      for (const note of recording.notes) requireBoundedString(note, 'Recording note', 500);
    }
    if (recording.approved_by !== undefined) requireBoundedString(recording.approved_by, 'Approver', 200);
    if (Boolean(recording.audio_base64) !== Boolean(recording.mime_type)) throw new Error('Audio data and MIME type must be supplied together.');
    if (recording.mime_type && !allowedMimeTypes.has(recording.mime_type)) throw new Error('Unsupported audio MIME type.');
    if (recording.human_approved && !recording.approved_by) throw new Error('Approved recordings require an approver.');
    if (recording.audio_base64) {
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(recording.audio_base64)) throw new Error('Audio data must be valid base64.');
      const bytes = Math.floor((recording.audio_base64.length * 3) / 4);
      if (bytes > 8 * 1024 * 1024) throw new Error('A recording exceeds the 8 MiB limit.');
      audioBytes += bytes;
    }
  }
  if (audioBytes > 16 * 1024 * 1024) throw new Error('Combined audio exceeds the 16 MiB limit.');
  return request as LiveRequest;
}

export function buildGeminiContents(request: LiveRequest) {
  const inventory = request.recordings.map(({ id, filename, notes }) => ({ id, filename, notes: notes ?? [] }));
  const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [{
    text: [
      `Reconcile production dialogue evidence for actor ${request.actor.name}.`,
      `Required lines: ${JSON.stringify(request.required_lines)}`,
      `Recording inventory and sound notes: ${JSON.stringify(inventory)}`,
      'Return every plausible line-to-recording candidate. Omit pairs with no evidence.',
      'Never decide whether the actor can leave and never invent an ID.',
    ].join('\n\n'),
  }];
  for (const recording of request.recordings) {
    if (recording.audio_base64 && recording.mime_type) {
      parts.push({ text: `Audio bytes for recording ID ${recording.id}:` });
      parts.push({ inlineData: { data: recording.audio_base64, mimeType: recording.mime_type } });
    }
  }
  return [{ role: 'user', parts }];
}

export function parseCandidateBatch(text: string, request: LiveRequest): LiveCandidate[] {
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new Error('Gemini returned malformed structured output.'); }
  const candidates = (value as { candidates?: unknown[] })?.candidates;
  if (!Array.isArray(candidates)) throw new Error('Gemini response did not include a candidate list.');
  const lineIds = new Set(request.required_lines.map((line) => line.id));
  const recordingIds = new Set(request.recordings.map((recording) => recording.id));

  return candidates.map((raw) => {
    const candidate = raw as Partial<LiveCandidate>;
    if (!candidate.line_id || !lineIds.has(candidate.line_id) || !candidate.recording_id || !recordingIds.has(candidate.recording_id)) {
      throw new Error('Gemini returned an evidence ID outside the supplied inventory.');
    }
    if (typeof candidate.confidence !== 'number' || candidate.confidence < 0 || candidate.confidence > 1) throw new Error('Gemini returned an invalid confidence.');
    if (!['complete', 'partial'].includes(candidate.completeness ?? '')) throw new Error('Gemini returned invalid completeness.');
    if (!['verified', 'sound_check', 'missing'].includes(candidate.recommendation ?? '')) throw new Error('Gemini returned an invalid recommendation.');
    if (typeof candidate.transcript !== 'string' || typeof candidate.reasoning !== 'string' || !Array.isArray(candidate.concerns)) throw new Error('Gemini returned an invalid evidence candidate.');
    return candidate as LiveCandidate;
  });
}

export function evaluateLiveRelease(request: LiveRequest, candidates: LiveCandidate[]) {
  const unresolved_line_ids = request.required_lines
    .filter((line) => !candidates.some((candidate) => {
      const recording = request.recordings.find((item) => item.id === candidate.recording_id);
      return candidate.line_id === line.id
        && candidate.completeness === 'complete'
        && candidate.recommendation !== 'missing'
        && recording?.human_approved === true
        && Boolean(recording.approved_by);
    }))
    .map((line) => line.id);
  return {
    status: unresolved_line_ids.length === 0 ? 'clear' : 'hold',
    covered: request.required_lines.length - unresolved_line_ids.length,
    total: request.required_lines.length,
    unresolved_line_ids,
    rule: 'every required line needs a human-approved evidence path',
  };
}
