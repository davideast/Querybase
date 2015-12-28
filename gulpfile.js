'use strict';

const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const gutil = require('gulp-util');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const tsify = require('tsify');
const del = require('del');

const setupBrowserify = (srcFile, outputFile) => {
  // set up the browserify instance on a task basis
  const b = browserify({
    debug: true,
  });

  return b
    .add(srcFile)
    .plugin(tsify, {
   		sortOutput: true,
			module: 'commonjs',
			target: 'es5'
	  })
    .bundle()
    .pipe(source(outputFile))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/'))
    .pipe(gulp.dest('./examples/'));
}

gulp.task('clean', () => { del(['examples/*.js', 'examples/*.js.map', 'dist']); });
gulp.task('default', ['clean'], () => { setupBrowserify('./src/web.ts', 'querybase.js'); });