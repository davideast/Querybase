/**
 * Structure for building a DatabaseQuery
 * @property {string} predicate The predicate clause. ex: orderByChild(predicate)
 * @property {string} value The value for comparison orderByChild(predicate).equalTo(value)
 */
export interface QueryPredicate {
  predicate: string;
  value: string;
}

/**
 * Defines the utility methods used in Querybase
 */
export interface QuerybaseUtils {
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
}

export const _: QuerybaseUtils = {

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
