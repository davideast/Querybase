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

  /*
   * var ref = new QueryRef(ref, ['name', 'age', 'location']);
   * var query = ref.where({ name: 'david', age: 28 });
   */
  where(criteria): FirebaseQuery {
    var criteriaIndex = "_where_" + Object.keys(criteria).join('_');
    var criteriaValues = this._values(criteria).join('_');
    return this.ref.orderByChild(criteriaIndex).equalTo(criteriaValues);
  }
  
  private getPathFromRef(ref): string {
    const PATH_POSITION = 3;
    var pathArray = ref.toString().split('/');
    return pathArray.slice(PATH_POSITION, pathArray.length).join('/');
  }
  
  private _createIndexes(properties: any[], data: any, propHash?: any) {
    var propCop = properties.slice();
    var mainProp = propCop.shift()
    var propHash = propHash || {};

    propCop.forEach((prop) => {
      var propString = "";
      var valueString = "";

      propHash["_where_" + mainProp + "_" + prop] = data[mainProp] + "_" + data[prop];

      propCop.forEach((subProp) => {
        propString = propString + "_" + subProp;
        valueString = valueString + "_" + data[subProp];
      });
      
      propHash["_where_" + mainProp + propString] = data[mainProp] + valueString;
    });

    if (propCop.length !== 0) {
      this._createIndexes(propCop, data, propHash);
    }

    return propHash;
  }
  
  private _addIndexToData(schema, data) {
    var indexes = this._createIndexes(schema, data);
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

}
