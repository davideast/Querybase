/// <reference path="../typings/firebase/firebase.d.ts" />

class QuerybaseUtils {
  
  codeify(key: string): number {
    return parseInt(key.split('').map((char) => { return char.charCodeAt(0) } ).join(''), 10);
	}
  
  isString(value): boolean {
    return typeof value === 'string' || value instanceof String;
  }
  
  hasMultipleCriteria(criteriaKeys) {
    return criteriaKeys.length > 1;
  }
  
  createKey(propOne, propTwo) {
    return `${propOne}_${propTwo}`;
  }
  
  getPathFromRef(ref): string {
    const PATH_POSITION = 3;
    var pathArray = ref.toString().split('/');
    return pathArray.slice(PATH_POSITION, pathArray.length).join('/');
  }  
  
  merge(obj1, obj2) {
    var mergedHash = {};
    for (var prop in obj1) { 
      mergedHash[prop] = obj1[prop]; 
    }
    for (var prop in obj2) { 
      mergedHash[prop] = obj2[prop]; 
    }
    return mergedHash;
  }
  
  keys(obj) {
    return Object.keys(obj);
  }
  
  values(obj) {
    return Object.keys(obj).map(key => { return obj[key]; });
  }
  
  arrayToObject(arr: any[]) {
    var hash = {};
    arr.forEach((item) => hash[item] = item);
    return hash;
  }
  
  sortLexicographically(prop) {
   return function(a,b){ return a[prop].localeCompare(b[prop]); };
  }
  
  stripKeys(obj, keyStrip = "_") {
    var copy = Object.create(obj);
    this.keys(copy).forEach((key) => { if (key.substr(0, 1) === keyStrip) { delete copy[key] } });
  }
  
}

class QuerybaseQuery {
  query: FirebaseQuery;
  
  constructor(query) {
    this.query = query;
  }
  
  lessThan(value) {
    return new QuerybaseQuery(this.query.endAt(value));
  }
  
  greaterThan(value) {
    return this.query.startAt(value);
  }
  
  equalTo(value) {
    return this.query.equalTo(value);
  }
  
  on(event, callback, cancel?, context?) {
    this.query.on(event, callback, cancel, context)
  }
  
}

class Querybase {
  
  ref: Firebase;
  schema: any;
  private _: QuerybaseUtils;
  private _path: string;
  
  constructor(ref: Firebase, schema: any) {
    this._ = new QuerybaseUtils();
    this.ref = ref;
    this._path = this._.getPathFromRef(ref);
    this.schema = schema;
    var indexes = this._createIndexes(schema, this._.arrayToObject(schema));
    this._warnAboutIndexOnRule(indexes);
  }

  set(data) {
    var dataWithIndex = this._indexData(this.schema, data, this.ref.key());
    this.ref.set(dataWithIndex);
  }

  update(data) {
    var dataWithIndex = this._indexData(this.schema, data, this.ref.key());
    this.ref.update(dataWithIndex);
  }

  push(data) {
    const dataWithIndex = this._indexData(this.schema, data, this.ref.push().key());
    this.ref.parent().update(dataWithIndex);
  }
  
  remove() {
    return this.ref.remove();
  }
  
  onDisconnect() {
    return this.ref.onDisconnect();
  }
  
  where(criteria): any {
    
    if (this._.isString(criteria)) {
      return new QuerybaseQuery(this.ref.orderByChild(criteria));
    } 
    
    const keys = this._.keys(criteria);
    const values = this._.values(criteria);
    
    // multiple criteria
    if (this._.hasMultipleCriteria(keys)) {
      
      //TODO: refactor _ 
      const criteriaIndex = "_" + keys.join('_');
      const criteriaValues = values.join('_');
      
      return this.ref.orderByChild(criteriaIndex).equalTo(criteriaValues); 
    }
    
    // single criteria 
    return this.ref.orderByChild(keys[0]).equalTo(values[0]);
  }
  
  private _createIndexes(properties: any[], data: any, indexHash?: any) {
    // create a copy of the array to not modifiy the original properties
    var propCop = properties.slice();
    // remove the first property, this ensures no redundant keys are created (age_name vs. name_age)
    var mainProp = propCop.shift()
    // recursive check for the indexHash
    var indexHash = indexHash || {};

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
  
  private _addIndexToData(schema, data) {
    var indexes = this._createIndexes(schema, data);
    var merged = this._.merge(data, indexes);
    return merged;
  }
  
  private _indexData(schema, data, key: string) {
    const indexes = this._createIndexes(schema, data);
    var merged = this._.merge(data, indexes);
        
    var fanoutHash = {};
    fanoutHash[`${this._path}/${key}`] = merged;
    
    return fanoutHash;
  }
  
  private _warnAboutIndexOnRule(obj) {
    var indexKeys = this._.merge(obj, this._.arrayToObject(this.schema));
    var indexOnRule =  `
"${this._.getPathFromRef(this.ref)}": {
  ".indexOn": [${this._.keys(indexKeys).map((key) => { return `"${key}"`; }).join(", ")}]
}`;
    console.warn(`Add this rule to improve performance of your Firebase queries: \n ${indexOnRule}`);
  }

}
