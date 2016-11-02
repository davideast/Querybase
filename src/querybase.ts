/// <reference path="../typings/firebase/firebase.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

/**
 * Structure for building a FirebaseQuery
 * @property {string} predicate The predicate clause. ex: orderByChild(predicate)
 * @property {string} value The value for comparison orderByChild(predicate).equalTo(value)
 */
interface QueryPredicate {
  predicate: string;
  value: string;
}

/**
 * Defines the utility methods used in Querybase
 */
interface QuerybaseUtils {
  indexKey(): string;
  isCommonJS(): boolean;
  isString(value): boolean;
  isObject(value): boolean;
  hasMultipleCriteria(criteriaKeys: string[]): boolean;
  createKey(propOne, propTwo): string;
  getPathFromRef(ref): string;
  merge(obj1, obj2): Object;
  keys(obj): string[];
  values(obj): any[];
  encodeBase64(data: string): string;
  arraysToObject(keys, values): Object;
  lexicographicallySort(a: string, b: string): number;
  getKeyIndexPositions(arr: string[]): Object;
  createSortedObject(keys: string[], values: any[]);
  sortObjectLexicographically(obj: Object): Object;
  decodeBase64(encoded: string): string;
}

const _: QuerybaseUtils = {

  indexKey(): string {
    return '~~';
  },

  /**
   * Detects whether it is a node enviroment
   * @return {boolean}
   */
  isCommonJS(): boolean {
    return typeof module != 'undefined';
  },

  /**
   * Detects whether a value is a string
   * @param {any} value The possible string
   * @return {boolean}
   */
  isString(value): boolean {
    return typeof value === 'string' || value instanceof String;
  },
  
  /**
   * Detects whether a value is an object
   * @param {any} value The possible object
   * @return {boolean}
   */
  isObject(value): boolean {
    return value !== null && typeof value === 'object';
  },
  
  /**
   * Detects whether a string array has more than one key
   * @param {string[]} criteriaKeys The array of keys
   * @return {boolean}
   */
  hasMultipleCriteria(criteriaKeys: string[]): boolean {
    return criteriaKeys.length > 1;
  },

  /**
   * Creates the key pattern for index properties
   * @param {string} propOne
   * @param {string} propTwo 
   * @return {string}
   */
  createKey(propOne, propTwo) {
    return `${propOne}${_.indexKey()}${propTwo}`;
  },

  /**
   * Retrieves the Firebase path, minus the full URL, 
   * from a Firebase Reference
   * @param {Firebase} ref
   * @return {string}
   */
  getPathFromRef(ref): string {
    const PATH_POSITION = 3;
    let pathArray = ref.toString().split('/');
    return pathArray.slice(PATH_POSITION, pathArray.length).join('/');
  },

  /**
   * Merges two objects into one
   * @param {object} obj1
   * @param {object} obj2
   * @return {object}
   */
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

  /**
   * Returns an array of keys for an object
   * @param {object} obj
   * @return {string[]}
   */
  keys(obj) {
    return Object.keys(obj);
  },

  /**
   * Returns an array of values for an object
   * @param {object} obj
   * @return {any[]}
   */
  values(obj) {
    return Object.keys(obj).map(key => { return obj[key]; });
  },
  
  /**
   * Universal base64 encode method
   * @param {string} data
   * @return {string}
   */
  encodeBase64(data: string): string {
    if (this.isCommonJS()) {
      return new Buffer(data).toString('base64');
    } else {
      /* istanbul ignore next */
      return window.btoa(data);
    }
  },

  /**
   * Universal base64 decode method
   * @param {string} data
   * @return {string}
   */  
  decodeBase64(encoded: string): string {
    if (this.isCommonJS()) {
      return new Buffer(encoded, 'base64').toString('ascii');
    } else {
      return window.atob(encoded); 
    }
  },  

  /**
   * Creates an object from a keys array and a values array.
   * @param {any[]} keys
   * @param {any[]} values
   * @return {Object}
   * @example
   *  const keys = ['name', 'age'];
   *  const values = ['David', '27'];
   *  const object = _.arraysToObject(keys, value); // { name: 'David', age: '27' }
   */
  arraysToObject(keys, values): Object {
    let indexHash = {};
    let count = 0;
    keys.forEach((key) => {
      const value = values[count];
      indexHash[key] = value;
      count++;
    });
    return indexHash;
  },

  /**
   * A function for lexicographically comparing keys. Used for 
   * array sort methods.
   * @param {string} a
   * @param {string} b
   * @return {number}
   */  
  lexicographicallySort(a: string, b: string): number {
    return a.localeCompare(b);
  },
  
  /**
   * Creates an object with the key name and position in an array
   * @param {string[]} arr
   * @return {Object}
   * @example
   *  const keys = ['name', 'age', 'location'];
   *  const indexKeys = _.getKeyIndexPositions(keys);
   *    => { name: 0, age: 1, location: 2 }
   */    
  getKeyIndexPositions(arr: string[]): Object {
    const indexOfKeys = {};
    arr.forEach((key, index) => indexOfKeys[key] = index);
    return indexOfKeys;
  },

  /**
   * Creates an object whose keys are lexicographically sorted
   * @param {string[]} keys
   * @param {any[]} values
   * @return {Object}
   * @example
   *  const keys = ['name', 'age', 'location'];
   *  const values = ['David', '28', 'SF'];
   *  const sortedObj = _.createSortedObject(keys, values);
   *    => { age: '28', location: 'SF', name: 'David' }
   */      
  createSortedObject(keys: string[], values: any[]) {
    const sortedRecord = {};
    const indexOfKeys = this.getKeyIndexPositions(keys);
    const sortedKeys = keys.sort(this.lexicographicallySort);
    
    sortedKeys.forEach((key) => {
      let index = indexOfKeys[key];
      sortedRecord[key] = values[index];
    });
    
    return sortedRecord;
  },

  /**
   * Creates an object whose keys are lexicographically sorted
   * @param {obj} Object
   * @return {Object}
   * @example
   *  const record = { name: 'David', age: '28', location: 'SF' };
   *  const sortedObj = _.sortObjectLexicographically(record);
   *    => { age: '28', location: 'SF', name: 'David' }
   */  
  sortObjectLexicographically(obj: Object): Object {
    const keys = this.keys(obj);
    const values = this.values(obj);
    return this.createSortedObject(keys, values);
  }
  
}

