'use strict';
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const ts = require('gulp-typescript');


gulp.task('clean', () => { del(['examples/*.js', 'examples/*.js.map', '!examples/index.js', 'dist']); });
gulp.task('default', ['clean'], () => { 
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