/*
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

// jest.setTimeout(30000)

let { default: coreServer } = require('../../src/core/opcua-iiot-core-server')
const { OPCUAServer } = require('node-opcua')
const portHelper = require('../helper/test-helper-extensions')

let opcuaServer = null

describe('OPC UA Core Server', function () {

  let testingOpcUaPort = 0

  beforeAll(() => {
    testingOpcUaPort = 51220
  })

  beforeEach(function (done) {
    opcuaServer = null

    testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
    const port = testingOpcUaPort

    opcuaServer = new OPCUAServer({
      port,
      resourcePath: '/UA/MyLittleTestServer',
      buildInfo: {
        productName: 'MyTestServer1',
        buildNumber: '7658',
        buildDate: new Date()
      }
    })
    done()
  })

  afterEach(function (done) {
    opcuaServer.shutdown(function () {
      coreServer.destructAddressSpace(done)
    })
  })

  afterAll(function (done) {
    opcuaServer = null
    coreServer = null
    done()
  })

  describe('core server functions', function () {
    it('should work on server initialize callback', function (done) {
      const run = async () => {
        await opcuaServer.initialize()
        coreServer.constructAddressSpace(opcuaServer, true).then(() => {
          done()
        })
      }
      run()
    })

    it('should reset count server timeInterval on maxTimeInterval', function (done) {
      opcuaServer.initialize(function () {
        const run = async () => {
          coreServer.constructAddressSpace(opcuaServer, true).then(function () {
            coreServer.timeInterval = coreServer.maxTimeInterval
            coreServer.simulateVariation({})
            expect(coreServer.timeInterval).toBe(500000)
            done()
          })
        }
        run()
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
      opcuaServer.initialize(function () {
        coreServer.constructAddressSpace(opcuaServer, true).then(function () {
          coreServer.start(opcuaServer, null).then().catch(function (err) {
            if (err) {
              expect(err.message).toBe('Node Not Valid To Start')
              done()
            }
          })
        })
      })
    })

    it('should work on server start callback', function (done) {
      opcuaServer.initialize(function () {
        coreServer.constructAddressSpace(opcuaServer, true).then(function () {
          let node = { iiot: { initialized: false } }
          coreServer.start(opcuaServer, node).then(function () {
            expect(node.iiot.initialized).toBe(true)
            done()
          })
        })
      })
    })
  })
})
