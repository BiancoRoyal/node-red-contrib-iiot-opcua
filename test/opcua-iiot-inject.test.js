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

jest.setTimeout(10000)

var inputNode = require('../src/opcua-iiot-inject')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testInjectFlow = [
  {
    'id': 'n1ijf1',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '12345',
    'payloadType': 'num',
    'topic': 'TestTopicInject',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '1',
    'name': 'TestInject',
    'addressSpaceItems': [
      {
        'name': 'ServerStatus',
        'nodeId': 'ns=0;i=2256',
        'datatypeName': 'String'
      }
    ],
    'wires': [['n2ijf1']]
  },
  {id: 'n2ijf1', type: 'helper'}
]

var testInjectWithDelayFlow = [
  {
    'id': 'n1ijf2',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '12345',
    'payloadType': 'num',
    'topic': 'TestTopicInject',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'TestInject',
    'addressSpaceItems': [
      {
        'name': 'ServerStatus',
        'nodeId': 'ns=0;i=2256',
        'datatypeName': 'String'
      }
    ],
    'wires': [['n2ijf2']]
  },
  {id: 'n2ijf2', type: 'helper'}
]

var testInjectWithLongDelayFlow = [
  {
    'id': 'n1ijf3',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '12345',
    'payloadType': 'num',
    'topic': 'TestTopicInject',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '5',
    'name': 'TestInject',
    'addressSpaceItems': [
      {
        'name': 'ServerStatus',
        'nodeId': 'ns=0;i=2256',
        'datatypeName': 'String'
      }
    ],
    'wires': [['n2ijf3']]
  },
  {id: 'n2ijf3', type: 'helper'}
]

