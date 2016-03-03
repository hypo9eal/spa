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
  shell = require( 'gulp-shell' ),

  opts = minimist( process.argv.slice( 2 ) ),
  task_name = opts._[ 0 ],
  sourcePath = 'source',
  publicPath = 'app/public',
  dbPath = '/usr/local/var/mongodb',
  dbLogPath = '/usr/local/var/log/mongodb/mongodb.log';

// task "css"
gulp.task( 'css', function () {
  return gulp.src( [
    sourcePath + '/css/spa.scss',
    sourcePath + '/css/spa.shell.scss',
    sourcePath + '/css/spa.chat.scss',
    sourcePath + '/css/spa.avtr.scss'
  ] )
  .pipe( plumber() )
  .pipe( sourcemaps.init() )
  .pipe( sass().on( 'error', sass.logError ) )
  .pipe( autoprefixer() )
  .pipe( concat( 'css/spa.min.css' ) )
  .pipe( cssnano() )
  .pipe( sourcemaps.write( 'maps' ) )
  .pipe( gulp.dest( publicPath ) )
  .pipe( browserSync.stream() );
});

// task "js"
gulp.task( 'js', function () {
  var
    is_test = ( task_name === 'test' ? true : false ),
    sourcepath_list = [
      sourcePath + '/js/spa.js',
      sourcePath + '/js/spa.util.js',
      sourcePath + '/js/spa.data.js',
      sourcePath + '/js/spa.model.js',
      sourcePath + '/js/spa.util_b.js',
      sourcePath + '/js/spa.shell.js',
      sourcePath + '/js/spa.chat.js',
      sourcePath + '/js/spa.avtr.js' ];

  if ( is_test ) {
    sourcepath_list = [
      sourcePath + '/js/spa.js',
      sourcePath + '/js/spa.util.js',
      sourcePath + '/js/spa.data.js',
      sourcePath + '/js/spa.fake.js',
      sourcePath + '/js/spa.model.js' ];
    publicPath += '/js';
  }

  return gulp.src( sourcepath_list )
    .pipe( plumber() )
    .pipe( sourcemaps.init() )
    .pipe( gulpif( ! is_test, concat( 'js/spa.min.js' ) ) )
    .pipe( gulpif( ! is_test, uglify() ) )
    .pipe( sourcemaps.write( 'maps' ) )
    .pipe( gulp.dest( publicPath ) )
    .pipe( browserSync.stream() );
});

// task "hologram"
gulp.task( 'hologram', function() {
  return gulp.src( [ 'hologram/config.yml' ] )
  .pipe( plumber() )
  .pipe( hologram() )
  .pipe( browserSync.stream() );
});

// task "copy"
gulp.task( 'copy', function () {
  return gulp.src([
    sourcePath + '/**/*',
    '!' + sourcePath + '/css/**/*.scss',
    '!' + sourcePath + '/css/**/*.css',
    '!' + sourcePath + '/js/*.js'
  ])
  .pipe( plumber() )
  .pipe( gulp.dest( publicPath ) )
  .pipe( browserSync.stream() );
});

// task "deploy"
gulp.task( 'deploy', [ 'copy', 'css', 'js', 'hologram' ] );

// task "watch"
gulp.task( 'watch', [ 'deploy' ], function () {
  browserSync.init( {
    proxy: 'http://localhost:4000',
    port: 3000,
    open: false
  } );

  gulp.watch( [ 'hologram/**/*' ], [ 'hologram' ] );
  gulp.watch( [ sourcePath + '/**/*.scss' ], [ 'css', 'hologram' ] );
  gulp.watch( [ sourcePath + '/js/*.js' ], [ 'js' ] );
  gulp.watch( [
    sourcePath + '/**/*',
    '!' + sourcePath + '/css/**/*.scss',
    '!' + sourcePath + '/js/*.js'
  ], [ 'copy' ] );
});

// task "node"
gulp.task( 'node', function () {
  var exec_str = 'node';

  if ( opts.debug ) {
    exec_str =
      'node-inspector --web-port=4000 --debug-port=5858 & node --debug';
  }

  return nodemon( {
    script: 'app/app.js',
    ext: 'js json',
    exec: exec_str,
    ignore: [ publicPath ],
    env: {
      'NODE_ENV': 'development'
    },
    stdout: true
  });
});

// task "mongodb"
gulp.task( 'mongodb', function ()  {
  return gulp.src( '' )
    .pipe( shell( [
      'mongod --fork --dbpath ' + dbPath + ' --logpath ' + dbLogPath
    ] ));
} );

gulp.task( 'build', [ 'node', 'watch' ] );

gulp.task( 'test', [ 'copy', 'js', 'node' ], shell.task ( [
  'mocha ' + publicPath + '/test/test.js -t 10000'
] ));
