/// <reference path="../typings/firebase/firebase.d.ts" />

class QueryRef {
  
  ref: Firebase;
  schema: any;
  
  constructor(ref: Firebase, schema: any) {
    this.ref = ref;
    this.schema = schema;
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
    var dataWithIndex = this._addIndexToData(this.schema, data);
    this.ref.push().set(dataWithIndex);
  }
  
  where(criteria): FirebaseQuery {
    const keys = Object.keys(criteria);
    const values = this._values(criteria);
    
    if (keys.length > 1) {
      var criteriaIndex = keys.join('_');
      var criteriaValues = values.join('_');
      return this.ref.orderByChild(criteriaIndex).equalTo(criteriaValues); 
    }
    
    // single criteria 
    return this.ref.orderByChild(keys[0]).equalTo(values[0]);
  }
  
  private _createKey(propOne, propTwo) {
    return `${propOne}_${propTwo}`;
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

      indexHash[this._createKey(mainProp, prop)] = this._createKey(data[mainProp], data[prop]);

      propCop.forEach((subProp) => {
        propString = this._createKey(propString, subProp);
        valueString = this._createKey(valueString, data[subProp]);
      });
      
      indexHash[mainProp + propString] = data[mainProp] + valueString;
      
    });

    if (propCop.length !== 0) {
      this._createIndexes(propCop, data, indexHash);
    }

    return indexHash;
  }
  
  private _getPathFromRef(ref): string {
    const PATH_POSITION = 3;
    var pathArray = ref.toString().split('/');
    return pathArray.slice(PATH_POSITION, pathArray.length).join('/');
  }  
  
  private _addIndexToData(schema, data) {
    var indexes = this._createIndexes(schema, data);
    this._warnAboutIndexOnRule(indexes);
    var merged = this._merge(data, indexes);
    return merged;
  }
  
  private _merge(obj1, obj2) {
    var mergedHash = {};
    for (var prop in obj1) { 
      mergedHash[prop] = obj1[prop]; 
    }
    for (var prop in obj2) { 
      mergedHash[prop] = obj2[prop]; 
    }
    return mergedHash;
  }
  
  private _values(obj) {
    return Object.keys(obj).map(key => { return obj[key]; });
  }
  
  private _arrayToObject(arr: any[]) {
    var hash = {};
    arr.forEach((item) => hash[item] = item);
    return hash;
  }
  
  private _warnAboutIndexOnRule(obj) {
    var indexKeys = this._merge(obj, this._arrayToObject(this.schema));
    var indexOnRule =  `
"${this._getPathFromRef(this.ref)}": {
  ".indexOn": [${Object.keys(indexKeys).map((key) => { return `"${key}"`; }).join(", ")}]
}`;
    console.warn(`Add this rule to improve performance of your Firebase queries: \n ${indexOnRule}`);
  }

}
