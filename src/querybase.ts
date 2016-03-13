/// <reference path="../typings/firebase/firebase.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

interface QueryPredicate {
  predicate: string;
  value: string;
}

interface QuerybaseUtils {
  isCommonJS(): boolean;
  isString(value): boolean;
  hasMultipleCriteria(criteriaKeys: string[]): boolean;
  createKey(propOne, propTwo): string;
  getPathFromRef(ref): string;
  merge(obj1, obj2): Object;
  keys(obj): string[];
  values(obj): any[];
  arrayToObject(arr: any[]);
  encodeBase64(data: string): string;
  arraysToObject(keys, values): Object;
}

const _ : QuerybaseUtils = {
  
  isCommonJS(): boolean {
    return typeof module != 'undefined';
  },
  
  isString(value): boolean {
    return typeof value === 'string' || value instanceof String;
  },
  
  hasMultipleCriteria(criteriaKeys: string[]): boolean {
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
      /* istanbul ignore next */
      return window.btoa(data); 
    }
  },
  
  arraysToObject(keys, values): Object  {
    let indexHash = {};
    let count = 0;
    keys.forEach((key) => {
      const value = values[count];
      indexHash[key] = value;
      count++;
    });
    return indexHash;
  }

  
}

class Querybase {
  
  ref: () => Firebase;
  indexOn: () => string[];
  key: () => string;
  private encodedKeys: () => string[];
  
  constructor(ref: Firebase, indexOn: string[]) {
    this.ref = () => ref;
    this.indexOn = () => indexOn;
    /* istanbul ignore next */ 
    this.key = () => this.ref().key();
    this.encodedKeys = () => this.encodeKeys(this.indexOn());
  }
  
  set(data) {
    const dataWithIndex = this.indexify(data);
    this.ref().set(dataWithIndex);
  }

  update(data) {
    const dataWithIndex = this.indexify(data);
    this.ref().update(dataWithIndex);
  }

  push(data) {
    
    // TODO: Should we return a Querybase with the option 
    // to specify child indexes?
    if (!data) { return this.ref().push() }
    
    // If there is only one key there's no need to indexify
    if(_.keys(data).length === 1) {
      return this.ref().push(data);
    }
    
    // Create indexes with indexed data values
    const dataWithIndex = this.indexify(data);
    // merge basic data with indexes with data
    const indexesAndData = _.merge(dataWithIndex, data);
    
    let firebaseRef = this.ref().push();
    firebaseRef.set(indexesAndData);
    return firebaseRef;
  }
  
  remove() {
    return this.ref().remove();
  }
  
  child(path, indexOn?: string[]) {
    return new Querybase(this.ref().child(path), indexOn || this.indexOn());
  }
  
  createQueryPredicate(criteria): QueryPredicate {
    const keys = _.keys(criteria);
    const values = _.values(criteria);
    
    // warn about the indexes for indexOn rules
    this._warnAboutIndexOnRule(this.encodedKeys());
    
    // for only one criteria in the object, use the key and vaue
    if (!_.hasMultipleCriteria(keys)) {
      return {
        predicate: keys[0],
        value: values[0]
      };
    }
    
    // for multiple criteria in the object, 
    // encode the keys and values provided
    const criteriaIndex = this.encodeKey(keys.join('_'));
    const criteriaValues = this.encodeKey(values.join('_'));
    
    return {
      predicate: criteriaIndex,
      value: criteriaValues
    };
  }
  
  where(criteria): any {
    // for strings create a QuerybaseQuery
    if (_.isString(criteria)) {
      return new QuerybaseQuery(this.ref().orderByChild(criteria));
    }
    
    // Create the query predicate to build the Firebase Query
    const queryPredicate = this.createQueryPredicate(criteria);
    return this.createFirebaseQuery(queryPredicate);
  }
  
  createFirebaseQuery(criteria: QueryPredicate): FirebaseQuery {
    return this.ref().orderByChild(criteria.predicate).equalTo(criteria.value);
  }
  
  createCompositeIndex(indexes: any[], data: Object, indexHash?: Object) {
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
      indexHash[_.createKey(mainProp, prop)] = 
        _.createKey(data[mainProp], data[prop]);

      // create indexes for all property combinations
      propCop.forEach((subProp) => {
        propString = _.createKey(propString, subProp);
        valueString = _.createKey(valueString, data[subProp]);
      });
      
      indexHash[mainProp + propString] = data[mainProp] + valueString;
        
    });

    // recursive check
    if (propCop.length !== 0) {
      this.createCompositeIndex(propCop, data, indexHash);
    }

    return indexHash;  
  }
  
  encodeCompositeIndex(indexWithData: Object) {
    const values = _.values(indexWithData);
    const keys = _.keys(indexWithData);
    const encodedValues = this.encodeKeys(values);
    const encodedKeys = this.encodeKeys(keys);
    return _.arraysToObject(encodedKeys, encodedValues);
  }
  
  indexify(data: Object) {
    const compositeIndex = this.createCompositeIndex(this.indexOn(), data);
    return this.encodeCompositeIndex(compositeIndex);
  }
  
  encodeKey(value: string): string {
    return "querybase_" + _.encodeBase64(value);
  }
  
  encodeKeys(values: string[]): string[] {
    return values.map((value) => this.encodeKey(value));
  }
  
  private _warnAboutIndexOnRule(indexes) {
    const indexKeys = _.arrayToObject(this.encodeKeys(indexes));
    const _indexOnRule =  `
"${_.getPathFromRef(this.ref())}": {
  "._indexOn": [${_.keys(indexKeys).map((key) => { return `"${key}"`; }).join(", ")}]
}`;
    console.warn(`Add this rule to drastically improve performance of your Firebase queries: \n ${_indexOnRule}`);
  }

}

class QuerybaseQuery {
  
  private query: () => FirebaseQuery;
  
  constructor(query: FirebaseQuery) {
    this.query = () => query;
  }
  
  lessThan(value) {
    return new QuerybaseQuery(this.query().endAt(value));
  }
  
  greaterThan(value) {
    return this.query().startAt(value);
  }
  
  equalTo(value) {
    return this.query().equalTo(value);
  }
  
  startsWith(value) {
    const firstChar = value.substr(0, 1);
    return this.query().startAt(firstChar).endAt(`${value}\uf8ff`);
  }
  
  between(valueOne: any, valueTwo: any) {
    return this.query().startAt(valueOne).endAt(valueTwo);
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