'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var glob = require('glob');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var es = require('event-stream');
var minimist = require('minimist');
var options = minimist(process.argv.slice(2));
var production = process.env.NODE_ENV === 'production';

var WATCH = false;

gulp.task('enable-watch', function() {
    WATCH = true;
})

gulp.task('watch', ['enable-watch', 'build']);

gulp.task('build', function(done) {
    glob('./src/pages/*/*.entry.js', function(err, files) {
        if (err) {
            done(err);
            return;
        }
        var tasks = files.map(function(entry) {
            var bundler = browserify({
                    entries: [entry],
                    debug: !production,
                    cache: {}, // required for watchify
                    packageCache: {}, // required for watchify
                    fullPaths: WATCH // required to be true only for watchify
                });

            if (WATCH) {
                bundler.plugin(watchify, {
                    delay: 100,
                    ignoreWatch: ['**/node_modules/**'],
                    poll: true
                });
            }

            bundler.transform('babelify', {presets: ['es2015', 'react']});

            var rebundle = function() {
                gutil.log('Start rebuild');
                var stream = bundler
                    .bundle()
                    .pipe(source(entry))
                    .pipe(rename(function(path) {
                        path.basename = path.basename.replace(/entry$/, 'bundle')
                    }))
                    .pipe(gulp.dest('./'));

                stream.on('error', gutil.log);
                return stream;
            };

            bundler.on('log', gutil.log);
            bundler.on('update', rebundle);
            return rebundle();

        });
        es.merge(tasks).on('end', done);
    });
});
