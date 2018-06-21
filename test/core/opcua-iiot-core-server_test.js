/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

let assert = require('chai').assert
let expect = require('chai').expect
let coreServer = require('../../src/core/opcua-iiot-core-server')
let opcuaserver = null

describe('OPC UA Core Server', function () {
  beforeEach(function (done) {
    setTimeout(function () {
      opcuaserver = new coreServer.core.nodeOPCUA.OPCUAServer({
        port: 53531,
        resourcePath: "UA/MyLittleTestServer",
        buildInfo: {
          productName: "MyTestServer1",
          buildNumber: "7658",
          buildDate: new Date(2018, 3, 12)
        }
      })
      done()
    }, 500)

  })

  afterEach(function (done) {
    opcuaserver.shutdown(1, done)
  })

  describe('core address space functions', function () {
    it('should work on server initialize callback', function (done) {

      opcuaserver.initialize(function () {
        coreServer.constructAddressSpace(opcuaserver, true).then(function () {
          done()
        })
      })
    })

    it('should reset count server timeInterval on maxTimeInterval', function (done) {

      coreServer.timeInterval = coreServer.maxTimeInterval
      coreServer.simulateVariation({})
      assert.equal(1, coreServer.timeInterval)
      done()
    })
  })

  describe('core server functions', function () {
    it('should catch error on start with empty server and empty node', function (done) {

      coreServer.start(null, null).then().catch(function (err) {
        if(err) {
          assert.equal('Server Not Valid To Start', err.message)
          done()
        }
      })
    })

    it('should catch error on start with initialized server and empty node', function (done) {

      opcuaserver.initialize(function () {
        coreServer.constructAddressSpace(opcuaserver, true).then(function () {
          coreServer.start(opcuaserver, null).then().catch(function (err) {
            if(err) {
              assert.equal('Node Not Valid To Start', err.message)
              done()
            }
          })
        })
      })
    })

    it('should work on server start callback', function (done) {

      opcuaserver.initialize(function () {
        coreServer.constructAddressSpace(opcuaserver, true).then(function () {
          let node = {initialized: false}
          coreServer.start(opcuaserver, node).then(function () {
            assert.equal(true, node.initialized)
            done()
          })
        })
      })
    })
  })
})
