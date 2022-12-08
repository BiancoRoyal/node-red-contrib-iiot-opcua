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
var serverCmdNode = require('../../src/opcua-iiot-server-cmd')

var serverCmdNodes = [injectNode, functionNode, serverCmdNode]

var helper = require('node-red-node-test-helper')
var portHelper = require('./../helper/test-helper-extensions')
helper.init(require.resolve('node-red'))

var testFlows = require('./flows/server-cmd-flows')

let testingOpcUaPort = 0

describe('OPC UA Server Command node Unit Testing', function () {

  beforeAll(() => {
    testingOpcUaPort = 58350
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

  describe('Command node', function () {
    it('should be loaded', function (done) {
      helper.load(serverCmdNodes, testFlows.testUnitServerCommandFlow,
        function () {
          let nodeUnderTest = helper.getNode('n3cmdf1')
          expect(nodeUnderTest.name).toBe('TestName')
          expect(nodeUnderTest.commandtype).toBe('restart')
          expect(nodeUnderTest.nodeId).toBe('')
          done()
        })
    })
  })
})
