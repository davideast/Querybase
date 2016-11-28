const rollup = require('rollup');
const fs = require('fs');
const uglify = require('uglify-js');
const OUT_FILE = './dist/querybase.umd.js';

rollup.rollup({
  entry: 'es6/entry.js'
}).then(bundle => {
  const result = bundle.generate({
    format: 'umd',
    moduleName: 'querybase'
  });

  bundle.write({
    format: 'umd',
    dest: OUT_FILE,
    moduleName: 'querybase'
  });
});