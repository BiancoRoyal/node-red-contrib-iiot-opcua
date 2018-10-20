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

var injectNode = require('node-red/nodes/core/core/20-inject')
var inputNode = require('../src/opcua-iiot-discovery')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testDiscoveryFlow = [
  {
    'id': 'n1dsf1',
    'type': 'OPCUA-IIoT-Discovery',
    'name': 'TestName',
    'wires': [['n2dsf1']]
  },
  {id: 'n2dsf1', type: 'helper'}
]

var testDiscoveryNullPortFlow = [
  {
    'id': 'n1dsf2',
    'type': 'OPCUA-IIoT-Discovery',
    'name': 'TestName',
    'discoveryPort': null,
    'wires': [['n2dsf1']]
  },
  {id: 'n2dsf1', type: 'helper'}
]

var testDiscoveryNullPortAndInjectFlow = [
  {
    'id': 'n1edf1',
    'type': 'inject',
    'topic': 'TestTopic',
    'payload': '',
    'payloadType': 'date',
    'repeat': '',
    'crontab': '',
    'once': true,
    'wires': [['n2edf1', 'n3edf1']]
  },
  {id: 'n2edf1', type: 'helper'},
  {
    'id': 'n3edf1',
    'type': 'OPCUA-IIoT-Discovery',
    'name': 'TestName',
    'discoveryPort': null,
    'wires': [['n4edf1']]
  },
  {id: 'n4edf1', type: 'helper'}
]

describe('OPC UA Discovery node Unit Testing', function () {
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

  describe('Discovery node', function () {
    it('should be loaded', function (done) {
      helper.load(
        [inputNode], testDiscoveryFlow,
        function () {
          let nodeUnderTest = helper.getNode('n1dsf1')
          expect(nodeUnderTest.type).toBe('OPCUA-IIoT-Discovery')
          expect(nodeUnderTest.name).toBe('TestName')
          setTimeout(done, 2000)
        })
    })

    it('should be loaded with default port', function (done) {
      helper.load(
        [inputNode], testDiscoveryNullPortFlow,
        function () {
          let nodeUnderTest = helper.getNode('n1dsf2')
          expect(nodeUnderTest.type).toBe('OPCUA-IIoT-Discovery')
          expect(nodeUnderTest.name).toBe('TestName')
          setTimeout(done, 2000)
        })
    })

    it('should be loaded with default port and send msg after inject', function (done) {
      helper.load(
        [injectNode, inputNode], testDiscoveryNullPortAndInjectFlow,
        function () {
          let nodeUnderTest = helper.getNode('n4edf1')
          nodeUnderTest.on('input', (msg) => {
            expect(msg.payload.discoveryUrls).toBeDefined()
            expect(msg.payload.endpoints).toBeDefined()
            setTimeout(done, 2000)
          })
        })
    })
  })
})
