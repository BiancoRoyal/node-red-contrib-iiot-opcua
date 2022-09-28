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
var inputNode = require('../../src/opcua-iiot-browser')
var serverNode = require('../../src/opcua-iiot-server')
var responseNode = require('../../src/opcua-iiot-response')
var resultFilterNode = require('../../src/opcua-iiot-result-filter')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var browseNodesToLoad = [injectNode, connectorNode, resultFilterNode, inputNode, serverNode, responseNode]

var testFlows = require('./flows/browser-e2e-flows')

describe('OPC UA Browser node e2e Testing', function () {
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

  describe('Browser node', function () {
    it('should verify browser items as result', function (done) {
      helper.load(browseNodesToLoad, testFlows.testBrowseFlow, function () {
        let n5 = helper.getNode('n5f1')
        let n1 = helper.getNode('n1f1')
        n5.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.browserResults).toBeInstanceOf(Array)
          expect(msg.payload.browserResults.length).toBe(15)
          done()
        })
      })
    })

    it('should verify browser items as single result', function (done) {
      helper.load(browseNodesToLoad, testFlows.testBrowseItemFlow, function () {
        let n5 = helper.getNode('n5f3')
        let n1 = helper.getNode('n1f3')
        n5.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.browserResults).toBeInstanceOf(Array)
          expect(msg.payload.browserResults.length).toBe(15)
          done()
        })
      })
    })

    it('should verify browser items as single of full result', function (done) {
      testFlows.testBrowseItemFlow[3].justValue = false
      helper.load(browseNodesToLoad, testFlows.testBrowseItemFlow, function () {
        let n5 = helper.getNode('n5f3')
        let n1 = helper.getNode('n1f3')
        n5.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.endpoint).toBeDefined()
          expect(msg.payload.session).toBeDefined()
          expect(msg.payload.browserResults).toBeInstanceOf(Array)
          expect(msg.payload.browserResults.length).toBe(15)
          expect(msg.payload.browserResults.length).toBe(msg.payload.browserResultsCount)
          done()
        })
      })
    })

    it('should verify browser items as single result with Nodes To Read', function (done) {
      testFlows.testBrowseItemFlow[3].sendNodesToRead = true
      helper.load(browseNodesToLoad, testFlows.testBrowseItemFlow, function () {
        let n5 = helper.getNode('n5f3')
        let n1 = helper.getNode('n1f3')
        n5.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.nodesToRead).toBeInstanceOf(Array)
          expect(msg.payload.nodesToRead.length).toBe(15)
          done()
        })
      })
    })

    it('should verify browser items as single result with Nodes To Listener', function (done) {
      testFlows.testBrowseItemFlow[3].sendNodesToListener = true
      helper.load(browseNodesToLoad, testFlows.testBrowseItemFlow, function () {
        let n5 = helper.getNode('n5f3')
        let n1 = helper.getNode('n1f3')
        n5.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.nodesToRead).toBeInstanceOf(Array)
          expect(msg.payload.nodesToRead.length).toBe(15)
          done()
        })
      })
    })

    it('should verify browser items as single result with Nodes To Browser', function (done) {
      testFlows.testBrowseItemFlow[3].sendNodesToBrowser = true
      helper.load(browseNodesToLoad, testFlows.testBrowseItemFlow, function () {
        let n5 = helper.getNode('n5f3')
        let n1 = helper.getNode('n1f3')
        n5.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.addressItemsToBrowse).toBeInstanceOf(Array)
          expect(msg.payload.addressItemsToBrowse.length).toBe(15)
          done()
        })
      })
    })

    it('should verify browser items as single result with nodes to Read, Browse, and Listener', function (done) {
      testFlows.testBrowseItemFlow[3].sendNodesToRead = true
      testFlows.testBrowseItemFlow[3].sendNodesToListener = true
      testFlows.testBrowseItemFlow[3].sendNodesToBrowser = true
      helper.load(browseNodesToLoad, testFlows.testBrowseItemFlow, function () {
        let n5 = helper.getNode('n5f3')
        let n1 = helper.getNode('n1f3')
        n5.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.nodesToRead).toBeInstanceOf(Array)
          expect(msg.payload.nodesToRead.length).toBe(15)
          expect(msg.payload.nodesToRead).toBeInstanceOf(Array)
          expect(msg.payload.nodesToRead.length).toBe(15)
          expect(msg.payload.addressItemsToBrowse).toBeInstanceOf(Array)
          expect(msg.payload.addressItemsToBrowse.length).toBe(15)
          done()
        })
      })
    })

    it('should verify browser items as single result with nodes to Browse with levels', function (done) {
      helper.load(browseNodesToLoad, testFlows.testBrowseLevelsFlow, function () {
        let n4 = helper.getNode('n4f2')
        let n1 = helper.getNode('n1f2')
        n4.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.addressItemsToBrowse).toBeInstanceOf(Array)
          expect(msg.payload.addressItemsToBrowse.length).toBe(15)
          done()
        })
      })
    })

    it('should verify browser items as single result with nodes to Read with levels', function (done) {
      helper.load(browseNodesToLoad, testFlows.testBrowseLevelsFlow, function () {
        let n6 = helper.getNode('n6f2')
        let n1 = helper.getNode('n1f2')
        n6.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.nodesToRead).toBeInstanceOf(Array)
          expect(msg.payload.nodesToRead.length).toBe(10)
          done()
        })
      })
    })

    it('should verify browser items as single result with nodes to Read with levels recursive', function (done) {
      testFlows.testBrowseLevelsFlow[3].recursiveBrowse = true
      helper.load(browseNodesToLoad, testFlows.testBrowseLevelsFlow, function () {
        let n6 = helper.getNode('n6f2')
        let n1 = helper.getNode('n1f2')
        n6.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.nodesToRead).toBeInstanceOf(Array)
          expect(msg.payload.nodesToRead.length).toBeGreaterThan(10)
          done()
        })
      })
    })

    it('should get ten messages with payload on browser with six response nodes and four result-filter nodes', function (done) {
      helper.load(browseNodesToLoad, testFlows.testBrowserResponseResultFilterFlow, function () {
        let n1 = helper.getNode('n1f4')
        let counter = 0
        n1.on('input', function (msg) {
          counter++
          expect(msg.payload).toBeDefined()
          expect(msg.payload.value).toBeDefined()

          if (msg.payload.value.length) {
            expect(msg.payload.value.length).toBeGreaterThan(0)
          } else {
            expect(msg.payload.browserResults).toBeDefined()
            expect(msg.payload.browserResults.length).toBeGreaterThan(0)
          }

          if (counter === 10) {
            done()
          }
        })
      })
    })
  })

  describe('Browser node HTTP requests', function () {
    it('should success on browse for a root id', function (done) {
      helper.load(browseNodesToLoad, testFlows.testBrowseFlow, function () {
        let n3 = helper.getNode('n3f1')
        let n1 = helper.getNode('n1f1')
        n3.on('input', function (msg) {
          helper.request()
            .get('/opcuaIIoT/browse/' + n3.id + '/' + encodeURIComponent('ns=0;i=85'))
            .expect(200)
            .end(done)
        })
      })
    })
  })
})
