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

var injectNode = require('../../src/opcua-iiot-inject')
var inputNode = require('../../src/opcua-iiot-server-aso')
var serverNode = require('../../src/opcua-iiot-server')
var connectorNode = require('../../src/opcua-iiot-connector')
var readNode = require('../../src/opcua-iiot-read')
var browserNode = require('../../src/opcua-iiot-browser')

var readAsoNodesToLoad = [functionNode, injectNode, inputNode, serverNode, connectorNode, readNode,  browserNode]

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testFlows = require('./flows/server-aso-e2e-flows')

describe('OPC UA Server ASO node Testing', function () {
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

  describe('Address Space Operation node e2e Testing', function () {
    it('should get all ASO data types with message with payload', function (done) {
      helper.load([injectNode, functionNode, inputNode, serverNode], testFlows.testASOFlow, function () {
        let n4 = helper.getNode('n4')
        let test = 0
        n4.on('input', function (msg) {
          expect(msg.payload.nodetype).toBe('inject')
          expect(msg.payload.injectType).toBe('ASO')

          switch (msg.payload.datatype) {
            case 'FolderType':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestVariables')
              test ^= 1
              break
            case 'DateTime':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestDateTime')
              test ^= 2
              break
            case 'Boolean':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestBoolean')
              test ^= 4
              break
            case 'Double':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestDouble')
              test ^= 8
              break
            case 'UInt16':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestUInt16')
              test ^= 16
              break
            case 'UInt32':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestUInt32')
              test ^= 32
              break
            case 'UInt64':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestUInt64')
              test ^= 64
              break
            case 'String':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestString')
              test ^= 128
              break
            case 'Int16':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestInt16')
              test ^= 256
              break
            case 'Int32':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestInt32')
              test ^= 512
              break
            case 'LocalizedText':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestLocalizedText')
              test ^= 1024
              break
            default:
              break
          }

          if (test === Math.pow(2, 11) - 1) {
            done()
          }
        })
      })
    })

    it('should verify an inject message for address space operation', function (done) {
      helper.load([injectNode, functionNode, inputNode, serverNode], testFlows.testASOFlow, function () {
        let n4 = helper.getNode('n4')
        let test = 0
        n4.on('input', function (msg) {
          expect(msg.payload.nodetype).toBe('inject')
          expect(msg.payload.injectType).toBe('ASO')

          switch (msg.payload.datatype) {
            case 'FolderType':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestVariables')
              expect(msg.payload.browsename).toBe('TestVariables')
              test ^= 1
              break
            case 'DateTime':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestDateTime')
              test ^= 2
              break
            case 'Boolean':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestBoolean')
              test ^= 4
              break
            case 'Double':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestDouble')
              test ^= 8
              break
            case 'UInt16':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestUInt16')
              test ^= 16
              break
            case 'UInt32':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestUInt32')
              test ^= 32
              break
            case 'UInt64':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestUInt64')
              test ^= 64
              break
            case 'String':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestString')
              test ^= 128
              break
            case 'Int16':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestInt16')
              test ^= 256
              break
            case 'Int32':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestInt32')
              test ^= 512
              break
            case 'LocalizedText':
              expect(msg.payload.nodeId.toString()).toBe('ns=1;s=TestLocalizedText')
              test ^= 1024
              break
            default:
              break
          }

          if (test === Math.pow(2, 11) - 1) {
            done()
          }
        })
      })
    })

    it('should verify read via browser for address space operations', function (done) {
      helper.load(readAsoNodesToLoad, testFlows.testASOReadFlow, function () {
        let n4 = helper.getNode('41ac95a6194a3536')
        n4.on('input', function (msg) {
          expect(msg.payload.addressSpaceItems).toBeDefined()
          expect(msg.payload.addressSpaceItems.length).toBe(1)

          expect(msg.payload.value).toBeDefined()
          expect(msg.payload.value.length).toBe(10)

          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.browserResults.length).toBe(10)

          done()
        })
      })
    })
  })
})
