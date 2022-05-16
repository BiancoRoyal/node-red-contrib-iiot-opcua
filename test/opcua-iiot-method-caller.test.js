/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2018 Klaus Landsdorf (http://bianco-royal.de/)
 * All rights reserved.
 * node-red-contrib-iiot-opcua
 *
 **/

'use strict'

jest.setTimeout(5000)

// opcua iiot
var injectNode = require('@node-red/nodes/core/common/20-inject')
var functionNode = require('@node-red/nodes/core/function/10-function')
var inputNode = require('../src/opcua-iiot-method-caller')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var methodCallerNodesToLoad = [injectNode, functionNode, inputNode]

var methodUnitFlow = [
  {
    'id': '706d43c1.90baac',
    'type': 'OPCUA-IIoT-Method-Caller',
    'connector': '',
    'objectId': 'ns=1;i=1234',
    'methodId': 'ns=1;i=12345',
    'methodType': 'basic',
    'value': '',
    'justValue': false,
    'name': 'TestName',
    'showStatusActivities': false,
    'showErrors': true,
    'inputArguments': [
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
    ],
    'wires': [[]]
  }
]

var methodNotConfiguredUnitFlow = [
  {
    'id': '706d43c1.90babc',
    'type': 'OPCUA-IIoT-Method-Caller',
    'connector': '',
    'objectId': '',
    'methodId': '',
    'methodType': 'basic',
    'value': '',
    'justValue': false,
    'name': 'TestName',
    'showStatusActivities': false,
    'showErrors': true,
    'inputArguments': [],
    'wires': [[]]
  }
]

describe('OPC UA Method Caller node Unit Testing', function () {
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
    it('should load with basic settings', function (done) {
      helper.load(methodCallerNodesToLoad, methodUnitFlow, () => {
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
      helper.load(methodCallerNodesToLoad, methodUnitFlow, () => {
        let n1 = helper.getNode('706d43c1.90baac')
        expect(n1).toBeDefined()
        n1.bianco.iiot.handleMethodError(new Error('Testing Error To Handle'), {payload: {}})
        done()
      })
    })

    it('should be loaded and handle missing input', function (done) {
      helper.load(methodCallerNodesToLoad, methodUnitFlow, () => {
        let n1 = helper.getNode('706d43c1.90baac')
        expect(n1).toBeDefined()
        n1.receive({payload: { objectId: 1 }})
        done()
      })
    })

    it('should be loaded and handle missing input', function (done) {
      helper.load(methodCallerNodesToLoad, methodUnitFlow, () => {
        let n1 = helper.getNode('706d43c1.90baac')
        expect(n1).toBeDefined()
        n1.receive({payload: { objectId: 1, methodId: 1 }})
        done()
      })
    })

    it('should be loaded and handle missing input', function (done) {
      helper.load(methodCallerNodesToLoad, methodUnitFlow, () => {
        let n1 = helper.getNode('706d43c1.90baac')
        expect(n1).toBeDefined()
        n1.receive({payload: { objectId: 1, methodId: 1, inputArguments: [] }})
        done()
      })
    })

    it('should be loaded and handle missing input', function (done) {
      helper.load(methodCallerNodesToLoad, methodUnitFlow, () => {
        let n1 = helper.getNode('706d43c1.90baac')
        expect(n1).toBeDefined()
        n1.receive({payload: {}})
        done()
      })
    })

    it('should be loaded and handle error', function (done) {
      helper.load(methodCallerNodesToLoad, methodNotConfiguredUnitFlow, () => {
        let n1 = helper.getNode('706d43c1.90babc')
        expect(n1).toBeDefined()
        n1.bianco.iiot.handleMethodError(new Error('Testing Error To Handle'), {payload: {}})
        done()
      })
    })

    it('should be loaded and handle missing input', function (done) {
      helper.load(methodCallerNodesToLoad, methodNotConfiguredUnitFlow, () => {
        let n1 = helper.getNode('706d43c1.90babc')
        expect(n1).toBeDefined()
        n1.receive({payload: { objectId: 1 }})
        done()
      })
    })

    it('should be loaded and handle missing input', function (done) {
      helper.load(methodCallerNodesToLoad, methodNotConfiguredUnitFlow, () => {
        let n1 = helper.getNode('706d43c1.90babc')
        expect(n1).toBeDefined()
        n1.receive({payload: {}, objectId: 1, methodId: 1})
        done()
      })
    })

    it('should be loaded and handle missing input', function (done) {
      helper.load(methodCallerNodesToLoad, methodNotConfiguredUnitFlow, () => {
        let n1 = helper.getNode('706d43c1.90babc')
        expect(n1).toBeDefined()
        n1.receive({payload: { objectId: 1, methodId: 1, inputArguments: [] }})
        done()
      })
    })

    it('should be loaded and handle missing input', function (done) {
      helper.load(methodCallerNodesToLoad, methodNotConfiguredUnitFlow, () => {
        let n1 = helper.getNode('706d43c1.90babc')
        expect(n1).toBeDefined()
        n1.receive({payload: {}})
        done()
      })
    })

    it('should be loaded and handle method warn message', function (done) {
      helper.load(methodCallerNodesToLoad, methodNotConfiguredUnitFlow, () => {
        let n1 = helper.getNode('706d43c1.90babc')
        expect(n1).toBeDefined()
        n1.bianco.iiot.handleMethodWarn('Test')
        done()
      })
    })

    it('should be loaded and handle missing session', function (done) {
      helper.load(methodCallerNodesToLoad, methodUnitFlow, () => {
        let n1 = helper.getNode('706d43c1.90baac')
        expect(n1).toBeDefined()
        n1.bianco.iiot.callMethodOnSession(null)
        done()
      })
    })
  })
})
