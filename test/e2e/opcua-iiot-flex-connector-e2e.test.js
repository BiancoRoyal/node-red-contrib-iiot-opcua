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
var inputNode = require('../../src/opcua-iiot-flex-connector')
var connectorNode = require('../../src/opcua-iiot-connector')
var serverNode = require('../../src/opcua-iiot-server')
var flexServerNode = require('../../src/opcua-iiot-flex-server')
var responseNode = require('../../src/opcua-iiot-response')
var listenerNode = require('../../src/opcua-iiot-listener')
var eventNode = require('../../src/opcua-iiot-event')
var browserNode = require('../../src/opcua-iiot-browser')
var injectIIoTNode = require('../../src/opcua-iiot-inject')

var flexConnectorNodes = [injectNode, injectIIoTNode, inputNode, connectorNode, serverNode, flexServerNode, responseNode, listenerNode, eventNode, browserNode]

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testFlows = require('./flows/flex-connector-e2e-flows')

describe('OPC UA Flex Connector node e2e Testing', function () {
  beforeAll(function (done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function (done) {
    helper.unload().then(function () {
      done()
    }).catch(function () {
      done()
    })
  })

  afterAll(function (done) {
    helper.stopServer(function () {
      done()
    })
  })

  describe('Flex Connector node', function () {
    it('should be loaded and get five injects', function (done) {
      const flow = Array.from(testFlows.testFlexConnectorFlow)

      helper.load(flexConnectorNodes, flow,
        function () {
          let counter = 0
          let nodeUnderTest = helper.getNode('n1fc')
          expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.on('input', (msg) => {
            counter++
            expect(msg.payload).toBeDefined()
            if (counter === 5) {
              done()
            }
          })
        })
    })

    it('should be loaded with connector, inject, and servers', function (done) {
      const flow = Array.from(testFlows.testWithServersFlexConnector)
      flow[9].port = "51100"
      flow[10].port = "51101"
      flow[11].port = "51102"
      flow[12].endpoint = "opc.tcp://localhost:51100"

      helper.load(flexConnectorNodes, testFlows.testWithServersFlexConnector,
        function () {
          let counter = 0
          let nodeUnderTest = helper.getNode('n2fcs')
          expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.on('input', (msg) => {
            counter++
            expect(msg.payload).toBeDefined()
            if (counter > 2) {
              setTimeout(done, 3000)
            }
          })
        })
    })

    it('should be loaded with listener, events, and servers', function (done) {
      const flow = Array.from(testFlows.flexConnectorSwitchingEndpointWithListenerFlow)
      flow[7].port = "51103"
      flow[8].port = "51104"
      flow[17].endpoint = "opc.tcp://localhost:50304/"

      helper.load(flexConnectorNodes, testFlows.flexConnectorSwitchingEndpointWithListenerFlow,
        function () {
          let counter = 0
          let nodeUnderTest = helper.getNode('n1rcf1')
          expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.on('input', (msg) => {
            counter++
            expect(msg.payload).toBeDefined()
            if (counter === 2) {
              setTimeout(done, 3000)
            }
          })
        })
    })
  })
})
