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

jest.setTimeout(30000)

// iiot opc ua nodes
var injectNode = require('../../src/opcua-iiot-inject')
var serverNode = require('../../src/opcua-iiot-server')
var responseNode = require('../../src/opcua-iiot-response')
var connectorNode = require('../../src/opcua-iiot-connector')
var inputNode = require('../../src/opcua-iiot-listener')
var browserNode = require('../../src/opcua-iiot-browser')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var listenerNodesToLoad = [injectNode, browserNode, connectorNode, inputNode, responseNode, serverNode]

var testFlows = require('./flows/listener-e2e-flows')

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
      testFlows.testListenerMonitoringFlow[8].port = 50400
      testFlows.testListenerMonitoringFlow[9].endpoint = "opc.tcp://localhost:50400/"
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
      testFlows.testListenerMonitoringFlow[8].port = 50401
      testFlows.testListenerMonitoringFlow[9].endpoint = "opc.tcp://localhost:50401/"
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
      testFlows.testListenerMonitoringFlow[8].port = 50402
      testFlows.testListenerMonitoringFlow[9].endpoint = "opc.tcp://localhost:50402/"
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
      testFlows.testListenerMonitoringAboFlow[11].port = 50403
      testFlows.testListenerMonitoringAboFlow[12].endpoint = "opc.tcp://localhost:50403/"
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
      testFlows.testListenerMonitoringAboFlow[11].port = 50404
      testFlows.testListenerMonitoringAboFlow[12].endpoint = "opc.tcp://localhost:50404/"
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
      testFlows.testListenerMonitoringAboFlow[11].port = 50405
      testFlows.testListenerMonitoringAboFlow[12].endpoint = "opc.tcp://localhost:50405/"
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
      testFlows.testListenerMonitoringAboFlow[11].port = 50406
      testFlows.testListenerMonitoringAboFlow[12].endpoint = "opc.tcp://localhost:50406/"
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
