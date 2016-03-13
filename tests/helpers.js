"use strict";
const Firebase = require('firebase');
const Querybase = require('../dist/querybase');
const QuerybaseQuery = Querybase.QuerybaseQuery;

function isQuerybaseQuery(query) {
  const type = Object.getPrototypeOf(query);
  return type === QuerybaseQuery.prototype;
}

function isQuerybaseRef(ref) {
  const type = Object.getPrototypeOf(ref);
  return type === Querybase.prototype;  
}


/**
 * Detects a function
 * @param {Function} fn - The possible function
 */
function isFunction(fn) {
  const functionType = typeof function() {};
  const currentType = typeof fn;
  return currentType === functionType;
}

/**
 * Detects a Firebase ref
 * @param {Firebase} ref - The possible Firebase ref
 */
function isFirebaseRef(ref) {
  return isFunction(ref.on);
}

function isFirebaseQuery(query) {
  return isFunction(query.startAt);
}

module.exports.isFunction = isFunction;
module.exports.isFirebaseRef = isFirebaseRef;
module.exports.isFirebaseQuery = isFirebaseQuery;
module.exports.isQuerybaseRef = isQuerybaseRef;
module.exports.isQuerybaseQuery = isQuerybaseQuery;