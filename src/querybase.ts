/// <reference path="../typings/firebase/firebase.d.ts" />

import QuerybaseUtils from "./QuerybaseUtils";
import QuerybaseQuery from "./QuerybaseQuery";

export default class Querybase {
  
  ref: () => Firebase;
  indexOn: () => string[];
  key: () => string;
  
  private _: QuerybaseUtils;
  
  constructor(ref: Firebase, indexOn: string[]) {
    this._ = new QuerybaseUtils();
    this.ref = () => { return ref; }
    this.indexOn = () => { return indexOn };
    this.key = () => { return this.ref().key() };
    
    const indexes = this._createIndexes(indexOn, this._.arrayToObject(indexOn));
    this._warnAboutIndexOnRule(indexes);
  }
  
  set(data) {
    const dataWithIndex = this._indexData(this.indexOn(), data);
    this.ref().set(dataWithIndex);
  }

  update(data) {
    const dataWithIndex = this._indexData(this.indexOn(), data);
    this.ref().update(dataWithIndex);
  }

  push(data) {
    if (!data) { return this.ref().push() }
    const dataWithIndex = this._indexData(this.indexOn(), data);
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
  
  private _createIndexes(properties: any[], data: any, indexHash?: any) {
    // create a copy of the array to not modifiy the original properties
    const propCop = properties.slice();
    // remove the first property, this ensures no redundant keys are created (age_name vs. name_age)
    const mainProp = propCop.shift()
    // recursive check for the indexHash
    indexHash = indexHash || {};

    propCop.forEach((prop) => {
      var propString = "";
      var valueString = "";
      
      // first level keys
      indexHash["_" + this._.createKey(mainProp, prop)] = this._.createKey(data[mainProp], data[prop]);

      // create indexes for all property combinations
      propCop.forEach((subProp) => {
        propString = this._.createKey(propString, subProp);
        valueString = this._.createKey(valueString, data[subProp]);
      });
      
      indexHash["_" + mainProp + propString] = data[mainProp] + valueString;
      
    });

    if (propCop.length !== 0) {
      this._createIndexes(propCop, data, indexHash);
    }

    return indexHash;
  }
  
  private _addIndexToData(_indexOn, data) {
    const indexes = this._createIndexes(_indexOn, data);
    const merged = this._.merge(data, indexes);
    return merged;
  }
  
  private _indexData(_indexOn, data) {
    const indexes = this._createIndexes(_indexOn, data);
    const merged = this._.merge(data, indexes);
    return merged;
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