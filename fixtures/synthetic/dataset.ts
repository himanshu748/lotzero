import type { Dataset, RecordNode, RecordEdge } from '../../src/contracts';
const at='2026-10-27T08:00:00Z';
const n=(id:string,kind:RecordNode['kind'],label:string,extra:Partial<RecordNode>={}):RecordNode=>({id,kind,label,evidence:['EV-MASTER'],...extra});
const e=(id:string,from:string,to:string,relation:RecordEdge['relation'],extra:Partial<RecordEdge>={}):RecordEdge=>({id,from,to,relation,certainty:'confirmed',evidence:['EV-MASTER'],...extra});
export const syntheticDataset:Dataset={version:'synthetic-v1',name:'Northstar Foods · autumn production',synthetic:true,evidence:[
 {id:'EV-MASTER',title:'Synthetic production and dispatch register',source:'LotZero synthetic fixture; not a real business record',recordedAt:at},
 {id:'EV-RECEIPT',title:'Synthetic ingredient intake record',source:'Receiving register R-104',recordedAt:at},
 {id:'EV-DRILL',title:'Synthetic rehearsal control authorization',source:'Training-only mock recall procedure D-07',recordedAt:'2026-10-28T09:00:00Z'},
 {id:'EV-REPAIR',title:'Synthetic corrected genealogy and destination register',source:'Fixture version 2 repair evidence',recordedAt:'2026-10-28T09:00:00Z'}
],nodes:[
 n('SUP-01','supplier','Aster Grain Cooperative'),n('SUP-02','supplier','Cedar Seed Works'),n('SUP-03','supplier','Meadow Ingredients'),
 ...['ING-A19','ING-A20','ING-B01','ING-B02','ING-C01','ING-C02','ING-D01','ING-D02','ING-E01','ING-E02','ING-F01','ING-F02'].map((id,i)=>n(id,'ingredient',['Toasted sesame · A19','Toasted sesame · A20','Rolled oats · B01','Rolled oats · B02','Cocoa · C01','Cocoa · C02','Sunflower oil · D01','Sunflower oil · D02','Rice flour · E01','Rice flour · E02','Cane sugar · F01','Cane sugar · F02'][i],{quantity:{value:100,unit:'kg'},evidence:['EV-RECEIPT']})),
 n('BATCH-101','batch','Sesame oat bar blend'),n('BATCH-102','batch','Sesame cracker blend'),n('BATCH-900','batch','Cocoa oat bar blend'),n('BATCH-404','batch','Unresolved production batch'),
 n('FG-101','product','Sesame oat bars · lot 101',{sku:'BAR-SES',quantity:{value:240,unit:'kg'},state:'stock'}),n('FG-102','product','Sesame crackers · lot 102',{sku:'CRK-SES',quantity:{value:120,unit:'kg'},state:'stock'}),n('FG-900','product','Cocoa oat bars · lot 900',{sku:'BAR-COC',quantity:{value:90,unit:'kg'},state:'stock'}),n('FG-404','product','Unresolved snack lot 404',{sku:'MIX-UNK',quantity:{value:40,unit:'kg'},state:'stock'}),
 n('PACK-201','transformation','Mixed snack repack · line 2'),n('FG-201','product','Mixed snack cases · lot 201',{sku:'CASE-MIX',quantity:{value:80,unit:'kg'},state:'stock'}),
 n('WH-NORTH','warehouse','North distribution centre',{region:'North',owner:'Quality lead — North'}),n('WH-SOUTH','warehouse','South distribution centre',{region:'South'}),n('WH-WEST','warehouse','West reserve warehouse',{region:'West',owner:'Quality lead — West'}),
 n('DEST-01','destination','Synthetic retailer · North'),n('DEST-02','destination','Synthetic retailer · South'),n('DEST-03','destination','Synthetic retailer · West'),
 n('SHIP-001','shipment','Dispatched · North retailer',{lotId:'FG-101',warehouseId:'WH-NORTH',destinationId:'DEST-01',occurredAt:'2026-10-27T12:00:00Z',state:'shipped',quantity:{value:120,unit:'kg'}}),
 n('SHIP-002','shipment','Scheduled · destination missing',{lotId:'FG-101',warehouseId:'WH-NORTH',occurredAt:'2026-10-29T12:00:00Z',state:'planned',quantity:{value:80000,unit:'g'}}),
 n('SHIP-003','shipment','Scheduled · mixed case dispatch',{warehouseId:'WH-SOUTH',destinationId:'DEST-02',occurredAt:'2026-10-30T12:00:00Z',state:'planned',quantity:{value:50,unit:'kg'}}),
 n('SHIP-004','shipment','Scheduled · ambiguous cracker lot',{lotId:'FG-102',warehouseId:'WH-SOUTH',destinationId:'DEST-02',occurredAt:'2026-10-31T12:00:00Z',state:'planned',quantity:{value:20,unit:'units'}}),
 n('SHIP-900','shipment','Cocoa bars · separate genealogy',{lotId:'FG-900',warehouseId:'WH-NORTH',destinationId:'DEST-03',occurredAt:'2026-10-29T12:00:00Z',state:'planned',quantity:{value:90,unit:'kg'}}),
 n('SHIP-404','shipment','Unresolved genealogy dispatch',{lotId:'FG-404',warehouseId:'WH-WEST',destinationId:'DEST-03',occurredAt:'2026-10-29T12:00:00Z',state:'planned',quantity:{value:40,unit:'kg'}})
],edges:[
 ...['ING-A19','ING-A20','ING-B01','ING-B02','ING-C01','ING-C02','ING-D01','ING-D02','ING-E01','ING-E02','ING-F01','ING-F02'].map((id,i)=>e(`SUPPLY-${id}`,`SUP-0${i%3+1}`,id,'supplies',{evidence:['EV-RECEIPT']})),
 e('USE-A19-101','ING-A19','BATCH-101','consumes',{quantity:{value:30,unit:'kg'}}),e('USE-B01-101','ING-B01','BATCH-101','consumes',{quantity:{value:100,unit:'kg'}}),
 e('USE-A19-102','ING-A19','BATCH-102','consumes',{certainty:'potential'}),e('USE-E01-102','ING-E01','BATCH-102','consumes'),
 e('USE-C01-900','ING-C01','BATCH-900','consumes'),e('USE-B02-900','ING-B02','BATCH-900','consumes'),e('USE-MISSING-404','ING-Z99','BATCH-404','consumes'),
 e('MAKE-101','BATCH-101','FG-101','produces'),e('MAKE-102','BATCH-102','FG-102','produces'),e('MAKE-900','BATCH-900','FG-900','produces'),e('MAKE-404','BATCH-404','FG-404','produces'),
 e('PACK-101','FG-101','PACK-201','repackages'),e('PACK-102','FG-102','PACK-201','repackages'),e('MAKE-201','PACK-201','FG-201','produces'),
 e('STOCK-101','FG-101','WH-NORTH','stores',{quantity:{value:120,unit:'kg'}}),e('STOCK-102','FG-102','WH-SOUTH','stores',{quantity:{value:120,unit:'kg'}}),e('STOCK-201','FG-201','WH-SOUTH','stores',{quantity:{value:80,unit:'kg'}}),e('STOCK-900','FG-900','WH-NORTH','stores',{quantity:{value:90,unit:'kg'}}),e('STOCK-404','FG-404','WH-WEST','stores',{quantity:{value:40,unit:'kg'}}),
 e('DISPATCH-001','FG-101','SHIP-001','ships'),e('DISPATCH-002','FG-101','SHIP-002','ships'),e('DISPATCH-003','FG-201','SHIP-003','ships'),e('DISPATCH-004','FG-102','SHIP-004','ships'),e('DISPATCH-900','FG-900','SHIP-900','ships'),e('DISPATCH-404','FG-404','SHIP-404','ships'),
 e('DELIVER-001','SHIP-001','DEST-01','delivers'),e('DELIVER-003','SHIP-003','DEST-02','delivers'),e('DELIVER-004','SHIP-004','DEST-02','delivers'),e('DELIVER-900','SHIP-900','DEST-03','delivers'),e('DELIVER-404','SHIP-404','DEST-03','delivers'),
 e('SUPPLY-ING-F02','SUP-03','ING-F02','supplies',{evidence:['EV-RECEIPT']})
]};
export const repairedDataset:Dataset={...syntheticDataset,version:'synthetic-v2',nodes:[...syntheticDataset.nodes.map(node=>node.id==='SHIP-002'?{...node,destinationId:'DEST-01'}:node.id==='SHIP-003'?{...node,lotId:'FG-201'}:node.id==='WH-SOUTH'?{...node,owner:'Quality lead — South'}:node)],edges:[...syntheticDataset.edges.filter((edge,index,all)=>all.findIndex(x=>x.id===edge.id)===index).map(edge=>edge.id==='USE-A19-102'?{...edge,certainty:'confirmed' as const,evidence:['EV-REPAIR']}:edge.id==='USE-MISSING-404'?{...edge,from:'ING-E02',evidence:['EV-REPAIR']}:edge),e('DELIVER-002','SHIP-002','DEST-01','delivers',{evidence:['EV-REPAIR']})]};
