/// <reference path="../typings/firebase/firebase.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

interface QuerybaseUtils {
  isCommonJS(): boolean;
  isString(value): boolean;
  hasMultipleCriteria(criteriaKeys): boolean;
  createKey(propOne, propTwo): string;
  getPathFromRef(ref): string;
  merge(obj1, obj2): Object;
  keys(obj): string[];
  values(obj): any[];
  arrayToObject(arr: any[]);
  encodeBase64(data: string): string;
  decodeBase64(encoded: string): string;
  encodeKey(key: string): string;
}

const _ : QuerybaseUtils = {
  
  isCommonJS(): boolean {
    return typeof module != 'undefined';
  },
  
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
    let pathArray = ref.toString().split('/');
    return pathArray.slice(PATH_POSITION, pathArray.length).join('/');
  },
  
  merge(obj1, obj2) {
    let mergedHash = {};
    for (let prop in obj1) { 
      mergedHash[prop] = obj1[prop]; 
    }
    for (let prop in obj2) { 
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
    let hash = {};
    arr.forEach((item) => hash[item] = item);
    return hash;
  },
  
  encodeBase64(data: string): string {
    if (this.isCommonJS()) {
      return new Buffer(data).toString('base64'); 
    } else {
      return window.btoa(data); 
    }
  },
  
  decodeBase64(encoded: string): string {
    if (this.isCommonJS()) {
      return new Buffer(encoded, 'base64').toString('ascii');
    } else {
      return window.atob(encoded); 
    }
  },
  
  encodeKey(value: string): string {
    return "querybase_" + this.encodeBase64(value);
  }
  
}

class Querybase {
  
  ref: () => Firebase;
  indexOn: () => string[];
  key: () => string;
  
  constructor(ref: Firebase, indexOn: string[]) {
    this.ref = () => { return ref; }
    this.indexOn = () => { return indexOn };
    this.key = () => { return this.ref().key() };
    
    const indexes = this.indexify(indexOn, _.arrayToObject(indexOn));
    this._warnAboutIndexOnRule(indexes);
  }
  
  set(data) {
    const dataWithIndex = this.indexify(this.indexOn(), data);
    this.ref().set(dataWithIndex);
  }

  update(data) {
    const dataWithIndex = this.indexify(this.indexOn(), data);
    this.ref().update(dataWithIndex);
  }

  push(data) {
    let firebaseRef = null;
    // TODO: return new Querybase not a basic ref
    if (!data) { firebaseRef = this.ref().push() }
    
    // Create indexes with indexed data values
    const dataWithIndex = this.indexify(this.indexOn(), data);
    // merge basic data with indexes with data
    const indexesAndData = _.merge(dataWithIndex, data);
    
    firebaseRef = this.ref().push();
    firebaseRef.set(indexesAndData);
    return new Querybase(firebaseRef, this.indexOn());
  }
  
  remove() {
    return this.ref().remove();
  }
  
  child(path, indexOn?: string[]) {
    return new Querybase(this.ref().child(path), indexOn || this.indexOn());
  }
  
  where(criteria): any {
    
    if (_.isString(criteria)) {
      return new QuerybaseQuery(this.ref().orderByChild(criteria));
    } 
    
    const keys = _.keys(criteria);
    const values = _.values(criteria);
    
    // multiple criteria
    if (_.hasMultipleCriteria(keys)) {
      
      //TODO: refactor _ 
      const criteriaIndex = _.encodeKey(keys.join('_'));
      const criteriaValues = _.encodeKey(values.join('_'));
      
      return this.ref().orderByChild(criteriaIndex).equalTo(criteriaValues); 
    }
    
    // single criteria 
    return this.ref().orderByChild(keys[0]).equalTo(values[0]);
  }
  
  indexify(indexes: any[], data: Object, indexHash?: Object) {
    // create a copy of the array to not modifiy the original properties
    const propCop = indexes.slice();
    // remove the first property, this ensures no redundant keys are created (age_name vs. name_age)
    const mainProp = propCop.shift();
    // recursive check for the indexHash
    indexHash = indexHash || {};

    propCop.forEach((prop) => {
      let propString = "";
      let valueString = "";
        
      // first level keys
      indexHash[_.encodeKey(_.createKey(mainProp, prop))] = 
        _.encodeKey(_.createKey(data[mainProp], data[prop]));

      // create indexes for all property combinations
      propCop.forEach((subProp) => {
        propString = _.createKey(propString, subProp);
        valueString = _.createKey(valueString, data[subProp]);
      });
      
      indexHash[_.encodeKey(mainProp + propString)] = _.encodeKey(data[mainProp] + valueString);
        
    });

    if (propCop.length !== 0) {
      this.indexify(propCop, data, indexHash);
    }

    return indexHash;  
  }
  
  private _warnAboutIndexOnRule(obj) {
    const indexKeys = _.merge(obj, _.arrayToObject(this.indexOn()));
    const _indexOnRule =  `
"${_.getPathFromRef(this.ref())}": {
  "._indexOn": [${_.keys(indexKeys).map((key) => { return `"${key}"`; }).join(", ")}]
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

if (_.isCommonJS()) {
  module.exports = Querybase; 
  module.exports.QuerybaseUtils = _;
  module.exports.QuerybaseQuery = QuerybaseQuery;
} else {
  /* istanbul ignore next */
  window["Querybase"] = Querybase;
  /* istanbul ignore next */ 
  window["Querybase"]["QuerybaseUtils"] = _;
  /* istanbul ignore next */
  window["Querybase"]["QuerybaseQuery"] = QuerybaseQuery;  
}