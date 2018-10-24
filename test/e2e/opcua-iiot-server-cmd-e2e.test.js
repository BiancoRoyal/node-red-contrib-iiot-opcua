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

var injectNode = require('node-red/nodes/core/core/20-inject')
var injectOPCUANode = require('../../src/opcua-iiot-inject')
var inputNode = require('../../src/opcua-iiot-server-cmd')
var serverNode = require('../../src/opcua-iiot-server')
var flexServerNode = require('../../src/opcua-iiot-flex-server')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testCMDFlow = [
  {
    'id': 'n1cmdf1',
    'type': 'inject',
    'payload': 'testpayload',
    'payloadType': 'str',
    'repeat': '',
    'crontab': '',
    'once': true,
    'wires': [['n2cmdf1', 'n3cmdf1', 'n4cmdf1']]
  },
  {id: 'n2cmdf1', type: 'helper'},
  {
    'id': 'n3cmdf1',
    'type': 'OPCUA-IIoT-Server-Command',
    'commandtype': 'restart',
    'nodeId': '',
    'name': '',
    'wires': [
      ['n5cmdf1']
    ]
  },
  {
    'id': 'n4cmdf1',
    'type': 'OPCUA-IIoT-Server-Command',
    'commandtype': 'deleteNode',
    'nodeId': 'ns=1;s=TestFolder',
    'name': '',
    'wires': [
      ['n6cmdf1']
    ]
  },
  {id: 'n5cmdf1', type: 'helper'},
  {id: 'n6cmdf1', type: 'helper'}
]

var testCMDWithServerFlow = [
  {
    'id': 'n1csf1',
    'type': 'inject',
    'payload': 'testpayload',
    'payloadType': 'str',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': '4',
    'wires': [['n2csf1', 'n3csf1']]
  },
  {id: 'n2csf1', type: 'helper'},
  {
    'id': 'n3csf1',
    'type': 'OPCUA-IIoT-Server-Command',
    'commandtype': 'restart',
    'nodeId': '',
    'name': '',
    'wires': [
      ['n4csf1', 's1csr']
    ]
  },
  {id: 'n4csf1', type: 'helper'},
  {
    'id': 's1csr',
    'type': 'OPCUA-IIoT-Server',
    'port': '52819',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'TestServer',
    'showStatusActivities': false,
    'showErrors': false,
    'asoDemo': true,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': false,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [['n5csf1']]
  },
  {id: 'n5csf1', type: 'helper'}
]

var testInjectCMDFlow = [
  {
    'id': 'n1cmdf2',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': 'testpayload',
    'payloadType': 'str',
    'topic': 'TestTopicCMD',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'TestName',
    'addressSpaceItems': [
      {
        'name': 'TestFolder',
        'nodeId': 'ns=1;s=TestFolder',
        'datatypeName': ''
      }
    ],
    'wires': [['n2cmdf2', 'n3cmdf2']]
  },
  {id: 'n2cmdf2', type: 'helper'},
  {
    'id': 'n3cmdf2',
    'type': 'OPCUA-IIoT-Server-Command',
    'commandtype': 'deleteNode',
    'nodeId': '',
    'name': '',
    'wires': [
      ['n4cmdf2', 's1cf5']
    ]
  },
  {id: 'n4cmdf2', type: 'helper'},
  {
    'id': 's1cf5',
    'type': 'OPCUA-IIoT-Server',
    'port': '51698',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'TestServer',
    'showStatusActivities': false,
    'showErrors': false,
    'asoDemo': true,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': false,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [['n5cmdf2']]
  },
  {id: 'n5cmdf2', type: 'helper'}
]

var testCMDWithFlexServerFlow = [
  {
    'id': 'n1csf3',
    'type': 'inject',
    'payload': 'testpayload',
    'payloadType': 'str',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': '4',
    'wires': [['n2csf3', 'n3csf3']]
  },
  {id: 'n2csf3', type: 'helper'},
  {
    'id': 'n3csf3',
    'type': 'OPCUA-IIoT-Server-Command',
    'commandtype': 'restart',
    'nodeId': '',
    'name': '',
    'wires': [
      ['n4csf3', 's3csfr']
    ]
  },
  {id: 'n4csf3', type: 'helper'},
  {
    'id': 's3csfr',
    'type': 'OPCUA-IIoT-Flex-Server',
    'port': '54120',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'DEMOFLEXSERVER',
    'showStatusActivities': false,
    'showErrors': false,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': false,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'registerServerMethod': '1',
    'discoveryServerEndpointUrl': '',
    'capabilitiesForMDNS': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'delayToClose': 500,
    'addressSpaceScript': 'function constructAlarmAddressSpace(server, addressSpace, eventObjects, done) {\n  done()\n}',
    'wires': [
      ['n5csf3']
    ]
  },
  {id: 'n5csf3', type: 'helper'}
]

