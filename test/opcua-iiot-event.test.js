/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2018,2019 Klaus Landsdorf (https://bianco-royal.com/)
 * All rights reserved.
 * node-red-contrib-iiot-opcua
 *
 **/

'use strict'

jest.setTimeout(5000)

var injectNode = require('@node-red/nodes/core/core/20-inject')
var inputNode = require('../src/opcua-iiot-event')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testEventNodeFlow = [
  {
    'id': 'n1evf1',
    'type': 'inject',
    'topic': 'TestTopic',
    'payload': '{"queueSize":10, "interval":1000}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'wires': [['n2evf1', 'n3evf1']]
  },
  {id: 'n2evf1', type: 'helper'},
  {
    'id': 'n3evf1',
    'type': 'OPCUA-IIoT-Event',
    'eventType': 'i=2041',
    'eventTypeLabel': 'BaseTypeEvent',
    'queueSize': 1,
    'usingListener': true,
    'name': 'TestName',
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [['n4evf1']]
  },
  {id: 'n4evf1', type: 'helper'}
]

describe('OPC UA Event node Unit Testing', function () {
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

  describe('Event node', function () {
    it('should load with basic settings', function (done) {
      helper.load(
        [inputNode],
        [{
          'id': '67c521a2.07429',
          'type': 'OPCUA-IIoT-Event',
          'eventType': 'i=2041',
          'eventTypeLabel': 'BaseTypeEvent',
          'queueSize': 1,
          'usingListener': true,
          'name': 'TestName',
          'showStatusActivities': false,
          'showErrors': false,
          'wires': [[]]
        }
        ],
        function () {
          let nodeUnderTest = helper.getNode('67c521a2.07429')
          expect(nodeUnderTest.name).toBe('TestName')
          expect(nodeUnderTest.eventTypeLabel).toBe('BaseTypeEvent')
          expect(nodeUnderTest.eventType).toBe('i=2041')
          expect(nodeUnderTest.usingListener).toBe(true)
          expect(nodeUnderTest.queueSize).toBe(1)
          done()
        })
    })

    it('should get a message with payload', function (done) {
      helper.load([injectNode, inputNode], testEventNodeFlow, function () {
        let n2 = helper.getNode('n2evf1')
        n2.on('input', function (msg) {
          expect(msg.payload).toMatchObject({'queueSize': 10, 'interval': 1000})
          done()
        })
      })
    })

    it('should verify a message for event parameters', function (done) {
      helper.load([injectNode, inputNode], testEventNodeFlow, function () {
        let n4 = helper.getNode('n4evf1')
        n4.on('input', function (msg) {
          expect(msg.payload.eventType).toBeDefined()
          expect(msg.payload.eventFilter).toBeDefined()
          expect(msg.payload.eventFields).toBeDefined()
          expect(msg.payload.queueSize).toBe(10)
          expect(msg.payload.interval).toBe(1000)
          /* payload: { eventType: 'i=2041',
            eventFilter: EventFilter { selectClauses: [Array], whereClause: [ContentFilter] }, eventFields: [ 'EventId', 'SourceName', 'Message', 'ReceiveTime' ],
            queueSize: 10,
            interval: 1000 }) */
          done()
        })
      })
    })
  })
})