/**
 * Querybase - Provides composite keys and a simplified query API.
 * 
 * @param {Firebase} ref 
 * @param {indexOn} string[]
 * 
 * @example
 *  // Querybase for multiple equivalency
 *  const firebaseRef = firebase.database.ref().child('people');
 *  const querybaseRef = querybase.ref(firebaseRef, ['name', 'age', 'location']);
 *  
 *  // Automatically handles composite keys
 *  querybaseRef.push({ 
 *    name: 'David',
 *    age: 27
 *  });
 *  
 *  const compositeRef = querybaseRef.where({
 *    name: 'David',
 *    age: 27
 *  })
 *  // .where() with multiple criteria returns a Firebase ref
 *  compositeRef.on('value', (snap) => console.log(snap.val());
 * 
 *  // Querybase for single criteria, returns a Firebase Ref
 *  querybaseRef.where({ name: 'David'});
 * 
 *  // Querybase for a single string criteria, returns
 *  // a QuerybaseQuery, which returns a Firebase Ref
 *  querybaseRef.where('name').startsWith('Da');
 *  querybaseRef.where('age').lessThan(30);
 *  querybaseRef.where('age').greaterThan(20);
 *  querybaseRef.where('age').between(20, 30);
 */
class Querybase {
  INDEX_LENGTH = 3;

  // read only properties

  // Returns a read-only Database reference
  ref: () => Firebase;
  // Returns a read-only set of indexes
  indexOn: () => string[];
  // the key of the Database ref
  key: string;
  // the set of indexOn keys base64 encoded
  private encodedKeys: () => string[];

  /**
   * The constructor provides the backing values 
   * for the read-only properties
   */
  constructor(ref: Firebase, indexOn: string[]) {
    
    // Check for constructor params and throw if not provided
    this._assertFirebaseRef(ref);
    this._assertIndexes(indexOn);
    this._assertIndexLength(indexOn);
    
    this.ref = () => ref;
    this.indexOn = () => indexOn.sort(_.lexicographicallySort);
    /* istanbul ignore next */
    this.key = this.ref().key;
    this.encodedKeys = () => this.encodeKeys(this.indexOn());
  }