describe('OPC UA Inject node Unit Testing', function () {
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

  describe('Inject node', function () {
    it('should load with basic settings', function (done) {
      helper.load([inputNode], [
        {
          'id': 'f93b472c.486038',
          'type': 'OPCUA-IIoT-Inject',
          'injectType': 'inject',
          'payload': '123456',
          'payloadType': 'num',
          'topic': 'TestTopicInject',
          'repeat': '',
          'crontab': '',
          'once': false,
          'name': 'TestName',
          'addressSpaceItems': [],
          'wires': [
            []
          ]
        }],
      function () {
        let nodeUnderTest = helper.getNode('f93b472c.486038')
        expect(nodeUnderTest.name).toBe('TestName')
        expect(nodeUnderTest.injectType).toBe('inject')
        expect(nodeUnderTest.payload).toBe('123456')
        expect(nodeUnderTest.topic).toBe('TestTopicInject')
        expect(nodeUnderTest.startDelay).toBe(10)
        done()
      })
    })

    it('should send a message with payload', function (done) {
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode('n2ijf1')
        n2.on('input', function (msg) {
          expect(msg.payload).toBe(12345)
          done()
        })
      })
    })

    it('should send a message with topic', function (done) {
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode('n2ijf1')
        n2.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicInject')
          done()
        })
      })
    })

    it('should load with basic settings read node', function (done) {
      helper.load([inputNode], [
        {
          'id': 'f93b472c.486038',
          'type': 'OPCUA-IIoT-Inject',
          'injectType': 'read',
          'payload': '123456',
          'payloadType': 'num',
          'topic': 'TestTopicInject',
          'repeat': '',
          'crontab': '',
          'once': false,
          'startDelay': '1',
          'name': 'TestName',
          'addressSpaceItems': [],
          'wires': [
            []
          ]
        }],
      function () {
        let nodeUnderTest = helper.getNode('f93b472c.486038')
        expect(nodeUnderTest.name).toBe('TestName')
        expect(nodeUnderTest.injectType).toBe('read')
        expect(nodeUnderTest.payload).toBe('123456')
        expect(nodeUnderTest.topic).toBe('TestTopicInject')
        expect(nodeUnderTest.startDelay).toBe(1)
        done()
      })
    })

    it('should send a message with payload read node', function (done) {
      testInjectFlow[0].injectType = 'read'
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode('n2ijf1')
        n2.on('input', function (msg) {
          expect(msg.payload).toBe(12345)
          done()
        })
      })
    })

    it('should send a message with topic read node', function (done) {
      testInjectFlow[0].injectType = 'read'
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode('n2ijf1')
        n2.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicInject')
          done()
        })
      })
    })

    it('should send a message with types read node', function (done) {
      testInjectFlow[0].injectType = 'read'
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode('n2ijf1')
        n2.on('input', function (msg) {
          expect(msg.nodetype).toBe('inject')
          expect(msg.injectType).toBe('read')
          done()
        })
      })
    })

    it('should load with basic settings listen node', function (done) {
      helper.load([inputNode], [
        {
          'id': 'f93b472c.486038',
          'type': 'OPCUA-IIoT-Inject',
          'injectType': 'listen',
          'payload': '123456',
          'payloadType': 'num',
          'topic': 'TestTopicInject',
          'repeat': '',
          'crontab': '',
          'once': false,
          'startDelay': '1',
          'name': 'TestName',
          'addressSpaceItems': [],
          'wires': [
            []
          ]
        }],
      function () {
        let nodeUnderTest = helper.getNode('f93b472c.486038')
        expect(nodeUnderTest.name).toBe('TestName')
        expect(nodeUnderTest.injectType).toBe('listen')
        expect(nodeUnderTest.payload).toBe('123456')
        expect(nodeUnderTest.topic).toBe('TestTopicInject')
        expect(nodeUnderTest.startDelay).toBe(1)
        done()
      })
    })

    it('should send a message with payload listen node', function (done) {
      testInjectFlow[0].injectType = 'listen'
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode('n2ijf1')
        n2.on('input', function (msg) {
          expect(msg.payload).toBe(12345)
          done()
        })
      })
    })

    it('should send a message with topic listen node', function (done) {
      testInjectFlow[0].injectType = 'listen'
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode('n2ijf1')
        n2.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicInject')
          done()
        })
      })
    })

    it('should send a message with types listen node', function (done) {
      testInjectFlow[0].injectType = 'listen'
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode('n2ijf1')
        n2.on('input', function (msg) {
          expect(msg.nodetype).toBe('inject')
          expect(msg.injectType).toBe('listen')
          done()
        })
      })
    })

    it('should load with basic settings write node', function (done) {
      helper.load([inputNode], [
        {
          'id': 'f93b472c.486038',
          'type': 'OPCUA-IIoT-Inject',
          'injectType': 'write',
          'payload': '123456',
          'payloadType': 'num',
          'topic': 'TestTopicInject',
          'repeat': '',
          'crontab': '',
          'once': false,
          'startDelay': '1',
          'name': 'TestName',
          'addressSpaceItems': [],
          'wires': [
            []
          ]
        }],
      function () {
        let nodeUnderTest = helper.getNode('f93b472c.486038')
        expect(nodeUnderTest.name).toBe('TestName')
        expect(nodeUnderTest.injectType).toBe('write')
        expect(nodeUnderTest.payload).toBe('123456')
        expect(nodeUnderTest.topic).toBe('TestTopicInject')
        expect(nodeUnderTest.startDelay).toBe(1)
        done()
      })
    })

    it('should send a message with payload write node', function (done) {
      testInjectFlow[0].injectType = 'write'
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode('n2ijf1')
        n2.on('input', function (msg) {
          expect(msg.payload).toBe(12345)
          done()
        })
      })
    })

    it('should send a message with topic write node', function (done) {
      testInjectFlow[0].injectType = 'write'
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode('n2ijf1')
        n2.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicInject')
          done()
        })
      })
    })

    it('should send a message with types write node', function (done) {
      testInjectFlow[0].injectType = 'write'
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode('n2ijf1')
        n2.on('input', function (msg) {
          expect(msg.nodetype).toBe('inject')
          expect(msg.injectType).toBe('write')
          done()
        })
      })
    })

    it('should send a message with types and delay write node', function (done) {
      helper.load([inputNode], testInjectWithDelayFlow, function () {
        let n2 = helper.getNode('n2ijf2')
        n2.on('input', function (msg) {
          expect(msg.nodetype).toBe('inject')
          expect(msg.injectType).toBe('inject')
          done()
        })
      })
    })

    it('should send a message with types and long delay', function (done) {
      helper.load([inputNode], testInjectWithLongDelayFlow, function () {
        let n2 = helper.getNode('n2ijf3')
        n2.on('input', function (msg) {
          expect(msg.nodetype).toBe('inject')
          expect(msg.injectType).toBe('inject')
          done()
        })
      })
    })
  })
})
