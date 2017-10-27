'use strict';

var gulp          = require('gulp');
var autoprefixer  = require('gulp-autoprefixer');
var includeFiles  = require('gulp-file-include');
var inlinesource  = require('gulp-inline-source');
var notify        = require('gulp-notify');
var sass          = require('gulp-sass');

// BUILD FOLDER
var dist = './dist';

// DEFAULT
gulp.task('default', ['inline-sources']);

// WATCH
gulp.task('watch',['inline-sources'],function() {
  gulp.watch(['./src/scss/**/*.scss','./src/js/**/*.js','./src/*.html'], ['inline-sources']);
});

/*---------------------------------------------------------------*/

// COMPILE HTML FILES
gulp.task('inline-sources',['sass', 'scripts'], function() {
  var options = {
      compress: false,
      pretty: true,
      rootpath: dist
  };
  return gulp.src('./src/*.html')
  .pipe(includeFiles({prefix: '@@', basepath: '@file'}))
  .pipe(inlinesource(options))
  .pipe(gulp.dest(dist));
});

// COMPILE MAIN.JS
gulp.task('scripts', function() {
  return gulp.src('./src/js/**.js')
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
    .pipe(gulp.dest(dist+'/js'))
});

// COMPILE MAIN.CSS
gulp.task('sass', function() {
  return gulp.src('./src/scss/**.scss')
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
    .pipe(gulp.dest(dist+'/css'));
});
