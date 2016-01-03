/// <reference path="../typings/gulp/gulp.d.ts" />

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const merge = require('merge2');

const tsBuild = (config) => {  
  config = config || {};
  const path = config.path || './src/Querybase.ts';
  const declaration = config.declaration || false
  const tsResult = gulp.src(path)
    .pipe(sourcemaps.init())
		.pipe(ts({
   		sortOutput: true,
			module: 'commonjs',
			target: 'es5',
      out: 'querybase.js',
      declaration: declaration
	  }));
    
    if (declaration) {
      return merge([
		    tsResult.dts
          .pipe(gulp.dest('./dist'))
          .pipe(gulp.dest('./typings/querybase')),
		    tsResult.js
          .pipe(gulp.dest('./dist'))
          .pipe(sourcemaps.write())
	    ]); 
    } 
    
    return tsResult.pipe(sourcemaps.write());
};

module.exports = tsBuild;