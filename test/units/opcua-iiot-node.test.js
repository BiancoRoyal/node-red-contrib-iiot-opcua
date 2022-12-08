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

var injectNode = require('@node-red/nodes/core/common/20-inject')
var inputNode = require('../../src/opcua-iiot-node')

var helper = require('node-red-node-test-helper')
var portHelper = require('./../helper/test-helper-extensions')
helper.init(require.resolve('node-red'))

var testFlows = require('./flows/node-flows')

let testingOpcUaPort = 0

describe('OPC UA Node node Unit Testing', function () {

  beforeAll(() => {
    testingOpcUaPort = 57850
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

  describe('Node node', function () {
    it('should be loaded', function (done) {
      helper.load(
        [inputNode], [{
          'id': '3a234e92.cbc0f2',
          'type': 'OPCUA-IIoT-Node',
          'injectType': 'inject',
          'nodeId': 'ns=1;s=TestReadWrite',
          'datatype': 'Double',
          'value': 'testpayload',
          'name': 'TestReadWrite',
          'topic': 'TestTopicNode',
          'showErrors': false,
          'wires': [[]]
        }
        ],
        function () {
          let nodeUnderTest = helper.getNode('3a234e92.cbc0f2')
          expect(nodeUnderTest.name).toBe('TestReadWrite')
          expect(nodeUnderTest.nodeId).toBe('ns=1;s=TestReadWrite')
          expect(nodeUnderTest.datatype).toBe('Double')
          expect(nodeUnderTest.injectType).toBe('inject')
          expect(nodeUnderTest.value).toBe('testpayload')
          expect(nodeUnderTest.topic).toBe('TestTopicNode')
          done()
        })
    })

    it('should get a message with payload', function (done) {
      helper.load([injectNode, inputNode], testFlows.testUnitNodeFlow, function () {
        let n2 = helper.getNode('n2nf1')
        n2.on('input', function (msg) {
          expect(msg.payload).toBe(12345.34)
          done()
        })
      })
    })

    it('should verify a message', function (done) {
      helper.load([injectNode, inputNode], testFlows.testUnitNodeFlow, function () {
        let n4 = helper.getNode('n4nf1')
        let n3 = helper.getNode('n3nf1')
        n4.on('input', function (msg) {
          expect(msg.payload.addressSpaceItems).toMatchObject([{
            'name': 'TestReadWrite',
            'nodeId': 'ns=2;s=TestReadWrite',
            'datatypeName': 'String'
          }])
          expect(msg.topic).toBe('TestTopicNode')
          done()
        })
        n3.receive()
      })
    })

    it('should have payload', function (done) {
      helper.load([injectNode, inputNode], testFlows.testUnitNodeFlow, function () {
        let n4 = helper.getNode('n4nf1')
        let n3 = helper.getNode('n3nf1')
        n4.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
        n3.receive()
      })
    })

    it('should have work with payloads', function (done) {
      helper.load([injectNode, inputNode], testFlows.testUnitNodeEventWithPayloadFlow, function () {
        let n4 = helper.getNode('n4')
        let n3 = helper.getNode('n3')
        n4.on('input', function (msg) {
          expect(msg.payload.valuesToWrite).toMatchObject([{ value: 1234 }])
          done()
        })
        n3.receive()
      })
    })

    it('should have work with payload number', function (done) {
      helper.load([injectNode, inputNode], testFlows.testUnitNodeEventFlow, function () {
        let n4 = helper.getNode('n4nf2')
        let n3 = helper.getNode('n3nf2')
        n4.on('input', function (msg) {
          expect(msg.payload.valuesToWrite).toMatchObject([{ value: 1234 }])
          expect(msg.topic).toBe('TestTopicNode')
          expect(msg.payload.addressSpaceItems).toMatchObject([{
            'name': 'TestReadWrite',
            'nodeId': 'ns=2;s=TestReadWrite',
            'datatypeName': 'Int16'
          }])
          done()
        })
        n3.receive()
      })
    })

    it('should have work with node value', function (done) {
      helper.load([injectNode, inputNode], testFlows.testUnitNodeEventValueNumberPayloadFlow, function () {
        let n4 = helper.getNode('n4nf3')
        let n3 = helper.getNode('n3nf3')
        n4.on('input', function (msg) {
          expect(msg.payload.valuesToWrite).toMatchObject([{ value: 2345 }])
          expect(msg.payload.value).toBe('')
          expect(msg.payload.addressSpaceItems).toMatchObject([{
            'name': 'TestReadWrite',
            'nodeId': 'ns=2;s=TestReadWrite',
            'datatypeName': 'Int16'
          }])
          expect(msg.topic).toBe('NODETOPICOVERRIDE')
          done()
        })
        n3.receive()
      })
    })

    // TODO: tests to see if the inject payload works for all types as expected (IIoT inject only)
  })
})
