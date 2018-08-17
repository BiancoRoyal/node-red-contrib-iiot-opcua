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

// iiot opcua
var injectNode = require('../src/opcua-iiot-inject')
var functionNode = require('node-red/nodes/core/core/80-function')
var connectorNode = require('../src/opcua-iiot-connector')
var inputNode = require('../src/opcua-iiot-write')
var responseNode = require('../src/opcua-iiot-response')
var serverNode = require('../src/opcua-iiot-server')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var writeNodesToLoad = [injectNode, functionNode, connectorNode, inputNode, responseNode, serverNode]

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
        'nodeId': 'ns=4;s=TestReadWrite',
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
        'nodeId': 'ns=4;s=TestReadWrite',
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

var testWriteNodeToBeLoaded = [
  {
    'id': '34d2c6bc.43275a',
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
    'endpoint': 'opc.tcp://localhost:2000/',
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
  }
]

describe('OPC UA Write node Testing', function () {
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
    it('should be loaded', function (done) {
      helper.load([inputNode, connectorNode], testWriteNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('34d2c6bc.43275a')
          nodeUnderTest.should.have.property('name', 'TestWrite')
          nodeUnderTest.should.have.property('showErrors', true)
          nodeUnderTest.should.have.property('justValue', false)
          setTimeout(done, 2000)
        })
    })

    it('should get a message with payload', function (done) {
      helper.load(writeNodesToLoad, testWriteFlow, function () {
        let n2 = helper.getNode('n2wrf1')
        n2.on('input', function (msg) {
          msg.should.have.property('payload', 12345.67)
          msg.should.have.property('topic', 'TestTopicWrite')
          setTimeout(done, 2000)
        })
      })
    })

    it('should verify addressSpaceItems', function (done) {
      helper.load(writeNodesToLoad, testWriteFlow, function () {
        let n2 = helper.getNode('n2wrf1')
        n2.on('input', function (msg) {
          msg.should.have.property('addressSpaceItems', [{
            'name': 'TestReadWrite',
            'nodeId': 'ns=4;s=TestReadWrite',
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
          msg.should.have.property('addressSpaceItems', [ {
            name: 'TestReadWrite',
            nodeId: 'ns=4;s=TestReadWrite',
            datatypeName: 'Double'
          } ])
          msg.valuesToWrite[0].should.be.equal(12345.22)
          msg.should.have.property('topic', 'TestTopicWrite')
          msg.should.have.property('nodetype', 'inject')
          msg.should.have.property('injectType', 'write')
          done()
        })
      })
    })

    it('should have write results', function (done) {
      helper.load(writeNodesToLoad, testWriteFlow, function () {
        let n6 = helper.getNode('n6wrf1')
        n6.on('input', function (msg) {
          msg.should.have.property('addressSpaceItems', [{
            'name': 'TestReadWrite',
            'nodeId': 'ns=4;s=TestReadWrite',
            'datatypeName': 'Double'
          }])
          msg.payload.should.have.property('statusCodes', [{'value': 0, 'description': 'No Error', 'name': 'Good'}])
          msg.should.have.property('topic', 'TestTopicWrite')
          msg.should.have.property('nodetype', 'write')
          msg.should.have.property('injectType', 'write')
          done()
        })
      })
    })

    it('should have write results with response', function (done) {
      helper.load(writeNodesToLoad, testWriteFlow, function () {
        let n8 = helper.getNode('n8wrf1')
        n8.on('input', function (msg) {
          msg.should.have.property('entryStatus', [1, 0, 0])
          msg.should.have.property('topic', 'TestTopicWrite')
          msg.should.have.property('nodetype', 'write')
          msg.should.have.property('injectType', 'write')
          done()
        })
      })
    })

    it('should have write results from payload without a valuesToWrite property', function (done) {
      helper.load(writeNodesToLoad, testWriteWithoutValuesToWriteFlow, function () {
        let n6 = helper.getNode('n6wrf2')
        n6.on('input', function (msg) {
          msg.should.have.property('addressSpaceItems', [{
            'name': 'TestReadWrite',
            'nodeId': 'ns=4;s=TestReadWrite',
            'datatypeName': 'Double'
          }])
          msg.payload.should.have.property('statusCodes', [{'value': 0, 'description': 'No Error', 'name': 'Good'}])
          msg.should.have.property('topic', 'TestTopicWrite')
          msg.should.have.property('nodetype', 'write')
          msg.should.have.property('injectType', 'write')
          done()
        })
      })
    })
  })
})
