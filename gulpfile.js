/*
 The BSD 3-Clause License

 Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */

'use strict'

const gulp = require('gulp')
const { series, parallel } = require('gulp')
const htmlmin = require('gulp-htmlmin')
const jsdoc = require('gulp-jsdoc3')
const clean = require('gulp-clean')
const sourcemaps = require('gulp-sourcemaps')
const changelog = require('gulp-conventional-changelog')

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

function changelogUpdate () {
  return gulp.src('CHANGELOG.md')
    .pipe(changelog({
      // conventional-changelog options go here
      preset: 'angular',
      releaseCount: 0
    }, {
      // context goes here
    }, {
      // git-raw-commits options go here
    }, {
      // conventional-commits-parser options go here
    }, {
      // conventional-changelog-writer options go here
    }))
    .pipe(gulp.dest('./'))
}

function web () {
  return gulp.src('src/*.htm*')
    .pipe(htmlmin({
      minifyJS: false,
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
  const ts = require('gulp-typescript')
  const tsProject = ts.createProject('tsconfig.json')
  return gulp.src('src/**/*.ts')
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(tsProject())
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest('opcuaIIoT'))
}

function doc (cb) {
  return gulp.src(['README.md', 'src/**/*.ts'], { read: false })
    .pipe(jsdoc(cb))
}

// function code () {
//   return gulp.src('src/**/*.ts')
//     .pipe(babel({ presets: ['@babel/env'] }))
//     .pipe(gulp.dest('code'))
// }

const docs = series(doc, docIcons, docImages)
const build = series(wipe, web, ts, locale, publics, icons)

exports.docs = docs
exports.clean = wipe
exports.build = build
exports.changelog = changelogUpdate
exports.publish = parallel(build, maps, docs, changelogUpdate)
