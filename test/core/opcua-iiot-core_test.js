/*
 The BSD 3-Clause License

 Copyright 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-opcua-iiot
 */
'use strict'

describe('OPC UA Core', function () {
  let assert = require('chai').assert
  let core = require('../../src/core/opcua-iiot-core')

  describe('get the name of a time unit', function () {
    it('should return the right string when the value is present', function (done) {
      assert.equal('msec.', core.getTimeUnitName('ms'))
      assert.equal('sec.', core.getTimeUnitName('s'))
      assert.equal('min.', core.getTimeUnitName('m'))
      assert.equal('h.', core.getTimeUnitName('h'))
      done()
    })

    it('should return nothing when the value is not present', function (done) {
      assert.equal('', core.getTimeUnitName('sec'))
      assert.equal('', core.getTimeUnitName('hour'))
      done()
    })
  })

  describe('calculate time in milliseconds by a time unit', function () {
    it('should return the right msec. transformation when the value is present', function (done) {
      assert.equal(1, core.calcMillisecondsByTimeAndUnit(1, 'ms'))
      assert.equal(1000, core.calcMillisecondsByTimeAndUnit(1, 's'))
      assert.equal(60000, core.calcMillisecondsByTimeAndUnit(1, 'm'))
      assert.equal(3600000, core.calcMillisecondsByTimeAndUnit(1, 'h'))

      done()
    })

    it('should return 10 sec. when the value is not present', function (done) {
      assert.equal(10000, core.calcMillisecondsByTimeAndUnit(1, 'hour'))
      assert.equal(10000, core.calcMillisecondsByTimeAndUnit(1, 'msec.'))
      done()
    })
  })
})
