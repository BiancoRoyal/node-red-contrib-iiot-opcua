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

process.env.TEST = 'true'

// jest.setTimeout(30000)

// opcua iiot
var injectNode = require('@node-red/nodes/core/common/20-inject')
var functionNode = require('@node-red/nodes/core/function/10-function')
var inputNode = require('../../src/opcua-iiot-method-caller')

var helper = require('node-red-node-test-helper')
var portHelper = require('./../helper/test-helper-extensions')
helper.init(require.resolve('node-red'))

var methodCallerNodesToLoad = [injectNode, functionNode, inputNode]

var testFlows = require('./flows/method-caller-flows')

let testingOpcUaPort = 0

describe('OPC UA Method Caller node Unit Testing', function () {

  beforeAll(() => {
    testingOpcUaPort = 57750
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

  describe('Method Caller node', function () {
    it('should load with basic settings', function (done) {
      helper.load(methodCallerNodesToLoad, testFlows.testUnitMethodCallerFlow, () => {
        let nodeUnderTest = helper.getNode('706d43c1.90baac')
        expect(nodeUnderTest.name).toBe('TestName')
        expect(nodeUnderTest.methodType).toBe('basic')
        expect(nodeUnderTest.objectId).toBe('ns=1;i=1234')
        expect(nodeUnderTest.methodId).toBe('ns=1;i=12345')
        expect(nodeUnderTest.justValue).toBe(false)
        expect(nodeUnderTest.inputArguments).toMatchObject([
          {
            'name': 'barks',
            'dataType': 'UInt32',
            'value': '3'
          },
          {
            'name': 'volume',
            'dataType': 'UInt32',
            'value': '6'
          }
        ])
        done()
      })
    })

    it('should be loaded and handle error', function (done) {
      helper.load(methodCallerNodesToLoad, testFlows.testUnitMethodCallerFlow, () => {
        let n1 = helper.getNode('706d43c1.90baac')
        expect(n1).toBeDefined()
        n1.functions.handleMethodError(new Error('Testing Error To Handle'), { payload: {} })
        done()
      })
    })

    it('should be loaded and handle missing input', function (done) {
      helper.load(methodCallerNodesToLoad, testFlows.testUnitMethodCallerFlow, () => {
        let n1 = helper.getNode('706d43c1.90baac')
        expect(n1).toBeDefined()
        n1.receive({ payload: { objectId: 1 } })
        done()
      })
    })

    it('should be loaded and handle missing input', function (done) {
      helper.load(methodCallerNodesToLoad, testFlows.testUnitMethodCallerFlow, () => {
        let n1 = helper.getNode('706d43c1.90baac')
        expect(n1).toBeDefined()
        n1.receive({ payload: { objectId: 1, methodId: 1 } })
        done()
      })
    })

    it('should be loaded and handle missing input', function (done) {
      helper.load(methodCallerNodesToLoad, testFlows.testUnitMethodCallerFlow, () => {
        let n1 = helper.getNode('706d43c1.90baac')
        expect(n1).toBeDefined()
        n1.receive({ payload: { objectId: 1, methodId: 1, inputArguments: [] } })
        done()
      })
    })

    it('should be loaded and handle missing input', function (done) {
      helper.load(methodCallerNodesToLoad, testFlows.testUnitMethodCallerFlow, () => {
        let n1 = helper.getNode('706d43c1.90baac')
        expect(n1).toBeDefined()
        n1.receive({ payload: {} })
        done()
      })
    })

    it('should be loaded and handle error', function (done) {
      helper.load(methodCallerNodesToLoad, testFlows.testUnitMethodCallerNotConfiguredFlow, () => {
        let n1 = helper.getNode('706d43c1.90babc')
        expect(n1).toBeDefined()
        n1.functions.handleMethodError(new Error('Testing Error To Handle'), { payload: {} })
        done()
      })
    })

    it('should be loaded and handle missing input', function (done) {
      helper.load(methodCallerNodesToLoad, testFlows.testUnitMethodCallerNotConfiguredFlow, () => {
        let n1 = helper.getNode('706d43c1.90babc')
        expect(n1).toBeDefined()
        n1.receive({ payload: { objectId: 1 } })
        done()
      })
    })

    it('should be loaded and handle missing input', function (done) {
      helper.load(methodCallerNodesToLoad, testFlows.testUnitMethodCallerNotConfiguredFlow, () => {
        let n1 = helper.getNode('706d43c1.90babc')
        expect(n1).toBeDefined()
        n1.receive({ payload: {}, objectId: 1, methodId: 1 })
        done()
      })
    })

    it('should be loaded and handle missing input', function (done) {
      helper.load(methodCallerNodesToLoad, testFlows.testUnitMethodCallerNotConfiguredFlow, () => {
        let n1 = helper.getNode('706d43c1.90babc')
        expect(n1).toBeDefined()
        n1.receive({ payload: { objectId: 1, methodId: 1, inputArguments: [] } })
        done()
      })
    })

    it('should be loaded and handle missing input', function (done) {
      helper.load(methodCallerNodesToLoad, testFlows.testUnitMethodCallerNotConfiguredFlow, () => {
        let n1 = helper.getNode('706d43c1.90babc')
        expect(n1).toBeDefined()
        n1.receive({ payload: {} })
        done()
      })
    })

    it('should be loaded and handle method warn message', function (done) {
      helper.load(methodCallerNodesToLoad, testFlows.testUnitMethodCallerNotConfiguredFlow, () => {
        let n1 = helper.getNode('706d43c1.90babc')
        expect(n1).toBeDefined()
        n1.functions.handleMethodWarn('Test')
        done()
      })
    })

    it('should be loaded and handle missing session', function (done) {
      helper.load(methodCallerNodesToLoad, testFlows.testUnitMethodCallerFlow, () => {
        let n1 = helper.getNode('706d43c1.90baac')
        expect(n1).toBeDefined()
        n1.functions.callMethodOnSession(null)
        done()
      })
    })
  })
})
