<p align="center">
  <img height="75px" width="411px" src="https://raw.githubusercontent.com/davideast/Querybase/master/logos/logo-large.png">
  <p align="center">Bringing the <code>.where()</code> statement to Firebase</p>
</p>

[![Build Status](https://travis-ci.org/davideast/Querybase.svg?branch=master)](https://travis-ci.org/davideast/Querybase)

## What is Querybase?

- **.where()** - Find records by multiple fields.
- **No client-side filtering** - Querybase genererates composite keys to provide querying on multiple fields.
- **Simple Query API** - Use common query methods such as `.greaterThan()`, `.lessThan()`, and `.startsWith()`.

## Documentation

Querybase takes a Firebase Database reference with a list of fields to create composite keys. 

### Querying using multiple fields

```js
 
 // Set the configuration for your app
 // TODO: Replace with your project's config object
 const config = {
   apiKey: '<your-api-key>',
   authDomain: '<your-auth-domain>',
   databaseURL: '<your-database-url>',
   storageBucket: '<your-storage-bucket>'
 };
 firebase.initializeApp(config);

 // Get a reference to the database service
 const database = firebase.database();
 const databaseRef = database.ref().child('people');
 const querybaseRef = querybase.ref(databaseRef, ['name', 'age', 'location']);
 
 // Automatically handles composite keys
 querybaseRef.push({ 
   name: 'David',
   age: 27,
   location: 'SF'
 });
 
// Find records by multiple fields
querybaseRef
  .where({
    name: 'David',
    age: 27
  })
  // returns a Firebase Database ref
  .on('value', (snap) => {
    console.log(snap);
  });
 
 ```
 
### Querying using one field
 
 ```js
  // Get a reference to the database service
 const database = firebase.database();
 const databaseRef = database.ref().child('people');
 const queryRef = querybase.query(databaseRef);
 // Querybase for single criteria, returns a Firebase Ref
 querybaseRef.where({ name: 'David'});
  
 // Querybase for a single string criteria, returns
 // a QuerybaseQuery, which returns a Firebase Ref
 querybaseRef.where('name').startsWith('Da');
 querybaseRef.where('age').lessThan(30);
 querybaseRef.where('age').greaterThan(20);
 querybaseRef.where('age').between(20, 30);
 ```