  /**
   * Check for a Firebase Database reference. Throw an exception if not provided.
   * @parameter {Firebase}
   * @return {void}
   */  
  private _assertFirebaseRef(ref: Firebase) {
    if (ref === null || ref === undefined || !ref.on) {
      throw new Error(`No Firebase Database Reference provided in the Querybase constructor.`);
    }
  }

  /**
   * Check for indexes. Throw an exception if not provided.
   * @param {string[]} indexes
   * @return {void}
   */    
  private _assertIndexes(indexes: any[]) {
    if (indexes === null || indexes === undefined) {
      throw new Error(`No indexes provided in the Querybase constructor. Querybase uses the indexOn() getter to create the composite queries for the where() method.`);
    }
  }

  /**
   * Check for indexes length. Throw and exception if greater than the INDEX_LENGTH value.
   * @param {string[]} indexes
   * @return {void}
   */   
  private _assertIndexLength(indexes: any[]) {
    if (indexes.length > this.INDEX_LENGTH) {
      throw new Error(`Querybase supports only ${this.INDEX_LENGTH} indexes for multiple querying.`)
    }
  }

  /**
   * Save data to the realtime database with composite keys
   * @param {any} data
   * @return {void}
   */
  set(data) {
    const dataWithIndex = this.indexify(data);
    this.ref().set(dataWithIndex);
  }

  /**
   * Update data to the realtime database with composite keys
   * @param {any} data
   * @return {void}
   */
  update(data) {
    const dataWithIndex = this.indexify(data);
    this.ref().update(dataWithIndex);
  }

