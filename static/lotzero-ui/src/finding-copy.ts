import type {AssertionResult} from '../../../src/contracts';

// Presentation only: stored assertion titles, result hashes and action IDs stay intact.
export function findingTitle(a: Pick<AssertionResult,'id'|'status'|'title'>): string {
  const titles: Record<AssertionResult['id'], Record<AssertionResult['status'], string>> = {
    'shipment-destination': {FAIL:'Shipment destination missing', UNKNOWN:'Shipment destinations need evidence', PASS:'Shipment destinations recorded'},
    'ingredient-origin': {FAIL:'Ingredient origin check failed', UNKNOWN:'Ingredient origins need evidence', PASS:'Ingredient origins recorded'},
    'warehouse-owner': {FAIL:'Warehouse response owner missing', UNKNOWN:'Warehouse owners need evidence', PASS:'Warehouse response owners recorded'},
    'quarantine-evidence': {FAIL:'Simulated hold is missing evidence', UNKNOWN:'No evidenced hold to evaluate', PASS:'Simulated hold has evidence'},
    'shipment-lot': {FAIL:'Shipment lot identifier missing or conflicting', UNKNOWN:'Shipment lot identifiers need evidence', PASS:'Shipment lot identifiers recorded'},
  };
  return titles[a.id]?.[a.status] ?? a.title;
}
export function findingPopulation(a: Pick<AssertionResult,'checked'|'passed'|'status'>): string {
  if (!a.checked) return 'No applicable records to check';
  if (a.status === 'PASS') return `${a.passed} of ${a.checked} records meet this check`;
  return `${a.checked-a.passed} of ${a.checked} records need review`;
}
const HAZARD_LABELS: Record<string, string> = {contamination:'Contamination', mislabeling:'Mislabeling', allergen:'Allergen'};
export function hazardLabel(hazard: string): string {
  return HAZARD_LABELS[hazard] ?? hazard;
}
export function utcLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toLocaleString('en-GB', {timeZone:'UTC', day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hourCycle:'h23'})} UTC`;
}
export function quantityLabel(q: {value: number; unit: string}): string {
  return `${q.value.toLocaleString('en-GB', {maximumFractionDigits:20})} ${q.unit}`;
}
