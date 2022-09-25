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

var injectNode = require('../../src/opcua-iiot-inject')
var connectorNode = require('../../src/opcua-iiot-connector')
var responseNode = require('../../src/opcua-iiot-response')
var readNode = require('../../src/opcua-iiot-read')
var listenerNode = require('../../src/opcua-iiot-listener')
var crawlerNode = require('../../src/opcua-iiot-crawler')
var serverNode = require('../../src/opcua-iiot-server')
var filterNode = require('../../src/opcua-iiot-result-filter')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testFilterNodes = [injectNode, connectorNode, readNode, responseNode, serverNode, crawlerNode, filterNode, listenerNode]

var testFlows = require('./flows/result-filter-e2e-flows')

describe('OPC UA Result Filter node e2e Testing', function () {
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

  describe('Result Filter node Unit Testing', function () {
    it('should read and filter the right node named TestReadWrite', function (done) {
      helper.load(testFilterNodes, testFlows.testFilterReadFlow, function () {
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
      testFlows.testFilterReadFlow[3].entry = 2
      testFlows.testFilterReadFlow[3].nodeId = 'ns=1;s=Counter'
      helper.load(testFilterNodes, testFlows.testFilterReadFlow, function () {
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
      helper.load(testFilterNodes, testFlows.testListenerFilterFlow, function () {
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
      helper.load(testFilterNodes, testFlows.testListenerFilterFlow, function () {
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
      helper.load(testFilterNodes, testFlows.testListenerFilterFlow, function () {
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
      helper.load(testFilterNodes, testFlows.testListenerFilterFlow, function () {
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

    it('should crawl and filter the right node i=1002', function (done) {
      helper.load(testFilterNodes, testFlows.testCrawlerFilterFlow, function () {
        let n1 = helper.getNode('n1crf3')
        n1.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          expect(msg.payload.nodeId).toBeDefined()
          expect(msg.payload.nodeId).toBe('ns=1;i=1002')
          done()
        })
      })
    })
  })
})