  /**
   * Push a child node to the realtime database with composite keys, if 
   * there is more than one property in the object
   * @param {any} data
   * @return {FirebaseRef}
   */
  push(data) {

    // TODO: Should we return a Querybase with the option 
    // to specify child indexes?
    if (!data) { return this.ref().push() }

    // If there is only one key there's no need to indexify
    if (_.keys(data).length === 1) {
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

  /**
   * Remove the current value from the Firebase reference
   * @return {void}
   */
  remove() {
    return this.ref().remove();
  }

  /**
   * Create a child reference with a specified path and provide 
   * specific indexes for the child path
   * @param {any} data
   * @return {FirebaseRef}
   */
  child(path, indexOn: string[]) {
    return new Querybase(this.ref().child(path), indexOn);
  }

  /**
   * Creates a QueryPredicate based on the criteria object passed. It
   * combines the keys and values of the criteria object into a predicate
   * and value string respectively.
   * @param {Object} criteria
   * @return {FirebaseRef}
   */
  private _createQueryPredicate(criteria): QueryPredicate {
    
    // Sort provided object lexicographically to match keys in database
    const sortedCriteria = _.sortObjectLexicographically(criteria);
    
    // retrieve the keys and values array
    const keys = _.keys(sortedCriteria);
    const values = _.values(sortedCriteria);

    // warn about the indexes for indexOn rules
    this._warnAboutIndexOnRule();

    // for only one criteria in the object, use the key and vaue
    if (!_.hasMultipleCriteria(keys)) {
      return {
        predicate: keys[0],
        value: values[0]
      };
    }

    // for multiple criteria in the object, 
    // encode the keys and values provided
    const criteriaIndex = this.encodeKey(keys.join(_.indexKey()));
    const criteriaValues = this.encodeKey(values.join(_.indexKey()));

    return {
      predicate: criteriaIndex,
      value: criteriaValues
    };
  }

  /**
   * Creates an orderByChild() FirebaseQuery from a string criteria.
   * @param {string} stringCriteria
   * @return {QuerybaseQuery}
   */  
  private _createChildOrderedQuery(stringCriteria: string): QuerybaseQuery {
    return new QuerybaseQuery(this.ref().orderByChild(stringCriteria));
  }

  /**
   * Creates an equalTo() FirebaseQuery from a QueryPredicate.
   * @param {Object} criteria
   * @return {FirebaseRef}
   */
  private _createEqualToQuery(criteria: QueryPredicate): FirebaseQuery {
    return this.ref().orderByChild(criteria.predicate).equalTo(criteria.value);
  }
  
  /**
   * Find a set of records by a set of criteria or a string property. 
   * Works with equivalency only.
   * @param {Object} criteria
   * @return {FirebaseRef}
   * @example
   *   // set of criteria
   *   const firebaseRef = firebase.database.ref.child('people');
   *   const querybaseRef = querybase.ref(firebaseRef, ['name', 'age', 'location']);
   *   querybaseRef.where({
   *    name: 'David',
   *    age: 27
   *   }).on('value', (snap) => {});
   * 
   *   // single criteria property
   *   querybaseRef.where({ name: 'David' }).on('value', (snap) => {});
   * 
   *   // string property
   *   querybaseRef.where('age').between(20, 30).on('value', (snap) => {});
   */
  where(criteria): any {
    // for strings create a QuerybaseQuery for advanced querying
    if (_.isString(criteria)) {
      return this._createChildOrderedQuery(criteria);
    }
    
    // Create the query predicate to build the Firebase Query
    const queryPredicate = this._createQueryPredicate(criteria);
    return this._createEqualToQuery(queryPredicate);
  }

  /**
   * Creates a set of composite keys with composite data. Creates every
   * possible combination of keys with respecive combined values. Redudant 
   * keys are not included ('name~~age' vs. 'age~~name').
   * @param {any[]} indexes
   * @param {Object} data
   * @param {Object?} indexHash for recursive check
   * @return {Object}
   * @example
   *  const indexes = ['name', 'age', 'location'];
   *  const data = { name: 'David', age: 27, location: 'SF' };
   *  const compositeKeys = _createCompositeIndex(indexes, data);
   *  
   *  // compositeKeys
   *  {
   *    'name~~age': 'David~~27',
   *    'name~~age~~location': 'David~~27~~SF',
   *    'name~~location': 'David~~SF',
   *    'age~~location': '27~~SF'
   *  }
   */
  private _createCompositeIndex(indexes: any[], data: Object, indexHash?: Object) {
    
    if(!Array.isArray(indexes)) {
      throw new Error(`_createCompositeIndex expects an array for the first parameter: found ${indexes.toString()}`)
    }
    
    if(indexes.length === 0) {
      throw new Error(`_createCompositeIndex expect an array with multiple elements for the first parameter. Found an array with length of ${indexes.length}`);
    }
    
    if(!_.isObject(data)) {
      throw new Error(`_createCompositeIndex expects an object for the second parameter: found ${data.toString()}`);
    }
    
    // create a copy of the array to not modifiy the original properties
    const propCop = indexes.slice();
    // remove the first property, this ensures no 
    // redundant keys are created (age~~name vs. name~~age)
    const mainProp = propCop.shift();
    // recursive check for the indexHash
    indexHash = indexHash || {};

    propCop.forEach((prop) => {
      let propString = "";
      let valueString = "";

      // first level keys
      // ex: ['name', 'age', 'location']
      // -> 'name~~age'
      // -> 'name~~location'
      // -> 'age~~location'
      indexHash[_.createKey(mainProp, prop)] =
        _.createKey(data[mainProp], data[prop]);

      // create indexes for all property combinations
      // ex: ['name', 'age', 'location']
      //  -> 'name~~age~~location'
      propCop.forEach((subProp) => {
        propString = _.createKey(propString, subProp);
        valueString = _.createKey(valueString, data[subProp]);
      });

      indexHash[mainProp + propString] = data[mainProp] + valueString;
    });

    // recursive check
    if (propCop.length !== 0) {
      this._createCompositeIndex(propCop, data, indexHash);
    }

    return indexHash;
  }

  /**
   * Encode (base64) all keys and data to avoid collisions with the
   * chosen Querybase delimiter key (_)
   * @param {Object} indexWithData
   * @return {Object}
   */
  private _encodeCompositeIndex(indexWithData: Object) {
    if(!_.isObject(indexWithData)) {
      throw new Error(`_encodeCompositeIndex expects an object: found ${indexWithData.toString()}`);
    }
    const values = _.values(indexWithData);
    const keys = _.keys(indexWithData);
    const encodedValues = this.encodeKeys(values);
    const encodedKeys = this.encodeKeys(keys);
    return _.arraysToObject(encodedKeys, encodedValues);
  }

  /**
   * Encode (base64) all keys and data to avoid collisions with the
   * chosen Querybase delimiter key (~~)
   * @param {Object} indexWithData
   * @return {Object}
   */
  indexify(data: Object) {
    const compositeIndex = this._createCompositeIndex(this.indexOn(), data);
    const encodedIndexes = this._encodeCompositeIndex(compositeIndex);
    return encodedIndexes;
  }

  /**
   * Encode (base64) a single key with the Querybase format
   * @param {string} value
   * @return {string}
   */
  encodeKey(value: string): string {
    return `querybase${_.indexKey()}` + _.encodeBase64(value);
  }

  /**
   * Encode (base64) a set of keys with the Querybase format
   * @param {string[]} values
   * @return {string}
   */
  encodeKeys(values: string[]): string[] {
    return values.map((value) => this.encodeKey(value));
  }

  /**
   * Print a warning to the console about using ".indexOn" rules for 
   * the generated keys. This warning has a copy-and-pastable security rule
   * based upon the keys provided.
   * @param {string} value
   * @return {void}
   */
  private _warnAboutIndexOnRule() {
    const indexKeys = this.encodedKeys();
    const _indexOnRule = `
"${_.getPathFromRef(this.ref())}": {
  ".indexOn": [${_.keys(indexKeys).map((key) => { return `"${indexKeys[key]}"`; }).join(", ")}]
}`;
    console.warn(`If you haven't yet, add this rule to drastically improve performance of your Realtime Database queries: \n ${_indexOnRule}`);
  }

}

/**
 * QuerybaseQuery - Provides a simple querying API
 * 
 * A QuerybaseQuery is created through using a string criteria
 * on a Querybase reference. It is not meant to be directly created.
 * 
 * @param {FirebaseQuery} query 
 * 
 * @example
 *  const firebaseRef = firebase.database.ref.child('people');
 *  const querybaseRef = querybase.ref(firebaseRef, ['name', 'age', 'location']);
 * 
 *  // Querybase for a single string criteria, returns
 *  // a QuerybaseQuery, which returns a Firebase Ref
 *  querybaseRef.where('name').startsWith('Da');
 *  querybaseRef.where('age').lessThan(30);
 *  querybaseRef.where('locaton').equalTo('SF');
 *  querybaseRef.where('age').greaterThan(20);
 *  querybaseRef.where('age').between(20, 30);
 */
class QuerybaseQuery {

  // read-only FirebaseQuery
  private query: () => FirebaseQuery;

  constructor(query: FirebaseQuery) {
    this.query = () => query;
  }

  /**
   * Find a set of records smaller than the provided value.
   * @param {any} value
   * @return {FirebaseQuery}
   */
  lessThan(value) {
    return this.query().endAt(value);
  }

  /**
   * Find a set of records larger than the provided value.
   * @param {any} value
   * @return {FirebaseQuery}
   */
  greaterThan(value) {
    return this.query().startAt(value);
  }

  /**
   * Find a set of records the same as the provided value.
   * @param {any} value
   * @return {FirebaseQuery}
   */
  equalTo(value) {
    return this.query().equalTo(value);
  }

  /**
   * Find a set of records that begins with the provided value.
   * @param {string} value
   * @return {FirebaseQuery}
   */
  startsWith(value: string) {
    const firstChar = value.substr(0, 1);
    return this.query().startAt(firstChar).endAt(`${value}\uf8ff`);
  }

  /**
   * Find a set of records between the provided values.
   * @param {string} value
   * @return {FirebaseQuery}
   */
  between(valueOne: any, valueTwo: any) {
    return this.query().startAt(valueOne).endAt(valueTwo);
  }

}

const querybaseExport = {
  ref: function (ref: Firebase, indexes: string[]) {
    return new Querybase(ref, indexes);
  }
};

// Export the modules for the current environment
if (_.isCommonJS()) {
  module.exports = querybaseExport;
  module.exports.Querybase = Querybase;
  module.exports.QuerybaseUtils = _;
  module.exports.QuerybaseQuery = QuerybaseQuery;
} else {
  /* istanbul ignore next */
  window["querybase"] = querybaseExport;
  /* istanbul ignore next */
  window["querybase"]["Querybase"] = Querybase;
  /* istanbul ignore next */
  window["querybase"]["QuerybaseUtils"] = _;
  /* istanbul ignore next */
  window["querybase"]["QuerybaseQuery"] = QuerybaseQuery;
}