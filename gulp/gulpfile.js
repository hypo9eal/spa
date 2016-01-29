'use strict';

var gulp, sass, browserSync, autoprefixer;

gulp = require( 'gulp' );
sass = require( 'gulp-sass' );
browserSync = require( 'browser-sync' ).create();
autoprefixer = require ( 'gulp-autoprefixer' );

gulp.task( 'css', function () {
  return gulp.src([
    '../source/**/*.scss'
  ])
  .pipe( sass().on( 'error', sass.logError ) )
  .pipe( autoprefixer() )
  .pipe( gulp.dest( '../build' ))
  .pipe( browserSync.stream());
});

gulp.task( 'copy', function () {
  return gulp.src([
    '../source/**/*',
    '!../source/**/*.scss'
  ])
  .pipe( gulp.dest( '../build' ) )
  .pipe( browserSync.stream());
});

gulp.task( 'watch', function () {
  browserSync.init({
    server: {
      baseDir: '../build'
    }
  });

  gulp.watch( ['../source/**/*.scss'], ['css'] );
  gulp.watch([
    '../source/**/*',
    '!../source/**/*.scss'
  ], ['copy'] );
});

gulp.task( 'default', ['copy', 'css', 'watch'] );
