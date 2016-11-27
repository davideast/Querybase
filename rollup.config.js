const rollup = require('rollup');
const fs = require('fs');

rollup.rollup({
  // The bundle's starting point. This file will be
  // included, along with the minimum necessary code
  // from its dependencies
  entry: 'es6/entry.js',
}).then(function (bundle) {
  // Generate bundle + sourcemap
  const result = bundle.generate({
    // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
    format: 'umd',
    moduleName: 'querybase'
  });

  //fs.writeFileSync('querybase.js', result.code);

  // Alternatively, let Rollup do it for you
  // (this returns a promise). This is much
  // easier if you're generating a sourcemap
  bundle.write({
    format: 'umd',
    dest: './dist/querybase.umd.js',
    moduleName: 'querybase'
  });
});