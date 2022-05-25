/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2022 DATATRONiQ GmbH (https://datatroniq.com)
 * Copyright (c) 2018 Klaus Landsdorf (http://bianco-royal.de/)
 * All rights reserved.
 * node-red-contrib-iiot-opcua
 *
 **/

'use strict'

jest.setTimeout(300000)

var injectNode = require('../../src/opcua-iiot-inject')
var connectorNode = require('../../src/opcua-iiot-connector')
var inputNode = require('../../src/opcua-iiot-browser')
var listenerNode = require('../../src/opcua-iiot-listener')
var asoNode = require('../../src/opcua-iiot-server-aso')
var serverNode = require('../../src/opcua-iiot-server')
var responseNode = require('../../src/opcua-iiot-response')
var resultFilterNode = require('../../src/opcua-iiot-result-filter')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var browseRecursiveNodesToLoad = [injectNode, asoNode, listenerNode, connectorNode, resultFilterNode, inputNode, serverNode, responseNode]

var testBrowseRecursiveASOFlow = [
  {
    'id': '58eb5d7c.b3cd24',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 's=TestFolderA',
    'browsename': 'TestA',
    'displayname': 'Test Folder A',
    'objecttype': 'FolderType',
    'datatype': '',
    'value': '',
    'referenceNodeId': 'ns=0;i=85',
    'referencetype': 'Organizes',
    'name': 'ASO Test Folder A',
    'wires': [
      [
        'fbe6e31.8e4212'
      ]
    ]
  },
  {
    'id': 'f3d82a20.ce4668',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '',
    'payloadType': 'date',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '4',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        '58eb5d7c.b3cd24'
      ]
    ]
  },
  {
    'id': 'fbe6e31.8e4212',
    'type': 'OPCUA-IIoT-Server',
    'port': '49888',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': '',
    'showStatusActivities': false,
    'showErrors': false,
    'asoDemo': false,
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
    'maxNodesPerRead': '',
    'maxNodesPerBrowse': '',
    'delayToClose': '',
    'wires': [[]]
  },
  {
    'id': 'f735200c.5ead8',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '',
    'payloadType': 'date',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '5',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        'd35f33d5.e4106',
        '54825b89.eaacac'
      ]
    ]
  },
  {
    'id': 'd35f33d5.e4106',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 's=TestFolderB',
    'browsename': 'TestB',
    'displayname': 'Test Folder B',
    'objecttype': 'FolderType',
    'datatype': '',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestFolderA',
    'referencetype': 'Organizes',
    'name': 'ASO Test Folder B',
    'wires': [
      [
        'fbe6e31.8e4212'
      ]
    ]
  },
  {
    'id': '96038cfa.49c6',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '',
    'payloadType': 'date',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '6',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        'e209347c.0d0df',
        '1d690492.ec2943'
      ]
    ]
  },
  {
    'id': 'e209347c.0d0df',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 's=TestFolderC',
    'browsename': 'TestC',
    'displayname': 'Test Folder C',
    'objecttype': 'FolderType',
    'datatype': '',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestFolderB',
    'referencetype': 'Organizes',
    'name': 'ASO Test Folder C',
    'wires': [
      [
        'fbe6e31.8e4212'
      ]
    ]
  },
  {
    'id': 'd29ea6e9.bb0f4',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '',
    'payloadType': 'date',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '7',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        '3323a9be.3f963e',
        'b2a853b3.f9fbe'
      ]
    ]
  },
  {
    'id': '3323a9be.3f963e',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 's=TestFolderD',
    'browsename': 'TestD',
    'displayname': 'Test Folder D',
    'objecttype': 'FolderType',
    'datatype': '',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestFolderC',
    'referencetype': 'Organizes',
    'name': 'ASO Test Folder D',
    'wires': [
      [
        'fbe6e31.8e4212'
      ]
    ]
  },
  {
    'id': 'e9a9f3a9.a525d',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '',
    'payloadType': 'date',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '8',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        '99828990.d072e',
        '1452afc0.e23c98'
      ]
    ]
  },
  {
    'id': '99828990.d072e',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 's=TestFolderE',
    'browsename': 'TestE',
    'displayname': 'Test Folder E',
    'objecttype': 'FolderType',
    'datatype': '',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestFolderD',
    'referencetype': 'Organizes',
    'name': 'ASO Test Folder E',
    'wires': [
      [
        'fbe6e31.8e4212'
      ]
    ]
  },
  {
    'id': 'fb77eb2f.aacc1',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '',
    'payloadType': 'date',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '9',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        '9a9d2ad9.c84078',
        '972d4ae5.07bdb8'
      ]
    ]
  },
  {
    'id': '9a9d2ad9.c84078',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 's=TestFolderF',
    'browsename': 'TestF',
    'displayname': 'Test Folder F',
    'objecttype': 'FolderType',
    'datatype': '',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestFolderE',
    'referencetype': 'Organizes',
    'name': 'ASO Test Folder F',
    'wires': [
      [
        'fbe6e31.8e4212'
      ]
    ]
  },
  {
    'id': '54825b89.eaacac',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 'ns=1;s=TestDoubleA',
    'browsename': 'TestDoubleA',
    'displayname': 'Test Double A',
    'objecttype': 'BaseDataVariableType',
    'datatype': 'Double',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestFolderA',
    'referencetype': 'Organizes',
    'name': 'Double A',
    'wires': [
      [
        'fbe6e31.8e4212'
      ]
    ]
  },
  {
    'id': '1d690492.ec2943',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 'ns=1;s=TestDoubleB',
    'browsename': 'TestDoubleB',
    'displayname': 'Test Double B',
    'objecttype': 'BaseDataVariableType',
    'datatype': 'Double',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestFolderB',
    'referencetype': 'Organizes',
    'name': 'Double B',
    'wires': [
      [
        'fbe6e31.8e4212'
      ]
    ]
  },
  {
    'id': 'b2a853b3.f9fbe',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 'ns=1;s=TestDoubleC',
    'browsename': 'TestDoubleC',
    'displayname': 'Test Double C',
    'objecttype': 'BaseDataVariableType',
    'datatype': 'Double',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestFolderC',
    'referencetype': 'Organizes',
    'name': 'Double C',
    'wires': [
      [
        'fbe6e31.8e4212'
      ]
    ]
  },
  {
    'id': '1452afc0.e23c98',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 'ns=1;s=TestDoubleD',
    'browsename': 'TestDoubleD',
    'displayname': 'Test Double D',
    'objecttype': 'BaseDataVariableType',
    'datatype': 'Double',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestFolderD',
    'referencetype': 'Organizes',
    'name': 'Double D',
    'wires': [
      [
        'fbe6e31.8e4212'
      ]
    ]
  },
  {
    'id': '972d4ae5.07bdb8',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 'ns=1;s=TestDoubleE',
    'browsename': 'TestDoubleE',
    'displayname': 'Test Double E',
    'objecttype': 'BaseDataVariableType',
    'datatype': 'Double',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestFolderE',
    'referencetype': 'Organizes',
    'name': 'Double E',
    'wires': [
      [
        'fbe6e31.8e4212'
      ]
    ]
  },
  {
    'id': '26184044.911c18',
    'type': 'OPCUA-IIoT-Server-ASO',
    'nodeId': 'ns=1;s=TestDoubleF',
    'browsename': 'TestDoubleF',
    'displayname': 'Test Double F',
    'objecttype': 'BaseDataVariableType',
    'datatype': 'Double',
    'value': '',
    'referenceNodeId': 'ns=1;s=TestFolderF',
    'referencetype': 'Organizes',
    'name': 'Double F',
    'wires': [
      [
        'fbe6e31.8e4212'
      ]
    ]
  },
  {
    'id': '5ccc0400.893e04',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '',
    'payloadType': 'date',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        '26184044.911c18'
      ]
    ]
  },
  {
    'id': '35de1778.7785d',
    'type': 'OPCUA-IIoT-Listener',
    'connector': 'c8abf139.f829a',
    'action': 'subscribe',
    'queueSize': 10,
    'name': '',
    'topic': '',
    'justValue': true,
    'useGroupItems': false,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        'f9c7086d.e2c42'
      ]
    ]
  },
  {
    'id': '5298ebe7.3ec52c',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': '{"interval":500,"queueSize":10,"options":{"requestedPublishingInterval":5000,"requestedLifetimeCount":60,"requestedMaxKeepAliveCount":10,"maxNotificationsPerPublish":5,"publishingEnabled":true,"priority":8}}',
    'payloadType': 'json',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '11',
    'name': '',
    'addressSpaceItems': [
      {
        'name': '',
        'nodeId': 'ns=1;s=TestFolderA',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        '788db36b.3065c4'
      ]
    ]
  },
  {
    'id': '788db36b.3065c4',
    'type': 'OPCUA-IIoT-Browser',
    'connector': 'c8abf139.f829a',
    'nodeId': '',
    'name': '',
    'justValue': false,
    'sendNodesToRead': true,
    'sendNodesToListener': true,
    'sendNodesToBrowser': true,
    'singleBrowseResult': true,
    'recursiveBrowse': true,
    'recursiveDepth': '5',
    'delayPerMessage': '0.2',
    'showStatusActivities': true,
    'showErrors': true,
    'wires': [
      [
        'n1f1'
      ]
    ]
  },
  {id: 'n1f1', type: 'helper'},
  {
    'id': 'c8abf139.f829a',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:49888/',
    'keepSessionAlive': true,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'NONE',
    'name': 'LOCAL SERVER',
    'showErrors': false,
    'individualCerts': false,
    'publicCertificateFile': '',
    'privateKeyFile': '',
    'defaultSecureTokenLifetime': '',
    'endpointMustExist': false,
    'autoSelectRightEndpoint': false,
    'strategyMaxRetry': '',
    'strategyInitialDelay': '',
    'strategyMaxDelay': '',
    'strategyRandomisationFactor': '',
    'requestedSessionTimeout': '',
    'connectionStartDelay': '',
    'reconnectDelay': '',
    'maxBadSessionRequests': '10'
  }
]

describe('OPC UA Browser recursive with ASO nodes e2e Testing', function () {
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

  describe('Browser Recursive node', function () {
    it('should verify browser items as result of a recursive browse', function (done) {
      helper.load(browseRecursiveNodesToLoad, testBrowseRecursiveASOFlow, function () {
        let n1 = helper.getNode('n1f1')
        n1.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.browserResults).toBeInstanceOf(Array)
          expect(msg.payload.browserResults.length).toBe(11)
          done()
        })
      })
    })
  })
})
