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

var injectNode = require('../../src/opcua-iiot-inject')
var connectorNode = require('../../src/opcua-iiot-connector')
var responseNode = require('../../src/opcua-iiot-response')
var readNode = require('../../src/opcua-iiot-read')
var listenerNode = require('../../src/opcua-iiot-listener')
var crawlerNode = require('../../src/opcua-iiot-crawler')
var serverNode = require('../../src/opcua-iiot-server')
var filterNode = require('../../src/opcua-iiot-result-filter')
var browserNode = require('../../src/opcua-iiot-browser')

var helper = require('node-red-node-test-helper')
var portHelper = require('./../helper/test-helper-extensions')
helper.init(require.resolve('node-red'))

var testFilterNodes = [injectNode, connectorNode, readNode,
  responseNode, serverNode, crawlerNode, filterNode,
  listenerNode, browserNode]

var testFlows = require('./flows/result-filter-e2e-flows')

let testingOpcUaPort = 0

describe('OPC UA Result Filter node e2e Testing', function () {

  beforeAll(() => {
    testingOpcUaPort = 55600
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

  describe('Result Filter node Unit Testing', function () {
    it('should read and filter the right node named TestReadWrite', function (done) {
      const flow = Array.from(testFlows.testFilterReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[6].port = port
      flow[7].endpoint = 'opc.tcp://localhost:' + port

      helper.load(testFilterNodes, flow, function () {
        let n1 = helper.getNode('n1frf1')
        n1.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          expect(msg.payload.value).toBeDefined()
          expect(msg.payload.value.nodeId).toBe('ns=1;s=TestReadWrite')
          expect(msg.payload.value.value).toBeDefined()
          expect(msg.payload.value.value).toBe(1000)
          done()
        })
      })
    })

    it('should read and filter the right node named Counter', function (done) {
      const flow = Array.from(testFlows.testFilterReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[6].port = port
      flow[7].endpoint = 'opc.tcp://localhost:' + port
      flow[3].entry = 2
      flow[3].nodeId = 'ns=1;s=Counter'
      helper.load(testFilterNodes, flow, function () {
        let n1 = helper.getNode('n1frf1')
        n1.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          expect(msg.payload.value).toBeDefined()
          expect(msg.payload.value.value).toBeDefined()
          expect(msg.payload.value.value).toBeGreaterThan(0)
          expect(msg.payload.value.nodeId).toBe('ns=1;s=Counter')
          done()
        })
      })
    })

    it('should monitor and filter the right node named FullCounter', function (done) {
      const flow = Array.from(testFlows.testListenerFilterFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[11].port = port
      flow[12].endpoint = 'opc.tcp://localhost:' + port

      helper.load(testFilterNodes, flow, function () {
        let n1 = helper.getNode('n1frf2')
        n1.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          expect(msg.payload.value).toBeDefined()
          expect(msg.payload.value).toBeGreaterThan(0)
          expect(msg.payload.nodeId).toBe('ns=1;s=FullCounter')
          done()
        })
      })
    })

    it('should monitor and filter the right node named TestReadWrite', function (done) {
      const flow = Array.from(testFlows.testListenerFilterFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[11].port = port
      flow[12].endpoint = 'opc.tcp://localhost:' + port

      helper.load(testFilterNodes, flow, function () {
        let n2 = helper.getNode('n2frf2')
        n2.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          expect(msg.payload.value).toBeDefined()
          expect(msg.payload.value).toBe(1000)
          expect(msg.payload.nodeId).toBeDefined()
          expect(msg.payload.nodeId).toBe('ns=1;s=TestReadWrite')
          done()
        })
      })
    })

    it('should monitor and filter the right node named Counter', function (done) {
      const flow = Array.from(testFlows.testListenerFilterFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[11].port = port
      flow[12].endpoint = 'opc.tcp://localhost:' + port

      helper.load(testFilterNodes, flow, function () {
        let n3 = helper.getNode('n3frf2')
        n3.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          expect(msg.payload.value).toBeDefined()
          expect(msg.payload.value).toBeGreaterThan(0)
          expect(msg.payload.nodeId).toBeDefined()
          expect(msg.payload.nodeId).toBe('ns=1;s=Counter')
          done()
        })
      })
    })

    it('should monitor and filter the right node i=2277', function (done) {
      const flow = Array.from(testFlows.testListenerFilterFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[11].port = port
      flow[12].endpoint = 'opc.tcp://localhost:' + port

      helper.load(testFilterNodes, flow, function () {
        let n4 = helper.getNode('n4frf2')
        n4.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          expect(msg.payload.value).toBeDefined()
          expect(msg.payload.value).toBeGreaterThan(0)
          expect(msg.payload.nodeId).toBeDefined()
          expect(msg.payload.nodeId).toBe('ns=0;i=2277')
          done()
        })
      })
    })

    it('should be able to do read with a filtered message', function (done) {
      const flow = Array.from(testFlows.testBrowserReadFilterFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[6].port = port
      flow[7].endpoint = 'opc.tcp://localhost:' + port

      helper.load(testFilterNodes, flow, function () {
        let n1 = helper.getNode('920deb27a882f242')
        n1.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          expect(msg.payload.value).toBeDefined()
          expect(msg.payload.value).toHaveLength(1)
          expect(msg.payload.nodeId).toBeDefined()
          expect(msg.payload.nodeId).toBe('ns=1;s=Pressure')
          done()
        })
      })
    })

    /* Todo: fix broken Tests
    // Crawler in combination with a filter let tests fail. For more information look at e2e tests of the crawler

    it('should crawl and filter the right node i=1002', function (done) {
      const flow = Array.from(testFlows.testCrawlerFilterFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
const port = testingOpcUaPort
      flow[5].port = port
      flow[6].endpoint = "opc.tcp://localhost:" + port

      helper.load(testFilterNodes, flow, function () {
        let n1 = helper.getNode('n1crf3')
        n1.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          expect(msg.payload.nodeId).toBeDefined()
          expect(msg.payload.nodeId).toBe('ns=1;i=1002')
          done()
        })
      })
    })
    */

  })
})
