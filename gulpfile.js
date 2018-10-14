/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */

'use strict'

const gulp = require('gulp')
const htmlmin = require('gulp-htmlmin')
const jsdoc = require('gulp-jsdoc3')
const clean = require('gulp-clean')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const sequence = require('gulp-sequence')
const sourcemaps = require('gulp-sourcemaps')
const pump = require('pump')
const replace = require('gulp-replace')

gulp.task('default', function () {
  // place code for your default task here
})

gulp.task('docs', sequence('doc', 'docIcons', 'docImages'))
gulp.task('build', sequence('clean', 'web', 'nodejs', 'locale', 'code', 'public', 'icons'))
gulp.task('publish', sequence('build', 'maps', 'docs'))

gulp.task('icons', function () {
  return gulp.src('src/icons/**/*').pipe(gulp.dest('opcuaIIoT/icons'))
})

gulp.task('docIcons', function () {
  return gulp.src('src/icons/**/*').pipe(gulp.dest('docs/gen/icons'))
})

gulp.task('docImages', function () {
  return gulp.src('images/**/*').pipe(gulp.dest('docs/gen/images'))
})

gulp.task('locale', function () {
  return gulp.src('src/locales/**/*').pipe(gulp.dest('opcuaIIoT/locales'))
})

gulp.task('public', function () {
  return gulp.src('src/public/**/*').pipe(gulp.dest('opcuaIIoT/public'))
})

gulp.task('maps', function () {
  return gulp.src('maps/**/*').pipe(gulp.dest('opcuaIIoT/maps'))
})

gulp.task('clean', function () {
  return gulp.src(['opcuaIIoT', 'docs/gen', 'maps', 'code', 'coverage', 'jcoverage', 'pki', 'test/pki'])
    .pipe(clean({force: true}))
})

gulp.task('web', function () {
  return gulp.src('src/*.htm*')
    .pipe(htmlmin({
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
      maxLineLength: 120,
      preserveLineBreaks: false,
      collapseWhitespace: true,
      collapseInlineTagWhitespace: true,
      conservativeCollapse: true,
      processScripts: ['text/x-red'],
      quoteCharacter: "'"
    }))
    .pipe(gulp.dest('opcuaIIoT'))
})

gulp.task('nodejs', function (cb) {
  let anchor = '// SOURCE-MAP-REQUIRED'

  pump([
    gulp.src('src/**/*.js')
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(replace(anchor, 'require(\'source-map-support\').install()'))
      .pipe(babel({presets: ['es2015']}))
      .pipe(uglify())
      .pipe(sourcemaps.write('maps')), gulp.dest('opcuaIIoT')],
  cb
  )
})

gulp.task('nodejsclearly', function (cb) {
  gulp.src('src/**/*.js')
    .pipe(babel({presets: ['es2015']}))
    .pipe(gulp.dest('code'))
})

gulp.task('doc', function (cb) {
  gulp.src(['README.md', 'src/**/*.js'], {read: false})
    .pipe(jsdoc(cb))
})

gulp.task('code', function () {
  gulp.src('src/**/*.js')
    .pipe(babel({presets: ['es2015']}))
    .pipe(gulp.dest('code'))
})
