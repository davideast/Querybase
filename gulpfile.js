'use strict';

const gulp = require('gulp');
const del = require('del');
const mocha = require('gulp-mocha');
const runSequence = require('run-sequence');
const istanbul = require('gulp-istanbul');
const firebaseServer = require('./tests/firebaseServer');
const size = require('gulp-filesize');
const execSync = require('child_process').execSync;

const exit = () => process.exit(0);

gulp.task('clean', () => del(['examples/*.js', 'examples/*.js.map', '!examples/index.js', 'dist']));

gulp.task('ts', () => {
  const tsCode = execSync('tsc');
  const rollupCode = execSync('node rollup.config');
  const uglifyCode = execSync('uglifyjs --compress --mangle -- ./dist/querybase.umd.js > ./dist/querybase.umd.min.js')
});

gulp.task('pre-test', () => {
  return gulp
    .src(['./dist/querybase.umd.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

// Use for build process, continues stream
gulp.task('test', ['firebaseServer', 'pre-test'], () => {
  return gulp
   .src('./tests/unit/**.spec.js', { read: false })
	 .pipe(mocha({ reporter: 'spec' }))
   .pipe(istanbul.writeReports());
});

gulp.task('firebaseServer', () => {
  firebaseServer.initializeApp();
});

gulp.task('default', runSequence('clean', 'ts', 'test', exit));