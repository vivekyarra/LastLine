import { describe, expect, it } from 'vitest';

import { evaluateLiveRelease, parseCandidateBatch, parseLiveRequest, type LiveCandidate } from '@/lib/live-analysis';

const request = parseLiveRequest({
  actor: { id: 'maya', name: 'Maya' },
  required_lines: [{ id: 'S12-L7', scene: '12', text: 'Because he followed you.' }],
  recordings: [{ id: 'WL-001', filename: 'wild.wav', notes: [], human_approved: false }],
});

const candidate: LiveCandidate = {
  line_id: 'S12-L7', recording_id: 'WL-001', confidence: 0.99, completeness: 'complete',
  transcript: 'Because he followed you.', concerns: [], recommendation: 'verified', reasoning: 'Complete semantic match.',
};

describe('live Gemini trust boundary', () => {
  it('keeps a 99% Gemini candidate on hold without human approval', () => {
    expect(evaluateLiveRelease(request, [candidate])).toMatchObject({ status: 'hold', unresolved_line_ids: ['S12-L7'] });
  });

  it('clears only when the matched recording carries named human approval', () => {
    const approved = { ...request, recordings: [{ ...request.recordings[0], human_approved: true, approved_by: 'Nora · Production Sound' }] };
    expect(evaluateLiveRelease(approved, [candidate])).toMatchObject({ status: 'clear', covered: 1 });
  });

  it('rejects model output that invents an evidence ID', () => {
    expect(() => parseCandidateBatch(JSON.stringify({ candidates: [{ ...candidate, recording_id: 'PHANTOM' }] }), request))
      .toThrow(/outside the supplied inventory/);
  });

  it('rejects duplicate request inventory IDs before model execution', () => {
    expect(() => parseLiveRequest({ ...request, recordings: [request.recordings[0], request.recordings[0]] }))
      .toThrow(/unique/);
  });

  it('bounds sound notes before they can inflate a model request', () => {
    expect(() => parseLiveRequest({
      ...request,
      recordings: [{ ...request.recordings[0], notes: ['x'.repeat(501)] }],
    })).toThrow(/at most 500 characters/);
  });

  it('bounds inventory identifiers before model execution', () => {
    expect(() => parseLiveRequest({
      ...request,
      recordings: [{ ...request.recordings[0], id: 'x'.repeat(129) }],
    })).toThrow(/Recording ID/);
  });
});
