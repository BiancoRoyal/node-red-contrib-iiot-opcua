/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

jest.setTimeout(5000)

let coreServer = require('../../src/core/opcua-iiot-core-server')
let opcuaserver = null

describe('OPC UA Core Server', function () {
  beforeEach(function (done) {
    opcuaserver = null
    opcuaserver = new coreServer.core.nodeOPCUA.OPCUAServer({
      port: 53531,
      resourcePath: 'UA/MyLittleTestServer',
      buildInfo: {
        productName: 'MyTestServer1',
        buildNumber: '7658',
        buildDate: new Date()
      }
    })
    done()
  })

  afterEach(function (done) {
    opcuaserver.shutdown(function () {
      coreServer.destructAddressSpace(done)
    })
  })

  afterAll(function (done) {
    opcuaserver = null
    coreServer = null
    done()
  })

  describe('core server functions', function () {
    it('should work on server initialize callback', function (done) {
      opcuaserver.initialize(function () {
        coreServer.constructAddressSpace(opcuaserver, true).then(function () {
          done()
        })
      })
    })

    it('should reset count server timeInterval on maxTimeInterval', function (done) {
      opcuaserver.initialize(function () {
        coreServer.constructAddressSpace(opcuaserver, true).then(function () {
          coreServer.timeInterval = coreServer.maxTimeInterval
          coreServer.simulateVariation({})
          expect(coreServer.timeInterval).toBe(1)
          done()
        })
      })
    })

    it('should catch error on start with empty server', function (done) {
      coreServer.start(null, null).then().catch(function (err) {
        if (err) {
          expect(err.message).toBe('Server Not Valid To Start')
          done()
        }
      })
    })

    it('should catch error on start with empty node', function (done) {
      opcuaserver.initialize(function () {
        coreServer.constructAddressSpace(opcuaserver, true).then(function () {
          coreServer.start(opcuaserver, null).then().catch(function (err) {
            if (err) {
              expect(err.message).toBe('Node Not Valid To Start')
              done()
            }
          })
        })
      })
    })

    it('should work on server start callback', function (done) {
      opcuaserver.initialize(function () {
        coreServer.constructAddressSpace(opcuaserver, true).then(function () {
          let node = { bianco: { iiot: {initialized: false} } }
          coreServer.start(opcuaserver, node).then(function () {
            expect(node.bianco.iiot.initialized).toBe(true)
            done()
          })
        })
      })
    })
  })
})
