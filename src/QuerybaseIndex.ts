import {QuerybaseUtils} from "./QuerybaseUtils";

const _ = new QuerybaseUtils();

export function indexify(indexes: any[], data: Object, indexHash?: Object) {
  // create a copy of the array to not modifiy the original properties
  const propCop = indexes.slice();
  // remove the first property, this ensures no redundant keys are created (age_name vs. name_age)
  const mainProp = propCop.shift()
  // recursive check for the indexHash
  indexHash = indexHash || {};

  propCop.forEach((prop) => {
    var propString = "";
    var valueString = "";
      
    // first level keys
    indexHash["_" + _.createKey(mainProp, prop)] = _.createKey(data[mainProp], data[prop]);

    // create indexes for all property combinations
    propCop.forEach((subProp) => {
      propString = _.createKey(propString, subProp);
      valueString = _.createKey(valueString, data[subProp]);
    });
      
    indexHash["_" + mainProp + propString] = data[mainProp] + valueString;
      
  });

  if (propCop.length !== 0) {
    indexify(propCop, data, indexHash);
  }

  return indexHash;  
}