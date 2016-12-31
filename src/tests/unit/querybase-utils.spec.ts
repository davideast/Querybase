import { QuerybaseUtils as _ } from '../../entry';
import * as firebaseServer from '../firebaseServer';
import * as helpers from '../helpers';
import * as assert from 'assert';
import * as chai from 'chai';

const should = chai.should();
const expect = chai.expect;

describe('QuerybaseUtils', () => {

  const smallRecord = {
    zed: 'a',
    name: 'David',
    time: '5:01'
  };

  const mediumRecord = {
    zed: 'a',
    zzzz: 'zzzz',
    name: 'David',
    time: '5:01',
    alpha: 'a',
    yogi: 'bear',
    jon: 'jon'
  };

  const smallRecordKeys = _.keys(smallRecord);
  const smallRecordValues = _.values(smallRecord);
  const mediumRecordKeys = _.keys(mediumRecord);
  const mediumRecordValues = _.values(mediumRecord);

  const sortedSmallRecord = {
    name: 'David',
    time: '5:01',
    zed: 'a'
  };

  const sortedMediumRecord = {
    'alpha': 'a',
    'jon': 'jon',
    'name': 'David',
    'time': '5:01',
    'yogi': 'bear',
    'zed': 'a',
    'zzzz': 'zzzz'
  };

  it('should exist', () => { expect(_).to.exist; })

  describe('indexKey', () => {

    it('should return the proper key', () => {
      assert.equal('~~', _.indexKey());
    });

  });

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

  describe('lexicographicallySort', () => {

    it('should lexicographically sort', () => {
      const sorted = smallRecordKeys.slice().sort(_.lexicographicallySort);
      assert.deepEqual(['name', 'time', 'zed'], sorted);
    });

    it('should lexicographically sort', () => {
      const sorted = mediumRecordKeys.slice().sort(_.lexicographicallySort);
      const expectedOrder = [
        'alpha',
        'jon',
        'name',
        'time',
        'yogi',
        'zed',
        'zzzz'
       ];
      assert.deepEqual(expectedOrder, sorted);
    });

  });

  describe('getKeyIndexPositions', () => {

    it('should create an object with the index positions', () => {

      const indexOfKeys = _.getKeyIndexPositions(smallRecordKeys);
      assert.deepEqual({ 'zed': 0, 'name': 1, 'time': 2 }, indexOfKeys);

    });

  });

  describe('createSortedObject', () => {

    it('should create a sorted object', () => {
      const sortedRecord = _.createSortedObject(smallRecordKeys, smallRecordValues);
      assert.deepEqual(_.keys(sortedRecord), _.keys(sortedSmallRecord));
    })

    it('should create a sorted object', () => {
      const sortedRecord = _.createSortedObject(mediumRecordKeys, mediumRecordValues);
      assert.deepEqual(_.keys(sortedMediumRecord), _.keys(sortedRecord));
    })

  });

  describe('sortObjectLexicographically', () => {

    it('sort an object lexicographically', () => {
      const sortedRecord = _.sortObjectLexicographically(smallRecord);
      assert.deepEqual(_.keys(sortedSmallRecord), _.keys(sortedRecord));
    });

    it('sort an object lexicographically', () => {
      const sortedRecord = _.sortObjectLexicographically(mediumRecord);
      assert.deepEqual(_.keys(sortedMediumRecord), _.keys(sortedRecord));
    });

  });

});