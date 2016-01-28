var gulp, sass;

gulp = require( 'gulp' );
sass = require( 'gulp-sass' );

gulp.task( 'sass', function () {
  return gulp.src([
    '_resource/**/*.scss'
  ])
  .pipe( sass().on( 'error', sass.logError ) )
  .pipe( gulp.dest( 'htdocs' ));
});

gulp.task( 'copy', function () {
  return gulp.src([
    '_resource/**/*',
    '!_resource/**/*.scss'
  ])
  .pipe( gulp.dest( 'htdocs' ) );
});

gulp.task( 'watch', function () {
  gulp.watch( ['_resource/**/*.scss'], ['sass'] );
  gulp.watch([
    '_resource/**/*',
    '!_resource/**/*.scss'
  ], ['copy'] );
});

gulp.task( 'default', ['copy', 'sass', 'watch'] );
