'use strict'
const firebaseServer = require('../firebaseServer');
import * as querybase from '../../entry';
import * as helpers from '../helpers';
import * as assert from 'assert';
import * as chai from 'chai';
import * as sinon from 'sinon';

const QuerybaseQuery = querybase.QuerybaseQuery;
const expect = chai.expect;

describe('QuerybaseQuery', () => {

  let queryRef;
  beforeEach(() => queryRef = new QuerybaseQuery(ref.orderByChild('value')));

  const ref = firebaseServer.ref().child('items');

  describe('constructor', () => {

    it('should set a FirebaseQuery', () => {
      const query = ref.orderByChild('value');
      const querybaseQuery = new QuerybaseQuery(query);
      assert.equal(helpers.isFirebaseQuery(querybaseQuery.query()), true);
    });

  });

  describe('lessThan', () => {

    it('should call FirebaseQuery.endAt', () => {
      sinon.spy(queryRef.query(), 'endAt');
      queryRef.lessThan(3);
      expect(queryRef.query().endAt.calledOnce).to.be.ok;
      queryRef.query().endAt.restore();
    });

  });

  describe('greaterThan', () => {

    it('should call FirebaseQuery.startAt', () => {
      sinon.spy(queryRef.query(), 'startAt');
      queryRef.greaterThan(100);
      expect(queryRef.query().startAt.calledOnce).to.be.ok;
      queryRef.query().startAt.restore();
    });

    it('should return a Firebase Query', () => {
      const query = queryRef.greaterThan(3);
      assert.equal(helpers.isFirebaseQuery(query), true);
    });

  });

  describe('startsWith', () => {

    it('should call FirebaseQuery.startAt and FirebaseQuery.endAt', () => {

      sinon.spy(queryRef.query(), 'startAt');
      // TODO: How to spy on the chained query
      //sinon.spy(queryRef.query().startAt(), 'endAt');

      queryRef.startsWith('Davi');

      // TODO: call startAt with the first character of the string
      expect(queryRef.query().startAt.calledOnce).to.be.ok;
      queryRef.query().startAt.restore();

      // TODO: call endAt with the whole character plus "\uF8FF"
      // expect(queryRef.query().endAt.calledOnce).to.be.ok;
      // queryRef.query().endAt.restore();

    });

    it('should return a Firebase Query', () => {
      const query = queryRef.startsWith('D');
      assert.equal(helpers.isFirebaseQuery(query), true);
    });

  });

  describe('between', () => {

    it('should call FirebaseQuery.startAt and FirebaseQuery.endAt', () => {
      // TODO: call startAt with the valueOne
      // TODO: call endAt with valueTwo
      sinon.spy(queryRef.query(), 'startAt');
      queryRef.between(11, 99);
      expect(queryRef.query().startAt.calledOnce).to.be.ok;
      queryRef.query().startAt.restore();
    });

    it('should return a Firebase Query', () => {
      const query = queryRef.between(1, 10);
      assert.equal(helpers.isFirebaseQuery(query), true);
    });

  });

  describe('equalTo', () => {

    it('should call FirebaseQuery.equalTo', () => {
      sinon.spy(queryRef.query(), 'equalTo');
      queryRef.equalTo('something awesome');
      expect(queryRef.query().equalTo.calledOnce).to.be.ok;
      queryRef.query().equalTo.restore();
    });

    it('should return a Firebase Query', () => {
      const query = queryRef.equalTo('someValue');
      assert.equal(helpers.isFirebaseQuery(query), true);
    });

  });

});