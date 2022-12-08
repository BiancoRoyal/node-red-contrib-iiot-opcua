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
var functionNode = require('@node-red/nodes/core/function/10-function')
var flexServerNode = require('../../src/opcua-iiot-flex-server')

var flexServerFlowNodes = [injectNode, functionNode, flexServerNode]

var helper = require('node-red-node-test-helper')
var portHelper = require('./../helper/test-helper-extensions')
helper.init(require.resolve('node-red'))

var testFlows = require('./flows/flex-server-flows')

let testingOpcUaPort = 0

describe('OPC UA Flex Server node Unit Testing', function () {

  beforeAll(() => {
    testingOpcUaPort = 57650
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

  describe('Flex Server node', function () {
    it('should be loaded', function (done) {
      helper.load(flexServerFlowNodes, testFlows.testUnitFlexServerFlow,
        () => {
          let nodeUnderTest = helper.getNode('85d5edb0.385143')
          // expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.on('server_running', () => {
            expect(nodeUnderTest.name).toBe('DEMOSERVER')
            expect(nodeUnderTest.maxAllowedSessionNumber).toBe(10)
            expect(nodeUnderTest.maxNodesPerRead).toBe(1000)
            expect(nodeUnderTest.maxNodesPerBrowse).toBe(2000)
            setTimeout(done, 4000)
          })
        }
      )
    })

    it('should be loaded with user and ISA95 NodeSet XML', function (done) {
      helper.load(flexServerFlowNodes, testFlows.testUnitFlexServerWithUserAndISA95Flow,
        () => {
          let nodeUnderTest = helper.getNode('16093040.5dab23')
          expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.on('server_running', () => {
            expect(nodeUnderTest.name).toBe('DEMOSERVERWITHUSERANDISA95')
            expect(nodeUnderTest.maxAllowedSessionNumber).toBe(10)
            expect(nodeUnderTest.maxNodesPerRead).toBe(1000)
            expect(nodeUnderTest.maxNodesPerBrowse).toBe(2000)
            setTimeout(done, 4000)
          })
        }
      )
    })
  })
})
