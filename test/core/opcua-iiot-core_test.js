/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

describe('OPC UA Core', function () {
  let assert = require('chai').assert
  let core = require('../../src/core/opcua-iiot-core')
  let isWindows = /^win/.test(core.os.platform())

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

  describe('core path functions', function () {
    it('should return the right string for the node-opcua path', function (done) {
      let path = require.resolve('node-opcua')

      if (isWindows) {
        path = path.replace('\\index.js', '')
      } else {
        path = path.replace('/index.js', '')
      }
      assert.equal(path, core.getNodeOPCUAPath())
      done()
    })

    it('should return the right string for the node-opcua-client path', function (done) {
      let path = require.resolve('node-opcua-client')

      if (isWindows) {
        path = path.replace('\\index.js', '')
      } else {
        path = path.replace('/index.js', '')
      }
      assert.equal(path, core.getNodeOPCUAClientPath())
      done()
    })

    it('should return the right string for the node-opcua-server path', function (done) {
      let path = require.resolve('node-opcua-server')

      if (isWindows) {
        path = path.replace('\\index.js', '')
      } else {
        path = path.replace('/index.js', '')
      }
      assert.equal(path, core.getNodeOPCUAServerPath())
      done()
    })
  })

  describe('core build functions', function () {
    it('should return the right string for the topic in message build', function (done) {
      let msg = core.buildBrowseMessage('TestTopic')
      assert.equal('TestTopic', msg.topic)
      done()
    })

    it('should return the right string for converting to Int32', function (done) {
      let result = core.toInt32(16)
      assert.equal(16, result)
      done()
    })
  })
})
