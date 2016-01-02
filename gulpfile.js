/// <reference path="./typings/gulp/gulp.d.ts" />

'use strict';

const gulp = require('gulp');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const ts = require('gulp-typescript');
const mocha = require('gulp-mocha');
const runSequence = require('run-sequence');

gulp.task('clean', () => del(['examples/*.js', 'examples/*.js.map', '!examples/index.js', 'dist']));

gulp.task('typescript', ['clean'], () => {
	return gulp.src('./src/Querybase.ts')
    .pipe(sourcemaps.init())
		.pipe(ts({
   		sortOutput: true,
			module: 'commonjs',
			target: 'es5',
      out: 'querybase.js'
	  }))
    .pipe(sourcemaps.write())
    .pipe(uglify())
		.pipe(gulp.dest('./dist'))
    .pipe(gulp.dest('./examples'));  
});

gulp.task('test', () => {
  return gulp.src('./tests/unit/**.spec.js', { read: false })
	 .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('default', () => runSequence('clean', 'typescript', 'test'));