const Querybase = require('./Querybase');
const Firebase = require('firebase');

const FirebaseUrl = 'https://querybase.firebaseio-demo.com/';
const ref = new Firebase(FirebaseUrl).child('people');
const queryRef = new Querybase(ref, ['height', 'name', 'age']);