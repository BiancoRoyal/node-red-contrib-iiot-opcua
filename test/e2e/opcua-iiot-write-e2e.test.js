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

var injectNodeRedNode = require('node-red/nodes/core/core/20-inject')
var functionNodeRedNode = require('node-red/nodes/core/core/80-function')

// iiot opcua
var injectNode = require('../../src/opcua-iiot-inject')
var connectorNode = require('../../src/opcua-iiot-connector')
var inputNode = require('../../src/opcua-iiot-write')
var responseNode = require('../../src/opcua-iiot-response')
var serverNode = require('../../src/opcua-iiot-server')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var writeNodesToLoad = [injectNodeRedNode, injectNode, functionNodeRedNode, connectorNode, inputNode, responseNode, serverNode]

var testWriteFlow = [
  {
    'id': 'n1wrf1',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'write',
    'payload': '12345.67',
    'payloadType': 'num',
    'topic': 'TestTopicWrite',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2.4',
    'name': 'TestReadWrite',
    'addressSpaceItems': [
      {
        'name': 'TestReadWrite',
        'nodeId': 'ns=1;s=TestReadWrite',
        'datatypeName': 'Double'
      }
    ],
    'wires': [['n2wrf1', 'n3wrf1']]
  },
  {'id': 'n2wrf1', 'type': 'helper'},
  {
    'id': 'n3wrf1',
    'type': 'function',
    'name': '',
    'func': 'msg.valuesToWrite = [12345.22];\nreturn msg;',
    'outputs': 1,
    'noerr': 0,
    'wires': [['n4wrf1', 'n5wrf1']]
  },
  {'id': 'n4wrf1', 'type': 'helper'},
  {
    'id': 'n5wrf1',
    'type': 'OPCUA-IIoT-Write',
    'connector': 'c1wrf1',
    'name': 'TestWrite',
    'justValue': true,
    'showStatusActivities': false,
    'showErrors': true,
    'wires': [['n6wrf1', 'n7wrf1']]
  },
  {
    'id': 'c1wrf1',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:1972/',
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
  {'id': 'n6wrf1', 'type': 'helper'},
  {
    'id': 'n7wrf1',
    'type': 'OPCUA-IIoT-Response',
    'name': 'TestWriteResponse',
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [['n8wrf1']]
  },
  {'id': 'n8wrf1', 'type': 'helper'},
  {
    'id': 's1wrf1',
    'type': 'OPCUA-IIoT-Server',
    'port': '1972',
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
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [[]]
  }
]

var testWriteWithoutValuesToWriteFlow = [
  {
    'id': 'n1wrf2',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'write',
    'payload': '12345.67',
    'payloadType': 'num',
    'topic': 'TestTopicWrite',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2.4',
    'name': 'TestReadWrite',
    'addressSpaceItems': [
      {
        'name': 'TestReadWrite',
        'nodeId': 'ns=1;s=TestReadWrite',
        'datatypeName': 'Double'
      }
    ],
    'wires': [['n2wrf2', 'n3wrf2']]
  },
  {'id': 'n2wrf2', 'type': 'helper'},
  {
    'id': 'n3wrf2',
    'type': 'OPCUA-IIoT-Write',
    'connector': 'c1wrf2',
    'name': 'TestWrite',
    'justValue': true,
    'showStatusActivities': false,
    'showErrors': true,
    'wires': [['n4wrf2', 'n5wrf2']]
  },
  {
    'id': 'c1wrf2',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:1973/',
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
  {'id': 'n4wrf2', 'type': 'helper'},
  {
    'id': 'n5wrf2',
    'type': 'OPCUA-IIoT-Response',
    'name': 'TestWriteResponse',
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [['n6wrf2']]
  },
  {'id': 'n6wrf2', 'type': 'helper'},
  {
    'id': 's1wrf2',
    'type': 'OPCUA-IIoT-Server',
    'port': '1973',
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
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [[]]
  }
]

var testWriteNodeToBeLoadedWithServer = [
  {
    'id': '34d2c6bc.43275b',
    'type': 'OPCUA-IIoT-Write',
    'connector': 'd35ceb8e.d06aa8',
    'name': 'TestWrite',
    'justValue': false,
    'showStatusActivities': false,
    'showErrors': true,
    'wires': [[]]
  },
  {
    'id': 'd35ceb8e.d06aa8',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:5392/',
    'keepSessionAlive': false,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'NONE',
    'name': 'TESTSERVER',
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
    'id': 's1wrf2',
    'type': 'OPCUA-IIoT-Server',
    'port': '5392',
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
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [[]]
  }
]

describe('OPC UA Write node e2e Testing', function () {
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

  describe('Write node', function () {
    it('should be loaded and live with server', function (done) {
      helper.load([inputNode, serverNode, connectorNode], testWriteNodeToBeLoadedWithServer,
        function () {
          let nodeUnderTest = helper.getNode('34d2c6bc.43275b')
          expect(nodeUnderTest.name).toBe('TestWrite')
          expect(nodeUnderTest.showErrors).toBe(true)
          expect(nodeUnderTest.justValue).toBe(false)
          setTimeout(done, 3000)
        })
    })

    it('should get a message with payload', function (done) {
      helper.load(writeNodesToLoad, testWriteFlow, function () {
        let n2 = helper.getNode('n2wrf1')
        n2.on('input', function (msg) {
          expect(msg.payload).toBe(12345.67)
          expect(msg.topic).toBe('TestTopicWrite')
          setTimeout(done, 2000)
        })
      })
    })

    it('should verify addressSpaceItems', function (done) {
      helper.load(writeNodesToLoad, testWriteFlow, function () {
        let n2 = helper.getNode('n2wrf1')
        n2.on('input', function (msg) {
          expect(msg.addressSpaceItems).toMatchObject([{
            'name': 'TestReadWrite',
            'nodeId': 'ns=1;s=TestReadWrite',
            'datatypeName': 'Double'
          }])
          setTimeout(done, 2000)
        })
      })
    })

    it('should have values to write', function (done) {
      helper.load(writeNodesToLoad, testWriteFlow, function () {
        let n4 = helper.getNode('n4wrf1')
        n4.on('input', function (msg) {
          expect(msg.addressSpaceItems).toMatchObject([{
            name: 'TestReadWrite',
            nodeId: 'ns=1;s=TestReadWrite',
            datatypeName: 'Double'
          }])
          expect(msg.valuesToWrite[0]).toBe(12345.22)
          expect(msg.topic).toBe('TestTopicWrite')
          expect(msg.nodetype).toBe('inject')
          expect(msg.injectType).toBe('write')
          done()
        })
      })
    })

    it('should have write results', function (done) {
      helper.load(writeNodesToLoad, testWriteFlow, function () {
        let n6 = helper.getNode('n6wrf1')
        n6.on('input', function (msg) {
          expect(msg.addressSpaceItems).toMatchObject([{
            'name': 'TestReadWrite',
            'nodeId': 'ns=1;s=TestReadWrite',
            'datatypeName': 'Double'
          }])
          expect(msg.payload.statusCodes).toMatchObject([{'value': 0, 'description': 'No Error', 'name': 'Good'}])
          expect(msg.topic).toBe('TestTopicWrite')
          expect(msg.nodetype).toBe('write')
          expect(msg.injectType).toBe('write')
          done()
        })
      })
    })

    it('should have write results with response', function (done) {
      helper.load(writeNodesToLoad, testWriteFlow, function () {
        let n8 = helper.getNode('n8wrf1')
        n8.on('input', function (msg) {
          expect(msg.entryStatus).toMatchObject([1, 0, 0])
          expect(msg.topic).toBe('TestTopicWrite')
          expect(msg.nodetype).toBe('write')
          expect(msg.injectType).toBe('write')
          done()
        })
      })
    })

    it('should have write results from payload without a valuesToWrite property', function (done) {
      helper.load(writeNodesToLoad, testWriteWithoutValuesToWriteFlow, function () {
        let n6 = helper.getNode('n6wrf2')
        n6.on('input', function (msg) {
          expect(msg.addressSpaceItems).toMatchObject([{
            'name': 'TestReadWrite',
            'nodeId': 'ns=1;s=TestReadWrite',
            'datatypeName': 'Double'
          }])
          expect(msg.payload.statusCodes).toMatchObject([{'value': 0, 'description': 'No Error', 'name': 'Good'}])
          expect(msg.topic).toBe('TestTopicWrite')
          expect(msg.nodetype).toBe('write')
          expect(msg.injectType).toBe('write')
          done()
        })
      })
    })
  })
})
