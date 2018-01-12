'use strict';

var browserSync   = require("browser-sync").create();
var exec          = require('child_process').exec;
var gulp          = require('gulp');
var autoprefixer  = require('gulp-autoprefixer');
var php           = require('gulp-connect-php7');
var includeFiles  = require('gulp-file-include');
var inlinesource  = require('gulp-inline-source');
var notify        = require('gulp-notify');
var clean         = require('gulp-rimraf');
var sass          = require('gulp-sass');
var sourcemaps    = require('gulp-sourcemaps');

var dist = './dist';

// DEFAULT
gulp.task('default', ['build']);

// COMPILE
gulp.task('compile', ['html', 'php', 'sass', 'scripts']);

// WATCH
gulp.task('watch',['compile'], function() {
  gulp.watch(['./src/scss/**/*.scss'], ['sass']);
  gulp.watch(['./src/js/**/*.js'], ['scripts']).on('change',browserSync.reload);
  gulp.watch(['./src/*.html'], ['html']).on('change',browserSync.reload);
  gulp.watch(['./src/api/*.php'], ['php']).on('change',browserSync.reload);
});

// SYNC + WATCH (PHP SERVER)
gulp.task('sync',['kill-php', 'watch'], function() {
  // run php server
  php.server({ base: dist, port: 8010}, function() {
    browserSync.init({
      proxy: '127.0.0.1:8010',
      port: 3000
    });
  });
});

// kills all php processes, prevents error when building server if server exists
gulp.task('kill-php', function() {
  exec('pkill php', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
  });
});

// // SYNC + WATCH
// gulp.task('sync',['watch'], function() {
//   // serve dist folder on port 4000
//   browserSync.init({
//     server: dist,
//     port: 4000
//   });
// });

/*---------------------------------------------------------------*/

// CLEAN UP DIST
gulp.task('build',['inline-sources'], function() {
  return gulp.src([dist+'/css', dist+'/js'], { read: false })
  .pipe(clean());
});

// COMPILE HTML FILES
gulp.task('compile',['sass', 'scripts'], function() {
  return gulp.src('./src/*.html')
  .pipe(includeFiles({prefix: '@@', basepath: '@file'}))
  .pipe(gulp.dest(dist));
});

// COMPILE PHP FILES
gulp.task('php', function() {
  return gulp.src('./src/api/*.php')
  .pipe(includeFiles({prefix: '@@', basepath: '@file'}))
  .pipe(gulp.dest(dist+'/api'));
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

// COMPILE JS
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
    .pipe(browserSync.stream());
});

// COMPILE SCSS
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
    .pipe(gulp.dest(dist+'/css'))
    .pipe(browserSync.stream({match: '**/*.css'}));
});