import { describe, expect, it } from 'vitest';

import type { RequiredLine } from '@/lib/domain';
import { evaluateRelease } from '@/lib/release-policy';

const base: RequiredLine = {
  id: 'S12-L7',
  scene: '12',
  actorId: 'maya-chen',
  text: 'Because he followed you.',
  evidence: [],
};

describe('release policy', () => {
  it('fails closed when no release obligations are supplied', () => {
    expect(evaluateRelease([])).toEqual({
      status: 'hold',
      covered: 0,
      total: 0,
      unresolvedLineIds: [],
    });
  });

  it('holds when a required line has no evidence', () => {
    expect(evaluateRelease([base])).toMatchObject({
      status: 'hold',
      covered: 0,
      unresolvedLineIds: ['S12-L7'],
    });
  });

  it('does not allow high model confidence to clear an actor', () => {
    const result = evaluateRelease([{ ...base, evidence: [{
      id: 'e-1',
      recordingId: 'A007-T004',
      confidence: 0.999,
      completeness: 'complete',
      recommendation: 'verified',
      concerns: [],
    }] }]);
    expect(result.status).toBe('hold');
  });

  it('holds when evidence is incomplete even if a human approved it', () => {
    const result = evaluateRelease([{ ...base, evidence: [{
      id: 'e-2',
      recordingId: 'A007-T004',
      confidence: 0.99,
      completeness: 'partial',
      recommendation: 'sound_check',
      concerns: ['clipped ending'],
      approvedBy: 'Nora Patel',
    }] }]);
    expect(result.status).toBe('hold');
  });

  it('clears only with a complete human-approved evidence path', () => {
    const result = evaluateRelease([{ ...base, evidence: [{
      id: 'e-3',
      recordingId: 'WL-001',
      confidence: 0.98,
      completeness: 'complete',
      recommendation: 'verified',
      concerns: [],
      approvedBy: 'Nora Patel',
    }] }]);
    expect(result).toMatchObject({ status: 'clear', covered: 1, total: 1, unresolvedLineIds: [] });
  });

  it('keeps the release gate closed if any one of several lines is unresolved', () => {
    const approved = {
      id: 'e-4',
      recordingId: 'A001-T001',
      confidence: 0.97,
      completeness: 'complete' as const,
      recommendation: 'verified' as const,
      concerns: [],
      approvedBy: 'Nora Patel',
    };
    const result = evaluateRelease([
      { ...base, id: 'S12-L5', evidence: [approved] },
      base,
    ]);
    expect(result).toMatchObject({ status: 'hold', covered: 1, total: 2, unresolvedLineIds: ['S12-L7'] });
  });
});
