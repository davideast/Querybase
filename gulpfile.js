const gulp = require('gulp')
const ts = require('gulp-typescript');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const browserify = require('gulp-browserify');

gulp.task('default', function() {
	var tsResult = gulp.src('src/**/*.ts')
		.pipe(sourcemaps.init())
		.pipe(ts({
   		sortOutput: true,
			module: 'commonjs',
			target: 'es5'
		}));

	return tsResult.js
		.pipe(concat('querybase.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist'))
		.pipe(gulp.dest('examples'));
});
