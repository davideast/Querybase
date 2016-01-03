"use strict";

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

module.exports.isFunction = isFunction;
module.exports.isFirebaseRef = isFirebaseRef;
