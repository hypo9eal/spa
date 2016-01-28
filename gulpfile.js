var gulp = require( 'gulp' );

gulp.task( 'default', function () {
  console.log( 'test' );
});

gulp.task( 'copy', function () {
  return gulp.src([
    '_resource/**/*'
  ])
  .pipe( gulp.dest( 'html' ));
});
