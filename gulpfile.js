'use strict';

var gulp, sass, browserSync;

gulp = require( 'gulp' );
sass = require( 'gulp-sass' );
browserSync = require( 'browser-sync' ).create();

gulp.task( 'sass', function () {
  return gulp.src([
    'source/**/*.scss'
  ])
  .pipe( sass().on( 'error', sass.logError ) )
  .pipe( gulp.dest( 'public' ))
  .pipe( browserSync.stream());
});

gulp.task( 'copy', function () {
  return gulp.src([
    'source/**/*',
    '!source/**/*.scss'
  ])
  .pipe( gulp.dest( 'public' ) )
  .pipe( browserSync.stream());
});

gulp.task( 'watch', function () {
  browserSync.init({
    server: {
      baseDir: 'public'
    }
  });
  gulp.watch( ['source/**/*.scss'], ['sass'] );
  gulp.watch([
    'source/**/*',
    '!source/**/*.scss'
  ], ['copy'] );
});

gulp.task( 'default', ['copy', 'sass', 'watch'] );
