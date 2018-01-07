'use strict';

var browserSync   = require("browser-sync").create();
var gulp          = require('gulp');
var autoprefixer  = require('gulp-autoprefixer');
var includeFiles  = require('gulp-file-include');
var inlinesource  = require('gulp-inline-source');
var notify        = require('gulp-notify');
var clean         = require('gulp-rimraf');
var sass          = require('gulp-sass');

// BUILD FOLDER
var dist = './dist';

// DEFAULT
gulp.task('default', ['build']);

// WATCH
gulp.task('watch',['compile'], function() {
  gulp.watch(['./src/scss/**/*.scss','./src/js/**/*.js','./src/*.html'], ['compile']);
});

// SYNC + WATCH
gulp.task('sync',['watch'], function() {
  // serve dist folder on port 4000
  browserSync.init({
    server: dist,
    port: 4000
  });
  // reload browser when html pages in dist folder update
  var debounce = 500;
  gulp.watch(dist+'/*.html').on('change', function(){
    if (debounce) {
      setTimeout(function(){
        browserSync.reload();
        debounce = 500;
      }, debounce);
      debounce = null;
    }
  });
});

/*---------------------------------------------------------------*/

// COMPILE HTML FILES
gulp.task('compile',['sass', 'scripts'], function() {
  return gulp.src('./src/*.html')
  .pipe(includeFiles({prefix: '@@', basepath: '@file'}))
  .pipe(gulp.dest(dist));
});

// INLINE EXTERNAL FILES
gulp.task('inline-sources',['compile'], function() {
  return gulp.src(dist+'/*.html')
  .pipe(inlinesource({
      compress: false,
      pretty: true,
      rootpath: dist
  }))
  .pipe(gulp.dest(dist));
});

// CLEAN UP DIST
gulp.task('build',['inline-sources'], function() {
  return gulp.src([dist+'/css', dist+'/js'], { read: false })
  .pipe(clean());
});

// COMPILE JS
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

// COMPILE SCSS
gulp.task('sass', function() {
  return gulp.src('./src/scss/**.scss')
    .pipe(sass({outputStyle:'compact'}))
    .on('error', function(error) {
      let args = Array.prototype.slice.call(arguments);
      notify.onError({
        title   : 'SASS Error',
        message : error.relativePath
      }).apply(this, args);
      console.log('\n');
      console.log('File:', error.file);
      console.log('Line:', error.line, ' | Column:', error.column);
      console.log('\n');
      console.log(error.formatted);
      this.emit('end');
    })
    .pipe(autoprefixer({
      browsers : ['last 5 versions'],
      cascade  : false
    }))
    .pipe(gulp.dest(dist+'/css'));
});