export interface Store {
  get<T>(key:string):Promise<T|undefined>;
  set(key:string,value:unknown,ttlDays?:number):Promise<void>;
  claim(key:string,value:unknown):Promise<boolean>;
  delete(key:string):Promise<void>;
  list<T>(prefix:string):Promise<{key:string;value:T}[]>;
  deletePrefix(prefix:string,except?:string[]):Promise<void>;
}
