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

process.env.TEST = "true"

// jest.setTimeout(30000)

// iiot opc ua nodes
var injectNode = require('@node-red/nodes/core/common/20-inject')
var functionNode = require('@node-red/nodes/core/function/10-function')
var inputNode = require('../../src/opcua-iiot-listener')

var helper = require('node-red-node-test-helper')
var portHelper = require('./../helper/test-helper-extensions')
const {NodeIdType} = require("node-opcua");
helper.init(require.resolve('node-red'))

var listenerNodesToLoad = [injectNode, functionNode, inputNode]

var testFlows = require('./flows/listener-flows')
global.lastOpcuaPort = 57200

describe('OPC UA Listener monitoring node Unit Testing', function () {
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

  describe('Listener node', function () {
    it('should be loaded', function (done) {
      helper.load(listenerNodesToLoad, testFlows.testUnitListenerFlow,
        function () {
          let nodeUnderTest = helper.getNode('bee3e3b0.ca1a08')
          expect(nodeUnderTest.name).toBe('TestListener')
          expect(nodeUnderTest.action).toBe('subscribe')
          done()
        })
    })

    it('should be loaded and call createSubscription with wrong state', function (done) {
      helper.load(listenerNodesToLoad, testFlows.testUnitListenerFlow,
        function () {
          let nodeUnderTest = helper.getNode('bee3e3b0.ca1a08')
          expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.iiot.stateService.send('END')
          nodeUnderTest.functions.createSubscription({ payload: {} })
          done()
        })
    })

    it('should be loaded and call subscribeActionInput with wrong state', function (done) {
      helper.load(listenerNodesToLoad, testFlows.testUnitListenerFlow,
        function () {
          let nodeUnderTest = helper.getNode('bee3e3b0.ca1a08')
          expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.iiot.stateService.send('END')
          nodeUnderTest.functions.subscribeActionInput({ payload: {} })
          done()
        })
    })

    it('should be loaded and call subscribeMonitoredItem with wrong state', function (done) {
      helper.load(listenerNodesToLoad, testFlows.testUnitListenerFlow,
        function () {
          let nodeUnderTest = helper.getNode('bee3e3b0.ca1a08')
          expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.iiot.stateService.send('END')
          nodeUnderTest.iiot.opcuaSession = null
          nodeUnderTest.functions.subscribeMonitoredItem({ payload: {} })
          done()
        })
    })

    it('should be loaded and call monitoredItemTerminated with null item to monitor', function (done) {
      helper.load(listenerNodesToLoad, testFlows.testUnitListenerFlow,
        function () {
          let nodeUnderTest = helper.getNode('bee3e3b0.ca1a08')
          expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.iiot.stateService.send('END')
          nodeUnderTest.functions.monitoredItemTerminated({ payload: {} }, null, {}, new Error('Test Error Monitored Item'))
          done()
        })
    })

    it('should be loaded and call monitoredItemTerminated with null item to monitor', function (done) {
      helper.load(listenerNodesToLoad, testFlows.testUnitListenerFlow,
        function () {
          let nodeUnderTest = helper.getNode('bee3e3b0.ca1a08')
          expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.functions.errorHandling(new Error('Test Error'))
          done()
        })
    })

    it('should be loaded and call setMonitoring with undefined item id to monitor', function (done) {
      helper.load(listenerNodesToLoad, testFlows.testUnitListenerFlow,
        function () {
          let nodeUnderTest = helper.getNode('bee3e3b0.ca1a08')
          expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.iiot.stateService.send('END')
          let testItem = {nodeId: {identifierType: NodeIdType.STRING, namespace: 0, identifier: 'TestItem'}}
          nodeUnderTest.functions.setMonitoring({ itemToMonitor: testItem, on: (string, callback) => {console.log('Added ' + string)}})
          done()
        })
    })
  })
})
