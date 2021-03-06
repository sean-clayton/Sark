var gulp = require('gulp');
var compiler = require('babel-core/register');
var exec = require('child_process').exec;
var path = require('path');
var del = require('del');
var runSequence = require('run-sequence');
var plugins = require('gulp-load-plugins')({rename: {
    'gulp-babel-istanbul': 'babelIstanbul'
  }});

const paths = {
	js: ['.*.js', './src/*.js', './src/server/*.js'],
	tests: ['./test/*.js'],
	other: ['./package.json', './.gitignore'],
};

gulp.task('lint', function () {
    return gulp.src(paths.js)
        .pipe(plugins.eslint())
        .pipe(plugins.eslint.format())
        .pipe(plugins.eslint.failAfterError());
});

gulp.task('babel', () =>{
	var stream = gulp.src(paths.js.concat(['!gulpfile.js']), { base: '.' })
		.pipe(plugins.newer('dist'))
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.babel())
		.pipe(plugins.sourcemaps.write('.', {
			includeContent: false,
			sourceRoot(file) {
				return path.relative(file.path, __dirname);
			}
		}))
		.pipe(gulp.dest('dist'))
	return stream
});

gulp.task('pre-test', function () {
  return gulp.src(paths.js)
    // Covering files
    .pipe(plugins.babelIstanbul())
    // Force `require` to return covered files
    .pipe(plugins.babelIstanbul.hookRequire());
});

gulp.task('copy', () =>{
	var stream = gulp.src(paths.other)
		.pipe(plugins.newer('dist'))
		.pipe(gulp.dest('dist'));
	return stream
});

gulp.task('copy-public', () => {
	var stream = gulp.src('./src/public/**/*', { base: 'scr'})
		.pipe(plugins.newer('dist/public/'))
		.pipe(gulp.dest('dist/public/'));
	return stream
});

gulp.task('clean', () =>{
	var stream = del(['dist/**', 'coverage/**', '!logs/.gitignore'])
	return stream
});

gulp.task('set-test-env', function () {
  plugins.env({
    vars: {
      NODE_ENV: 'test'
    }
  })
});

//******************** MAIN TASKS ************************

gulp.task('dev', ['babel', 'copy', 'copy-public', 'lint'], function () {
	var stream = plugins.nodemon({ script: './dist/src/index.js'
	      , ext: 'html js'
	      ,	ignore: ['node_modules/**/*.js', 'dist/**/*.*', 'git/*']
	      , tasks: ['copy', 'copy-public', 'babel', 'lint']})
    return stream
})

gulp.task('test', ['babel', 'pre-test', 'set-test-env'], function () {
  return gulp.src(paths.tests)
  	.pipe(plugins.mocha({
  		compilers : { js: compiler },
  		timeout : 240000,
  	}))
    .pipe(plugins.babelIstanbul.writeReports())
    .pipe(plugins.babelIstanbul.enforceThresholds({ thresholds: { global: 50 } }))
    .once('end', function () {
      process.exit();
    });;
});

gulp.task('commit', () => {
	runSequence(['lint', 'test'], 'clean');
});