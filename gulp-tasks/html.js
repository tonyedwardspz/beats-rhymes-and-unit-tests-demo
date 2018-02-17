'use strict';

let gulp = require('gulp');
let minifyHtml = require('gulp-minify-html');
let runSequence = require('run-sequence');
let gulpif = require('gulp-if');
let gutil = require('gulp-util');

let env = gutil.env.env === 'PRODUCTION' ? true : false;

gulp.task('html:watch', function() {
  gulp.watch('./client/*.html', function(){
    runSequence(['html'], ['styles:inline']);
  });
});

gulp.task('html', function() {
  return gulp.src('./client/*.html')
    .pipe(gulpif(env, minifyHtml()))
    .pipe(gulp.dest('./public'));
});
