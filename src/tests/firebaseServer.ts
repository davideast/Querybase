import * as firebase from 'firebase/app';

/**
 * Initialize the app with a service account, granting admin privileges
 */
function initializeApp() {
  firebase.initializeApp({
    databaseURL: "https://querybase-b565d.firebaseio.com"
  });
}

/**
 * Creates a root ref for the database that is offline
 */
function getRef() {
  const db = firebase.database();

  // go offline for testing
  db.goOffline();

  return db.ref();
}

export {
  getRef as ref,
  initializeApp
};