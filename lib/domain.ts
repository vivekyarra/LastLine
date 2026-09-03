export type EvidenceRecommendation = 'verified' | 'sound_check' | 'missing';

export type EvidencePath = {
  id: string;
  recordingId: string;
  confidence: number;
  completeness: 'complete' | 'partial';
  concerns: string[];
  recommendation: EvidenceRecommendation;
  approvedBy?: string;
  approvedAt?: string;
};

export type RequiredLine = {
  id: string;
  actorId: string;
  scene: string;
  text: string;
  evidence: EvidencePath[];
};

export type ReleaseDecision = {
  status: 'hold' | 'clear';
  covered: number;
  total: number;
  unresolvedLineIds: string[];
};

export type DemoStage = 'hold' | 'recording' | 'review' | 'clear';
