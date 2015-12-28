'use strict';

const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const gutil = require('gulp-util');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const tsify = require('tsify');

gulp.task('default', function () {
  // set up the browserify instance on a task basis
  const b = browserify({
    debug: true,
  });

  return b
    .add('./src/main.ts')
    .plugin(tsify, {
   		sortOutput: true,
			module: 'commonjs',
			target: 'es5'
	  })
    .bundle()
    .pipe(source('Querybase.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/'))
    .pipe(gulp.dest('./examples/'));
});