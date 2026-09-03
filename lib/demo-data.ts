import type { EvidencePath, RequiredLine } from '@/lib/domain';

const approved = (id: string, recordingId: string): EvidencePath => ({
  id,
  recordingId,
  confidence: 0.96,
  completeness: 'complete',
  concerns: [],
  recommendation: 'verified',
  approvedBy: 'Nora Patel · Production Sound',
  approvedAt: '2026-09-02T19:42:00Z',
});

export const demoLines: RequiredLine[] = [
  { id: 'S12-L3', actorId: 'maya-chen', scene: '12', text: 'I never said I trusted him.', evidence: [approved('EV-001', 'A007-T001')] },
  { id: 'S12-L5', actorId: 'maya-chen', scene: '12', text: 'You heard what you wanted.', evidence: [approved('EV-002', 'A007-T003')] },
  {
    id: 'S12-L7',
    actorId: 'maya-chen',
    scene: '12',
    text: 'Because he followed you.',
    evidence: [
      { id: 'EV-003', recordingId: 'A007-T002', confidence: 0.91, completeness: 'complete', concerns: ['aircraft_noise'], recommendation: 'sound_check' },
      { id: 'EV-004', recordingId: 'A007-T004', confidence: 0.78, completeness: 'complete', concerns: ['possible_background_noise'], recommendation: 'sound_check' },
      { id: 'EV-005', recordingId: 'A007-T007', confidence: 0.43, completeness: 'partial', concerns: ['interrupted'], recommendation: 'missing' },
    ],
  },
  { id: 'S14-L2', actorId: 'maya-chen', scene: '14', text: 'Then we leave before dawn.', evidence: [approved('EV-006', 'A011-T002')] },
  { id: 'S14-L9', actorId: 'maya-chen', scene: '14', text: 'No. We finish this here.', evidence: [approved('EV-007', 'A011-T006')] },
];

export const approvedWildPath: EvidencePath = {
  id: 'EV-WL-001',
  recordingId: 'WL-MAYA-S12-L7-001',
  confidence: 0.98,
  completeness: 'complete',
  concerns: [],
  recommendation: 'verified',
  approvedBy: 'Nora Patel · Production Sound',
  approvedAt: '2026-09-02T20:18:20Z',
};

export function linesForApproval(approvedWild: boolean): RequiredLine[] {
  if (!approvedWild) return demoLines;
  return demoLines.map((line) => line.id === 'S12-L7' ? { ...line, evidence: [...line.evidence, approvedWildPath] } : line);
}
