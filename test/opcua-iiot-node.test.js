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

var injectNode = require('@node-red/nodes/core/common/20-inject')
var inputNode = require('../src/opcua-iiot-node')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testNodeFlow = [
  {
    'id': 'n1nf1',
    'type': 'inject',
    'name': 'TestName',
    'topic': 'TestTopicNode',
    'payload': '12345.34',
    'payloadType': 'num',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': '',
    'wires': [
      [
        'n2nf1',
        'n3nf1'
      ]
    ]
  },
  {id: 'n2nf1', type: 'helper'},
  {
    'id': 'n3nf1',
    'type': 'OPCUA-IIoT-Node',
    'injectType': 'write',
    'nodeId': 'ns=2;s=TestReadWrite',
    'datatype': 'String',
    'value': '',
    'name': 'TestReadWrite',
    'topic': '',
    'showErrors': false,
    wires: [['n4nf1']]
  },
  {id: 'n4nf1', type: 'helper'}
]

var testNodeEventFlow = [
  {
    'id': 'n1nf2',
    'type': 'inject',
    'name': 'TestReadWrite',
    'topic': 'TestTopicNode',
    'payload': '1234',
    'payloadType': 'num',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': '',
    'wires': [
      [
        'n2nf2',
        'n3nf2'
      ]
    ]
  },
  {id: 'n2nf2', type: 'helper'},
  {
    'id': 'n3nf2',
    'type': 'OPCUA-IIoT-Node',
    'injectType': 'write',
    'nodeId': 'ns=2;s=TestReadWrite',
    'datatype': 'Int16',
    'value': '',
    'name': 'TestReadWrite',
    'topic': '',
    'showErrors': false,
    'wires': [
      [
        'n4nf2'
      ]
    ]
  },
  {id: 'n4nf2', type: 'helper'}
]

var testEventValueNumberFlowPayload = [
  {
    'id': 'n1nf3',
    'type': 'inject',
    'name': 'TestReadWrite',
    'topic': '',
    'payload': '',
    'payloadType': 'str',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': '',
    'wires': [
      [
        'n2nf3',
        'n3nf3'
      ]
    ]
  },
  {id: 'n2nf3', type: 'helper'},
  {
    'id': 'n3nf3',
    'type': 'OPCUA-IIoT-Node',
    'injectType': 'write',
    'nodeId': 'ns=2;s=TestReadWrite',
    'datatype': 'Int16',
    'value': 2345,
    'name': 'TestReadWrite',
    'topic': 'NODETOPICOVERRIDE',
    'showErrors': false,
    'wires': [
      [
        'n4nf3'
      ]
    ]
  },
  {id: 'n4nf3', type: 'helper'}
]

var testNodeEventWithPayloadFlow = [
  {
    'id': 'n1',
    'type': 'inject',
    'name': 'Error 1',
    'topic': 'ERRORS',
    'payload': '1234',
    'payloadType': 'num',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': '',
    'wires': [
      [
        'n2',
        'n3'
      ]
    ]
  },
  {id: 'n2', type: 'helper'},
  {
    'id': 'n3',
    'type': 'OPCUA-IIoT-Node',
    'injectType': 'write',
    'nodeId': 'ns=1;s=GESTRUCKEST',
    'datatype': 'Int16',
    'value': '',
    'name': 'ERRORNODE',
    'topic': '',
    'showErrors': false,
    'wires': [
      [
        'n4'
      ]
    ]
  },
  {id: 'n4', type: 'helper'}
]

describe('OPC UA Node node Unit Testing', function () {
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
          'wires': [[]]}
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
      helper.load([injectNode, inputNode], testNodeFlow, function () {
        let n2 = helper.getNode('n2nf1')
        n2.on('input', function (msg) {
          expect(msg.payload).toBe(12345.34)
          done()
        })
      })
    })

    it('should verify a message', function (done) {
      helper.load([injectNode, inputNode], testNodeFlow, function () {
        let n4 = helper.getNode('n4nf1')
        let n3 = helper.getNode('n3nf1')
        n4.on('input', function (msg) {
          expect(msg.payload.addressSpaceItems).toMatchObject([{'name': 'TestReadWrite', 'nodeId': 'ns=2;s=TestReadWrite', 'datatypeName': 'String'}])
          expect(msg.topic).toBe('TestTopicNode')
          done()
        })
        n3.receive()
      })
    })

    it('should have payload', function (done) {
      helper.load([injectNode, inputNode], testNodeFlow, function () {
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
      helper.load([injectNode, inputNode], testNodeEventWithPayloadFlow, function () {
        let n4 = helper.getNode('n4')
        let n3 = helper.getNode('n3')
        n4.on('input', function (msg) {
          expect(msg.payload.valuesToWrite).toMatchObject([{value: 1234}])
          done()
        })
        n3.receive()
      })
    })

    it('should have work with payload number', function (done) {
      helper.load([injectNode, inputNode], testNodeEventFlow, function () {
        let n4 = helper.getNode('n4nf2')
        let n3 = helper.getNode('n3nf2')
        n4.on('input', function (msg) {
          expect(msg.payload.valuesToWrite).toMatchObject([{value: 1234}])
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
      helper.load([injectNode, inputNode], testEventValueNumberFlowPayload, function () {
        let n4 = helper.getNode('n4nf3')
        let n3 = helper.getNode('n3nf3')
        n4.on('input', function (msg) {
          expect(msg.payload.valuesToWrite).toMatchObject([{value: 2345}])
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
  })
})
