/// <reference path="../typings/firebase/firebase.d.ts" />

class QuerybaseUtils {
  
  codeify(key: string): string {
    return key.split('').map((char) => { return char.charCodeAt(0) } ).join('');
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
  
  values(obj) {
    return Object.keys(obj).map(key => { return obj[key]; });
  }
  
  arrayToObject(arr: any[]) {
    var hash = {};
    arr.forEach((item) => hash[item] = item);
    return hash;
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
  _: QuerybaseUtils;
  
  constructor(ref: Firebase, schema: any) {
    this.ref = ref;
    this.schema = schema;
    this._ = new QuerybaseUtils();
    var indexes = this._createIndexes(schema, this._.arrayToObject(schema));
    this._warnAboutIndexOnRule(indexes);
  }

  set(data) {
    var dataWithIndex = this._addIndexToData(this.schema, data);
    this.ref.set(dataWithIndex);
  }

  update(data) {
    var dataWithIndex = this._addIndexToData(this.schema, data);
    this.ref.update(dataWithIndex);
  }

  push(data) {
    const dataWithIndex = this._indexData(this.schema, data);
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
    
    const keys = Object.keys(criteria);
    const values = this._.values(criteria);
    
    // multiple criteria
    if (this._.hasMultipleCriteria(keys)) {
      var criteriaIndex = keys.join('_');
      var criteriaValues = values.join('_');
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

      indexHash[this._.createKey(mainProp, prop)] = this._.createKey(data[mainProp], data[prop]);

      propCop.forEach((subProp) => {
        propString = this._.createKey(propString, subProp);
        valueString = this._.createKey(valueString, data[subProp]);
      });
      
      indexHash[mainProp + propString] = data[mainProp] + valueString;
      
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
  
  private _indexData(schema, data) {
    var indexes = this._createIndexes(schema, data);
    const merged = this._.merge(data, indexes);

    const pushRef = this.ref.push();
    const path = this._.getPathFromRef(this.ref);
    
    var indexHash = {};
    Object.keys(indexes).forEach((index) => {
      indexHash[`${path}_index/${index}/${this._.codeify(indexes[index])}`] = merged;
    });
    
    var fanoutHash = {};
    fanoutHash[`${path}/${pushRef.key()}`] = merged;
    
    return this._.merge(fanoutHash, indexHash);
  }
  
  private _warnAboutIndexOnRule(obj) {
    var indexKeys = this._.merge(obj, this._.arrayToObject(this.schema));
    var indexOnRule =  `
"${this._.getPathFromRef(this.ref)}": {
  ".indexOn": [${Object.keys(indexKeys).map((key) => { return `"${key}"`; }).join(", ")}]
}`;
    console.warn(`Add this rule to improve performance of your Firebase queries: \n ${indexOnRule}`);
  }

}
