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

// iiot opc ua nodes
var injectNode = require('../../src/opcua-iiot-inject')
var serverNode = require('../../src/opcua-iiot-server')
var responseNode = require('../../src/opcua-iiot-response')
var connectorNode = require('../../src/opcua-iiot-connector')
var inputNode = require('../../src/opcua-iiot-listener')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var listenerNodesToLoad = [injectNode, connectorNode, inputNode, responseNode, serverNode]

var testListenerMonitoringFlow = [
  {
    'id': 'c9ca1bbe.d1cb2',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': '{"interval":500,"queueSize":4,"options":{"requestedPublishingInterval":1000,"requestedLifetimeCount":60,"requestedMaxKeepAliveCount":10,"maxNotificationsPerPublish":4,"publishingEnabled":true,"priority":1}}',
    'payloadType': 'json',
    'topic': 'TestTopicSubscribe',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2.4',
    'name': 'Start Abo',
    'addressSpaceItems': [
      {
        'name': 'FullCounter',
        'nodeId': 'ns=1;s=FullCounter',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        'd9754392.9eb1d', 'n2li'
      ]
    ]
  },
  {
    'id': '273f8497.2f8b44',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': '{"interval":500,"queueSize":4,"options":{"requestedPublishingInterval":1000,"requestedLifetimeCount":60,"requestedMaxKeepAliveCount":10,"maxNotificationsPerPublish":4,"publishingEnabled":true,"priority":1}}',
    'payloadType': 'json',
    'topic': 'TestTopicUnsubscribe',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '5.5',
    'name': 'End Abo',
    'addressSpaceItems': [
      {
        'name': 'FullCounter',
        'nodeId': 'ns=1;s=FullCounter',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        'd9754392.9eb1d', 'n2li'
      ]
    ]
  },
  {id: 'n2li', type: 'helper'},
  {
    'id': 'd9754392.9eb1d',
    'type': 'OPCUA-IIoT-Listener',
    'connector': 'c95fc9fc.64ccc',
    'action': 'subscribe',
    'queueSize': '1',
    'name': '',
    'justValue': true,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        'b0856b45.da4a18', 'n3li'
      ]
    ]
  },
  {id: 'n3li', type: 'helper'},
  {
    'id': 'b0856b45.da4a18',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateFilters': false,
    'filters': [],
    'wires': [
      [
        'n4li'
      ]
    ]
  },
  {id: 'n4li', type: 'helper'},
  {
    'id': '4ab7dc9.b7c5624',
    'type': 'OPCUA-IIoT-Server',
    'port': '1985',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': '',
    'showStatusActivities': false,
    'showErrors': false,
    'asoDemo': true,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': true,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'registerServerMethod': 1,
    'discoveryServerEndpointUrl': '',
    'capabilitiesForMDNS': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [
      []
    ]
  },
  {
    'id': 'c95fc9fc.64ccc',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:1985/',
    'keepSessionAlive': true,
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

describe('OPC UA Listener monitoring node e2e Testing', function () {
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

  describe('Listen node', function () {
    let msgCounter = 0

    it('should get a message with payload after inject on unsubscribe', function (done) {
      helper.load(listenerNodesToLoad, testListenerMonitoringFlow, function () {
        msgCounter = 0
        let n2 = helper.getNode('n2li')
        n2.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 2) {
            expect(msg.topic).toBe('TestTopicUnsubscribe')
            expect(msg.nodetype).toBe('inject')
            expect(msg.injectType).toBe('listen')
            setTimeout(done, 2000)
          }
        })
      })
    })

    it('should verify a message on changed monitored item with statusCode on subscribe', function (done) {
      helper.load(listenerNodesToLoad, testListenerMonitoringFlow, function () {
        msgCounter = 0
        let n3 = helper.getNode('n3li')
        n3.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.value).toBeDefined()
            expect(msg.payload.value.dataType).toBe('Int32')
            expect(msg.payload.statusCode).toBeDefined()
            done()
          }
        })
      })
    })

    it('should verify a compressed message from response node on subscribe', function (done) {
      helper.load(listenerNodesToLoad, testListenerMonitoringFlow, function () {
        msgCounter = 0
        let n4 = helper.getNode('n4li')
        n4.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.value).toBeDefined()
            expect(msg.payload.dataType).toBe('Int32')
            expect(msg.payload.nodeId).toBe('ns=1;s=FullCounter')
            expect(msg.payload.statusCode).not.toBeDefined()
            done()
          }
        })
      })
    })
  })
})
