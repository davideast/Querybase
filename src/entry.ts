import { Querybase, DatabaseReference } from './querybase';
import { _ } from './QuerybaseUtils';
import { QuerybaseQuery } from './QuerybaseQuery';

/**
 * Convienence function to match Firebase SDK design.
 * use:
 *  const ref = firebase.database.ref('items');
 *  querybase.ref(ref, ['prop1', 'prop2']);
 */
function ref(ref: DatabaseReference, indexes: string[]) {
  return new Querybase(ref, indexes);
}

/**
 * Export all structures for external use
 * use:
 *   import * as querybase from 'querybase';
 *   const ref = firebase.database.ref('items');
 *   querybase.ref(ref, ['prop1', 'prop2']);
 *   // or use low-level types
 *   const customQuerybase = new querybase.Querybase(ref, ['prop1', 'prop2']);
 *   const query = ref.orderByChild('prop1');
 *   const querybaseQuery = new querybase.QuerybaseQuery(query);
 *   querybaseQuery.greaterThan(10);
 */
export {
  ref,
  Querybase,
  QuerybaseQuery,
  _ as QuerybaseUtils
}
