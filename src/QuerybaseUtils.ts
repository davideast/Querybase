/// <reference path="../typings/firebase/firebase.d.ts" />

export class QuerybaseUtils {
  
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
   return (a,b) => { return a[prop].localeCompare(b[prop]); };
  }
  
  stripKeys(obj, keyStrip = "_") {
    var copy = Object.create(obj);
    this.keys(copy).forEach((key) => { if (key.substr(0, 1) === keyStrip) { delete copy[key] } });
  }
  
  copy(obj: Object) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }
  
}