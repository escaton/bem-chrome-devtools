'use strict';

var gulp = require('gulp');
var glob = require('glob');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var es = require('event-stream');

gulp.task('build', function(done) {
    glob('./src/pages/*/*.entry.js', function(err, files) {
        if (err) {
            done(err);
            return;
        }
        var tasks = files.map(function(entry) {
            return browserify({
                    entries: [entry]
                })
                .transform('babelify', {presets: ['es2015', 'react']})
                .bundle()
                .pipe(source(entry))
                .pipe(rename(function(path) {
                    path.basename = path.basename.replace(/entry$/, 'bundle')
                }))
                .pipe(gulp.dest('./'));
        });
        es.merge(tasks).on('end', done);
    });
});
