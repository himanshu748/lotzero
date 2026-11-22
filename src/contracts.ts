export type Kind = 'supplier' | 'ingredient' | 'batch' | 'product' | 'transformation' | 'warehouse' | 'shipment' | 'destination';
export type Certainty = 'confirmed' | 'potential' | 'unknown';
export type Unit = 'kg' | 'g' | 'lb' | 'l' | 'ml' | 'units';
export interface Quantity { value: number; unit: Unit }
export interface RecordNode {
  id: string; kind: Kind; label: string; evidence: string[];
  quantity?: Quantity; owner?: string; sku?: string; region?: string;
  lotId?: string; warehouseId?: string; destinationId?: string;
  occurredAt?: string; state?: 'planned' | 'shipped' | 'stock';
}
export interface RecordEdge {
  id: string; from: string; to: string;
  relation: 'supplies' | 'consumes' | 'produces' | 'repackages' | 'stores' | 'ships' | 'delivers';
  certainty: Certainty; evidence: string[]; quantity?: Quantity;
}
export interface Evidence { id: string; title: string; source: string; recordedAt: string }
export interface Dataset { version: string; name: string; synthetic: boolean; nodes: RecordNode[]; edges: RecordEdge[]; evidence: Evidence[] }
export type AssertionId = 'ingredient-origin' | 'shipment-destination' | 'warehouse-owner' | 'quarantine-evidence' | 'shipment-lot';
export interface Scenario { sourceLotId: string; hazard: 'contamination' | 'mislabeling' | 'allergen'; at: string; assertions: AssertionId[] }
export interface Gap { id: string; code: string; message: string; recordIds: string[]; evidence: string[] }
export interface TraceEntry { nodeId: string; certainty: Certainty; path: string[]; edgeIds: string[]; evidence: string[] }
export interface AssertionResult { id: AssertionId; title: string; status: 'PASS' | 'FAIL' | 'UNKNOWN'; checked: number; passed: number; counterexamples: Gap[] }
export interface Intervention { id: string; type: 'quarantine' | 'hold' | 'investigate' | 'assign-owner'; targetId: string; at: string; evidence: string[]; owner?: string }
export interface Simulation { historicalShipmentIds: string[]; preventableShipmentIds: string[]; remainingShipmentIds: string[]; notes: string[] }
export interface DrillResult {
  id: string; fingerprint: string; datasetVersion: string; scenario: Scenario;
  trace: TraceEntry[]; gaps: Gap[]; assertions: AssertionResult[];
  affectedProductIds: string[]; affectedShipmentIds: string[]; warehouseIds: string[]; unknownRecordIds: string[];
  quantities: {unit: string; value: number; recordIds: string[]}[];
  interventions: Intervention[]; simulation: Simulation;
}
export interface JiraAction { id: string; summary: string; description: string; recordIds: string[]; evidence: string[]; issueKey?: string; issueUrl?: string; status?: 'created' | 'uncertain' | 'failed'; error?: string; evidenceComment?: 'posted' | 'uncertain' }
export interface Snapshot { id: string; createdAt: string; initiator: string; dataset: Dataset; result: DrillResult; actions: JiraAction[] }
export interface Comparison { improved: string[]; regressed: string[]; unchanged: string[]; addedShipments: string[]; removedShipments: string[] }
export interface Project { id: string; key: string; name: string }
export interface Bootstrap { dataset: Dataset | null; snapshots: Snapshot[]; mode: 'forge' | 'local'; project?: Project; audit: {at: string; actor: string; event: string}[] }
export const DEFAULT_ASSERTIONS: AssertionId[] = ['ingredient-origin','shipment-destination','warehouse-owner','quarantine-evidence','shipment-lot'];
