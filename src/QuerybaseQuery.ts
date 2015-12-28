/// <reference path="../typings/firebase/firebase.d.ts" />

export default class QuerybaseQuery {
  query: FirebaseQuery;
  
  constructor(query: FirebaseQuery) {
    this.query = query;
  }
  
  lessThan(value: any) {
    return new QuerybaseQuery(this.query.endAt(value));
  }
  
  greaterThan(value: any) {
    return this.query.startAt(value);
  }
  
  equalTo(value: any) {
    return this.query.equalTo(value);
  }
  
}