'use strict';

let gulp = require('gulp');
let browserSync = require('browser-sync').create();

gulp.task('serve', function() {
    browserSync.init(null, {
        port: 9999,
        proxy: 'http://127.0.0.1:8080'
    });
    gulp.watch('./public/**/*.*').on('change', browserSync.reload);
});
