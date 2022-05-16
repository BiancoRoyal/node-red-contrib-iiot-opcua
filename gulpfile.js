/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */

'use strict'

const gulp = require('gulp')
const { series, parallel } = require('gulp')
const htmlmin = require('gulp-htmlmin')
const jsdoc = require('gulp-jsdoc3')
const clean = require('gulp-clean')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps')
const replace = require('gulp-replace')

function icons () {
  return gulp.src('src/icons/**/*').pipe(gulp.dest('opcuaIIoT/icons'))
}

function docIcons () {
  return gulp.src('src/icons/**/*').pipe(gulp.dest('docs/gen/icons'))
}

function docImages () {
  return gulp.src('images/**/*').pipe(gulp.dest('docs/gen/images'))
}

function locale () {
  return gulp.src('src/locales/**/*').pipe(gulp.dest('opcuaIIoT/locales'))
}

function publics () {
  return gulp.src('src/public/**/*').pipe(gulp.dest('opcuaIIoT/public'))
}

function maps () {
  return gulp.src('maps/**/*').pipe(gulp.dest('opcuaIIoT/maps'))
}

function wipe () {
  return gulp.src(['opcuaIIoT', 'docs/gen', 'maps', 'code', 'coverage', 'jcoverage', 'suite/jcoverage', 'pki', 'suite/pki', 'test/pki'], { allowEmpty: true })
    .pipe(clean({ force: true }))
}

function web () {
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
}

function ts () {
    var ts = require("gulp-typescript")
    var tsProject = ts.createProject('tsconfig.json');
    return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest("dist"))
}

function nodejs () {
  const anchor = '// SOURCE-MAP-REQUIRED'

  return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(replace(anchor, 'require(\'source-map-support\').install()'))
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(sourcemaps.write('maps')).pipe(gulp.dest('opcuaIIoT'))
}

function doc (cb) {
  return gulp.src(['README.md', 'src/**/*.ts'], { read: false })
    .pipe(jsdoc(cb))
}

function code () {
  return gulp.src('src/**/*.ts')
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(gulp.dest('code'))
}

const docs = series(doc, docIcons, docImages)
const build = series(wipe, web, ts, locale, code, publics, icons)

exports.docs = docs
exports.clean = wipe
exports.build = build
exports.publish = parallel(build, maps, docs)