var testWrongCMDWithFlexServerFlow = [
  {
    'id': 'n1csf4',
    'type': 'inject',
    'payload': 'testpayload',
    'payloadType': 'str',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': '3',
    'wires': [['n2csf4', 'n3csf4']]
  },
  {id: 'n2csf4', type: 'helper'},
  {
    'id': 'n3csf4',
    'type': 'OPCUA-IIoT-Server-Command',
    'commandtype': 'test',
    'nodeId': '',
    'name': '',
    'wires': [
      ['n4csf4', 's4csfr']
    ]
  },
  {id: 'n4csf4', type: 'helper'},
  {
    'id': 's4csfr',
    'type': 'OPCUA-IIoT-Flex-Server',
    'port': '54121',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'DEMOFLEXSERVER',
    'showStatusActivities': false,
    'showErrors': false,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': false,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'registerServerMethod': '1',
    'discoveryServerEndpointUrl': '',
    'capabilitiesForMDNS': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'delayToClose': 500,
    'addressSpaceScript': 'function constructAlarmAddressSpace(server, addressSpace, eventObjects, done) {\n  done()\n}',
    'wires': [
      ['n5csf4']
    ]
  },
  {id: 'n5csf4', type: 'helper'}
]

var testWrongInjectWithFlexServerFlow = [
  {
    'id': 'n1csf5',
    'type': 'inject',
    'payload': 'testpayload',
    'payloadType': 'str',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': '3',
    'commandType': 'test',
    'nodetype': 'inject',
    'injecType': 'TEST',
    'wires': [['n2csf5', 's5csfr']]
  },
  {id: 'n2csf5', type: 'helper'},
  {
    'id': 's5csfr',
    'type': 'OPCUA-IIoT-Flex-Server',
    'port': '54122',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'DEMOFLEXSERVER',
    'showStatusActivities': false,
    'showErrors': false,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': false,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'registerServerMethod': '1',
    'discoveryServerEndpointUrl': '',
    'capabilitiesForMDNS': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'delayToClose': 500,
    'addressSpaceScript': 'function constructAlarmAddressSpace(server, addressSpace, eventObjects, done) {\n  done()\n}',
    'wires': [
      ['n5csf4']
    ]
  },
  {id: 'n5csf4', type: 'helper'}
]

describe('OPC UA Server Command node e2e Testing', function () {
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

  describe('Command node', function () {
    it('should get a message with payload on restart command', function (done) {
      helper.load([injectNode, inputNode], testCMDFlow, function () {
        let n5 = helper.getNode('n5cmdf1')
        n5.on('input', function (msg) {
          expect(msg.commandType).toBe('restart')
          expect(msg.payload.nodeId).toBeUndefined()
          expect(msg.nodetype).toBe('inject')
          expect(msg.injectType).toBe('CMD')
          done()
        })
      })
    })

    it('should get a message with payload on delete ASO command', function (done) {
      helper.load([injectNode, inputNode], testCMDFlow, function () {
        let n6 = helper.getNode('n6cmdf1')
        n6.on('input', function (msg) {
          expect(msg.commandType).toBe('deleteNode')
          expect(msg.payload.nodeId).toBe('ns=1;s=TestFolder')
          expect(msg.nodetype).toBe('inject')
          expect(msg.injectType).toBe('CMD')
          done()
        })
      })
    })

    it('should get a message with inject to delete ASO', function (done) {
      helper.load([injectOPCUANode, inputNode, serverNode], testInjectCMDFlow, function () {
        let n5 = helper.getNode('n5cmdf2')
        n5.on('input', function (msg) {
          expect(msg.commandType).toBe('deleteNode')
          expect(msg.payload.nodeId).toBe('ns=1;s=TestFolder')
          expect(msg.nodetype).toBe('inject')
          expect(msg.injectType).toBe('CMD')
          done()
        })
      })
    })

    it('should get a message with inject to restart server', function (done) {
      helper.load([injectNode, injectOPCUANode, inputNode, serverNode], testCMDWithServerFlow, function () {
        let n5 = helper.getNode('n5csf1')
        n5.on('input', function (msg) {
          expect(msg.commandType).toBe('restart')
          expect(msg.payload.nodeId).toBeUndefined()
          expect(msg.nodetype).toBe('inject')
          expect(msg.injectType).toBe('CMD')
          setTimeout(done, 3000)
        })
      })
    })

    it('should get a message with inject to restart flex server', function (done) {
      helper.load([injectNode, injectOPCUANode, inputNode, flexServerNode], testCMDWithFlexServerFlow, function () {
        let n5 = helper.getNode('n5csf3')
        n5.on('input', function (msg) {
          expect(msg.commandType).toBe('restart')
          expect(msg.payload.nodeId).toBeUndefined()
          expect(msg.nodetype).toBe('inject')
          expect(msg.injectType).toBe('CMD')
          setTimeout(done, 3000)
        })
      })
    })

    it('should get no message with wrong command inject to restart flex server', function (done) {
      helper.load([injectNode, injectOPCUANode, inputNode, flexServerNode], testWrongCMDWithFlexServerFlow, function () {
        let n5 = helper.getNode('n5csf4')
        n5.on('input', function (msg) {
          expect(false).toBeTruthy()
        })
        setTimeout(done, 3500)
      })
    })

    it('should get no message on wrong inject type sent to flex server', function (done) {
      helper.load([injectNode, injectOPCUANode, inputNode, flexServerNode], testWrongInjectWithFlexServerFlow, function () {
        let n5 = helper.getNode('n5csf4')
        n5.on('input', function (msg) {
          expect(false).toBeTruthy()
        })
        setTimeout(done, 3500)
      })
    })
  })
})
