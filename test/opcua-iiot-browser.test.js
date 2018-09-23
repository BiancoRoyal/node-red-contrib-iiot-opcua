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

var injectNode = require('../src/opcua-iiot-inject')
var connectorNode = require('../src/opcua-iiot-connector')
var browserNode = require('../src/opcua-iiot-browser')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var browseNodesToLoad = [injectNode, connectorNode, browserNode]
var testUnitBrowserFlow = [
  {
    'id': '13118ee.7ced371',
    'type': 'OPCUA-IIoT-Browser',
    'connector': 'a0513f1.9777fc',
    'nodeId': 'ns=1;i=1234',
    'name': 'TestName',
    'justValue': true,
    'sendNodesToRead': false,
    'sendNodesToListener': false,
    'sendNodesToBrowser': true,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        'n1helper'
      ]
    ]
  },
  {id: 'n1helper', type: 'helper'},
  {
    'id': 'a0513f1.9777fc',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:1234/',
    'keepSessionAlive': false,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'NONE',
    'name': 'LOCAL DEMO SERVER',
    'showErrors': false,
    'publicCertificateFile': '',
    'privateKeyFile': '',
    'defaultSecureTokenLifetime': '60000',
    'endpointMustExist': false,
    'autoSelectRightEndpoint': false
  }
]
describe('OPC UA Browser node Unit Testing', function () {
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

  describe('Browser node', function () {
    it('should be loaded', function (done) {
      helper.load(browseNodesToLoad, testUnitBrowserFlow,
        function () {
          let nodeUnderTest = helper.getNode('13118ee.7ced371')
          expect(nodeUnderTest.name).toBe('TestName')
          expect(nodeUnderTest.nodeId).toBe('ns=1;i=1234')
          expect(nodeUnderTest.justValue).toBe(true)
          expect(nodeUnderTest.sendNodesToRead).toBe(false)
          expect(nodeUnderTest.sendNodesToListener).toBe(false)
          expect(nodeUnderTest.sendNodesToBrowser).toBe(true)
          expect(nodeUnderTest.showStatusActivities).toBe(false)
          setTimeout(done, 3000)
        })
    })

    it('should get a message with payload', function (done) {
      helper.load(browseNodesToLoad, testUnitBrowserFlow, function () {
        let helperNode = helper.getNode('n1helper')
        helperNode.on('input', function (msg) {
          expect(msg.payload).toBe('testpayload')
          setTimeout(done, 3000)
        })
      })
    })
  })
})
