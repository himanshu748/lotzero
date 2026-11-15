import { z } from 'zod';
import type { Dataset, Scenario, Intervention } from '../contracts';
export const LIMITS = { nodes: 1000, edges: 3000, evidence: 3000, bytes: 200_000 } as const;
const id = z.string().min(1).max(96).regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]*$/);
const text = z.string().max(500);
const date = z.string().datetime({ offset: true });
const quantity = z.object({ value: z.number().finite().nonnegative().max(1e12), unit: z.enum(['kg','g','lb','l','ml','units']) }).strict();
const refs = z.array(id).max(30);
export const nodeSchema = z.object({id,kind:z.enum(['supplier','ingredient','batch','product','transformation','warehouse','shipment','destination']),label:text.min(1),evidence:refs,quantity:quantity.optional(),owner:text.optional(),sku:text.optional(),region:text.optional(),lotId:id.optional(),warehouseId:id.optional(),destinationId:id.optional(),occurredAt:date.optional(),state:z.enum(['planned','shipped','stock']).optional()}).strict();
export const edgeSchema = z.object({id,from:id,to:id,relation:z.enum(['supplies','consumes','produces','repackages','stores','ships','delivers']),certainty:z.enum(['confirmed','potential','unknown']),evidence:refs,quantity:quantity.optional()}).strict();
export const evidenceSchema = z.object({id,title:text.min(1),source:text.min(1),recordedAt:date}).strict();
export const datasetSchema = z.object({version:z.string().min(1).max(96),name:text.min(1),synthetic:z.boolean(),nodes:z.array(nodeSchema).min(1).max(LIMITS.nodes),edges:z.array(edgeSchema).max(LIMITS.edges),evidence:z.array(evidenceSchema).max(LIMITS.evidence)}).strict();
export const scenarioSchema = z.object({sourceLotId:id,hazard:z.enum(['contamination','mislabeling','allergen']),at:date,assertions:z.array(z.enum(['ingredient-origin','shipment-destination','warehouse-owner','quarantine-evidence','shipment-lot'])).min(1).max(5).refine(v=>new Set(v).size===v.length,'Duplicate assertion')}).strict();
export const interventionSchema = z.object({id,type:z.enum(['quarantine','hold','investigate','assign-owner']),targetId:id,at:date,evidence:refs,owner:text.optional()}).strict();
export function validateDataset(input: unknown): Dataset {
  const serialized = JSON.stringify(input);
  if (!serialized || new TextEncoder().encode(serialized).length > LIMITS.bytes) throw new Error(`Dataset exceeds ${LIMITS.bytes} UTF-8 bytes`);
  return datasetSchema.parse(input) as Dataset;
}
export const validateScenario = (input: unknown): Scenario => scenarioSchema.parse(input);
export const validateInterventions = (input: unknown): Intervention[] => z.array(interventionSchema).max(30).refine(v=>new Set(v.map(x=>x.id)).size===v.length,'Duplicate intervention IDs').parse(input);
