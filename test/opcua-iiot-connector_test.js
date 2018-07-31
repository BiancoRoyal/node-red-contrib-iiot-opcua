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

var helper = require('node-red-contrib-test-helper')

// iiot opc ua nodes
var serverNode = require('../src/opcua-iiot-server')
var injectNode = require('../src/opcua-iiot-inject')
var inputNode = require('../src/opcua-iiot-connector')
// services
var readNode = require('../src/opcua-iiot-read')
var writeNode = require('../src/opcua-iiot-write')
var browserNode = require('../src/opcua-iiot-browser')
var listenerNode = require('../src/opcua-iiot-listener')
var methodCallerNode = require('../src/opcua-iiot-method-caller')

var nodesToLoadForBrowser = [injectNode, browserNode, inputNode, serverNode]
var nodesToLoadForReader = [injectNode, readNode, inputNode, serverNode]
var nodesToLoadForWriter = [injectNode, writeNode, inputNode, serverNode]
var nodesToLoadForListener = [injectNode, listenerNode, inputNode, serverNode]
var nodesToLoadForMethodCaller = [injectNode, methodCallerNode, inputNode, serverNode]

// https://www.dailycred.com/article/bcrypt-calculator
var testCredentials = {
  user: 'peter',
  password: '$2a$04$Dj8UfDYcMLjttad0Qi67DeKtqJM6SZ8XR.Oy70.GUvle4MlrVWaYC'
}

