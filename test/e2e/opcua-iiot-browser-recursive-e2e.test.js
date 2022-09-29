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
var listenerNode = require('../../src/opcua-iiot-listener')
var asoNode = require('../../src/opcua-iiot-server-aso')
var serverNode = require('../../src/opcua-iiot-server')
var responseNode = require('../../src/opcua-iiot-response')
var resultFilterNode = require('../../src/opcua-iiot-result-filter')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var browseRecursiveNodesToLoad = [injectNode, asoNode, listenerNode, connectorNode, resultFilterNode, inputNode, serverNode, responseNode]

var testFlows = require('./flows/browser-recursive-e2e-flows')

describe('OPC UA Browser recursive with ASO nodes e2e Testing', function () {
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

  describe('Browser Recursive node', function () {
    it('should verify browser items as result of a recursive browse', function (done) {
      const flow = testFlows.testBrowseRecursiveASOFlow
      flow[3].port = "50199"
      flow[24].endpoint = "opc.tcp://localhost:50199/"
      helper.load(browseRecursiveNodesToLoad, flow, function () {
        let n1 = helper.getNode('helperNode')
        n1.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.browserResults).toBeInstanceOf(Array)
          expect(msg.payload.browserResults.length).toBe(11)
          done()
        })
      })
    })
  })
})
