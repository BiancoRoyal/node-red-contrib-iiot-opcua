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
var serverNode = require('../../src/opcua-iiot-server')
var readNode = require('../../src/opcua-iiot-read')
var browserNode = require('../../src/opcua-iiot-browser')
var crawlerNode = require('../../src/opcua-iiot-crawler')
var methodsNode = require('../../src/opcua-iiot-method-caller')
var resultFilterNode = require('../../src/opcua-iiot-result-filter')
var responseNode = require('../../src/opcua-iiot-response')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testResponseNodes = [injectNode, connectorNode, browserNode, crawlerNode, methodsNode, readNode, resultFilterNode, responseNode, serverNode]

var testFlows = require('./flows/response-e2e-flows')

describe('OPC UA Response node e2e Testing', function () {
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

  describe('Response node', function () {
    it('should get a message with payload on read not compressed', function (done) {
      helper.load(testResponseNodes, testFlows.testReadResponseFlow, function () {
        let nut = helper.getNode('n1rsf1')
        let inject = helper.getNode('ac8b3930.dce72')
        nut.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
      })
    })

    it('should get a message with payload on read compressed', function (done) {
      helper.load(testResponseNodes, testFlows.testReadResponseFlow, function () {
        let nut = helper.getNode('n2rsf1')
        let inject = helper.getNode('ac8b3930.dce72')
        nut.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
      })
    })

    it('should get a message with payload on read TestReadWrite filtered not compressed', function (done) {
      helper.load(testResponseNodes, testFlows.testReadResponseFlow, function () {
        let nut = helper.getNode('n4rsf1')
        let inject = helper.getNode('ac8b3930.dce72')
        nut.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
      })
    })

    it('should get a message with payload on read TestReadWrite filtered compressed', function (done) {
      helper.load(testResponseNodes, testFlows.testReadResponseFlow, function () {
        let nut = helper.getNode('n3rsf1')
        let inject = helper.getNode('ac8b3930.dce72')
        nut.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
      })
    })

    it('should get a message with payload on read Counter filtered not compressed', function (done) {
      helper.load(testResponseNodes, testFlows.testReadResponseFlow, function () {
        let nut = helper.getNode('n6rsf1')
        let inject = helper.getNode('ac8b3930.dce72')
        nut.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
      })
    })

    it('should get a message with payload on read Counter filtered compressed', function (done) {
      helper.load(testResponseNodes, testFlows.testReadResponseFlow, function () {
        let nut = helper.getNode('n5rsf1')
        let inject = helper.getNode('ac8b3930.dce72')
        nut.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
      })
    })

    it('should get four messages with payload on read after browse with four response nodes', function (done) {
      helper.load(testResponseNodes, testFlows.testReadAllAttributesResponseFlow, function () {
        let n1 = helper.getNode('n1rsf2')
        let counter = 0
        n1.on('input', function (msg) {
          counter++
          expect(msg.payload).toBeDefined()
          expect(msg.payload.value).toBeDefined()
          expect(typeof msg.payload.value).toBe(Array)
          expect(msg.payload.value.length).toBeGreaterThan(0)

          if (counter === 4) {
            done()                                // Todo: Test fails with "Callback was already called" live error log is at ./ResponseE2EErrorLog.txt
          }
        })
      })
    })

    it('should get six messages with payload on browse with six response nodes on all possible setting of options', function (done) {
      helper.load(testResponseNodes, testFlows.testAllResponseTypesWithBrowser, function () {
        let n1 = helper.getNode('n1rsf3')
        let counter = 0
        n1.on('input', function (msg) {
          counter++
          expect(msg.payload).toBeDefined()

          if (msg.payload.length) {
            expect(msg.payload.length).toBeGreaterThan(0)
          } else {
            expect(msg.payload.browserResults).toBeDefined()
            expect(msg.payload.browserResults.length).toBeGreaterThan(0)
          }

          if (counter === 6) {
            done()
          }
        })
      })
    })

    it('should get six messages with payload on crawler with six response nodes on all possible setting of options', function (done) {
      helper.load(testResponseNodes, testFlows.testCrawlerResponseFlow, function () {
        let n1 = helper.getNode('n1rsf4')
        let counter = 0
        n1.on('input', function (msg) {
          counter++
          expect(msg.payload).toBeDefined()

          if (msg.payload.length) {
            expect(msg.payload.length).toBeGreaterThan(0)
          } else {
            expect(msg.payload.crawlerResults).toBeDefined()
            expect(msg.payload.crawlerResults.length).toBeGreaterThan(0)
          }

          if (counter === 6) {
            done()
          }
        })
      })
    })

    it('should get three messages with payload on method call with three response nodes on all possible setting of options', function (done) {
      helper.load(testResponseNodes, testFlows.testMethodResponseFlow, function () {
        let n1 = helper.getNode('n1rsf5')
        let counter = 0
        n1.on('input', function (msg) {
          counter++
          expect(msg.payload).toBeDefined()
          expect(msg.payload.results).toBeDefined()
          expect(msg.payload.results.length).toBeGreaterThan(0)

          if (counter === 3) {
            done()
          }
        })
      })
    })
  })
})
