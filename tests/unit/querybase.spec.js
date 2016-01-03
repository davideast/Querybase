/// <reference path="../../typings/tsd.d.ts" />

const FirebaseServer = require('firebase-server');
const Firebase = require('firebase');
const Querybase = require('../../dist/querybase');
const helpers = require('../helpers');
const firebaseServer = require('../firebaseServer');
const QuerybaseQuery = Querybase.QuerybaseQuery;
const assert = require('assert');
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

describe('Querybase', () => {
  
  const server = firebaseServer();

  const ref = new Firebase('ws://test.firebaseio.com:5000');
  
  it('should exist', () => { expect(Querybase).to.exist; });
  
  describe('where', () => {
    
    const queryRef = new Querybase(ref, ['color', 'height', 'weight'])
    
    it('should return a QuerybaseQuery for a single criteria', () => {
      const query = queryRef.where('green');
      const type = Object.getPrototypeOf(query);
      assert.equal(type, QuerybaseQuery.prototype);
    });
    
    it('should return a Firebase query for an object with a single criteria', () => {
      const query = queryRef.where({ color: 'green' });
      assert.equal(true, helpers.isFirebaseRef(query));
    });
    
  });
  
});