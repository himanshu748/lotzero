import type {Dataset} from '../../src/contracts';

/** A shallow material graph; scale fixtures never bypass the production parser. */
export function scaleDataset(count: number): Dataset {
  const dataset: Dataset = {name: 'Synthetic scale fixture', version: `scale-${count}`, synthetic: true, nodes: [{id: 'I', kind: 'ingredient', label: 'Source', evidence: ['E']}], edges: [], evidence: [{id: 'E', title: 'Synthetic record', source: 'Generated scale fixture', recordedAt: '2026-10-28T09:00:00Z'}]};
  for (let i = 1; i < count; i++) {
    dataset.nodes.push({id: `N${i}`, kind: i === 1 ? 'batch' : 'product', label: `Record ${i}`, evidence: ['E']});
    dataset.edges.push({id: `R${i}`, from: i === 1 ? 'I' : 'N1', to: `N${i}`, relation: i === 1 ? 'consumes' : 'produces', certainty: 'confirmed', evidence: ['E']});
  }
  return dataset;
}
