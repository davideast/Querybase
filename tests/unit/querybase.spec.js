/// <reference path="../../typings/tsd.d.ts" />
'use strict'
const firebaseServer = require('../firebaseServer');
const querybase = require('../../dist/querybase');
const Querybase = querybase.Querybase;
const QuerybaseQuery = querybase.QuerybaseQuery;
const helpers = require('../helpers');
const _ = querybase.QuerybaseUtils;
const assert = require('assert');
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

// disable warnings
// TODO: Create index rules for the querybase database
console.warn = () => {};

describe('querybase export', () => {
  
  const ref = firebaseServer.ref().child('items');
  const indexes = ['color', 'height', 'weight'];
  
  it('should create a Querybase ref', () => {
    const queryRef = querybase.ref(ref, indexes)
    assert.equal(true, helpers.isQuerybaseRef(queryRef));
  });
  
});

describe('Querybase', () => {

  const ref = firebaseServer.ref().child('items');
  const indexes = ['color', 'height', 'weight'];
  const expectedIndex = {
    'color~~height': 'Blue~~67',
    'color~~height~~weight': 'Blue~~67~~130',
    'color~~weight': 'Blue~~130',
    'height~~weight': '67~~130'
  };
  
  let queryRef;
  beforeEach(() => queryRef = new Querybase(ref, indexes));
  
  it('should exist', () => { expect(Querybase).to.exist; });
  
  describe('constructor', () => {

    it('should throw if no Firebase ref is provided', () => {
      const errorWrapper = () => new Querybase();
      expect(errorWrapper).to.throw(Error);
    });
    
    it('should throw if no indexes are provided', () => {
      const errorWrapper = () => new Querybase(ref);
      expect(errorWrapper).to.throw(Error);
    });
    
  });
  
  describe('getKey', () => {
    
    it('should throw if no indexes are provided', () => {
      const querybaseRef = querybase.ref(ref, ['name', 'age']);
      const key = querybaseRef.getKey();
      assert.equal(key, 'items');
    });    
    
  });
  
  describe('set', () => {

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

    it('should call the Firebase remove function', () => {
      sinon.spy(queryRef.ref(), 'remove');
      queryRef.remove({ age: 27, location: 'SF' });
      expect(queryRef.ref().remove.calledOnce).to.be.ok;
      queryRef.ref().remove.restore();
    });    
  });    
  
  describe('child', () => {

    it('should call the Firebase child function', () => {
      sinon.spy(queryRef.ref(), 'child');
      queryRef.child('some/path', ['name', 'color']);
      expect(queryRef.ref().child.calledOnce).to.be.ok;
      queryRef.ref().child.restore();
    });
    
    it('should return a Querybase ref', () => {
      const childQueryRef = queryRef.child('some/path', ['name', 'color']);
      assert.equal(helpers.isQuerybaseRef(childQueryRef), true);
    });
    
    it('should return a child Querybase ref with new indexes', () => {
      const childRef = queryRef.child('some/path', ['name', 'color'])
      assert.equal(childRef.indexOn()[0], 'color');
      assert.equal(childRef.indexOn()[1], 'name');
    });
    
    it('should throw if no indexes are provided', () => {
      const errorWrapper = () => queryRef.child('someKey');
      expect(errorWrapper).to.throw(Error);
    });
      
  });    
  
  describe('where', () => {
    
    it('should return a QuerybaseQuery for a single criteria', () => {
      const query = queryRef.where('green');
      assert.equal(helpers.isQuerybaseQuery(query), true);
    });
    
    it('should return a Firebase query for an object with a single criteria', () => {
      const query = queryRef.where({ color: 'green' });
      assert.equal(true, helpers.isFirebaseRef(query));
    });
    
    it('should create a Firebase query for multiple criteria', () => {
      const query = queryRef.where({ weight: '120', color: 'green' });
      assert.equal(true, helpers.isFirebaseRef(query));
    });
    
    it('should warn about using indexOn rules', () => {
      sinon.spy(queryRef, '_warnAboutIndexOnRule');
      const query = queryRef.where({ color: 'green', weight: '120' });
      expect(queryRef._warnAboutIndexOnRule.calledOnce).to.be.ok;
      queryRef._warnAboutIndexOnRule.restore();
    });
    
  });
  
  describe('_createQueryPredicate', () => {

    // not encoded
    // { color: 'Blue' }
    it('should create a QueryPredicate for one criteria', () => {
      
      const expectedPredicate = {
        predicate: 'color',
        value: 'Blue'
      };
      const predicate = queryRef._createQueryPredicate({ color: 'Blue' });
      
      assert.deepEqual(expectedPredicate, predicate);
      
    });
    
    // encoded
    // { height: '67', color: 'Blue' }
    it('should encode a QueryPredicate for multiple criteria', () => {
      
      const expectedPredicate = {
        predicate: 'querybase~~Y29sb3J+fmhlaWdodA==',
        value: 'querybase~~Qmx1ZX5+Njc='
      };
      
      const predicate = queryRef._createQueryPredicate({ height: 67, color: 'Blue' });
      assert.deepEqual(expectedPredicate, predicate);
      
    });
    
  });
  
  describe('_createCompositeIndex', () => {
    
    it('should create a composite index', () => {

      const compositeIndex = queryRef._createCompositeIndex(indexes, {
        weight: 130,
        height: 67,
        color: 'Blue'
      });
      
      assert.deepEqual(compositeIndex, expectedIndex);
      
    });
    
    it('should throw if no indexes are provided', () => {
      const errorWrapper = () => queryRef._createCompositeIndex();
      expect(errorWrapper).to.throw(Error);
    });
    
    it('should throw if no data is provided', () => {
      const errorWrapper = () => queryRef._createCompositeIndex(['name', 'age']);
      expect(errorWrapper).to.throw(Error);
    });

    it('should throw if an empty array is provided', () => {
      const errorWrapper = () => queryRef._createCompositeIndex([]);
      expect(errorWrapper).to.throw(Error);
    });
        
  });
  
  describe('_encodeCompositeIndex', () => {
    
    it('should encode an object', () => {
      
      const expectedEncodedIndex = { 
        'querybase~~Y29sb3J+fmhlaWdodA==': 'querybase~~Qmx1ZX5+Njc=',
        'querybase~~Y29sb3J+fmhlaWdodH5+d2VpZ2h0': 'querybase~~Qmx1ZX5+Njd+fjEzMA==',
        'querybase~~Y29sb3J+fndlaWdodA==': 'querybase~~Qmx1ZX5+MTMw',
        'querybase~~aGVpZ2h0fn53ZWlnaHQ=': 'querybase~~Njd+fjEzMA==' 
      };
      
      const encodedIndex = queryRef._encodeCompositeIndex(expectedIndex);
      assert.deepEqual(expectedEncodedIndex, encodedIndex);
    });
    
    it('should throw if no parameter is provided', () => {
      const errorWrapper = () => queryRef._encodeCompositeIndex();
      expect(errorWrapper).to.throw(Error);
    });
    
    it('should throw if a non object is provided', () => {
      const errorWrapper = () => queryRef._encodeCompositeIndex(4);
      expect(errorWrapper).to.throw(Error);
    });    
    
  });
  
  describe('_createChildOrderedQuery', () => {
    
    it('should call the Firebase orderByChild function', () => {
      sinon.spy(queryRef.ref(), 'orderByChild');
      queryRef._createChildOrderedQuery('age');
      expect(queryRef.ref().orderByChild.calledOnce).to.be.ok;
      queryRef.ref().orderByChild.restore();
    });
    
  });

  describe('_createEqualToQuery', () => {
    
    it('should call the Firebase orderByChild function', () => {
      sinon.spy(queryRef.ref(), 'orderByChild');
      queryRef._createEqualToQuery({ predicate: 'age~~name', value: '27~~David' });
      expect(queryRef.ref().orderByChild.calledOnce).to.be.ok;
      queryRef.ref().orderByChild.restore();
    });
    
  });
  
  describe('indexify', () => {
    // _createCompositeIndex
    // it('should call the _createCompositeIndex', () => {
    //   sinon.spy(queryRef, '_createCompositeIndex');
    //   queryRef.indexify({ age: '27', name: 'David' });
    //   expect(queryRef._createCompositeIndex.calledOnce).to.be.ok;
    //   queryRef._createCompositeIndex.restore();
    // });
    // _encodeCompositeIndex
    it('should call the _encodeCompositeIndex', () => {
      sinon.spy(queryRef, '_encodeCompositeIndex');
      queryRef.indexify({ age: '27', name: 'David' });
      expect(queryRef._encodeCompositeIndex.calledOnce).to.be.ok;
      queryRef._encodeCompositeIndex.restore();
    });    
  });
  
});