var testConnectorBrowseFlow = [
  {
    'id': 'n1cf1',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': 'testpayload',
    'payloadType': 'str',
    'topic': 'TestTopicBrowse',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2.4',
    'name': 'TestInject',
    'addressSpaceItems': [],
    'wires': [['n2cf1', 'n3cf1']]
  },
  {id: 'n2cf1', type: 'helper'},
  {
    'id': 'n3cf1',
    'type': 'OPCUA-IIoT-Browser',
    'connector': 'c1cf1',
    'nodeId': 'ns=4;i=1234',
    'name': 'TestBrowser',
    'justValue': true,
    'sendNodesToRead': false,
    'sendNodesToListener': false,
    'sendNodesToBrowser': false,
    'singleBrowseResult': true,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [['n5cf1']]
  },
  {
    'id': 'c1cf1',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:1962/',
    'keepSessionAlive': false,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'NONE',
    'name': 'TESTSERVER',
    'showStatusActivities': false,
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
  {id: 'n5cf1', type: 'helper'},
  {
    'id': 's1cf1',
    'type': 'OPCUA-IIoT-Server',
    'port': '1962',
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

var testConnectorReadFlow = [
  {
    'id': 'n1cf2',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'read',
    'payload': 'testpayload',
    'payloadType': 'str',
    'topic': 'TestTopicRead',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2.4',
    'name': '',
    'addressSpaceItems': [
      {
        'name': '',
        'nodeId': 'ns=4;s=Pressure',
        'datatypeName': ''
      }
    ],
    'wires': [['n2cf2', 'n3cf2']]
  },
  {id: 'n2cf2', type: 'helper'},
  {
    'id': 'n3cf2',
    'type': 'OPCUA-IIoT-Read',
    'attributeId': 0,
    'maxAge': 1,
    'depth': 1,
    'connector': 'c1cf2',
    'name': 'TestRead',
    'justValue': true,
    'showStatusActivities': false,
    'showErrors': false,
    'parseStrings': false,
    'wires': [['n5cf2']]
  },
  {
    'id': 'c1cf2',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:1980/',
    'keepSessionAlive': false,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'NONE',
    'name': 'TESTSERVER',
    'showStatusActivities': false,
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
  {id: 'n5cf2', type: 'helper'},
  {
    'id': 's1cf2',
    'type': 'OPCUA-IIoT-Server',
    'port': '1980',
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

var testConnectorListenerFlow = [
  {
    'id': 'n1cf3',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': '{"interval":100,"queueSize":1,"options":{"requestedPublishingInterval":1000,"requestedLifetimeCount":10,"requestedMaxKeepAliveCount":10,"maxNotificationsPerPublish":10,"publishingEnabled":true,"priority":1}}',
    'payloadType': 'json',
    'topic': 'TestTopicListen',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3.4',
    'name': 'TestListen',
    'addressSpaceItems': [
      {
        'name': '',
        'nodeId': 'ns=4;s=FullCounter',
        'datatypeName': ''
      }
    ],
    'wires': [['n2cf3', 'n3cf3']]
  },
  {id: 'n2cf3', type: 'helper'},
  {
    'id': 'n3cf3',
    'type': 'OPCUA-IIoT-Listener',
    'connector': 'c1cf3',
    'action': 'subscribe',
    'queueSize': 1,
    'name': 'TestListener',
    'justValue': true,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [['n5cf3']]
  },
  {
    'id': 'c1cf3',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:1981/',
    'keepSessionAlive': false,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'NONE',
    'name': 'TESTSERVER',
    'showStatusActivities': false,
    'showErrors': false,
    'publicCertificateFile': '',
    'privateKeyFile': '',
    'defaultSecureTokenLifetime': '60000',
    'endpointMustExist': false,
    'autoSelectRightEndpoint': false,
    'strategyMaxRetry': '',
    'strategyInitialDelay': '',
    'strategyMaxDelay': '',
    'strategyRandomisationFactor': '',
    'requestedSessionTimeout': ''
  },
  {id: 'n5cf3', type: 'helper'},
  {
    'id': 's1cf3',
    'type': 'OPCUA-IIoT-Server',
    'port': '1981',
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

var testConnectorWriteFlow = [
  {
    'id': 'n1cf4',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'write',
    'payload': '1000',
    'payloadType': 'num',
    'topic': 'TestTopicWrite',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2.4',
    'name': '',
    'addressSpaceItems': [
      {
        'name': 'Pressure',
        'nodeId': 'ns=4;s=Pressure',
        'datatypeName': 'Double'
      }
    ],
    'wires': [['n2cf4', 'n3cf4']]
  },
  {id: 'n2cf4', type: 'helper'},
  {
    'id': 'n3cf4',
    'type': 'OPCUA-IIoT-Write',
    'connector': 'c1cf4',
    'name': 'TestWrite',
    'justValue': true,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [['n5cf4']]
  },
  {
    'id': 'c1cf4',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:1982/',
    'keepSessionAlive': false,
    'loginEnabled': true,
    'securityPolicy': 'Basic256',
    'securityMode': 'SIGNANDENCRYPT',
    'name': 'TESTSERVER',
    'showStatusActivities': false,
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
  {id: 'n5cf4', type: 'helper'},
  {
    'id': 's1cf4',
    'type': 'OPCUA-IIoT-Server',
    'port': '1982',
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
    'serverDiscovery': true,
    'users': [
      {
        'name': 'peter',
        'password': 'peter'
      }
    ],
    'xmlsets': [
      {
        'name': 'ISA95',
        'path': 'public/vendor/opc-foundation/xml/Opc.ISA95.NodeSet2.xml'
      }
    ],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [[]]
  }
]

var testConnectorMethodCallerFlow = [
  {
    'id': 'n1cf5',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '1000',
    'payloadType': 'num',
    'topic': 'TestTopicMethod',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2.4',
    'name': 'TestInject',
    'addressSpaceItems': [],
    'wires': [['n2cf5', 'n3cf5']]
  },
  {id: 'n2cf5', type: 'helper'},
  {
    'id': 'n3cf5',
    'type': 'OPCUA-IIoT-Method-Caller',
    'connector': 'c1cf5',
    'objectId': 'ns=4;i=1234',
    'methodId': 'ns=4;i=12345',
    'methodType': 'basic',
    'value': '',
    'justValue': true,
    'name': 'TestMethodBark',
    'showStatusActivities': false,
    'showErrors': false,
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
    'wires': [['n5cf5']]
  },
  {
    'id': 'c1cf5',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:1983/',
    'keepSessionAlive': false,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'NONE',
    'name': 'TESTSERVER',
    'showStatusActivities': false,
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
  {id: 'n5cf5', type: 'helper'},
  {
    'id': 's1cf5',
    'type': 'OPCUA-IIoT-Server',
    'port': '1983',
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

var testConnectorHTTPFlow = [
  {
    'id': 'n1cf6',
    'type': 'OPCUA-IIoT-Method-Caller',
    'connector': 'c1cf6',
    'objectId': 'ns=4;i=1234',
    'methodId': 'ns=4;i=12345',
    'methodType': 'basic',
    'value': '',
    'justValue': true,
    'name': 'TestMethodBark',
    'showStatusActivities': false,
    'showErrors': false,
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
    'wires': [[]]
  },
  {
    'id': 'c1cf6',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:1991/',
    'keepSessionAlive': false,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'NONE',
    'name': 'TESTSERVER',
    'showStatusActivities': false,
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
    'id': 's1cf6',
    'type': 'OPCUA-IIoT-Server',
    'port': '1991',
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

describe('OPC UA Connector node Testing', function () {
  before(function (done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function (done) {
    helper.unload().then(function () {
      done()
    }).catch(function (err) {
      console.log('Connector error ' + err)
      done()
    })
  })

  after(function (done) {
    helper.stopServer(function () {
      done()
    })
  })

  describe('Connector node', function () {
    it('should be loaded', function (done) {
      helper.load([inputNode], [
        {
          'id': 'n4',
          'type': 'OPCUA-IIoT-Connector',
          'discoveryUrl': 'opc.tcp://localhost:4840/',
          'endpoint': 'opc.tcp://localhost:1984/',
          'keepSessionAlive': false,
          'loginEnabled': false,
          'securityPolicy': 'None',
          'securityMode': 'NONE',
          'name': 'TESTSERVER',
          'showStatusActivities': false,
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
      ],
      function () {
        let n4 = helper.getNode('n4')
        n4.should.have.property('name', 'TESTSERVER')
        n4.should.have.property('discoveryUrl', 'opc.tcp://localhost:4840/')
        n4.should.have.property('endpoint', 'opc.tcp://localhost:1984/')
        n4.should.have.property('securityPolicy', 'None')
        n4.should.have.property('messageSecurityMode', 'NONE')
        n4.should.have.property('publicCertificateFile', null)
        n4.should.have.property('privateKeyFile', null)
        setTimeout(done, 5000)
      })
    })

    it('should success on discovery request', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorHTTPFlow, function () {
        helper.request()
          .get('/opcuaIIoT/client/discover/c1cf6/' + encodeURIComponent('test'))
          .expect(200)
          .end(done)
      })
    })

    it('should success on endpoints request', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorHTTPFlow, function () {
        helper.request()
          .get('/opcuaIIoT/client/endpoints/c1cf6/' + encodeURIComponent('test'))
          .expect(200)
          .end(done)
      })
    })

    it('should success on DataTypeId request', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorHTTPFlow, function () {
        helper.request()
          .get('/opcuaIIoT/plain/DataTypeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should success on AttributeIds request', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorHTTPFlow, function () {
        helper.request()
          .get('/opcuaIIoT/plain/AttributeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should success on StatusCodes request', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorHTTPFlow, function () {
        helper.request()
          .get('/opcuaIIoT/plain/StatusCodes')
          .expect(200)
          .end(done)
      })
    })

    it('should success on ObjectTypeIds request', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorHTTPFlow, function () {
        helper.request()
          .get('/opcuaIIoT/plain/ObjectTypeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should success on VariableTypeIds request', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorHTTPFlow, function () {
        helper.request()
          .get('/opcuaIIoT/plain/VariableTypeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should success on ReferenceTypeIds request', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorHTTPFlow, function () {
        helper.request()
          .get('/opcuaIIoT/plain/ReferenceTypeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should success on XML sets request', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorHTTPFlow, function () {
        helper.request()
          .get('/opcuaIIoT/xmlsets/public')
          .expect(200)
          .end(done)
      })
    })

    it('should success on DataTypeIds list request', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorHTTPFlow, function () {
        helper.request()
          .get('/opcuaIIoT/list/DataTypeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should success on EventTypeIds list request', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorHTTPFlow, function () {
        helper.request()
          .get('/opcuaIIoT/list/EventTypeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should success on InstanceTypeIds list request', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorHTTPFlow, function () {
        helper.request()
          .get('/opcuaIIoT/list/InstanceTypeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should success on VariableTypeIds list request', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorHTTPFlow, function () {
        helper.request()
          .get('/opcuaIIoT/list/VariableTypeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should success on ReferenceTypeIds list request', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorHTTPFlow, function () {
        helper.request()
          .get('/opcuaIIoT/list/ReferenceTypeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should get a message with payload after inject with browser', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorBrowseFlow, function () {
        let n2 = helper.getNode('n2cf1')
        n2.on('input', function (msg) {
          msg.should.have.property('payload', 'testpayload')
          setTimeout(done, 5000)
        })
      })
    })

    it('should get a message with topic after browse', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorBrowseFlow, function () {
        let n5 = helper.getNode('n5cf1')
        n5.on('input', function (msg) {
          msg.should.have.property('topic', 'TestTopicBrowse')
          done()
        })
      })
    })

    it('should get a message with browseTopic after browse', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorBrowseFlow, function () {
        let n5 = helper.getNode('n5cf1')
        n5.on('input', function (msg) {
          msg.payload.should.have.property('browseTopic', 'ns=4;i=1234')
          done()
        })
      })
    })

    it('should get a message with browserItems in payload after browse', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorBrowseFlow, function () {
        let n5 = helper.getNode('n5cf1')
        n5.on('input', function (msg) {
          msg.payload.should.have.property('browseTopic', 'ns=4;i=1234')
          msg.payload.should.have.property('browserItems', [{
            'referenceTypeId': 'ns=0;i=35',
            'isForward': true,
            'nodeId': 'ns=4;s=Pressure',
            'browseName': {'namespaceIndex': 0, 'name': 'Pressure'},
            'displayName': {'text': 'Pressure'},
            'nodeClass': 'Variable',
            'typeDefinition': 'ns=0;i=63'
          }, {
            'referenceTypeId': 'ns=0;i=35',
            'isForward': true,
            'nodeId': 'ns=4;s=Matrix',
            'browseName': {'namespaceIndex': 0, 'name': 'Matrix'},
            'displayName': {'text': 'Matrix'},
            'nodeClass': 'Variable',
            'typeDefinition': 'ns=0;i=63'
          }, {
            'referenceTypeId': 'ns=0;i=35',
            'isForward': true,
            'nodeId': 'ns=4;s=Position',
            'browseName': {'namespaceIndex': 0, 'name': 'Position'},
            'displayName': {'text': 'Position'},
            'nodeClass': 'Variable',
            'typeDefinition': 'ns=0;i=63'
          }, {
            'referenceTypeId': 'ns=0;i=35',
            'isForward': true,
            'nodeId': 'ns=4;s=PumpSpeed',
            'browseName': {'namespaceIndex': 0, 'name': 'PumpSpeed'},
            'displayName': {'text': 'Pump Speed'},
            'nodeClass': 'Variable',
            'typeDefinition': 'ns=0;i=63'
          }, {
            'referenceTypeId': 'ns=0;i=35',
            'isForward': true,
            'nodeId': 'ns=4;s=SomeDate',
            'browseName': {'namespaceIndex': 0, 'name': 'SomeDate'},
            'displayName': {'text': 'Some Date'},
            'nodeClass': 'Variable',
            'typeDefinition': 'ns=0;i=63'
          }, {
            'referenceTypeId': 'ns=0;i=35',
            'isForward': true,
            'nodeId': 'ns=4;s=MultiLanguageText',
            'browseName': {'namespaceIndex': 0, 'name': 'MultiLanguageText'},
            'displayName': {'text': 'Multi Language Text'},
            'nodeClass': 'Variable',
            'typeDefinition': 'ns=0;i=63'
          }, {
            'referenceTypeId': 'ns=0;i=35',
            'isForward': true,
            'nodeId': 'ns=4;s=FanSpeed',
            'browseName': {'namespaceIndex': 0, 'name': 'FanSpeed'},
            'displayName': {'text': 'FanSpeed'},
            'nodeClass': 'Variable',
            'typeDefinition': 'ns=0;i=63'
          }, {
            'referenceTypeId': 'ns=0;i=35',
            'isForward': true,
            'nodeId': 'ns=1;s=TemperatureAnalogItem',
            'browseName': {'namespaceIndex': 0, 'name': 'TemperatureAnalogItem'},
            'displayName': {'text': 'TemperatureAnalogItem'},
            'nodeClass': 'Variable',
            'typeDefinition': 'ns=0;i=2368'
          }, {
            'referenceTypeId': 'ns=0;i=47',
            'isForward': true,
            'nodeId': 'ns=4;i=16479',
            'browseName': {'namespaceIndex': 0, 'name': 'MyVariable1'},
            'displayName': {'text': 'MyVariable1'},
            'nodeClass': 'Variable',
            'typeDefinition': 'ns=0;i=63'
          }, {
            'referenceTypeId': 'ns=0;i=47',
            'isForward': true,
            'nodeId': 'ns=4;b=1020ffaa',
            'browseName': {'namespaceIndex': 0, 'name': 'MyVariable2'},
            'displayName': {'text': 'MyVariable2'},
            'nodeClass': 'Variable',
            'typeDefinition': 'ns=0;i=63'
          }, {
            'referenceTypeId': 'ns=0;i=47',
            'isForward': true,
            'nodeId': 'ns=4;s=TestReadWrite',
            'browseName': {'namespaceIndex': 0, 'name': 'TestReadWrite'},
            'displayName': {'text': 'Test Read and Write'},
            'nodeClass': 'Variable',
            'typeDefinition': 'ns=0;i=63'
          }, {
            'referenceTypeId': 'ns=0;i=47',
            'isForward': true,
            'nodeId': 'ns=4;s=free_memory',
            'browseName': {'namespaceIndex': 0, 'name': 'FreeMemory'},
            'displayName': {'text': 'Free Memory'},
            'nodeClass': 'Variable',
            'typeDefinition': 'ns=0;i=63'
          }, {
            'referenceTypeId': 'ns=0;i=47',
            'isForward': true,
            'nodeId': 'ns=4;s=Counter',
            'browseName': {'namespaceIndex': 0, 'name': 'Counter'},
            'displayName': {'text': 'Counter'},
            'nodeClass': 'Variable',
            'typeDefinition': 'ns=0;i=63'
          }, {
            'referenceTypeId': 'ns=0;i=47',
            'isForward': true,
            'nodeId': 'ns=4;s=FullCounter',
            'browseName': {'namespaceIndex': 0, 'name': 'FullCounter'},
            'displayName': {'text': 'FullCounter'},
            'nodeClass': 'Variable',
            'typeDefinition': 'ns=0;i=63'
          }, {
            'referenceTypeId': 'ns=0;i=47',
            'isForward': true,
            'nodeId': 'ns=4;i=12345',
            'browseName': {'namespaceIndex': 0, 'name': 'Bark'},
            'displayName': {'text': 'Bark'},
            'nodeClass': 'Method',
            'typeDefinition': 'ns=0;i=0'
          }])
          done()
        })
      })
    })

    it('should get a message with payload after inject with read', function (done) {
      helper.load(nodesToLoadForReader, testConnectorReadFlow, function () {
        let n2 = helper.getNode('n2cf2')
        n2.on('input', function (msg) {
          msg.should.have.property('payload', 'testpayload')
          msg.should.have.property('topic', 'TestTopicRead')
          done()
        })
      })
    })

    it('should get a message with nodeId in payload after read', function (done) {
      helper.load(nodesToLoadForReader, testConnectorReadFlow, function () {
        let n5 = helper.getNode('n5cf2')
        n5.on('input', function (msg) {
          msg.payload[0].should.have.property('nodeId', 'ns=4;s=Pressure')
          msg.should.have.property('topic', 'TestTopicRead')
          msg.should.have.property('addressSpaceItems', [{'name': '', 'nodeId': 'ns=4;s=Pressure', 'datatypeName': ''}])
          done()
        })
      })
    })

    let msgCounter = 0
    it('should get a message with payload after inject with listener', function (done) {
      helper.load(nodesToLoadForListener, testConnectorListenerFlow, function () {
        let n2 = helper.getNode('n2cf3')
        n2.on('input', function (msg) {
          msg.payload.should.have.property('options')
          msg.should.have.property('topic', 'TestTopicListen')
        })

        let n5 = helper.getNode('n5cf3')
        n5.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            msg.payload.value.should.have.property('dataType', 'Int32')
            msg.payload.statusCode.should.have.property('name', 'Good')
            msg.should.have.property('nodetype', 'listen')
            msg.should.have.property('injectType', 'subscribe')
            done()
          }
        })
      })
    })

    it('should get a message with payload after inject with write', function (done) {
      helper.load(nodesToLoadForWriter, testConnectorWriteFlow, testCredentials, function () {
        let n2 = helper.getNode('n2cf4')
        n2.on('input', function (msg) {
          msg.should.have.property('payload', 1000)
          msg.should.have.property('topic', 'TestTopicWrite')
          done()
        })
      })
    })

    it('should get a message with addressSpaceItems after write', function (done) {
      helper.load(nodesToLoadForWriter, testConnectorWriteFlow, testCredentials, function () {
        let n5 = helper.getNode('n5cf4')
        n5.on('input', function (msg) {
          msg.should.have.property('topic', 'TestTopicWrite')
          msg.should.have.property('addressSpaceItems', [{'name': 'Pressure', 'nodeId': 'ns=4;s=Pressure', 'datatypeName': 'Double'}])
          done()
        })
      })
    })

    it('should get a message with payload after inject with autoselect endpoint', function (done) {
      testConnectorWriteFlow[0].autoSelectRightEndpoint = true
      helper.load(nodesToLoadForWriter, testConnectorWriteFlow, testCredentials, function () {
        let n2 = helper.getNode('n2cf4')
        n2.on('input', function (msg) {
          msg.should.have.property('payload', 1000)
          msg.should.have.property('topic', 'TestTopicWrite')
          done()
        })
      })
    })

    it('should get a message with addressSpaceItems after write with autoselect endpoint', function (done) {
      testConnectorWriteFlow[0].autoSelectRightEndpoint = true
      helper.load(nodesToLoadForWriter, testConnectorWriteFlow, testCredentials, function () {
        let n5 = helper.getNode('n5cf4')
        n5.on('input', function (msg) {
          msg.should.have.property('topic', 'TestTopicWrite')
          msg.should.have.property('addressSpaceItems', [{'name': 'Pressure', 'nodeId': 'ns=4;s=Pressure', 'datatypeName': 'Double'}])
          done()
        })
      })
    })

    it('should get a message with payload after inject with method', function (done) {
      helper.load(nodesToLoadForMethodCaller, testConnectorMethodCallerFlow, function () {
        let n2 = helper.getNode('n2cf5')
        n2.on('input', function (msg) {
          msg.should.have.property('payload', 1000)
          msg.should.have.property('topic', 'TestTopicMethod')
          setTimeout(done, 5000)
        })
      })
    })

    it('should get a message with addressSpaceItems after method', function (done) {
      helper.load(nodesToLoadForMethodCaller, testConnectorMethodCallerFlow, function () {
        let n5 = helper.getNode('n5cf5')
        n5.on('input', function (msg) {
          msg.should.have.property('topic', 'TestTopicMethod')
          msg.should.have.property('nodetype', 'method')
          msg.should.have.property('injectType', 'inject')
          msg.should.have.property('methodType', 'basic')
          msg.should.have.property('payload', [{'statusCode': {'value': 0, 'description': 'No Error', 'name': 'Good'}, 'outputArguments': [{'dataType': 'String', 'arrayType': 'Array', 'value': ['Whaff!!!!!', 'Whaff!!!!!', 'Whaff!!!!!']}]}])
          done()
        })
      })
    })
  })
})
