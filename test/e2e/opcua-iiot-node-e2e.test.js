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

// iiot opc ua nodes

var serverNode = require('../../src/opcua-iiot-server')
var responseNode = require('../../src/opcua-iiot-response')
var connectorNode = require('../../src/opcua-iiot-connector')
var listenerNode = require('../../src/opcua-iiot-listener')
var inputNode = require('../../src/opcua-iiot-node')
var resultFilterNode = require('../../src/opcua-iiot-result-filter')

var helper = require('node-red-node-test-helper')
var portHelper = require('./../helper/test-helper-extensions')
helper.init(require.resolve('node-red'))

var nodeNodesToLoad = [injectNode, inputNode, connectorNode, listenerNode, responseNode, serverNode, resultFilterNode]

var testFlows = require('./flows/node-e2e-flows')

let testingOpcUaPort = 0

describe('OPC UA Node node e2e Testing', function () {

  beforeAll(() => {
    testingOpcUaPort = 54700
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

  describe('Node node', function () {
    let msgCounter = 0

    it('should get two messages with payload and value after inject on subscribe with listener', function (done) {
      const flow = Array.from(testFlows.testNodeFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[9].port = port
      flow[16].endpoint = 'opc.tcp://localhost:' + port

      helper.load(nodeNodesToLoad, flow, function () {
        msgCounter = 0
        let n2 = helper.getNode('9902563b094d0417')
        // let n2 = helper.getNode('53aa4e70.57ae7')
        n2.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload).toBeDefined()
            expect(msg.payload.value).toBeDefined()
          }
          if (msgCounter === 2) {
            expect(msg.payload).toBeDefined()
            expect(msg.payload.value).toBeDefined()
            done()
          }
        })
      })
    })

    // TODO: tests to see if the different inject node payloads work for all types as expected (Node-RED and IIoT inject)
  })
})
