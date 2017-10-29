/*
 The BSD 3-Clause License

 Copyright 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

describe('OPC UA Core Client', function () {
  let assert = require('chai').assert
  let expect = require('chai').expect
  let coreClient = require('../../src/core/opcua-iiot-core-client')

  describe('write', function () {
    it('should return Error object, if none value is present', function (done) {
      coreClient.write(null, null, null).catch(function (err) {
        assert.equal('Session Not Valid To Write', err.message)
      })
      done()
    })

    it('should be instance of Promise, if none value is present', function (done) {
      expect(coreClient.write(null, null, null).catch(function (err) {
        assert.equal('Session Not Valid To Write', err.message)
      })).to.be.instanceOf(Promise)
      done()
    })
  })
})
