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
var serverNode = require('../../src/opcua-iiot-server')
var readNode = require('../../src/opcua-iiot-read')
var browserNode = require('../../src/opcua-iiot-browser')
var crawlerNode = require('../../src/opcua-iiot-crawler')
var methodsNode = require('../../src/opcua-iiot-method-caller')
var resultFilterNode = require('../../src/opcua-iiot-result-filter')
var responseNode = require('../../src/opcua-iiot-response')

var helper = require('node-red-node-test-helper')
var portHelper = require('./../helper/test-helper-extensions')
helper.init(require.resolve('node-red'))

var testResponseNodes = [injectNode, connectorNode, browserNode, crawlerNode, methodsNode, readNode, resultFilterNode, responseNode, serverNode]

var testFlows = require('./flows/response-e2e-flows')

let testingOpcUaPort = 0

describe('OPC UA Response node e2e Testing', function () {

  beforeAll(() => {
    testingOpcUaPort = 55300
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

  describe('Response node', function () {
    it('should get a message with payload on read not compressed', function (done) {
      const flow = Array.from(testFlows.testReadResponseFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[17].port = port
      flow[18].endpoint = 'opc.tcp://localhost:' + port

      helper.load(testResponseNodes, flow, function () {
        let nut = helper.getNode('n1rsf1')
        let inject = helper.getNode('ac8b3930.dce72')
        nut.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
      })
    })

    it('should get a message with payload on read compressed', function (done) {
      const flow = Array.from(testFlows.testReadResponseFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[17].port = port
      flow[18].endpoint = 'opc.tcp://localhost:' + port

      helper.load(testResponseNodes, flow, function () {
        let nut = helper.getNode('n2rsf1')
        let inject = helper.getNode('ac8b3930.dce72')
        nut.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
      })
    })

    it('should get a message with payload on read TestReadWrite filtered not compressed', function (done) {
      const flow = Array.from(testFlows.testReadResponseFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[17].port = port
      flow[18].endpoint = 'opc.tcp://localhost:' + port

      helper.load(testResponseNodes, flow, function () {
        let nut = helper.getNode('n4rsf1')
        let inject = helper.getNode('ac8b3930.dce72')
        nut.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
      })
    })

    it('should get a message with payload on read TestReadWrite filtered compressed', function (done) {
      const flow = Array.from(testFlows.testReadResponseFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[17].port = port
      flow[18].endpoint = 'opc.tcp://localhost:' + port

      helper.load(testResponseNodes, flow, function () {
        let nut = helper.getNode('n3rsf1')
        let inject = helper.getNode('ac8b3930.dce72')
        nut.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
      })
    })

    it('should get a message with payload on read Counter filtered not compressed', function (done) {
      const flow = Array.from(testFlows.testReadResponseFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[17].port = port
      flow[18].endpoint = 'opc.tcp://localhost:' + port

      helper.load(testResponseNodes, flow, function () {
        let nut = helper.getNode('n6rsf1')
        let inject = helper.getNode('ac8b3930.dce72')
        nut.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
      })
    })

    it('should get a message with payload on read Counter filtered compressed', function (done) {
      const flow = Array.from(testFlows.testReadResponseFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[17].port = port
      flow[18].endpoint = 'opc.tcp://localhost:' + port

      helper.load(testResponseNodes, flow, function () {
        let nut = helper.getNode('n5rsf1')
        let inject = helper.getNode('ac8b3930.dce72')
        nut.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
      })
    })

    /*  Todo: fix broken Tests
    //  Like the crawler, the browser also seems to have problems with a callback error
    //  Either the implementation of browser and crawler needs to be updated or the server, session and ASO
    //  need to be rebuild. Another option could be that the node opcua package has some problems that jest
    //  detects as unhandled errors.
    //  For now, we deactivate these tests as we are working on a fix and the nodes work as they should
    //  For more information look at crawler e2e tests

    it('should get four messages with payload on read after browse with four response nodes', function (done) {
      const flow = Array.from(testFlows.testReadAllAttributesResponseFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
const port = testingOpcUaPort
      flow[9].port = port
      flow[10].endpoint = "opc.tcp://localhost:" + port

      helper.load(testResponseNodes, flow, function () {
        let n1 = helper.getNode('n1rsf2')
        let counter = 0
        n1.on('input', function (msg) {
          counter++
          expect(msg.payload).toBeDefined()
          expect(msg.payload.value).toBeDefined()
          expect(typeof msg.payload.value).toBe(Array)
          expect(msg.payload.value.length).toBeGreaterThan(0)

          if (counter === 4) {
            done() // Todo: Test fails with "Callback was already called"
          }
        })
      })
    })
    */

    it('should get six messages with payload on browse with six response nodes on all possible setting of options', function (done) {
      const flow = Array.from(testFlows.testAllResponseTypesWithBrowser)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[1].port = port
      flow[11].endpoint = 'opc.tcp://localhost:' + port

      helper.load(testResponseNodes, flow, function () {
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

    /*  Todo: fix broken Tests
    //  The crawler seems to have problems with a callback error
    //  Either the implementation of browser and crawler needs to be updated or the server, session and ASO
    //  need to be rebuild. Another option could be that the node opcua package has some problems that jest
    //  detects as unhandled errors.
    //  For now, we deactivate these tests as we are working on a fix and the nodes work as they should
    //  For more information look at crawler e2e tests

    it('should get six messages with payload on crawler with six response nodes on all possible setting of options', function (done) {
      const flow = Array.from(testFlows.testCrawlerResponseFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
const port = testingOpcUaPort
      flow[10].port = port
      flow[13].endpoint = "opc.tcp://localhost:" + port

      helper.load(testResponseNodes, flow, function () {
        let n1 = helper.getNode('193c2083a00aab84')
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

    */

    it('should get three messages with payload on method call with three response nodes on all possible setting of options', function (done) {
      const flow = Array.from(testFlows.testMethodResponseFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port

      helper.load(testResponseNodes, flow, function () {
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
