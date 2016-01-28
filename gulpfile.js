'use strict';

var gulp, sass;

gulp = require( 'gulp' );
sass = require( 'gulp-sass' );

gulp.task( 'sass', function () {
  return gulp.src([
    'source/**/*.scss'
  ])
  .pipe( sass().on( 'error', sass.logError ) )
  .pipe( gulp.dest( 'public' ));
});

gulp.task( 'copy', function () {
  return gulp.src([
    'source/**/*',
    '!source/**/*.scss'
  ])
  .pipe( gulp.dest( 'public' ) );
});

gulp.task( 'watch', function () {
  gulp.watch( ['source/**/*.scss'], ['sass'] );
  gulp.watch([
    'source/**/*',
    '!source/**/*.scss'
  ], ['copy'] );
});

gulp.task( 'default', ['copy', 'sass', 'watch'] );
