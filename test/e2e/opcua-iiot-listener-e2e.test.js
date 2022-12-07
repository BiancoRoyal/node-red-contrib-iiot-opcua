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

// iiot opc ua nodes
var injectNode = require('../../src/opcua-iiot-inject')
var serverNode = require('../../src/opcua-iiot-server')
var responseNode = require('../../src/opcua-iiot-response')
var connectorNode = require('../../src/opcua-iiot-connector')
var inputNode = require('../../src/opcua-iiot-listener')
var browserNode = require('../../src/opcua-iiot-browser')

var helper = require('node-red-node-test-helper')
var portHelper = require('./../helper/test-helper-extensions')
helper.init(require.resolve('node-red'))

var listenerNodesToLoad = [injectNode, browserNode, connectorNode, inputNode, responseNode, serverNode]

var testFlows = require('./flows/listener-e2e-flows')
global.lastOpcuaPort = 55500

describe('OPC UA Listener monitoring node e2e Testing', function () {
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

  describe('Listen node', function () {
    let msgCounter = 0

    it('should get a message with payload after inject on unsubscribe', function (done) {
      const port = portHelper.getPort()
      testFlows.testListenerMonitoringFlow[8].port = port
      testFlows.testListenerMonitoringFlow[9].endpoint = "opc.tcp://localhost:" + port
      const flow = Array.from(testFlows.testListenerMonitoringFlow)

      helper.load(listenerNodesToLoad, flow, function () {
        msgCounter = 0
        let n2 = helper.getNode('n2li')
        n2.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 2) {
            expect(msg.topic).toBe('TestTopicUnsubscribe')
            expect(msg.payload.nodetype).toBe('inject')
            expect(msg.payload.injectType).toBe('listen')
            setTimeout(done, 3000)
          }
        })
      })
    })

    it('should verify a message on changed monitored item with statusCode on subscribe', function (done) {
      const port = portHelper.getPort()
      testFlows.testListenerMonitoringFlow[8].port = port
      testFlows.testListenerMonitoringFlow[9].endpoint = "opc.tcp://localhost:" + port
      const flow = Array.from(testFlows.testListenerMonitoringFlow)

      helper.load(listenerNodesToLoad, flow, function () {
        msgCounter = 0
        let n3 = helper.getNode('n3li')
        n3.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.value).toBeDefined()
            expect(msg.topic).toBe('TestTopicSubscribe')
            expect(msg.payload.value.value.dataType).toBe('Int32')
            expect(msg.payload.value.statusCode).toBeDefined()
            setTimeout(done, 3000)
          }
        })
      })
    })

    it('should verify a compressed message from response node on subscribe', function (done) {
      const port = portHelper.getPort()
      testFlows.testListenerMonitoringFlow[8].port = port
      testFlows.testListenerMonitoringFlow[9].endpoint = "opc.tcp://localhost:" + port
      const flow = Array.from(testFlows.testListenerMonitoringFlow)

      helper.load(listenerNodesToLoad, flow, function () {
        msgCounter = 0
        let n4 = helper.getNode('n4li')
        n4.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.value).toBeDefined()
            expect(msg.topic).toBe('TestTopicSubscribe')
            expect(msg.payload.value.value.dataType).toBe('Int32')
            expect(msg.payload.payload.nodeId).toBe('ns=1;s=FullCounter')
            expect(msg.payload.value.statusCode).toBeDefined()
            setTimeout(done, 3000)
          }
        })
      })
    })

    it('should get a message with payload after injecting twice', function (done) {
      const port = portHelper.getPort()
      testFlows.testListenerMonitoringAboFlow[11].port = port
      testFlows.testListenerMonitoringAboFlow[12].endpoint = "opc.tcp://localhost:" + port
      const flow = Array.from(testFlows.testListenerMonitoringAboFlow)

      helper.load(listenerNodesToLoad, flow, function () {
        msgCounter = 0
        let n1 = helper.getNode('n1lia')
        n1.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.topic).toBe('TestTopicSubscribe1')
            expect(msg.payload.nodetype).toBe('inject')
            expect(msg.payload.injectType).toBe('listen')
          }

          if (msgCounter === 2) {
            expect(msg.topic).toBe('TestTopicUnsubscribe1')
            expect(msg.payload.nodetype).toBe('inject')
            expect(msg.payload.injectType).toBe('listen')
            setTimeout(done, 3000)
          }
        })
      })
    })

    it('should verify a message on changed monitored item with statusCode on subscribing twice', function (done) {
      const port = portHelper.getPort()
      testFlows.testListenerMonitoringAboFlow[11].port = port
      testFlows.testListenerMonitoringAboFlow[12].endpoint = "opc.tcp://localhost:" + port
      const flow = Array.from(testFlows.testListenerMonitoringAboFlow)

      helper.load(listenerNodesToLoad, flow, function () {
        msgCounter = 0
        let n2 = helper.getNode('n2lia')
        n2.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.topic).toBe('TestTopicSubscribe2')
            expect(msg.payload.nodetype).toBe('inject')
            expect(msg.payload.injectType).toBe('listen')
            expect(msg.payload.value).toBeDefined()
          }

          if (msgCounter === 2) {
            expect(msg.topic).toBe('TestTopicUnsubscribe2')
            expect(msg.payload.nodetype).toBe('inject')
            expect(msg.payload.injectType).toBe('listen')
            setTimeout(done, 3000)
          }
        })
      })
    })

    it('should verify message from listener node on subscribing twice', function (done) {
      const port = portHelper.getPort()
      testFlows.testListenerMonitoringAboFlow[11].port = port
      testFlows.testListenerMonitoringAboFlow[12].endpoint = "opc.tcp://localhost:" + port
      const flow = Array.from(testFlows.testListenerMonitoringAboFlow)

      helper.load(listenerNodesToLoad, flow, function () {
        msgCounter = 0
        let n3 = helper.getNode('n3lia')
        n3.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.value).toBeDefined()
            setTimeout(done, 3000)
          }
        })
      })
    })

    it('should verify a compressed message from response node on subscribing twice', function (done) {
      const port = portHelper.getPort()
      testFlows.testListenerMonitoringAboFlow[11].port = port
      testFlows.testListenerMonitoringAboFlow[12].endpoint = "opc.tcp://localhost:" + port
      const flow = Array.from(testFlows.testListenerMonitoringAboFlow)

      helper.load(listenerNodesToLoad, flow, function () {
        msgCounter = 0
        let n4 = helper.getNode('n4lia')
        n4.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.value).toBeDefined()
            setTimeout(done, 3000)
          }
        })
      })
    })
  })
})
