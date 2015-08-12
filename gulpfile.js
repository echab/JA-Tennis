'use strict';
var pkg = require('./package.json'),
	gulp = require('gulp'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    inlineAngularTemplates = require('gulp-inline-angular-templates'),
    //angularTemplatecache = require('gulp-angular-templatecache'),
	uglify = require('gulp-uglify'),
	minifyCss = require('gulp-minify-css'),
	//rename = require('gulp-rename'),
	usemin = require('gulp-usemin'),
	minifyHtml = require('gulp-minify-html'),
	replace = require('gulp-replace'),
    targethtml = require('gulp-targethtml'),
    //through = require('gulp-through'),
    filelog = require('gulp-filelog'),
    //notify = require('gulp-notify')
    zip = require('gulp-zip'),
    ftp = require('gulp-ftp'),
    fs = require('fs'),
    ftppass = JSON.parse(fs.readFileSync('../.ftppass', 'utf8')),
    del = require('del')
;

gulp.task('clean', function (cb) {
    del(['dist/**'], cb); //use a callback
});

gulp.task('template', ['html'], function () {
    return gulp.src(['app/*/*.html', '!**/_*.html'])
        .pipe(minifyHtml())
        .pipe(inlineAngularTemplates('dist/index.html', {
            base: 'app',
            unescape: {
                '&lt;': '<',
                '&gt;': '>',
                '&apos;': '\'',
                '&amp;': '&'
            }
        }))
        //.pipe(angularTemplatecache())
		.pipe(gulp.dest('dist/'))
    ;
});

gulp.task('html', function () {
    return gulp.src(['app/index.html'])
        .pipe(targethtml('dist'))
		.pipe(usemin({
		    css: [minifyCss(), 'concat'], //
		    html: [], //[minifyHtml({empty: true})],
		    js: [
                //sourcemaps.init({ loadMaps: true }),
                uglify({
                    mangle: true,
                    compress: {
                        drop_debugger: true,
                        dead_code: false,
                        unused: false
                    }
                }),
                //sourcemaps.write('.')
		    ]
		    //}), rev()]
		}))
		.pipe(gulp.dest('dist/'));
});

gulp.task('copy', function () {
    return gulp.src(['app/**/*.{ico,png}', 'app/.htaccess'])
		.pipe(gulp.dest('dist'));
});

gulp.task('appcache', function () {
    return gulp.src(['app/jatennis.appcache'])
        .pipe(replace(/{{ VERSION }}/g, pkg.version))
        .pipe(replace(/{{ DATE }}/g, new Date().toISOString()))
		.pipe(gulp.dest('dist'));
});


gulp.task('backup', function () {
    return gulp.src([
            '**/*.{ts,html,css,ico,png,appcache,cmd,sln,vbproj,config}',
            '**/{math-mock,ui-bootstrap-mocks}.js',
            'package.json',
            '.htaccess',
            '.ftppass',
            '*file.js',
            '!node_modules/**', '!lib/angular/**', '!lib/ui-bootstrap/**', '!lib/typings/**', '!dist/**', '!bin/**'])
    .pipe(zip('JA-Tennis_' + (new Date().toISOString().replace(/[^\w]/g, '_')) + '.zip'))
	.pipe(gulp.dest('../backup/'));
});

gulp.task('publish', ['default'], function () {
    return gulp.src(['dist/**'])
        .pipe(ftp({
            host: 'ftpperso.free.fr',
            user: ftppass.free1.username,
            pass: ftppass.free1.password,
            remotePath: '2.0/'
        }));
});



gulp.task('default', ['template', 'html', 'appcache', 'copy']);
