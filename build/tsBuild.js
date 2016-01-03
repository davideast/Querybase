/// <reference path="../typings/gulp/gulp.d.ts" />

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const merge = require('merge2');
const rename = require("gulp-rename");
const uglify = require('gulp-uglify');

const tsBuild = () => {  
  const path = './src/Querybase.ts';
  const tsResult = gulp.src(path)
    .pipe(sourcemaps.init())
		.pipe(ts({
   		sortOutput: true,
			module: 'commonjs',
			target: 'es5',
      out: 'querybase.js',
      declaration: true
	  }));
    

    return merge([
        
      // querybase.d.ts
		  tsResult.dts
        .pipe(gulp.dest('./dist'))
        .pipe(gulp.dest('./typings/querybase')),
          
      // querybase.js
		  tsResult.js
        .pipe(gulp.dest('./dist'))
        .pipe(sourcemaps.write()),
        
      // querybase.min.js
      tsResult.js
        .pipe(uglify())
        .pipe(rename('querybase.min.js'))
        .pipe(gulp.dest('./dist'))
          
	  ]); 
    
    
    return tsResult.pipe(sourcemaps.write());
};

module.exports = tsBuild;