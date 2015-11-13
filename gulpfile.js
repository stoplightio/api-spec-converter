var gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    coveralls = require('gulp-coveralls');

gulp.task('lint', function(done) {
  // patterns with the same form as gulp.src(patterns)
  var patterns = ['lib/*.js'];

  return gulp.src(['**/*.js','!node_modules/**',,'!coverage/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('coverall', function(){
  gulp.src('coverage/lcov.info')
  .pipe(coveralls());
});

gulp.task('default', ['lint', 'coverall']);
