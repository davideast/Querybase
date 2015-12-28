/// <reference path="../typings/firebase/firebase.d.ts" />

import {QuerybaseUtils} from "./QuerybaseUtils";
import {QuerybaseQuery} from "./QuerybaseQuery";
import {indexify} from "./QuerybaseIndex";

export class Querybase {
  
  ref: () => Firebase;
  indexOn: () => string[];
  key: () => string;
  
  private _: QuerybaseUtils;
  
  constructor(ref: Firebase, indexOn: string[]) {
    this._ = new QuerybaseUtils();
    this.ref = () => { return ref; }
    this.indexOn = () => { return indexOn };
    this.key = () => { return this.ref().key() };
    
    const indexes = indexify(indexOn, this._.arrayToObject(indexOn));
    this._warnAboutIndexOnRule(indexes);
  }
  
  set(data) {
    const dataWithIndex = indexify(this.indexOn(), data);
    this.ref().set(dataWithIndex);
  }

  update(data) {
    const dataWithIndex = indexify(this.indexOn(), data);
    this.ref().update(dataWithIndex);
  }

  push(data) {
    if (!data) { return this.ref().push() }
    
    const dataWithIndex = indexify(this.indexOn(), data);
    
    this.ref().push(dataWithIndex);
  }
  
  remove() {
    return this.ref().remove();
  }
  
  onDisconnect() {
    return this.ref().onDisconnect();
  }
  
  child(path, indexOn?: string[]) {
    return new Querybase(this.ref().child(path), indexOn || this.indexOn());
  }
  
  where(criteria): any {
    
    if (this._.isString(criteria)) {
      return new QuerybaseQuery(this.ref().orderByChild(criteria));
    } 
    
    const keys = this._.keys(criteria);
    const values = this._.values(criteria);
    
    // multiple criteria
    if (this._.hasMultipleCriteria(keys)) {
      
      //TODO: refactor _ 
      const criteriaIndex = "_" + keys.join('_');
      const criteriaValues = values.join('_');
      
      return this.ref().orderByChild(criteriaIndex).equalTo(criteriaValues); 
    }
    
    // single criteria 
    return this.ref().orderByChild(keys[0]).equalTo(values[0]);
  }
  
  private _warnAboutIndexOnRule(obj) {
    const indexKeys = this._.merge(obj, this._.arrayToObject(this.indexOn()));
    const _indexOnRule =  `
"${this._.getPathFromRef(this.ref())}": {
  "._indexOn": [${this._.keys(indexKeys).map((key) => { return `"${key}"`; }).join(", ")}]
}`;
    console.warn(`Add this rule to drastically improve performance of your Firebase queries: \n ${_indexOnRule}`);
  }

}