/// <reference path="../typings/firebase/firebase.d.ts" />

export default class QuerybaseQuery {
  query: FirebaseQuery;
  
  constructor(query: FirebaseQuery) {
    this.query = query;
  }
  
  lessThan(value) {
    return new QuerybaseQuery(this.query.endAt(value));
  }
  
  greaterThan(value) {
    return this.query.startAt(value);
  }
  
  equalTo(value) {
    return this.query.equalTo(value);
  }
  
  startsWith(value) {
    const firstChar = value.substr(0, 1);
    return this.query.startAt(firstChar).endAt(`${value}\uf8ff`);
  }
  
  between(valueOne: number, valueTwo: number) {
    return this.query.startAt(valueOne).endAt(valueTwo);
  }
  
}