'use strict';

var gulp          = require('gulp');
var autoprefixer  = require('gulp-autoprefixer');
var includeFiles  = require('gulp-file-include');
var inlinesource  = require('gulp-inline-source');
var notify        = require('gulp-notify');
var sourcemaps    = require('gulp-sourcemaps');
var sass          = require('gulp-sass');

// BUILD FOLDER
var dist = './dist';

var build = [
  'inline-sources'
]

// DEFAULT
gulp.task('default', build);

// WATCH
gulp.task('watch',[...build],function() {
  gulp.watch(['./src/scss/**/*.scss','./src/js/**/*.js','./src/*.html'], ['inline-sources']);
});

/*---------------------------------------------------------------*/

// COMPILE HTML FILES
gulp.task('inline-sources',['sass', 'scripts'], function() {
  var options = {
      compress: false
  };
  return gulp.src('./src/*.html')
  .pipe(includeFiles({prefix: '@@', basepath: '@file'}))
  .pipe(inlinesource(options))
  .pipe(gulp.dest(dist));
});

// COMPILE MAIN.JS
gulp.task('scripts', function() {
  return gulp.src('./src/js/**.js')
    .pipe(sourcemaps.init())
    .pipe(includeFiles({prefix: '@@', basepath: '@file'}))
    .on('error', function(error) {
      var args = Array.prototype.slice.call(arguments);
      notify.onError({
        title   : 'Javascript Error',
        message : error.message.split('.js: ')[1]
      }).apply(this, args);
      console.log(error)
      this.emit('end')
    })
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(dist+'/js'))
});

// COMPILE MAIN.CSS
gulp.task('sass', function() {
  return gulp.src('./src/scss/**.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle:'compact'}))
    .on('error', function(error) {
      var args = Array.prototype.slice.call(arguments);
      notify.onError({
        title   : 'Error: ' + error.relativePath,
        message : error.messageOriginal
      }).apply(this, args);
      console.log('\n');
      console.log('File:   ', error.file);
      console.log('Line:   ', error.line);
      console.log('Column: ', error.column);
      console.log('\n');
      console.log(error.formatted);
      this.emit('end')
    })
    .pipe(autoprefixer({
      browsers : ['last 5 versions'],
      cascade  : false
    }))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(dist+'/css'));
});
