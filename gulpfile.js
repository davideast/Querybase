'use strict';

const gulp = require('gulp');
const del = require('del');
const mocha = require('gulp-mocha');
const runSequence = require('run-sequence');
const istanbul = require('gulp-istanbul');
const firebaseServer = require('./src/tests/firebaseServer');
const uglify = require('gulp-uglify');
const size = require('gulp-size');
const ts = require('gulp-typescript');
const rollup = require('gulp-better-rollup')
const rename = require('gulp-rename');
const tsProject = ts.createProject('tsconfig.json');
const testTsProject = ts.createProject('tsconfig.test.json');

const exit = () => process.exit(0);

gulp.task('clean', () => del(['examples/*.js', 'examples/*.js.map', '!examples/index.js', 'dist', 'es6']));

gulp.task('ts', () => {
  const tsResult = tsProject.src()
    .pipe(tsProject());
  return tsResult.js
    .pipe(gulp.dest('./es6'));
});

gulp.task('rollup', () => {
  return gulp.src('./es6/entry.js')
    .pipe(rollup({
      entry: './es6/entry.js',
      moduleName: 'querybase'
    }, 'umd'))
    .pipe(rename('querybase.umd.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('uglify', () => {
  return gulp
    .src('./dist/querybase.umd.js')
    .pipe(uglify({ mangle: true }))
    .pipe(rename('querybase.umd.min.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('size', () => {
  return gulp
    .src('./dist/querybase.umd.min.js')
    .pipe(size({
      showFiles: true,
      gzip: true
    }));
});

gulp.task('ts-tests', () => {
  const tsResult = testTsProject.src()
    .pipe(testTsProject());
  return tsResult.js
    .pipe(gulp.dest('./dist'));
});

gulp.task('pre-test', () => {
  return gulp
    .src([
      './dist/entry.js',
      './dist/querybase.js',
      './dist/QuerybaseQuery.js',
      './dist/QuerybaseUtils.js',
    ])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['firebaseServer'], () => {
  return gulp
   .src('./dist/tests/unit/**.spec.js', { read: false })
	 .pipe(mocha({ reporter: 'spec' }))
   .pipe(istanbul.writeReports());
});

gulp.task('firebaseServer', () => {
  firebaseServer.initializeApp();
});

gulp.task('default', runSequence(
  'clean',
  'ts',
  'rollup',
  'ts-tests',
  'pre-test',
  'test',
  'uglify',
  'size',
  exit
  )
);