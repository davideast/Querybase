<p align="center">
  <img height="250px" width="250px" src="https://raw.githubusercontent.com/davideast/Querybase/master/logos/logo_small.png">
  <p align="center">Bringing the <code>.where()</code> statement to Firebase</p>
</p>

## What is Querybase?

- **.where()** - Find records by multiple fields.
- **No client-side filtering** - Querybase genererates composite keys to provide querying on multiple fields.
- **Simple Query API** - Use common query methods such as `.greaterThan()`, `.lessThan()`, and `.startsWith()`.

## Documentation

Querybase takes a Firebase references with a list of fields to create composite keys. 

### Querying using multiple fields

```js
 const firebaseRef = new Firebase('<my-app>/people');
 const querybaseRef = new Querybase(firebaseRef, ['name', 'age', 'location']);
 
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
  // returns a Firebase ref
  .on('value', (snap) => {
    console.log(snap);
  });
 
 ```
 
### Querying using one field
 
 ```js
 // Querybase for single criteria, returns a Firebase Ref
 querybaseRef.where({ name: 'David'});
  
 // Querybase for a single string criteria, returns
 // a QuerybaseQuery, which returns a Firebase Ref
 querybaseRef.where('name').startsWith('Da');
 querybaseRef.where('age').lessThan(30);
 querybaseRef.where('age').greaterThan(20);
 querybaseRef.where('age').between(20, 30);
 ```