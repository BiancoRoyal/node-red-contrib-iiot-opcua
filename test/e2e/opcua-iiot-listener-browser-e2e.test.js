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

var testFlows = require('./flows/listener-browser-e2e-flows')


let testingOpcUaPort = 0

describe('OPC UA Listener monitoring via Browser node e2e Testing', function () {

  beforeAll(() => {
    testingOpcUaPort = 53800
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

  describe('Listen via Browser node', function () {

    it('should have a message browser', function (done) {
      const flow = Array.from(testFlows.simpleBrowserAboFlowWithoutListenerInject)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[14].port = port
      flow[15].endpoint = 'opc.tcp://localhost:' + port

      helper.load(listenerNodesToLoad, flow, function () {
        let n4 = helper.getNode('n2abo')
        n4.on('input', function (msg) {
          done()
        })
      })
    })

    /*

        let msgCounter = 0
        it('should verify a message from browse node on subscribe recursive', function (done) {
          testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
    const port = testingOpcUaPort
          testFlows.recursiveBrowserAboFlow[14].port = port
          testFlows.recursiveBrowserAboFlow[15].endpoint = "opc.tcp://localhost:" + port
          const flow = Array.from(testFlows.recursiveBrowserAboFlow)

          helper.load(listenerNodesToLoad, flow, function () {
            msgCounter = 0
            let n2 = helper.getNode('n2abo')
            n2.on('input', function (msg) {
              msgCounter++
              if (msgCounter === 1) {
                expect(msg.payload.browserResults).toBeDefined()
                expect(msg.payload.browserResults.length).toBe(95)
              }

              if (msgCounter === 2) {
                expect(msg.payload.browserResults).toBeDefined()
                expect(msg.payload).toBeDefined()
                expect(msg.topic).toBe('unsub')
              }

              if (msgCounter === 3) {
                expect(msg.payload.browserResults).toBeDefined()
                expect(msg.payload).toBeDefined()
                expect(msg.topic).toBe('unsub')
                setTimeout(done, 3000)
              }
            })
          })
        })

        it('should verify a compressed message from response after browser node on subscribe recursive', function (done) {
          testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
    const port = testingOpcUaPort
          testFlows.recursiveBrowserAboFlow[14].port = port
          testFlows.recursiveBrowserAboFlow[15].endpoint = "opc.tcp://localhost:" + port
          const flow = Array.from(testFlows.recursiveBrowserAboFlow)

          helper.load(listenerNodesToLoad, flow, function () {
            msgCounter = 0
            let n3 = helper.getNode('n3abo')
            n3.on('input', function (msg) {
              msgCounter++
              if (msgCounter === 1) {
                expect(msg.payload).toBeDefined()
                expect(msg.payload.browserResults.length).toBe(95)
                expect(msg.payload.recursiveDepth).toBe(0)
              }

              if (msgCounter === 2) {
                expect(msg.payload).toBeDefined()
                expect(msg.payload.browserResults).toBeDefined()
                expect(msg.payload.recursiveDepth).toBe(0)
                setTimeout(done, 3000)
              }
            })
          })
        })

        it('should verify a message from listener node on subscribe recursive', function (done) {
          testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
    const port = testingOpcUaPort
          testFlows.recursiveBrowserAboFlow[14].port = port
          testFlows.recursiveBrowserAboFlow[15].endpoint = "opc.tcp://localhost:" + port
          const flow = Array.from(testFlows.recursiveBrowserAboFlow)

          helper.load(listenerNodesToLoad, flow, function () {
            msgCounter = 0
            let n4 = helper.getNode('n4abo')
            n4.on('input', function (msg) {
              msgCounter++
              if (msgCounter === 1) {
                expect(msg.payload).toBeDefined()
              }

              if (msgCounter === 2) {
                expect(msg.payload).toBeDefined()
                setTimeout(done, 3000)
              }
            })
          })
        })

        it('should verify a compressed message from response after listener node on subscribe recursive as single result', function (done) {
          testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
    const port = testingOpcUaPort
          testFlows.recursiveBrowserAboFlow[14].port = port
          testFlows.recursiveBrowserAboFlow[15].endpoint = "opc.tcp://localhost:" + port
          const flow = Array.from(testFlows.recursiveBrowserAboFlow)

          helper.load(listenerNodesToLoad, flow, function () {
            msgCounter = 0
            let n5 = helper.getNode('n5abo')
            n5.on('input', function (msg) {
              msgCounter++
              if (msgCounter === 1) {
                expect(msg.payload).toBeDefined()
                setTimeout(done, 3000)
              }
            })
          })
        })

        it('should subscribe from recursive browse from multiple results', function (done) {
          testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
    const port = testingOpcUaPort
          testFlows.feedListenerWithRecursiveBrowse[1].singleBrowseResult = false
          testFlows.feedListenerWithRecursiveBrowse[8].port = port
          testFlows.feedListenerWithRecursiveBrowse[9].endpoint = "opc.tcp://localhost:" + port
          const flow = Array.from(testFlows.feedListenerWithRecursiveBrowse)

          helper.load(listenerNodesToLoad, flow, function () {
            msgCounter = 0
            let n2 = helper.getNode('n2brli')
            n2.on('input', function (msg) {
              msgCounter++
              if (msgCounter === 1) {
                expect(msg.payload).toBeDefined()
                setTimeout(done, 3000)
              }
            })
          })
        })

        it('should subscribe from recursive browse from single result', function (done) {
          testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
    const port = testingOpcUaPort
          testFlows.feedListenerWithRecursiveBrowse[1].singleBrowseResult = true
          testFlows.feedListenerWithRecursiveBrowse[8].port = port
          testFlows.feedListenerWithRecursiveBrowse[9].endpoint = "opc.tcp://localhost:" + port
          const flow = Array.from(testFlows.feedListenerWithRecursiveBrowse)

          helper.load(listenerNodesToLoad, flow, function () {
            msgCounter = 0
            let n2 = helper.getNode('n2brli')
            n2.on('input', function (msg) {
              msgCounter++
              if (msgCounter === 1) {
                expect(msg.payload).toBeDefined()
                setTimeout(done, 3000)
              }
            })
          })
        })
    */
  })
})
