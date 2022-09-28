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

var injectNodeRed = require('@node-red/nodes/core/common/20-inject')
var functionNode = require('@node-red/nodes/core/function/10-function')

// opcua iiot
var injectNode = require('../../src/opcua-iiot-inject')
var connectorNode = require('../../src/opcua-iiot-connector')
var responseNode = require('../../src/opcua-iiot-response')
var serverNode = require('../../src/opcua-iiot-server')
var inputNode = require('../../src/opcua-iiot-method-caller')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var methodCallerNodesToLoad = [injectNode, connectorNode, inputNode, responseNode, serverNode]
var eventNodesToLoad = [injectNodeRed, functionNode, connectorNode, inputNode, responseNode, serverNode]

var testFlows = require('./flows/method-caller-e2e-flow')

describe('OPC UA Method Caller node e2e Testing', function () {
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

  describe('Method Caller node', function () {
    it('should get a message with payload after inject', function (done) {
      helper.load(methodCallerNodesToLoad, testFlows.testMethodFlowPayload, function () {
        let n2 = helper.getNode('n2mcf1')
        n2.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicMethod')
          expect(msg.payload.nodetype).toBe('inject')
          expect(msg.payload.injectType).toBe('inject')
          done()
        })
      })
    })

    it('should get a message with payload', function (done) {
      helper.load(methodCallerNodesToLoad, testFlows.testMethodFlowPayload, function () {
        let n2 = helper.getNode('n2mcf1')
        n2.on('input', function (msg) {
          expect(msg.payload.value).toBe(12345)
          done()
        })
      })
    })

    it('should verify the result with response data', function (done) {
      helper.load(methodCallerNodesToLoad, testFlows.testMethodFlowPayload, function () {
        let n6 = helper.getNode('n6mcf1')
        n6.on('input', function (msg) {
          expect(msg.payload.nodetype).toBe('method')
          expect(msg.payload.entryStatus).toMatchObject({
            "bad": 0,
            "good": 1,
            "other": 0
          })
          // TODO: string vs. int on ENUMS has problems in tests and outputs
          // if I copy the live data, then I get strings like Double etc.
          // the test needs node-opcua enums or int to compare, otherwise it fails here
          expect(msg.payload.value).toMatchObject([
            {
              'statusCode': { 'value': 0, 'description': 'The operation succeeded.', 'name': 'Good' },
              "outputArguments": [
                {
                  "dataType": 12,
                  "arrayType": 1,
                  "value": [
                    "Whaff!!!!!",
                    "Whaff!!!!!",
                    "Whaff!!!!!"
                  ]
                }
              ]
            }])
          done()
        })
      })
    })

    it('should get a message with payload after inject event inject', function (done) {
      helper.load(eventNodesToLoad, testFlows.testMethodInjectFlowPayload, function () {
        let n2 = helper.getNode('n2mcf2')
        n2.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicMethod')
          expect(msg.payload).toBe(23456)
          done()
        })
      })
    })

    it('should verify the result with response data event inject', function (done) {
      helper.load(eventNodesToLoad, testFlows.testMethodInjectFlowPayload, function () {
        let n8 = helper.getNode('n8mcf2')
        n8.on('input', function (msg) {
          expect(msg.payload.nodetype).toBe('method')
          expect(msg.payload.entryStatus).toMatchObject({good: 1, bad: 0, other: 0})
          expect(msg.payload.value).toBeDefined()
          expect(msg.payload.definition).toBeDefined()
          expect(msg.payload.results).toBeDefined()
          done()
        })
      })
    })
  })
})
