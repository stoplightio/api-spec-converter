var gulp = require('gulp'),
    eslint = require('gulp-eslint');

gulp.task('lint', function(done) {
  // patterns with the same form as gulp.src(patterns)
  var patterns = ['lib/*.js'];

  return gulp.src(['**/*.js','!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('default', ['lint']);
