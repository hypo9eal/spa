'use strict';

var gulp = require( 'gulp' );
var sass = require( 'gulp-sass' );
var browserSync = require( 'browser-sync' ).create();
var autoprefixer = require( 'gulp-autoprefixer' );
var sourcemaps = require( 'gulp-sourcemaps' );
var cssnano = require( 'gulp-cssnano' );
var hologram = require( 'gulp-hologram' );
var uglify = require( 'gulp-uglify' );
var plumber = require( 'gulp-plumber' );
var concat = require( 'gulp-concat' );

var src = 'source';
var dst = 'build';

// task "css"
gulp.task( 'css', function () {
  return gulp.src([
    src + '/css/spa.scss',
    src + '/css/spa.shell.scss',
    src + '/css/spa.chat.scss'
  ])
  .pipe( plumber() )
  .pipe( sourcemaps.init() )
  .pipe( sass().on( 'error', sass.logError ) )
  .pipe( autoprefixer() )
  .pipe( concat( 'css/spa.min.css') )
  .pipe( cssnano() )
  .pipe( sourcemaps.write( 'maps' ) )
  .pipe( gulp.dest( dst ) )
  .pipe( browserSync.stream() );
});

// task "js"
gulp.task( 'js', function () {
  return gulp.src([
    src + '/js/spa.js',
    src + '/js/spa.util.js',
    src + '/js/spa.model.js',
    src + '/js/spa.shell.js',
    src + '/js/spa.chat.js'
  ])
  .pipe( plumber() )
  .pipe( sourcemaps.init() )
  .pipe( concat( 'js/spa.min.js' ) )
  .pipe( uglify() )
  .pipe( sourcemaps.write( 'maps' ) )
  .pipe( gulp.dest( dst ))
  .pipe( browserSync.stream() );
});

// task "hologram"
gulp.task( 'hologram', function() {
  return gulp.src( ['hologram/config.yml'] )
  .pipe( plumber() )
  .pipe( hologram() )
  .pipe( browserSync.stream() );
});

// task "copy"
gulp.task( 'copy', function () {
  return gulp.src([
    src + '/**/*',
    '!' + src + '/css/**/*.scss',
    '!' + src + '/css/**/*.css',
    '!' + src + '/js/*.js'
  ])
  .pipe( plumber() )
  .pipe( gulp.dest( dst ) )
  .pipe( browserSync.stream() );
});

// task "watch"
gulp.task( 'watch', function () {
  browserSync.init({
    server: {
      baseDir: dst
    }
  });

  gulp.watch( ['hologram/**/*'], ['hologram'] );
  gulp.watch( [src + '/**/*.scss'], ['css', 'hologram'] );
  gulp.watch( [src + '/js/*.js'], ['js'] );
  gulp.watch([
    src + '/**/*',
    '!' + src + '/css/**/*.scss',
    '!' + src + '/js/*.js'
  ], ['copy'] );
});

gulp.task( 'default', ['copy', 'css', 'js', 'hologram', 'watch'] );
