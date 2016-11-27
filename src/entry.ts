import { Querybase, DatabaseReference } from './Querybase';
import { _ } from './QuerybaseUtils';
import { QuerybaseQuery } from './QuerybaseQuery';

function ref(ref: DatabaseReference, indexes: string[]) {
  return new Querybase(ref, indexes);
}

export {
  ref,
  Querybase,
  QuerybaseQuery,
  _ as QuerybaseUtils
}