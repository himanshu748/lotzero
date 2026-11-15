import type { Quantity } from '../contracts';
export function normalizeQuantity(q:Quantity):{unit:string;value:number}{
  const [unit,factor]=({g:['kg',0.001],kg:['kg',1],lb:['kg',0.45359237],ml:['l',0.001],l:['l',1],units:['units',1]} as const)[q.unit];
  return {unit,value:q.value*factor};
}
