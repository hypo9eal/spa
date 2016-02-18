'use strict';

var
  gulp = require( 'gulp' ),
  sass = require( 'gulp-sass' ),
  browserSync = require( 'browser-sync' ).create(),
  autoprefixer = require( 'gulp-autoprefixer' ),
  sourcemaps = require( 'gulp-sourcemaps' ),
  cssnano = require( 'gulp-cssnano' ),
  hologram = require( 'gulp-hologram' ),
  uglify = require( 'gulp-uglify' ),
  plumber = require( 'gulp-plumber' ),
  concat = require( 'gulp-concat' ),
  nodemon = require( 'gulp-nodemon' ),

  src = 'source',
  dst = 'app/public';

// task "css"
gulp.task( 'css', function () {
  return gulp.src([
    src + '/css/spa.scss',
    src + '/css/spa.shell.scss',
    src + '/css/spa.chat.scss',
    src + '/css/spa.avtr.scss'
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
    src + '/js/spa.data.js',
    src + '/js/spa.fake.js',
    src + '/js/spa.model.js',
    src + '/js/spa.util_b.js',
    src + '/js/spa.shell.js',
    src + '/js/spa.chat.js',
    src + '/js/spa.avtr.js'
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

// task "node"
gulp.task( 'node', function () {
  return nodemon( {
    script: 'app/app.js',
    ext: 'js css html',
    ignore: [],
    env: {
      'NODE_ENV': 'development'
    },
    stdout: true
  });
});

// task "watch"
gulp.task( 'watch', [ 'node' ], function () {
  browserSync.init( {
    proxy: 'http://localhost:4000',
    port: 3000,
    open: false
  } );

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
