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

var injectNode = require('node-red/nodes/core/core/20-inject')
var inputNode = require('../src/opcua-iiot-node')
var helper = require('node-red-contrib-test-helper')

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
    'value': '2345',
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
    'nodeId': 'ns=5;s=GESTRUCKEST',
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

describe('OPC UA Node node Testing', function () {
  before(function (done) {
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

  after(function (done) {
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
          'nodeId': 'ns=2;s=TestReadWrite',
          'datatype': 'Double',
          'value': 'testpayload',
          'name': 'TestReadWrite',
          'topic': 'TestTopicNode',
          'showErrors': false,
          'wires': [[]]}
        ],
        function () {
          let nodeUnderTest = helper.getNode('3a234e92.cbc0f2')
          nodeUnderTest.should.have.property('name', 'TestReadWrite')
          nodeUnderTest.should.have.property('nodeId', 'ns=2;s=TestReadWrite')
          nodeUnderTest.should.have.property('datatype', 'Double')
          nodeUnderTest.should.have.property('injectType', 'inject')
          nodeUnderTest.should.have.property('value', 'testpayload')
          nodeUnderTest.should.have.property('topic', 'TestTopicNode')
          done()
        })
    })

    it('should get a message with payload', function (done) {
      helper.load([injectNode, inputNode], testNodeFlow, function () {
        let n2 = helper.getNode('n2nf1')
        n2.on('input', function (msg) {
          msg.should.have.property('payload', 12345.34)
          done()
        })
      })
    })

    it('should verify a message', function (done) {
      helper.load([injectNode, inputNode], testNodeFlow, function () {
        let n4 = helper.getNode('n4nf1')
        n4.on('input', function (msg) {
          msg.should.have.property('addressSpaceItems', [{'name': 'TestReadWrite', 'nodeId': 'ns=2;s=TestReadWrite', 'datatypeName': 'String'}])
          msg.should.have.property('topic', 'TestTopicNode')
          done()
        })
      })
    })

    it('should have payload', function (done) {
      helper.load([injectNode, inputNode], testNodeFlow, function () {
        let n4 = helper.getNode('n4nf1')
        n4.on('input', function (msg) {
          msg.should.have.property('payload', 12345.34)
          done()
        })
      })
    })

    it('should have work with payloads', function (done) {
      helper.load([injectNode, inputNode], testNodeEventWithPayloadFlow, function () {
        let n4 = helper.getNode('n4')
        n4.on('input', function (msg) {
          msg.should.have.property('valuesToWrite', [1234])
          done()
        })
      })
    })

    it('should have work with payload number', function (done) {
      helper.load([injectNode, inputNode], testNodeEventFlow, function () {
        let n4 = helper.getNode('n4nf2')
        n4.on('input', function (msg) {
          msg.should.have.property('valuesToWrite', [1234])
          msg.should.have.property('topic', 'TestTopicNode')
          msg.should.have.property('addressSpaceItems', [{
            'name': 'TestReadWrite',
            'nodeId': 'ns=2;s=TestReadWrite',
            'datatypeName': 'Int16'
          }])
          msg.should.have.property('payload', 1234)
          done()
        })
      })
    })

    it('should have work with node value', function (done) {
      helper.load([injectNode, inputNode], testEventValueNumberFlowPayload, function () {
        let n4 = helper.getNode('n4nf3')
        n4.on('input', function (msg) {
          msg.should.have.property('valuesToWrite', [2345])
          msg.should.have.property('payload', '')
          msg.should.have.property('addressSpaceItems', [{
            'name': 'TestReadWrite',
            'nodeId': 'ns=2;s=TestReadWrite',
            'datatypeName': 'Int16'
          }])
          msg.should.have.property('topic', 'NODETOPICOVERRIDE')
          done()
        })
      })
    })
  })
})
