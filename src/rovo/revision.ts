import type { Snapshot } from '../contracts';
import { stable } from '../graph/core';

/** A content revision, not an authentication token or digital signature. */
export function rehearsalRevisionInput(snapshot: Snapshot): string {
  return stable({
    snapshotId: snapshot.id,
    savedAt: snapshot.createdAt,
    dataset: snapshot.dataset,
    scenario: snapshot.result.scenario,
    interventions: snapshot.result.interventions,
  });
}

export const ANALYST_KEY = 'lotzero-recall-analyst';
export const ANALYST_NAME = 'Recall rehearsal analyst';
