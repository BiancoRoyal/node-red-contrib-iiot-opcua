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
    'id': 'aso0',
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
        'server'
      ]
    ]
  },
  {
    'id': 'inject0',
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
        'aso0'
      ]
    ]
  },
  {
    'id': 'server',
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
    'id': 'inject2',
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
        'aso2',
        'aso7'
      ]
    ]
  },
  {
    'id': 'aso2',
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
        'server'
      ]
    ]
  },
  {
    'id': 'inject3',
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
        'aso3',
        'aso8'
      ]
    ]
  },
  {
    'id': 'aso3',
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
        'server'
      ]
    ]
  },
  {
    'id': 'inject4',
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
        'aso4',
        'aso9'
      ]
    ]
  },
  {
    'id': 'aso4',
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
        'server'
      ]
    ]
  },
  {
    'id': 'inject5',
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
        'aso5',
        'aso10'
      ]
    ]
  },
  {
    'id': 'aso5',
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
        'server'
      ]
    ]
  },
  {
    'id': 'inject6',
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
        'aso6',
        'aso11'
      ]
    ]
  },
  {
    'id': 'aso6',
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
        'server'
      ]
    ]
  },
  {
    'id': 'aso7',
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
        'server'
      ]
    ]
  },
  {
    'id': 'aso8',
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
        'server'
      ]
    ]
  },
  {
    'id': 'aso9',
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
        'server'
      ]
    ]
  },
  {
    'id': 'aso10',
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
        'server'
      ]
    ]
  },
  {
    'id': 'aso11',
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
        'server'
      ]
    ]
  },
  {
    'id': 'aso12',
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
        'server'
      ]
    ]
  },
  {
    'id': 'inject7',
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
        'aso12'
      ]
    ]
  },
  {
    'id': 'listener',
    'type': 'OPCUA-IIoT-Listener',
    'connector': 'connector',
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
    'id': 'browserInject',
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
        'browser'
      ]
    ]
  },
  {
    'id': 'browser',
    'type': 'OPCUA-IIoT-Browser',
    'connector': 'connector',
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
        'helperNode'
      ]
    ]
  },
  {id: 'helperNode', type: 'helper'},
  {
    'id': 'connector',
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
        let n1 = helper.getNode('helperNode')
        n1.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.browserResults).toBeInstanceOf(Array)
          expect(msg.payload.browserResults.length).toBe(11)
          done()
        })
        const trigger = require('./receive');
        const injectors = testBrowseRecursiveASOFlow.map((item) => {return item.id}).filter((item)=>{return item.indexOf('inject') === 0})
        injectors.forEach((injector) => {
          setTimeout(trigger, 3000, helper.getNode(injector))
        })
        let browserInject = helper.getNode('browserInject')
        setTimeout(trigger, 6000, browserInject)
      })
    })
  })
})
