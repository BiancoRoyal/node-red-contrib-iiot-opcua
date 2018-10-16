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
    'id': '17fad322.b448d5',
    'type': 'inject',
    'name': '86',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:55386/","keepSessionAlive":false,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': false,
    'onceDelay': 0.1,
    'wires': [
      [
        '14d54403.f94f04'
      ]
    ]
  },
  {
    'id': '25bd13e0.8f1a94',
    'type': 'inject',
    'name': '89',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:5589/","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': false,
    'onceDelay': 0.1,
    'wires': [
      [
        '14d54403.f94f04'
      ]
    ]
  },
  {
    'id': '5d542501.b7ddf4',
    'type': 'inject',
    'name': '88',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"opc.tcp://localhost:5587/","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': false,
    'onceDelay': 0.1,
    'wires': [
      [
        '14d54403.f94f04'
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
    'once': false,
    'onceDelay': 0.1,
    'wires': [
      [
        '14d54403.f94f04'
      ]
    ]
  },
  {
    'id': '65015785.dec638',
    'type': 'inject',
    'name': 'wrong endpoint',
    'topic': '',
    'payload': '{"discoveryUrl":null,"endpoint":"localhost:5589","keepSessionAlive":true,"securityPolicy":"None","securityMode":"NONE","name":"LOCAL FLEXIBLE INJECTED SERVER","showErrors":true,"publicCertificateFile":null,"privateKeyFile":null,"defaultSecureTokenLifetime":0,"endpointMustExist":false,"autoSelectRightEndpoint":false,"strategyMaxRetry":0,"strategyInitialDelay":0,"strategyMaxDelay":0,"strategyRandomisationFactor":0,"requestedSessionTimeout":0,"connectionStartDelay":0,"reconnectDelay":0}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': false,
    'onceDelay': 0.1,
    'wires': [
      [
        '14d54403.f94f04'
      ]
    ]
  },
  {
    'id': '14d54403.f94f04',
    'type': 'OPCUA-IIoT-Flex-Connector',
    'name': 'TestFlexConnectorEvents',
    'showStatusActivities': false,
    'showErrors': false,
    'connector': '494e76bd.d2c928',
    'wires': [
      [
        'n1fc'
      ]
    ]
  },
  {
    'id': '494e76bd.d2c928',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:5589/',
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
  {id: 'n1fc', type: 'helper'},
  {
    'id': 's1cf5',
    'type': 'OPCUA-IIoT-Server',
    'port': '5589',
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
    'wires': [[]]
  },
  {
    'id': 's2cf5',
    'type': 'OPCUA-IIoT-Server',
    'port': '5586',
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
    'wires': [[]]
  },
  {
    'id': 's3cf5',
    'type': 'OPCUA-IIoT-Server',
    'port': '5587',
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
    it('should be loaded with connector, inject, and servers', function (done) {
      helper.load([inputNode, connectorNode, serverNode], testFlexConnectorFlow,
        function () {
          let nodeUnderTest = helper.getNode('n1fc')
          expect(nodeUnderTest).toBeDefined()
          setTimeout(done, 2000)
        })
    })
  })
})
