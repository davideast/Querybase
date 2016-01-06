/// <reference path="../typings/firebase/firebase.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

interface QuerybaseUtils {
  isString(value): boolean;
  hasMultipleCriteria(criteriaKeys): boolean;
  createKey(propOne, propTwo): string;
  getPathFromRef(ref): string;
  merge(obj1, obj2): Object;
  keys(obj): string[];
  values(obj): any[];
  arrayToObject(arr: any[]);
}

const _ : QuerybaseUtils = {
  
  isString(value): boolean {
    return typeof value === 'string' || value instanceof String;
  },
  
  hasMultipleCriteria(criteriaKeys) {
    return criteriaKeys.length > 1;
  },
  
  createKey(propOne, propTwo) {
    return `${propOne}_${propTwo}`;
  },
  
  getPathFromRef(ref): string {
    const PATH_POSITION = 3;
    var pathArray = ref.toString().split('/');
    return pathArray.slice(PATH_POSITION, pathArray.length).join('/');
  },
  
  merge(obj1, obj2) {
    var mergedHash = {};
    for (var prop in obj1) { 
      mergedHash[prop] = obj1[prop]; 
    }
    for (var prop in obj2) { 
      mergedHash[prop] = obj2[prop]; 
    }
    return mergedHash;
  },
  
  keys(obj) {
    return Object.keys(obj);
  },
  
  values(obj) {
    return Object.keys(obj).map(key => { return obj[key]; });
  },
  
  arrayToObject(arr: any[]) {
    var hash = {};
    arr.forEach((item) => hash[item] = item);
    return hash;
  }
  
}

class Querybase {
  
  ref: () => Firebase;
  indexOn: () => string[];
  key: () => string;
  _: QuerybaseUtils;
  
  constructor(ref: Firebase, indexOn: string[], utils: QuerybaseUtils = _) {
    this._ = utils;
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
    let firebaseRef = null;
    // TODO: return new Querybase not a basic ref
    if (!data) { firebaseRef = this.ref().push() }
    
    const dataWithIndex = indexify(this.indexOn(), data);
    
    firebaseRef = this.ref().push(dataWithIndex);
    return new Querybase(firebaseRef, this.indexOn());
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

class QuerybaseQuery {
  query: FirebaseQuery;
  
  constructor(query: FirebaseQuery) {
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
  
  startsWith(value) {
    const firstChar = value.substr(0, 1);
    return this.query.startAt(firstChar).endAt(`${value}\uf8ff`);
  }
  
  between(valueOne: any, valueTwo: any) {
    return this.query.startAt(valueOne).endAt(valueTwo);
  }
  
}

function indexify(indexes: any[], data: Object, indexHash?: Object) {
  // create a copy of the array to not modifiy the original properties
  const propCop = indexes.slice();
  // remove the first property, this ensures no redundant keys are created (age_name vs. name_age)
  const mainProp = propCop.shift()
  // recursive check for the indexHash
  indexHash = indexHash || {};

  propCop.forEach((prop) => {
    var propString = "";
    var valueString = "";
      
    // first level keys
    indexHash["_" + _.createKey(mainProp, prop)] = _.createKey(data[mainProp], data[prop]);

    // create indexes for all property combinations
    propCop.forEach((subProp) => {
      propString = _.createKey(propString, subProp);
      valueString = _.createKey(valueString, data[subProp]);
    });
      
    indexHash["_" + mainProp + propString] = data[mainProp] + valueString;
      
  });

  if (propCop.length !== 0) {
    indexify(propCop, data, indexHash);
  }

  return indexHash;  
}

if (typeof module != 'undefined') {
  module.exports = Querybase; 
  module.exports.indexify = indexify; 
  module.exports.QuerybaseUtils = _;
  module.exports.QuerybaseQuery = QuerybaseQuery;
} else {
  /* istanbul ignore next */
  window["Querybase"] = Querybase;
  /* istanbul ignore next */
  window["Querybase"]["indexify"] = indexify;
  /* istanbul ignore next */ 
  window["Querybase"]["QuerybaseUtils"] = _;
  /* istanbul ignore next */
  window["Querybase"]["QuerybaseQuery"] = QuerybaseQuery;  
}