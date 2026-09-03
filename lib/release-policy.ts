import type { ReleaseDecision, RequiredLine } from '@/lib/domain';

/**
 * The release gate is deliberately model-free. Gemini may propose evidence,
 * but only an explicitly approved evidence path can satisfy a required line.
 */
export function evaluateRelease(lines: RequiredLine[]): ReleaseDecision {
  if (lines.length === 0) {
    return { status: 'hold', covered: 0, total: 0, unresolvedLineIds: [] };
  }

  const unresolvedLineIds = lines
    .filter((line) => !line.evidence.some((path) =>
      Boolean(path.approvedBy)
      && path.completeness === 'complete'
      && path.recommendation !== 'missing',
    ))
    .map((line) => line.id);

  return {
    status: unresolvedLineIds.length === 0 ? 'clear' : 'hold',
    covered: lines.length - unresolvedLineIds.length,
    total: lines.length,
    unresolvedLineIds,
  };
}
