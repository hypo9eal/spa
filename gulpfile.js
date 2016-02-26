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
  gulpif = require( 'gulp-if' ),
  minimist = require( 'minimist' ),
  // shell = require( 'gulp-shell' ),

  opts = minimist( process.argv.slice( 2 ) ),
  task_name = opts._[ 0 ],
  src = 'source',
  dst = 'app/public';

// task "css"
gulp.task( 'css', function () {
  return gulp.src( [
    src + '/css/spa.scss',
    src + '/css/spa.shell.scss',
    src + '/css/spa.chat.scss',
    src + '/css/spa.avtr.scss'
  ] )
  .pipe( plumber() )
  .pipe( sourcemaps.init() )
  .pipe( sass().on( 'error', sass.logError ) )
  .pipe( autoprefixer() )
  .pipe( concat( 'css/spa.min.css' ) )
  .pipe( cssnano() )
  .pipe( sourcemaps.write( 'maps' ) )
  .pipe( gulp.dest( dst ) )
  .pipe( browserSync.stream() );
});

// task "js"
gulp.task( 'js', function () {
  var
    is_test = ( task_name === 'test' ? true : false ),
    src_list = [
      src + '/js/spa.js',
      src + '/js/spa.util.js',
      src + '/js/spa.data.js',
      src + '/js/spa.model.js',
      src + '/js/spa.util_b.js',
      src + '/js/spa.shell.js',
      src + '/js/spa.chat.js',
      src + '/js/spa.avtr.js' ];

  if ( is_test ) {
    src_list = [
      src + '/js/spa.js',
      src + '/js/spa.util.js',
      src + '/js/spa.data.js',
      src + '/js/spa.fake.js',
      src + '/js/spa.model.js' ];
    dst += '/js';
  }

  return gulp.src( src_list )
    .pipe( plumber() )
    .pipe( sourcemaps.init() )
    .pipe( gulpif( ! is_test, concat( 'js/spa.min.js' ) ) )
    .pipe( gulpif( ! is_test, uglify() ) )
    .pipe( sourcemaps.write( 'maps' ) )
    .pipe( gulp.dest( dst ) )
    .pipe( browserSync.stream() );
});

// task "hologram"
gulp.task( 'hologram', function() {
  return gulp.src( ['hologram/config.yml' ] )
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
  var exec_str = 'node';

  if ( task_name === 'default' && opts.debug ) {
    exec_str =
      'node-inspector --web-port=4000 --debug-port=5858 & node --debug';
  }

  return nodemon( {
    script: 'app/app.js',
    ext: 'js json',
    exec: exec_str,
    ignore: [ dst ],
    env: {
      'NODE_ENV': 'development'
    },
    stdout: true
  });
});

// task "watch"
gulp.task( 'watch', function () {
  browserSync.init( {
    proxy: 'http://localhost:4000',
    port: 3000,
    open: false
  } );

  gulp.watch( [ 'hologram/**/*' ], [ 'hologram' ] );
  gulp.watch( [ src + '/**/*.scss' ], [ 'css', 'hologram' ] );
  gulp.watch( [ src + '/js/*.js' ], [ 'js' ] );
  gulp.watch( [
    src + '/**/*',
    '!' + src + '/css/**/*.scss',
    '!' + src + '/js/*.js'
  ], [ 'copy' ] );
});

gulp.task( 'default',
  [ 'copy', 'css', 'js', 'hologram', 'node', 'watch' ] );

gulp.task( 'test',
  [ 'copy', 'js' ] );
