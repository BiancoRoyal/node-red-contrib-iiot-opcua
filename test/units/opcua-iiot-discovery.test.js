/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2022 DATATRONiQ GmbH (https://datatroniq.com)
 * Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 * All rights reserved.
 * node-red-contrib-iiot-opcua
 *
 **/

'use strict'

// jest.setTimeout(30000)

var injectNode = require('@node-red/nodes/core/common/20-inject')
var inputNode = require('../../src/opcua-iiot-discovery')

var helper = require('node-red-node-test-helper')
var portHelper = require('./../helper/test-helper-extensions')
helper.init(require.resolve('node-red'))

var testFlows = require('./flows/discovery-flows')

let testingOpcUaPort = 0

describe('OPC UA Discovery node Unit Testing', function () {

  beforeAll(() => {
    testingOpcUaPort = 57350
  })

  beforeEach(function (done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function (done) {
    helper.unload().then(function () {
      helper.stopServer(function () {
        done()
      })
    }).catch(function () {
      helper.stopServer(function () {
        done()
      })
    })
  })

  describe('Discovery node', function () {
    it('should be loaded', function (done) {
      helper.load(
        [inputNode], testFlows.testUnitDiscoveryFlow,
        () => {
          let nodeUnderTest = helper.getNode('d9db5e281fac4a0c')
          expect(nodeUnderTest.type).toBe('OPCUA-IIoT-Discovery')
          expect(nodeUnderTest.name).toBe('TestName')
          setTimeout(done, 2000)
        })
    })

    it('should be loaded with default port', function (done) {
      helper.load(
        [inputNode], testFlows.testUnitDiscoveryNullPortFlow,
        function () {
          let nodeUnderTest = helper.getNode('n1dsf2')
          expect(nodeUnderTest.type).toBe('OPCUA-IIoT-Discovery')
          expect(nodeUnderTest.name).toBe('TestName')
          setTimeout(done, 2000)
        })
    })

    it('should be loaded with default port and send msg after inject', function (done) {
      helper.load(
        [injectNode, inputNode], testFlows.testUnitDiscoveryNullPortAndInjectFlow,
        function () {
          let nodeUnderTest = helper.getNode('n4edf1')
          nodeUnderTest.on('input', (msg) => {
            expect(msg.payload.discoveryUrls).toBeDefined()
            expect(msg.payload.endpoints).toBeDefined()
            setTimeout(done, 2000)
          })
        })
    })
  })
})
