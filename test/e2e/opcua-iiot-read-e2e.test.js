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

var functionNode = require('@node-red/nodes/core/function/10-function')

// iiot opcua
var injectNode = require('../../src/opcua-iiot-inject')
var connectorNode = require('../../src/opcua-iiot-connector')
var inputNode = require('../../src/opcua-iiot-read')
var responseNode = require('../../src/opcua-iiot-response')
var serverNode = require('../../src/opcua-iiot-server')
var flexServerNode = require('../../src/opcua-iiot-flex-server')

var helper = require('node-red-node-test-helper')
var portHelper = require('./../helper/test-helper-extensions')
helper.init(require.resolve('node-red'))

var readNodesToLoad = [injectNode, functionNode, connectorNode, inputNode, responseNode, serverNode]
var readNodesToLoadWithFlexServer = [injectNode, functionNode, connectorNode, inputNode, responseNode, flexServerNode]

var testFlows = require('./flows/read-e2e-flows')
const { AttributeIds } = require('node-opcua')

let testingOpcUaPort = 0

describe('OPC UA Read node e2e Testing', function () {

  beforeAll(() => {
    testingOpcUaPort = 55000
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

  describe('Read node', function () {
    it('should get a message with payload for attributeId All', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = 0
      helper.load(readNodesToLoad, flow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', function (msg) {
          expect(msg.payload.value).toBe('testpayload')
          expect(msg.payload.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
          done()
        })
      })
    })

    it('should have read results for attributeId All', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = 0

      helper.load(readNodesToLoad, flow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', function (msg) {
          expect(msg.payload.value[0].nodeId).toBe('ns=0;i=2256')
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(0)
          done()
        })
      })
    })

    it('should have read results with response for attributeId 0', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = 0

      helper.load(readNodesToLoad, flow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({
            'good': 1,
            'bad': 0,
            'other': 0
          })
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(0)
          done()
        })
      })
    })

    it('should have read results with response for attributeId 0 from flex server', function (done) {
      const flow = testFlows.testReadFlexServerFlow
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = 0
      helper.load(readNodesToLoadWithFlexServer, flow, function () {
        let n6 = helper.getNode('n6rdf3')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ 'good': 1, 'bad': 0, 'other': 0 })
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(0)
          done()
        })
      })
    })

    it('should get a message with payload for attributeId Node-ID', function (done) {
      const flow = Array.from(Array.from(testFlows.testReadFlow))
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      helper.load(readNodesToLoad, flow, function () {
        flow[3].attributeId = AttributeIds.NodeId
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', function (msg) {
          expect(msg.payload.value).toBe('testpayload')
          expect(msg.payload.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
          done()
        })
      })
    })

    it('should have read results for attributeId Node-ID', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = AttributeIds.NodeId
      helper.load(readNodesToLoad, flow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', function (msg) {
          expect(msg.payload.value[0]).toBeDefined()
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(AttributeIds.NodeId)
          done()
        })
      })
    })

    it('should have read results with response for attributeId Node-ID', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = AttributeIds.NodeId
      helper.load(readNodesToLoad, flow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ 'good': 1, 'bad': 0, 'other': 0 })
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(AttributeIds.NodeId)
          done()
        })
      })
    })

    it('should get a message with payload for attributeId Node-Class', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = AttributeIds.NodeClass
      helper.load(readNodesToLoad, flow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', function (msg) {
          expect(msg.payload.value).toBe('testpayload')
          expect(msg.payload.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
          done()
        })
      })
    })

    it('should have read results for attributeId Node-Class', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = AttributeIds.NodeClass
      helper.load(readNodesToLoad, flow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', function (msg) {
          expect(msg.payload.value[0]).toBeDefined()
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(AttributeIds.NodeClass)
          done()
        })
      })
    })

    it('should have read results with response for attributeId Node-Class', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = AttributeIds.NodeClass
      helper.load(readNodesToLoad, flow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ 'good': 1, 'bad': 0, 'other': 0 })
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(AttributeIds.NodeClass)
          done()
        })
      })
    })

    it('should get a message with payload for attributeId Browse-Name', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = AttributeIds.BrowseName
      helper.load(readNodesToLoad, flow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', function (msg) {
          expect(msg.payload.value).toBe('testpayload')
          expect(msg.payload.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
          done()
        })
      })
    })

    it('should have read results for attributeId Browse-Name', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = AttributeIds.BrowseName
      helper.load(readNodesToLoad, flow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', function (msg) {
          expect(msg.payload.value[0]).toBeDefined()
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(AttributeIds.BrowseName)
          done()
        })
      })
    })

    it('should have read results with response for attributeId Browse-Name', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = AttributeIds.BrowseName
      helper.load(readNodesToLoad, flow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ 'good': 1, 'bad': 0, 'other': 0 })
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(AttributeIds.BrowseName)
          done()
        })
      })
    })

    it('should get a message with payload for attributeId Display-Name', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = AttributeIds.DisplayName
      helper.load(readNodesToLoad, flow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', function (msg) {
          expect(msg.payload.value).toBe('testpayload')
          expect(msg.payload.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
          done()
        })
      })
    })

    it('should have read results for attributeId Display-Name', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = AttributeIds.DisplayName
      helper.load(readNodesToLoad, flow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', function (msg) {
          expect(msg.payload.value[0]).toBeDefined()
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(AttributeIds.DisplayName)
          done()
        })
      })
    })

    it('should have read results with response for attributeId Display-Name', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = AttributeIds.DisplayName
      helper.load(readNodesToLoad, flow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ 'good': 1, 'bad': 0, 'other': 0 })
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(AttributeIds.DisplayName)
          done()
        })
      })
    })

    it('should get a message with payload for attributeId Value', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = AttributeIds.Value
      helper.load(readNodesToLoad, flow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', function (msg) {
          expect(msg.payload.value).toBe('testpayload')
          expect(msg.payload.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
          done()
        })
      })
    })

    it('should have read results for attributeId Value', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = AttributeIds.Value
      helper.load(readNodesToLoad, flow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', function (msg) {
          expect(msg.payload.value[0]).toBeDefined()
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(AttributeIds.Value)
          done()
        })
      })
    })

    it('should have read results with response for attributeId Value', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = AttributeIds.Value
      helper.load(readNodesToLoad, flow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ 'good': 1, 'bad': 0, 'other': 0 })
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(AttributeIds.Value)
          done()
        })
      })
    })

    it('should get a message with payload for attributeId History', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = 130
      helper.load(readNodesToLoad, flow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', function (msg) {
          expect(msg.payload.value).toBe('testpayload')
          expect(msg.payload.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
          done()
        })
      })
    })

    it('should have read results for attributeId History', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = 130
      helper.load(readNodesToLoad, flow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.value[0]).toBeDefined()
          expect(msg.payload.historyStart).toBeDefined()
          expect(msg.payload.historyEnd).toBeDefined()
          expect(msg.payload.attributeId).toBe(130)
          done()
        })
      })
    })

    it('should have read results with response for attributeId History', function (done) {
      const flow = Array.from(testFlows.testReadFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      flow[3].attributeId = 130
      helper.load(readNodesToLoad, flow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ 'good': 1, 'bad': 0, 'other': 0 })
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.readtype).toBe('HistoryValue')
          expect(msg.payload.historyStart).toBeDefined()
          expect(msg.payload.historyEnd).toBeDefined()
          expect(msg.payload.attributeId).toBe(130)
          done()
        })
      })
    })

    it('should have read with an injected time range results with response for attributeId History', function (done) {
      let flow = Array.from(testFlows.testReadHistoryRangeFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      helper.load(readNodesToLoad, flow, function () {
        let msgCounter = 0
        let n1 = helper.getNode('nr1h')
        n1.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.entryStatus).toMatchObject({ 'good': 1, 'bad': 0, 'other': 0 })
            expect(msg.topic).toBe('TestTopicRead1')
            expect(msg.payload.readtype).toBe('HistoryValue')
            expect(msg.payload.historyStart).toBeDefined()
            expect(msg.payload.historyEnd).toBeDefined()
            expect(msg.payload.attributeId).toBe(130)
          }

          if (msgCounter === 2) {
            expect(msg.payload.entryStatus).toMatchObject({ 'good': 1, 'bad': 0, 'other': 0 })
            expect(msg.topic).toBe('TestTopicRead2')
            expect(msg.payload.readtype).toBe('HistoryValue')
            expect(msg.payload.historyStart).toBeDefined()
            expect(msg.payload.historyEnd).toBeDefined()
            expect(msg.payload.attributeId).toBe(130)
            done()
          }
        })
      })
    })

    it('should have read with an injected time range results with compressed response for attributeId History', function (done) {
      const flow = Array.from(testFlows.testReadHistoryRangeFlow)
      testingOpcUaPort = portHelper.getPort(testingOpcUaPort)
      const port = testingOpcUaPort
      flow[7].port = port
      flow[8].endpoint = 'opc.tcp://localhost:' + port
      helper.load(readNodesToLoad, flow, function () {
        let msgCounter = 0
        let n2 = helper.getNode('nr2h')
        n2.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.entryStatus).toMatchObject({ 'good': 1, 'bad': 0, 'other': 0 })
            expect(msg.topic).toBe('TestTopicRead1')
            expect(msg.payload.historyStart).toBeDefined()
            expect(msg.payload.historyEnd).toBeDefined()
            expect(msg.payload.attributeId).toBeUndefined()
          }

          if (msgCounter === 2) {
            expect(msg.payload.entryStatus).toMatchObject({ 'good': 1, 'bad': 0, 'other': 0 })
            expect(msg.topic).toBe('TestTopicRead2')
            expect(msg.payload.historyStart).toBeDefined()
            expect(msg.payload.historyEnd).toBeDefined()
            expect(msg.payload.attributeId).toBeUndefined()
            done()
          }
        })
      })
    })
  })
})
