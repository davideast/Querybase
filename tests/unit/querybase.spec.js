/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/chai/chai.d.ts" />

const MockFirebase = require('mockfirebase');
const Querybase = require('../../dist/querybase');
const assert = require('assert');
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

describe('Querybase', () => {
  
  it('should exist', () => { expect(Querybase).to.exist; })
  
});