/// <reference path="../../typings/tsd.d.ts" />
'use strict'
const Firebase = require('firebase');
const Querybase = require('../../dist/querybase');
const helpers = require('../helpers');
const QuerybaseQuery = Querybase.QuerybaseQuery;
const _ = Querybase.QuerybaseUtils;
const assert = require('assert');
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

// disable warnings
console.warn = () => {};

function isQuerybaseQuery(query) {
  const type = Object.getPrototypeOf(query);
  return type === QuerybaseQuery.prototype;
}

function isQuerybaseRef(ref) {
  const type = Object.getPrototypeOf(ref);
  return type === Querybase.prototype;  
}

describe('Querybase', () => {

  const ref = new Firebase('ws://test.firebaseio.com:5000/items');
  const indexes = ['color', 'height', 'weight'];
  const expectedIndex = {
    'color_height': 'Blue_67',
    'color_height_weight': 'Blue_67_130',
    'color_weight': 'Blue_130',
    'height_weight': '67_130'
  };
  
  it('should exist', () => { expect(Querybase).to.exist; });
  
  describe('set', () => {
    
    let queryRef;
    beforeEach(() => queryRef = new Querybase(ref, ['age', 'location']));
    
    it('should call the Firebase set function', () => {
      sinon.spy(queryRef.ref(), 'set');
        
      queryRef.set({ age: 27, location: 'SF' });
        
      expect(queryRef.ref().set.calledOnce).to.be.ok;
      queryRef.ref().set.restore();
    });
    
    it('should call the indexify function', () => {
      sinon.spy(queryRef, 'indexify');
        
      queryRef.set({ age: 27, location: 'SF' });
        
      expect(queryRef.indexify.calledOnce).to.be.ok;
      queryRef.indexify.restore();
    });

  });
  
  describe('update', () => {
    
    let queryRef;
    beforeEach(() => queryRef = new Querybase(ref, ['age', 'location']));
    
    it('should call the Firebase update function', () => {
      sinon.spy(queryRef.ref(), 'update');
        
      queryRef.update({ age: 27, location: 'SF' });
        
      expect(queryRef.ref().update.calledOnce).to.be.ok;
      queryRef.ref().update.restore();
    });
    
    it('should call the indexify function', () => {
      sinon.spy(queryRef, 'indexify');
        
      queryRef.update({ age: 27, location: 'SF' });
        
      expect(queryRef.indexify.calledOnce).to.be.ok;
      queryRef.indexify.restore();
    });
    
  });
  
  describe('push', () => {
    let queryRef;
    beforeEach(() => queryRef = new Querybase(ref, ['age', 'location']));
    
    it('should call the Firebase push function', () => {
      sinon.spy(queryRef.ref(), 'push');
        
      queryRef.push({ age: 27, location: 'SF' });
        
      expect(queryRef.ref().push.calledOnce).to.be.ok;
      queryRef.ref().push.restore();
    });
    
    it('should return a Firebase reference', () => {
      const pushedBase = queryRef.push({ age: 27, location: 'SF' });
      assert.equal(true, helpers.isFirebaseRef(pushedBase));
    });
    
    it('should call the indexify function if data is passed', () => {
      sinon.spy(queryRef, 'indexify');
      queryRef.push({ age: 27, location: 'SF' });
      expect(queryRef.indexify.calledOnce).to.be.ok;
      queryRef.indexify.restore();
    });
    
    it('should not call the indexify function if no data is passed', () => {
      sinon.spy(queryRef, 'indexify');
      queryRef.push();        
      assert.equal(queryRef.indexify.calledOnce, false);
      queryRef.indexify.restore();
    });

    it('should not call the indexify function if one field is passed', () => {
      sinon.spy(queryRef, 'indexify');
      queryRef.push({ age: 27 });        
      assert.equal(queryRef.indexify.calledOnce, false);
      queryRef.indexify.restore();
    });    
    
    
  });

  describe('remove', () => {
    let queryRef;
    beforeEach(() => queryRef = new Querybase(ref, ['age', 'location']));
    
    it('should call the Firebase remove function', () => {
      sinon.spy(queryRef.ref(), 'remove');
      queryRef.remove({ age: 27, location: 'SF' });
      expect(queryRef.ref().remove.calledOnce).to.be.ok;
      queryRef.ref().remove.restore();
    });    
  });    
  
  describe('child', () => {
    let queryRef;
    beforeEach(() => queryRef = new Querybase(ref, ['age', 'location']));
    
    it('should call the Firebase child function', () => {
      sinon.spy(queryRef.ref(), 'child');
      queryRef.child('some/path');
      expect(queryRef.ref().child.calledOnce).to.be.ok;
      queryRef.ref().child.restore();
    });
    
    it('should return a Querybase ref', () => {
      const childQueryRef = queryRef.child('some/path');
      assert.equal(isQuerybaseRef(childQueryRef), true);
    });
    
    it('should return a child Querybase ref with parent indexes', () => {
      const childRef = queryRef.child('some/path')
      // TODO: array comparison
      assert.equal(childRef.indexOn()[0], 'age');
      assert.equal(childRef.indexOn()[1], 'location');
    });    
    
    it('should return a child Querybase ref with new indexes', () => {
      const childRef = queryRef.child('some/path', ['name', 'color'])
      // TODO: array comparison
      assert.equal(childRef.indexOn()[0], 'name');
      assert.equal(childRef.indexOn()[1], 'color');
    });
      
  });    
  
  describe('where', () => {
    
    let queryRef;
    
    beforeEach(() => queryRef = new Querybase(ref, indexes));
    
    it('should return a QuerybaseQuery for a single criteria', () => {
      const query = queryRef.where('green');
      assert.equal(isQuerybaseQuery(query), true);
    });
    
    it('should return a Firebase query for an object with a single criteria', () => {
      const query = queryRef.where({ color: 'green' });
      assert.equal(true, helpers.isFirebaseRef(query));
    });
    
    it('should create a Firebase query for multiple criteria', () => {
      const query = queryRef.where({ color: 'green', weight: '120' });
      assert.equal(true, helpers.isFirebaseRef(query));
    });
    
    it('should warn about using indexOn rules', () => {
      sinon.spy(queryRef, '_warnAboutIndexOnRule');
      const query = queryRef.where({ color: 'green', weight: '120' });
      expect(queryRef._warnAboutIndexOnRule.calledOnce).to.be.ok;
      queryRef._warnAboutIndexOnRule.restore();
    });
    
  });
  
  describe('createQueryPredicate', () => {
    
    let queryRef;
    beforeEach(() => queryRef = new Querybase(ref, indexes));
    
    // not encoded
    // { color: 'Blue' }
    it('should create a QueryPredicate for one criteria', () => {
      
      const expectedPredicate = {
        predicate: 'color',
        value: 'Blue'
      };
      const predicate = queryRef.createQueryPredicate({ color: 'Blue' });
      
      assert.equal(JSON.stringify(expectedPredicate), JSON.stringify(predicate));
      
    });
    
    // encoded
    // { color: 'Blue', height: '67 }
    it('should encode a QueryPredicate for multiple criteria', () => {
      
      const expectedPredicate = {
        predicate: 'querybase_Y29sb3JfaGVpZ2h0',
        value: 'querybase_Qmx1ZV82Nw=='
      };
      
      const predicate = queryRef.createQueryPredicate({ color: 'Blue', height: 67 });
      assert.equal(JSON.stringify(expectedPredicate), JSON.stringify(predicate));
      
    });
    
  });
  
  describe('createCompositeIndex', () => {
    
    let queryRef;      
    beforeEach(() => queryRef = new Querybase(ref, indexes));
    
    it('should create a composite index', () => {

      const compositeIndex = queryRef.createCompositeIndex(indexes, {
        color: 'Blue',
        height: 67,
        weight: 130
      });
      
      assert.equal(JSON.stringify(compositeIndex), JSON.stringify(expectedIndex));
      
    });
    
  });
  
  describe('encodeCompositeIndex', () => {
    
    let queryRef;
      
    beforeEach(() => queryRef = new Querybase(ref, indexes));
    
    it('should encode an object', () => {
      
      const expectedEncodedIndex = { 
        'querybase_Y29sb3JfaGVpZ2h0': 'querybase_Qmx1ZV82Nw==',
        'querybase_Y29sb3JfaGVpZ2h0X3dlaWdodA==': 'querybase_Qmx1ZV82N18xMzA=',
        'querybase_Y29sb3Jfd2VpZ2h0': 'querybase_Qmx1ZV8xMzA=',
        'querybase_aGVpZ2h0X3dlaWdodA==': 'querybase_NjdfMTMw' 
      }
      
      const encodedIndex = queryRef.encodeCompositeIndex(expectedIndex);
      assert.equal(JSON.stringify(expectedEncodedIndex), JSON.stringify(encodedIndex));
    });
    
  });
  
});