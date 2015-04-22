var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var _ = require('lodash');
var args = require('yargs').argv;

var config = require('./gulp.config')();

gulp.task('default', ['help']);

gulp.task('help', plugins.taskListing);

gulp.task('jscs', function () {
    return gulp
        .src(config.alljs)
        .pipe(plugins.jscs());
});

gulp.task('lint', function () {
    return gulp
        .src(config.alljs)
        .pipe(plugins.plumber())
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish', {
            verbose: true
        }));
});

gulp.task('build', ['lint', 'jscs'], function () {
    return gulp
        .src(config.alljs)
        .pipe(plugins.plumber())
        .pipe(plugins.jscs())
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish', {
            verbose: true
        }));
});

gulp.task('bump', function () {
    var type = args.type;
    var version = args.version;
    var options = {};

    if (version) {
        options.version = version;
    } else {
        options.type = type;
    }

    return gulp
        .src(config.packages)
        .pipe(plugins.bump(options))
        .pipe(gulp.dest(config.root));
});
