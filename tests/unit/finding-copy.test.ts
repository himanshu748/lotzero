import {it,expect} from 'vitest';
import {findingTitle,findingPopulation,hazardLabel,utcLabel,quantityLabel} from '../../static/lotzero-ui/src/finding-copy';
it('states the gap and review population without changing the underlying result',()=>{
 const input={id:'shipment-destination' as const,title:'Every affected shipment has a recorded destination',status:'FAIL' as const,checked:4,passed:3};
 expect(findingTitle(input)).toBe('Shipment destination missing');
 expect(findingPopulation(input)).toBe('1 of 4 records need review');
 expect(input.title).toBe('Every affected shipment has a recorded destination');
});
it('does not call unknown or empty evidence a pass',()=>{
 expect(findingTitle({id:'ingredient-origin',status:'UNKNOWN',title:'origin'})).toBe('Ingredient origins need evidence');
 expect(findingPopulation({checked:5,passed:2,status:'UNKNOWN'})).toBe('3 of 5 records need review');
 expect(findingPopulation({checked:0,passed:0,status:'UNKNOWN'})).toBe('No applicable records to check');
});
it('formats case values for reading without changing stored data',()=>{
 expect(hazardLabel('contamination')).toBe('Contamination');
 expect(utcLabel('2026-10-28T09:00:00.000Z')).toBe('28 Oct 2026, 09:00 UTC');
 expect(utcLabel('2026-10-28T09:00:30Z')).toBe('28 Oct 2026, 09:00:30 UTC');
 expect(utcLabel('not-a-date')).toBe('not-a-date');
 expect(quantityLabel({value:80000,unit:'g'})).toBe('80,000 g');
 expect(quantityLabel({value:0.0004,unit:'kg'})).toBe('0.0004 kg');
});
