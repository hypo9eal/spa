'use strict';

var
  gulp, sass, browserSync, autoprefixer, sourcemaps,
  cssnano;

gulp = require( 'gulp' );
sass = require( 'gulp-sass' );
browserSync = require( 'browser-sync' ).create();
autoprefixer = require( 'gulp-autoprefixer' );
sourcemaps = require( 'gulp-sourcemaps' );
cssnano = require( 'gulp-cssnano' );

// task "css"
gulp.task( 'css', function () {
  return gulp.src([
    '../source/**/*.scss'
  ])
  .pipe( sourcemaps.init() )
  .pipe( sass().on( 'error', sass.logError ) )
  .pipe( autoprefixer() )
  .pipe( cssnano() )
  .pipe( sourcemaps.write( 'map' ))
  .pipe( gulp.dest( '../build' ) )
  .pipe( browserSync.stream() );
});

// task "copy"
gulp.task( 'copy', function () {
  return gulp.src([
    '../source/**/*',
    '!../source/css/**/*.scss'
  ])
  .pipe( gulp.dest( '../build' ) )
  .pipe( browserSync.stream());
});

// task "watch"
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
