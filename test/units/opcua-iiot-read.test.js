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

var injectNode = require('@node-red/nodes/core/common/20-inject')
var functionNode = require('@node-red/nodes/core/function/10-function')

// iiot opcua
var readNode = require('../../src/opcua-iiot-read')
const helperExtensions = require('../helper/test-helper-extensions')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var readNodesToLoad = [injectNode, functionNode, readNode]

var testReadNodeToBeLoaded = helperExtensions.cleanFlowPositionData([
  {
    "id": "41cb29d.1ab50d8",
    "type": "OPCUA-IIoT-Read",
    "z": "acd804583564cb8c",
    "attributeId": 0,
    "maxAge": 1,
    "depth": 1,
    "connector": "",
    "name": "ReadAll",
    "justValue": true,
    "showStatusActivities": false,
    "showErrors": false,
    "parseStrings": false,
    "historyDays": "",
    "x": 300,
    "y": 100,
    "wires": [
      []
    ]
  }
])

describe('OPC UA Read node Unit Testing', function () {
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
    it('should be loaded for all attributes', function (done) {
      testReadNodeToBeLoaded[0].attributeId = 0
      testReadNodeToBeLoaded[0].name = 'ReadAll'
      helper.load(readNodesToLoad, testReadNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          expect(nodeUnderTest.name).toBe('ReadAll')
          expect(nodeUnderTest.attributeId).toBe(0)
          expect(nodeUnderTest.parseStrings).toBe(false)
          expect(nodeUnderTest.justValue).toBe(true)
          setTimeout(done, 2000)
        })
    })

    it('should be loaded for Node-Id attributes', function (done) {
      testReadNodeToBeLoaded[0].attributeId = 1
      testReadNodeToBeLoaded[0].name = 'ReadNodeId'
      helper.load(readNodesToLoad, testReadNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          expect(nodeUnderTest.name).toBe('ReadNodeId')
          expect(nodeUnderTest.attributeId).toBe(1)
          expect(nodeUnderTest.parseStrings).toBe(false)
          expect(nodeUnderTest.justValue).toBe(true)
          setTimeout(done, 2000)
        })
    })

    it('should be loaded for Node-Class attributes', function (done) {
      testReadNodeToBeLoaded[0].attributeId = 2
      testReadNodeToBeLoaded[0].name = 'ReadNodeClass'
      helper.load(readNodesToLoad, testReadNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          expect(nodeUnderTest.name).toBe('ReadNodeClass')
          expect(nodeUnderTest.attributeId).toBe(2)
          expect(nodeUnderTest.parseStrings).toBe(false)
          expect(nodeUnderTest.justValue).toBe(true)
          setTimeout(done, 2000)
        })
    })

    it('should be loaded for browse name attributes', function (done) {
      testReadNodeToBeLoaded[0].attributeId = 3
      testReadNodeToBeLoaded[0].name = 'ReadBrowseName'
      helper.load(readNodesToLoad, testReadNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          expect(nodeUnderTest.name).toBe('ReadBrowseName')
          expect(nodeUnderTest.attributeId).toBe(3)
          expect(nodeUnderTest.parseStrings).toBe(false)
          expect(nodeUnderTest.justValue).toBe(true)
          done()
        })
    })

    it('should be loaded for display name attributes', function (done) {
      testReadNodeToBeLoaded[0].attributeId = 4
      testReadNodeToBeLoaded[0].name = 'ReadDisplayName'
      helper.load(readNodesToLoad, testReadNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          expect(nodeUnderTest.name).toBe('ReadDisplayName')
          expect(nodeUnderTest.attributeId).toBe(4)
          expect(nodeUnderTest.parseStrings).toBe(false)
          expect(nodeUnderTest.justValue).toBe(true)
          setTimeout(done, 2000)
        })
    })

    it('should be loaded for values attributes', function (done) {
      testReadNodeToBeLoaded[0].attributeId = 13
      testReadNodeToBeLoaded[0].name = 'ReadValues'
      helper.load(readNodesToLoad, testReadNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          expect(nodeUnderTest.name).toBe('ReadValues')
          expect(nodeUnderTest.attributeId).toBe(13)
          expect(nodeUnderTest.parseStrings).toBe(false)
          expect(nodeUnderTest.justValue).toBe(true)
          setTimeout(done, 2000)
        })
    })

    it('should be loaded for history values attributes', function (done) {
      testReadNodeToBeLoaded[0].attributeId = 130
      testReadNodeToBeLoaded[0].name = 'ReadHistoryValues'
      helper.load(readNodesToLoad, testReadNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          expect(nodeUnderTest.name).toBe('ReadHistoryValues')
          expect(nodeUnderTest.attributeId).toBe(130)
          expect(nodeUnderTest.parseStrings).toBe(false)
          expect(nodeUnderTest.justValue).toBe(true)
          setTimeout(done, 2000)
        })
    })

    it('should be loaded and handle error', function (done) {
      helper.load(readNodesToLoad, testReadNodeToBeLoaded, () => {
        let n1 = helper.getNode('41cb29d.1ab50d8')
        if (n1) {
          n1.functions.handleReadError(new Error('Testing Error To Handle'), {payload: {}})
          done()
        }
      })
    })
  })
})
