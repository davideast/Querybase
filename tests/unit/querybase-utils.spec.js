/// <reference path="../../typings/tsd.d.ts" />

const _ = require('../../dist/querybase').QuerybaseUtils;
const assert = require('assert');
const chai = require('chai');
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
  
});