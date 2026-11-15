import {syntheticDataset} from '../../fixtures/synthetic/dataset';
import {stable} from '../graph/core';

/** A synthetic label alone is not permission to replace or run unrelated records. */
export function isNorthstarSample(value: unknown): boolean {
  return stable(value) === stable(syntheticDataset);
}
