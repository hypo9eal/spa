'use strict';

var
  gulp, sass, browserSync, autoprefixer, sourcemaps,
  cssnano, hologram;

gulp = require( 'gulp' );
sass = require( 'gulp-sass' );
browserSync = require( 'browser-sync' ).create();
autoprefixer = require( 'gulp-autoprefixer' );
sourcemaps = require( 'gulp-sourcemaps' );
cssnano = require( 'gulp-cssnano' );
hologram = require( 'gulp-hologram' );

// task "css"
gulp.task( 'css', function () {
  return gulp.src([
    '../source/**/*.scss'
  ])
  .pipe( sourcemaps.init() )
  .pipe( sass().on( 'error', sass.logError ) )
  .pipe( autoprefixer() )
  .pipe( cssnano() )
  .pipe( sourcemaps.write( 'maps' ))
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

// task "hologram"
gulp.task( 'hologram', function() {
  return gulp.src( ['../hologram/config.yml'] )
    .pipe( hologram() )
    .pipe( browserSync.stream() );
});

// task "watch"
gulp.task( 'watch', function () {
  browserSync.init({
    server: {
      baseDir: '../build'
    }
  });

  gulp.watch( ['../hologram/**/*'], ['hologram'] );
  gulp.watch( ['../source/**/*.scss'], ['css', 'hologram'] );
  gulp.watch([
    '../source/**/*',
    '!../source/**/*.scss'
  ], ['copy'] );

});

gulp.task( 'default', ['copy', 'css', 'hologram', 'watch'] );
