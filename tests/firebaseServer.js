/// <reference path="../typings/tsd.d.ts" />

const firebase = require("firebase");

/**
 * Initialize the app with a service account, granting admin privileges
 */
function initializeApp() {
  firebase.initializeApp({
    databaseURL: "https://querybase-b565d.firebaseio.com",
    serviceAccount: "./service-account.json"
  }); 
}

/**
 * Creates a default FirebaseServer
 * @param {Object} config - The object to configure the server 
 *                 { port: Number, url: String, data: Object}
 */
function getRef() {
  //config = config || { port: 5000, url: 'test.firebaseio.com', data: {}};
  const db = firebase.database();
  
  // go offline for testing
  db.goOffline();
  
  return db.ref();
}

module.exports = {
  ref: getRef,
  initializeApp: initializeApp
};