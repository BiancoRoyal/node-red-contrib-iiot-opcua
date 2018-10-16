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

jest.setTimeout(30000)

var injectNode = require('node-red/nodes/core/core/20-inject')
var inputNode = require('../../src/opcua-iiot-flex-connector')
var connectorNode = require('../../src/opcua-iiot-connector')
var serverNode = require('../../src/opcua-iiot-server')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testFlexConnectorFlow = [
  {
    'id': '65015785.dec638',
    'type': 'inject',
    'name': 'wrong endpoint',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"localhost:55189","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 2,
    'wires': [
      [
        '14d54403.f94f04', 'n1fc'
      ]
    ]
  },
  {
    'id': '17fad322.b448d5',
    'type': 'inject',
    'name': '86',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:55186/","keepSessionAlive":false,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 4,
    'wires': [
      [
        '14d54403.f94f04', 'n1fc'
      ]
    ]
  },
  {
    'id': '25bd13e0.8f1a94',
    'type': 'inject',
    'name': '89',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:55189/","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 8,
    'wires': [
      [
        '14d54403.f94f04', 'n1fc'
      ]
    ]
  },
  {
    'id': '5d542501.b7ddf4',
    'type': 'inject',
    'name': '87',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:55187/","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 12,
    'wires': [
      [
        '14d54403.f94f04', 'n1fc'
      ]
    ]
  },
  {
    'id': '2d7ff055.23044',
    'type': 'inject',
    'name': 'wrong port',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:12345/","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 16,
    'wires': [
      [
        '14d54403.f94f04', 'n1fc'
      ]
    ]
  },
  {id: 'n1fc', type: 'helper'}
]

var testWithServersFlexConnector = [
  {
    'id': '65015785.dec658',
    'type': 'inject',
    'name': 'wrong endpoint',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"localhost:55189","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 2,
    'wires': [
      [
        '14d54403.f94f14', 'n1fcs'
      ]
    ]
  },
  {
    'id': '17fad322.b44855',
    'type': 'inject',
    'name': '86',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:55186/","keepSessionAlive":false,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 4,
    'wires': [
      [
        '14d54403.f94f14', 'n1fcs'
      ]
    ]
  },
  {
    'id': '25bd13e0.8f1a54',
    'type': 'inject',
    'name': '89',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:55189/","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 8,
    'wires': [
      [
        '14d54403.f94f14', 'n1fcs'
      ]
    ]
  },
  {
    'id': '5d542501.b7dd54',
    'type': 'inject',
    'name': '87',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:55187/","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 12,
    'wires': [
      [
        '14d54403.f94f14', 'n1fcs'
      ]
    ]
  },
  {
    'id': '2d7ff055.23054',
    'type': 'inject',
    'name': 'wrong port',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:12345/","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 16,
    'wires': [
      [
        '14d54403.f94f14', 'n1fcs'
      ]
    ]
  },
  {id: 'n1fcs', type: 'helper'},
  {
    'id': '14d54403.f94f14',
    'type': 'OPCUA-IIoT-Flex-Connector',
    'name': 'TestFlexConnectorEvents',
    'showStatusActivities': false,
    'showErrors': false,
    'connector': '494e76bd.d2c938',
    'wires': [
      [
        'n2fcs'
      ]
    ]
  },
  {id: 'n2fcs', type: 'helper'},
  {
    'id': '494e76bd.d2c938',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:55189/',
    'keepSessionAlive': true,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'NONE',
    'name': 'LOCAL FLEX CONNECTOR',
    'showErrors': true,
    'publicCertificateFile': '',
    'privateKeyFile': '',
    'defaultSecureTokenLifetime': '60000',
    'endpointMustExist': false,
    'autoSelectRightEndpoint': false,
    'strategyMaxRetry': '',
    'strategyInitialDelay': '',
    'strategyMaxDelay': '',
    'strategyRandomisationFactor': '',
    'requestedSessionTimeout': '',
    'connectionStartDelay': '',
    'reconnectDelay': ''
  },
  {
    'id': 's1cs',
    'type': 'OPCUA-IIoT-Server',
    'port': '55186',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'TestServer',
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
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [[]]
  },
  {
    'id': 's2cs',
    'type': 'OPCUA-IIoT-Server',
    'port': '55187',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'TestServer',
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
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [[]]
  },
  {
    'id': 's3cs',
    'type': 'OPCUA-IIoT-Server',
    'port': '55189',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'TestServer',
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
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [[]]
  }
]

describe('OPC UA Flex Connector node e2e Testing', function () {
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

  describe('Flex Connector node', function () {
    it('should be loaded and get five injects', function (done) {
      helper.load([injectNode, inputNode, connectorNode, serverNode], testFlexConnectorFlow,
        function () {
          let counter = 0
          let nodeUnderTest = helper.getNode('n1fc')
          expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.on('input', (msg) => {
            counter++
            expect(msg.payload).toBeDefined()
            if (counter === 5) {
              done()
            }
          })
        })
    })

    it('should be loaded with connector, inject, and servers', function (done) {
      helper.load([injectNode, inputNode, connectorNode, serverNode], testWithServersFlexConnector,
        function () {
          let counter = 0
          let nodeUnderTest = helper.getNode('n2fcs')
          expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.on('input', (msg) => {
            counter++
            expect(msg.payload).toBeDefined()
            if (counter > 2) {
              setTimeout(done, 3000)
            }
          })
        })
    })
  })
})
