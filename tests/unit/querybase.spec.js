/// <reference path="../../typings/tsd.d.ts" />

const FirebaseServer = require('firebase-server');
const Firebase = require('firebase');
const Querybase = require('../../dist/querybase');
const QuerybaseQuery = Querybase.QuerybaseQuery;
const assert = require('assert');
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

describe('Querybase', () => {
  
  const server = new FirebaseServer(5000, 'test.firebaseio.com', {
    people: {
      "0": {
        height: 60,
        color: 'green',
        weight: 120
      },
      "1": {
        height: 70,
        color: 'red',
        weight: 190
      }
    }
  });

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
      expect(query.on).to.be.a('Function');
    });
    
  });
  
});