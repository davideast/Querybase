export type DatabaseQuery = firebase.database.Query;

/**
 * QuerybaseQuery - Provides a simple querying API
 * 
 * A QuerybaseQuery is created through using a string criteria
 * on a Querybase reference. It is not meant to be directly created.
 * 
 * @param {DatabaseQuery} query 
 * 
 * @example
 *  const firebaseRef = firebase.database.ref.child('people');
 *  const querybaseRef = querybase.ref(firebaseRef, ['name', 'age', 'location']);
 * 
 *  // Querybase for a single string criteria, returns
 *  // a QuerybaseQuery, which returns a Firebase Ref
 *  querybaseRef.where('name').startsWith('Da');
 *  querybaseRef.where('age').lessThan(30);
 *  querybaseRef.where('locaton').equalTo('SF');
 *  querybaseRef.where('age').greaterThan(20);
 *  querybaseRef.where('age').between(20, 30);
 */
export class QuerybaseQuery {

  // read-only DatabaseQuery
  private query: () => DatabaseQuery;

  constructor(query: DatabaseQuery) {
    this.query = () => query;
  }

  /**
   * Find a set of records smaller than the provided value.
   * @param {any} value
   * @return {DatabaseQuery}
   */
  lessThan(value) {
    return this.query().endAt(value);
  }

  /**
   * Find a set of records larger than the provided value.
   * @param {any} value
   * @return {DatabaseQuery}
   */
  greaterThan(value) {
    return this.query().startAt(value);
  }

  /**
   * Find a set of records the same as the provided value.
   * @param {any} value
   * @return {DatabaseQuery}
   */
  equalTo(value) {
    return this.query().equalTo(value);
  }

  /**
   * Find a set of records that begins with the provided value.
   * @param {string} value
   * @return {DatabaseQuery}
   */
  startsWith(value: string) {
    const firstChar = value.substr(0, 1);
    return this.query().startAt(firstChar).endAt(`${value}\uf8ff`);
  }

  /**
   * Find a set of records between the provided values.
   * @param {string} value
   * @return {DatabaseQuery}
   */
  between(valueOne: any, valueTwo: any) {
    return this.query().startAt(valueOne).endAt(valueTwo);
  }

}