'use strict';

var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var bump = require('gulp-bump');
var zip = require('gulp-zip');
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
                    .on('error', function (err) {
                        gutil.log(err.name, err.loc);
                        console.log(err.codeFrame);
                    })
                    .pipe(source(entry))
                    .pipe(rename(function(path) {
                        path.basename = path.basename.replace(/entry$/, 'bundle')
                    }))
                    .pipe(gulp.dest('./'));

                return stream;
            };

            bundler.on('log', gutil.log);
            bundler.on('update', rebundle);
            return rebundle();

        });
        es.merge(tasks).on('end', done);
    });
});

gulp.task('bump', function() {
    var types = {
        p: 'patch',
        m: 'minor'
    }
    var type = 'patch';
    Object.keys(options).some(function(opt) {
        if (types[opt]) {
            type = types[opt];
            return true;
        }
    });
    gulp
        .src(['./package.json', './src/manifest.json'], {
            base: '.'
        })
        .pipe(bump({type: type}))
        .pipe(gulp.dest('./'));
});

gulp.task('dist', function() {
    var keyPath = path.join(process.env.HOME, '.keys', 'bem-chrome-devtools.pem');
    var version = require('./src/manifest').version;
    return es.merge([
            gulp.src('src/**'),
            gulp.src(keyPath).pipe(rename('key.pem'))
        ])
        .pipe(zip('bem-devtools-' + version + '.zip'))
        .pipe(gulp.dest('dist'));
});
