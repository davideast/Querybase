/// <reference path="./typings/gulp/gulp.d.ts" />

'use strict';

const gulp = require('gulp');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const ts = require('gulp-typescript');
const mocha = require('gulp-mocha');
const runSequence = require('run-sequence');
const istanbul = require('gulp-istanbul');
const rename = require("gulp-rename");
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

gulp.task('clean', () => del(['examples/*.js', 'examples/*.js.map', '!examples/index.js', 'dist']));

gulp.task('typescript', ['clean'], () => {
	return tsBuild({ declaration: true })
		.pipe(gulp.dest('./dist'))
    .pipe(gulp.dest('./examples'));  
});

gulp.task('min', () => {
  return tsBuild()
    .pipe(uglify())
    .pipe(rename('quertbase.min.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('pre-test', function () {
  return gulp
    .src(['./dist/querybase.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['typings', 'pre-test'], () => {
  return gulp
   .src('./tests/unit/**.spec.js', { read: false })
	 .pipe(mocha({ reporter: 'spec' }))
   .pipe(istanbul.writeReports());
});

gulp.task('typings', () => {
  return gulp
    .src('./tests/**/*.d.ts')
    .pipe(gulp.dest('./typings'));
});

gulp.task('default', () => runSequence('clean', 'typescript', 'min', 'test'));