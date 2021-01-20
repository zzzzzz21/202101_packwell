'use strict';

// 初期設定(プラグインの読み込み)
const gulp = require('gulp');
const sass = require('gulp-sass');
const sassGlob = require("gulp-sass-glob");
const sourcemaps = require('gulp-sourcemaps');
const ejs = require('gulp-ejs');
const fs = require('fs');
const rename = require('gulp-rename');
const prefix  = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const imagemin = require('gulp-imagemin');
const imageminJpg = require('imagemin-jpeg-recompress');
const imageminPng = require('imagemin-pngquant');
const imageminGif = require('imagemin-gifsicle');
const imageminSvg = require('imagemin-svgo');
const minimist = require('minimist');
const gulpIf = require('gulp-if');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const prettify = require('gulp-prettify');
const browserSync = require('browser-sync').create();

const options = minimist(process.argv.slice(2), {
	string: 'env',
	default: {
		env: 'develop'
	}
});

// develop or production
const env = options.env;

// ビルドディレクトリ(本番とdev)
const paths = {
	develop: 'dev',
	production: 'dist'
}
// アセットディレクトリ(状況に応じて書き換え)
const Build = 'build';
const Assets = '';
const imgDir = 'images';


// SASSの設定
gulp.task('sass', function (done) {
    gulp.src(['./src/scss/**/*.scss', '!./src/scss/**/_*.scss'])
    .pipe(sassGlob())
    // エラーしても処理を止めない。エラーが発生した場合はデスクトップ通知を行う。
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    // 開発環境でのみソースマップを作成
    .pipe(
      gulpIf(
        env == 'develop',
        sourcemaps.init()
      )
    )
    // 本番環境でのみcssを最小化
    .pipe(
      gulpIf(
        env == 'develop',
        sass({ outputStyle: 'expanded' }),
        sass({ outputStyle: 'compressed' })
      )
    )
    .pipe(prefix({
      cascade: false,
      grid: true
    }))
    .pipe(
      gulpIf(
        env == 'develop',
        sourcemaps.write('./')
      )
    )
    .pipe(
      gulpIf(
        env == 'develop',
        gulp.dest('./' + paths.develop + '/' + Assets + '/css/'),
        gulp.dest('./' + paths.production + '/' + Assets + '/css/')
      )
    )
    // CSSファイルのみリロードする
    .pipe(
      gulpIf(
        env == 'develop',
        browserSync.stream()
      )
    )
    done();
});

// JavaScriptの設定
gulp.task('js', function(done) {
  gulp.src('./src/js/modules/**/*.js')
  .pipe(plumber())
  .pipe(babel({presets: ['@babel/env']}))
  .pipe(concat('script.js'))
  .pipe(uglify())
  .pipe(
    gulpIf(
      env == 'develop',
      gulp.dest('./' + paths.develop + '/' + Assets + '/js/'),
      gulp.dest('./' + paths.production + '/' + Assets + '/js/')
    )
  )
  done();
});

// EJSの設定
gulp.task('ejs', function (done) {
    const json = JSON.parse(fs.readFileSync('./src/pages.json')),
      pages = json.pages,
      temp = "src/html/temp.ejs";
      let i = 0;

    while (i < pages.length) {
      let name = pages[i].name,
          url = pages[i].url,
          contents = pages[i].contents;
      gulp
      .src(temp)
      .pipe(plumber())
      .pipe(ejs({jsonData: pages[i]},{rmWhitespace: true}))
      .pipe(prettify({
        indent_size: 2,
        indent_with_tabs: true
      }))
      .pipe(rename(name + '.html'))
      .pipe(
        gulpIf(
          env == 'develop',
          gulp.dest('./' + paths.develop + url),
          gulp.dest('./' + paths.production  + url)
        )
      )
      .pipe(
        gulpIf(
          env == 'develop',
          browserSync.stream()
        )
      )

      i++;
    }

    done();
});

//画像圧縮(jpg|jpeg|png|gif)
gulp.task('imagemin', (done) => {
  gulp.src(['./src/images/**/*.{jpg,jpeg,png,gif,svg}', '!./src/images/sprite/**/*.png'])
  .pipe(imagemin([
    imageminPng(),
    imageminJpg(),
    imageminGif({
        interlaced: false,
        optimizationLevel: 3,
        colors:180
    }),
    imageminSvg()
  ]
  ))
  .pipe(
    gulpIf(
      env == 'develop',
      gulp.dest('./' + paths.develop + '/' + Assets + '/' + imgDir + '/'),
      gulp.dest('./' + paths.production + '/' + Assets + '/' + imgDir + '/')
    )
  )
  done();
});

// Browser-syncの設定
// ブラウザ画面への通知を無効化
gulp.task('sync', () => {
  browserSync.init({
    server: {
      baseDir: './' + paths.develop + '/',
      index: 'index.html'
    },
    open: 'external',
    reloadOnRestart: true
  });
});

gulp.task('reload', () => {
  browserSync.reload();
});

gulp.task('watch', () => {
  gulp.watch(['./src/scss/**/*.scss'], gulp.task('sass'));
  gulp.watch(['./src/js/**/*.js'], gulp.task('js'));
  gulp.watch(['./src/html/**/*.ejs'], gulp.task('ejs'));
  gulp.watch(['./' + Build + '/**/*.html'], gulp.task('reload'));
});

gulp.task('default', gulp.series(
    gulpIf(
      env == 'develop',
      gulp.parallel('sass', 'ejs', 'sync', 'js', 'reload', 'watch', 'imagemin'),
      gulp.parallel('sass', 'ejs', 'js', 'imagemin')
    )
));