"use strict";
const Firebase = require('firebase');
const Querybase = require('../dist/Querybase');
const QuerybaseQuery = Querybase.QuerybaseQuery;

/**
 * Detects a Querybase ref
 * @param {Querybase} ref The possible Querybase ref
 */
function isQuerybaseRef(ref) {
  const type = Object.getPrototypeOf(ref);
  return type === Querybase.prototype;  
}

/**
 * Detects a function
 * @param {Function} fn The possible function
 */
function isFunction(fn) {
  const functionType = typeof function() {};
  const currentType = typeof fn;
  return currentType === functionType;
}

/**
 * Detects a Firebase ref
 * @param {Firebase} ref The possible Firebase ref
 */
function isFirebaseRef(ref) {
  return isFunction(ref.on);
}

/**
 * Detects a FirebaseQUery
 * @param {FirebaseQUery} query The possible FirebaseQUery
 */
function isFirebaseQuery(query) {
  return isFunction(query.startAt);
}

module.exports.isFunction = isFunction;
module.exports.isFirebaseRef = isFirebaseRef;
module.exports.isFirebaseQuery = isFirebaseQuery;
module.exports.isQuerybaseRef = isQuerybaseRef;