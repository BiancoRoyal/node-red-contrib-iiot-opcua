/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-opcua-iiot
 */

'use strict'

const gulp = require('gulp')
const htmlmin = require('gulp-htmlmin')
const jsdoc = require('gulp-jsdoc3')
const clean = require('gulp-clean')
const pump = require('pump')

gulp.task('default', function () {
  // place code for your default task here
})

gulp.task('docs', ['doc', 'docIcons', 'docExamples', 'docImages'])
gulp.task('websites', ['opcua-iiot-web'])
gulp.task('nodejs', ['opcua-iiot'])
gulp.task('build', ['nodejs', 'websites', 'locale'])
gulp.task('publish', ['build', 'icons', 'docs'])

gulp.task('icons', function () {
  return gulp.src('src/icons/**/*').pipe(gulp.dest('opcuaIIoT/icons'))
})

gulp.task('docIcons', function () {
  return gulp.src('src/icons/**/*').pipe(gulp.dest('docs/gen/icons'))
})

gulp.task('docExamples', function () {
  return gulp.src('examples/**/*').pipe(gulp.dest('docs/gen/examples'))
})

gulp.task('docImages', function () {
  return gulp.src('images/**/*').pipe(gulp.dest('docs/gen/images'))
})

gulp.task('locale', function () {
  return gulp.src('src/locales/**/*').pipe(gulp.dest('opcuaIIoT/locales'))
})

gulp.task('clean', function () {
  return gulp.src(['opcuaIIoT', 'docs/gen'])
    .pipe(clean({force: true}))
})

gulp.task('opcua-iiot-web', function () {
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

gulp.task('opcua-iiot', function (cb) {
  pump([
    gulp.src('src/**/*.js'),
    gulp.dest('opcuaIIoT')
  ],
    cb
  )
})

gulp.task('doc', function (cb) {
  gulp.src(['README.md', 'src/**/*.js'], {read: false})
    .pipe(jsdoc(cb))
})
