/// <reference path="../../typings/tsd.d.ts" />

const _ = require('../../dist/querybase').QuerybaseUtils;
const assert = require('assert');
const chai = require('chai');
const firebaseServer = require('../firebaseServer');
const helpers = require('../helpers');
const should = chai.should();
const expect = chai.expect;

describe('QuerybaseUtils', () => {
  
  
  it('should exist', () => { expect(_).to.exist; })
  
  describe('isString', () => {
    
    it('should return true for a string value', () => {
      const result = _.isString('a string');
      assert.equal(result, true);
    });
    
    it('should return false for a anything else', () => {
      const result = _.isString(22);
      assert.equal(result, false);
    });
    
  });
  
  describe('isCommonJS', () => {
    it('should return true, because this runtime is Node', () => {
      assert.equal(_.isCommonJS(), true);
    });
  });
  
  describe('hasMultipleCriteria', () => {
    
    it('should return true for more than one criteria key', () => {
      const criteriaKeys = ['age', 'location'];
      const hasMultiple = _.hasMultipleCriteria(criteriaKeys);
      assert.equal(hasMultiple, true);
    });
    
    it('should return false for one criteria key', () => {
      const criteriaKeys = ['age'];
      const hasMultiple = _.hasMultipleCriteria(criteriaKeys);
      assert.equal(hasMultiple, false);
    });
    
    it('should return false zero criteria keys', () => {
      const criteriaKeys = [];
      const hasMultiple = _.hasMultipleCriteria(criteriaKeys);
      assert.equal(hasMultiple, false);
    });
    
  });
  
  describe('getPathFromRef', () => {
    
    it('should find the path from the Firebase reference', () => {
      const ref = firebaseServer.ref().child('items');
      assert.equal(_.getPathFromRef(ref), 'items');
    });
    
    it('should find a two deep path from the Firebase reference', () => {
      const ref = firebaseServer.ref().child('items/1');
      assert.equal(_.getPathFromRef(ref), 'items/1');
    });
    
    it('should find a three deep path from the Firebase reference', () => {
      const ref = firebaseServer.ref().child('items/1/2');
      assert.equal(_.getPathFromRef(ref), 'items/1/2');
    });
        
  });
  
  describe('merge', () => {
    
    it('should merge two objects', () => {
      
      const obj1 = { key: 'key' };
      const obj2 = { key2: 'key2', key3: 'key3'};
      const merged = _.merge(obj1, obj2);
      const expected = { key: 'key', key2: 'key2', key3: 'key3' };
      assert.deepEqual(expected, merged);
      
    });
    
  });
  
});