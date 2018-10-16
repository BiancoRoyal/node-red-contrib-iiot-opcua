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

jest.setTimeout(20000)

var injectNodeRed = require('node-red/nodes/core/core/20-inject')
var functionNode = require('node-red/nodes/core/core/80-function')

// opcua iiot
var injectNode = require('../../src/opcua-iiot-inject')
var connectorNode = require('../../src/opcua-iiot-connector')
var responseNode = require('../../src/opcua-iiot-response')
var serverNode = require('../../src/opcua-iiot-server')
var inputNode = require('../../src/opcua-iiot-method-caller')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var methodCallerNodesToLoad = [injectNode, connectorNode, inputNode, responseNode, serverNode]
var eventNodesToLoad = [injectNodeRed, functionNode, connectorNode, inputNode, responseNode, serverNode]

var testMethodFlowPayload = [
  {
    'id': 'n1mcf1',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '12345',
    'payloadType': 'num',
    'topic': 'TestTopicMethod',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2.4',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        'n2mcf1',
        'n3mcf1'
      ]
    ]
  },
  {id: 'n2mcf1', type: 'helper'},
  {
    'id': 'n3mcf1',
    'type': 'OPCUA-IIoT-Method-Caller',
    'connector': 'c1mcf1',
    'objectId': 'ns=1;i=1234',
    'methodId': 'ns=1;i=12345',
    'methodType': 'basic',
    'value': '',
    'justValue': true,
    'name': '',
    'showStatusActivities': false,
    'showErrors': true,
    'inputArguments': [
      {
        'name': 'barks',
        'dataType': 'UInt32',
        'value': '3'
      },
      {
        'name': 'volume',
        'dataType': 'UInt32',
        'value': '6'
      }
    ],
    'wires': [
      [
        'n4mcf1',
        'n5mcf1'
      ]
    ]
  },
  {id: 'n4mcf1', type: 'helper'},
  {
    'id': 'n5mcf1',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      ['n6mcf1']
    ]
  },
  {id: 'n6mcf1', type: 'helper'},
  {
    'id': 'c1mcf1',
    'type': 'OPCUA-IIoT-Connector',
    'z': '',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:51976/',
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
  },
  {
    'id': 's1mcf1',
    'type': 'OPCUA-IIoT-Server',
    'port': '51976',
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

var testMethodInjectFlowPayload = [
  {
    'id': 'n1mcf2',
    'type': 'inject',
    'name': 'TestName',
    'topic': 'TestTopicMethod',
    'payload': '23456',
    'payloadType': 'num',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': '3',
    'wires': [
      [
        'n2mcf2',
        'n3mcf2'
      ]
    ]
  },
  {id: 'n2mcf2', type: 'helper'},
  {
    'id': 'n3mcf2',
    'type': 'function',
    'name': 'bark six times with volume twelve',
    'func': "msg.payload = {\n    objectId: 'ns=1;i=1234',\n    methodId: 'ns=1;i=12345',\n    inputArguments: [\n        " +
    "{name: 'barks', dataType:'UInt32', value:'6'},\n        {name: 'volume', dataType:'UInt32', value:'12'}\n    ],\n    " +
    "methodType: 'basic'\n}\nreturn msg;",
    'outputs': 1,
    'noerr': 0,
    'wires': [
      [
        'n4mcf2',
        'n5mcf2'
      ]
    ]
  },
  {id: 'n4mcf2', type: 'helper'},
  {
    'id': 'n5mcf2',
    'type': 'OPCUA-IIoT-Method-Caller',
    'connector': 'c1mcf2',
    'objectId': 'ns=1;i=1234',
    'methodId': 'ns=1;i=12345',
    'methodType': 'basic',
    'value': '',
    'justValue': false,
    'name': '',
    'showStatusActivities': false,
    'showErrors': true,
    'inputArguments': [
      {
        'name': 'barks',
        'dataType': 'UInt32',
        'value': '3'
      },
      {
        'name': 'volume',
        'dataType': 'UInt32',
        'value': '6'
      }
    ],
    'wires': [
      [
        'n6mcf2',
        'n7mcf2'
      ]
    ]
  },
  {id: 'n6mcf2', type: 'helper'},
  {
    'id': 'n7mcf2',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': false,
    'showStatusActivities': false,
    'showErrors': false,
    'activateFilters': false,
    'filters': [],
    'wires': [
      ['n8mcf2']
    ]
  },
  {id: 'n8mcf2', type: 'helper'},
  {
    'id': 'c1mcf2',
    'type': 'OPCUA-IIoT-Connector',
    'z': '',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:51977/',
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
    'autoSelectRightEndpoint': false,
    'strategyMaxRetry': '',
    'strategyInitialDelay': '',
    'strategyMaxDelay': '',
    'strategyRandomisationFactor': ''
  },
  {
    'id': 's1mcf2',
    'type': 'OPCUA-IIoT-Server',
    'port': '51977',
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

describe('OPC UA Method Caller node e2e Testing', function () {
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

  describe('Method Caller node', function () {
    it('should get a message with payload after inject', function (done) {
      helper.load(methodCallerNodesToLoad, testMethodFlowPayload, function () {
        let n2 = helper.getNode('n2mcf1')
        n2.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicMethod')
          expect(msg.nodetype).toBe('inject')
          expect(msg.injectType).toBe('inject')
          setTimeout(done, 3000)
        })
      })
    })

    it('should get a message with payload', function (done) {
      helper.load(methodCallerNodesToLoad, testMethodFlowPayload, function () {
        let n2 = helper.getNode('n2mcf1')
        n2.on('input', function (msg) {
          expect(msg.payload).toBe(12345)
          setTimeout(done, 3000)
        })
      })
    })

    it('should verify the result with response data', function (done) {
      helper.load(methodCallerNodesToLoad, testMethodFlowPayload, function () {
        let n6 = helper.getNode('n6mcf1')
        n6.on('input', function (msg) {
          expect(msg.nodetype).toBe('method')
          expect(msg.entryStatus).toMatchObject([1, 0, 0])
          expect(msg.payload).toMatchObject([{'statusCode': {'value': 0, 'description': 'No Error', 'name': 'Good'}, 'outputArguments': [{'dataType': 'String', 'arrayType': 'Array', 'value': ['Whaff!!!!!', 'Whaff!!!!!', 'Whaff!!!!!']}]}])
          done()
        })
      })
    })

    it('should get a message with payload after inject event inject', function (done) {
      helper.load(eventNodesToLoad, testMethodInjectFlowPayload, function () {
        let n2 = helper.getNode('n2mcf2')
        n2.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicMethod')
          expect(msg.payload).toBe(23456)
          setTimeout(done, 3000)
        })
      })
    })

    it('should get a message with payload event inject', function (done) {
      helper.load(eventNodesToLoad, testMethodInjectFlowPayload, function () {
        let n2 = helper.getNode('n2mcf2')
        n2.on('input', function (msg) {
          expect(msg.payload).toBe(23456)
          setTimeout(done, 3000)
        })
      })
    })

    it('should verify the result with response data event inject', function (done) {
      helper.load(eventNodesToLoad, testMethodInjectFlowPayload, function () {
        let n8 = helper.getNode('n8mcf2')
        n8.on('input', function (msg) {
          expect(msg.nodetype).toBe('method')
          expect(msg.entryStatus).toMatchObject([1, 0, 0])
          expect(msg.payload.results).toBeDefined()
          expect(msg.payload.definition).toBeDefined()
          done()
        })
      })
    })
  })
})
