var gulp = require('gulp')
var gutil = require('gulp-util')
var source = require('vinyl-source-stream')
var watchify = require('watchify')
var browserify = require('browserify')
var reactify = require('reactify')
var rename = require('gulp-rename')
var replace = require('gulp-replace')
var p = require('partialify/custom')
var uglify = require('gulp-uglify')
var streamify = require('gulp-streamify')
var babelify = require("babelify")

var gulp = require('gulp');
var react = require('gulp-react');

//
// Watch [development]
//

gulp.task('watch', function() {

    var libname = 'app.js'

    function doBundle() {
        return bundler.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source(libname))
            .pipe(gulp.dest('./www'))
    }

    var bundler = watchify(browserify(
        {entries: ['lib/index.js']},
        watchify.args))
    bundler.transform(babelify)
    bundler.transform(reactify)
    bundler.transform(p.alsoAllow('xml'))
    bundler.on('update', doBundle) // on any dep update, runs the bundler
    bundler.on('log', gutil.log); // output build logs to terminal
    return doBundle()
})
