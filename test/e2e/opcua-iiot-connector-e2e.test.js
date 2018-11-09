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

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

// iiot opc ua nodes
var serverNode = require('../../src/opcua-iiot-server')
var injectNode = require('../../src/opcua-iiot-inject')
var inputNode = require('../../src/opcua-iiot-connector')
// services
var readNode = require('../../src/opcua-iiot-read')
var writeNode = require('../../src/opcua-iiot-write')
var browserNode = require('../../src/opcua-iiot-browser')
var listenerNode = require('../../src/opcua-iiot-listener')
var methodCallerNode = require('../../src/opcua-iiot-method-caller')

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
    'startDelay': '3',
    'name': 'TestInject',
    'addressSpaceItems': [],
    'wires': [['n2cf1', 'n3cf1']]
  },
  {id: 'n2cf1', type: 'helper'},
  {
    'id': 'n3cf1',
    'type': 'OPCUA-IIoT-Browser',
    'connector': 'c1cf1',
    'nodeId': 'ns=1;i=1234',
    'name': 'TestBrowser',
    'justValue': true,
    'recursiveBrowse': false,
    'recursiveDepth': 1,
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
    'endpoint': 'opc.tcp://localhost:51962/',
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
    'port': '51962',
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
    'startDelay': '3',
    'name': '',
    'addressSpaceItems': [
      {
        'name': '',
        'nodeId': 'ns=1;s=Pressure',
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
    'endpoint': 'opc.tcp://localhost:51980/',
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
    'port': '51980',
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

var testConnectorListenerFlow = [
  {
    'id': 'n1cf3',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': '{"interval":250,"queueSize":1,"options":{"requestedPublishingInterval":500,"requestedLifetimeCount":10,"requestedMaxKeepAliveCount":10,"maxNotificationsPerPublish":10,"publishingEnabled":true,"priority":1}}',
    'payloadType': 'json',
    'topic': 'TestTopicListen',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'TestListen',
    'addressSpaceItems': [
      {
        'name': '',
        'nodeId': 'ns=1;s=FullCounter',
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
    'endpoint': 'opc.tcp://localhost:51981/',
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
    'port': '51981',
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
    'startDelay': '4',
    'name': '',
    'addressSpaceItems': [
      {
        'name': 'Pressure',
        'nodeId': 'ns=1;s=Pressure',
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
    'endpoint': 'opc.tcp://localhost:51982/',
    'keepSessionAlive': false,
    'loginEnabled': false,
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
    'port': '51982',
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
    'startDelay': '3',
    'name': 'TestInject',
    'addressSpaceItems': [],
    'wires': [['n2cf5', 'n3cf5']]
  },
  {id: 'n2cf5', type: 'helper'},
  {
    'id': 'n3cf5',
    'type': 'OPCUA-IIoT-Method-Caller',
    'connector': 'c1cf5',
    'objectId': 'ns=1;i=1234',
    'methodId': 'ns=1;i=12345',
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
    'endpoint': 'opc.tcp://localhost:51983/',
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
    'port': '51983',
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

var testConnectorHTTPFlow = [
  {
    'id': 'n1cf6',
    'type': 'OPCUA-IIoT-Method-Caller',
    'connector': 'c1cf6',
    'objectId': 'ns=1;i=1234',
    'methodId': 'ns=1;i=12345',
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
    'endpoint': 'opc.tcp://localhost:51991/',
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
    'port': '51991',
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

describe('OPC UA Connector node e2e Testing', function () {
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

  describe('Connector node', function () {
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
          expect(msg.payload).toBe('testpayload')
          setTimeout(done, 3000)
        })
      })
    })

    it('should get a message with topic after browse', function (done) {
      testConnectorBrowseFlow[3].port = 51963
      testConnectorBrowseFlow[5].endpoint = 'opc.tcp://localhost:51963/'
      helper.load(nodesToLoadForBrowser, testConnectorBrowseFlow, function () {
        let n5 = helper.getNode('n5cf1')
        n5.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicBrowse')
          done()
        })
      })
    })

    it('should get a message with rootNodeId after browse', function (done) {
      testConnectorBrowseFlow[3].port = 56219
      testConnectorBrowseFlow[5].endpoint = 'opc.tcp://localhost:56219/'
      helper.load(nodesToLoadForBrowser, testConnectorBrowseFlow, function () {
        let n5 = helper.getNode('n5cf1')
        n5.on('input', function (msg) {
          expect(msg.payload.rootNodeId).toBe('ns=1;i=1234')
          done()
        })
      })
    })

    it('should get a message with browserResults in payload after browse', function (done) {
      helper.load(nodesToLoadForBrowser, testConnectorBrowseFlow, function () {
        let n5 = helper.getNode('n5cf1')
        n5.on('input', function (msg) {
          expect(msg.payload.rootNodeId).toBe('ns=1;i=1234')
          expect(msg.payload.browserResults).toMatchObject([ { nodeId: 'ns=1;s=Pressure',
            browseName: '1:Pressure',
            displayName: 'locale=null text=Pressure',
            nodeClass: 'Variable',
            datatypeName: 'ns=0;i=63' },
          { nodeId: 'ns=1;s=Matrix',
            browseName: '1:Matrix',
            displayName: 'locale=null text=Matrix',
            nodeClass: 'Variable',
            datatypeName: 'ns=0;i=63' },
          { nodeId: 'ns=1;s=Position',
            browseName: '1:Position',
            displayName: 'locale=null text=Position',
            nodeClass: 'Variable',
            datatypeName: 'ns=0;i=63' },
          { nodeId: 'ns=1;s=PumpSpeed',
            browseName: '1:PumpSpeed',
            displayName: 'locale=en-US text=Pump Speed',
            nodeClass: 'Variable',
            datatypeName: 'ns=0;i=63' },
          { nodeId: 'ns=1;s=SomeDate',
            browseName: '1:SomeDate',
            displayName: 'locale=en-US text=Some Date',
            nodeClass: 'Variable',
            datatypeName: 'ns=0;i=63' },
          { nodeId: 'ns=1;s=MultiLanguageText',
            browseName: '1:MultiLanguageText',
            displayName: 'locale=en-US text=Multi Language Text',
            nodeClass: 'Variable',
            datatypeName: 'ns=0;i=63' },
          { nodeId: 'ns=1;s=FanSpeed',
            browseName: '1:FanSpeed',
            displayName: 'locale=null text=FanSpeed',
            nodeClass: 'Variable',
            datatypeName: 'ns=0;i=63' },
          { nodeId: 'ns=1;s=TemperatureAnalogItem',
            browseName: '1:TemperatureAnalogItem',
            displayName: 'locale=null text=TemperatureAnalogItem',
            nodeClass: 'Variable',
            datatypeName: 'ns=0;i=2368' },
          { nodeId: 'ns=1;i=16479',
            browseName: '1:MyVariable1',
            displayName: 'locale=null text=MyVariable1',
            nodeClass: 'Variable',
            datatypeName: 'ns=0;i=63' },
          { nodeId: 'ns=1;b=1020ffaa',
            browseName: '1:MyVariable2',
            displayName: 'locale=null text=MyVariable2',
            nodeClass: 'Variable',
            datatypeName: 'ns=0;i=63' },
          { nodeId: 'ns=1;s=TestReadWrite',
            browseName: '1:TestReadWrite',
            displayName: 'locale=null text=Test Read and Write',
            nodeClass: 'Variable',
            datatypeName: 'ns=0;i=63' },
          { nodeId: 'ns=1;s=free_memory',
            browseName: '1:FreeMemory',
            displayName: 'locale=en-US text=Free Memory',
            nodeClass: 'Variable',
            datatypeName: 'ns=0;i=63' },
          { nodeId: 'ns=1;s=Counter',
            browseName: '1:Counter',
            displayName: 'locale=null text=Counter',
            nodeClass: 'Variable',
            datatypeName: 'ns=0;i=63' },
          { nodeId: 'ns=1;s=FullCounter',
            browseName: '1:FullCounter',
            displayName: 'locale=null text=FullCounter',
            nodeClass: 'Variable',
            datatypeName: 'ns=0;i=63' },
          { nodeId: 'ns=1;i=12345',
            browseName: '1:Bark',
            displayName: 'locale=null text=Bark',
            nodeClass: 'Method',
            datatypeName: 'ns=0;i=0' } ])
          done()
        })
      })
    })

    it('should get a message with payload after inject with read', function (done) {
      testConnectorReadFlow[3].port = 56220
      testConnectorReadFlow[5].endpoint = 'opc.tcp://localhost:56220/'
      helper.load(nodesToLoadForReader, testConnectorReadFlow, function () {
        let n2 = helper.getNode('n2cf2')
        n2.on('input', function (msg) {
          expect(msg.payload).toBe('testpayload')
          expect(msg.topic).toBe('TestTopicRead')
          setTimeout(done, 3000)
        })
      })
    })

    it('should get a message with nodeId in payload after read', function (done) {
      testConnectorReadFlow[3].port = 56221
      testConnectorReadFlow[5].endpoint = 'opc.tcp://localhost:56221/'
      helper.load(nodesToLoadForReader, testConnectorReadFlow, function () {
        let n5 = helper.getNode('n5cf2')
        n5.on('input', function (msg) {
          expect(msg.payload[0].nodeId).toBe('ns=1;s=Pressure')
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.addressSpaceItems).toMatchObject([{'name': '', 'nodeId': 'ns=1;s=Pressure', 'datatypeName': ''}])
          done()
        })
      })
    })

    let msgCounter = 0
    it('should get a message with payload after inject with listener', function (done) {
      helper.load(nodesToLoadForListener, testConnectorListenerFlow, function () {
        let n2 = helper.getNode('n2cf3')
        n2.on('input', function (msg) {
          expect(msg.payload.options).toBeDefined()
          expect(msg.topic).toBe('TestTopicListen')
        })

        let n5 = helper.getNode('n5cf3')
        n5.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.value.dataType).toBe('Int32')
            expect(msg.payload.statusCode.name).toBe('Good')
            expect(msg.nodetype).toBe('listen')
            expect(msg.injectType).toBe('subscribe')
            done()
          }
        })
      })
    })

    it('should get a message with addressSpaceItems after write', function (done) {
      testConnectorWriteFlow[3].endpoint = 'opc.tcp://localhost:56442/'
      testConnectorWriteFlow[3].credentials = {user: 'peter', password: 'peter'}
      testConnectorWriteFlow[5].port = 56442
      helper.load(nodesToLoadForWriter, testConnectorWriteFlow, testCredentials, function () {
        let n5 = helper.getNode('n5cf4')
        n5.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicWrite')
          expect(msg.addressSpaceItems).toMatchObject([{'name': 'Pressure', 'nodeId': 'ns=1;s=Pressure', 'datatypeName': 'Double'}])
          done()
        })
      })
    })

    it('should get a message with addressSpaceItems after write with autoselect endpoint', function (done) {
      testConnectorWriteFlow[3].autoSelectRightEndpoint = true
      testConnectorWriteFlow[3].credentials = {user: 'peter', password: 'peter'}
      helper.load(nodesToLoadForWriter, testConnectorWriteFlow, testCredentials, function () {
        let n5 = helper.getNode('n5cf4')
        n5.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicWrite')
          expect(msg.addressSpaceItems).toMatchObject([{'name': 'Pressure', 'nodeId': 'ns=1;s=Pressure', 'datatypeName': 'Double'}])
          done()
        })
      })
    })

    it('should get a message with payload after inject with method', function (done) {
      testConnectorMethodCallerFlow[3].endpoint = 'opc.tcp://localhost:56446/'
      testConnectorMethodCallerFlow[5].port = 56446
      helper.load(nodesToLoadForMethodCaller, testConnectorMethodCallerFlow, function () {
        let n2 = helper.getNode('n2cf5')
        n2.on('input', function (msg) {
          expect(msg.payload).toBe(1000)
          expect(msg.topic).toBe('TestTopicMethod')
          setTimeout(done, 3000)
        })
      })
    })

    it('should get a message with addressSpaceItems after method', function (done) {
      helper.load(nodesToLoadForMethodCaller, testConnectorMethodCallerFlow, function () {
        let n5 = helper.getNode('n5cf5')
        n5.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicMethod')
          expect(msg.nodetype).toBe('method')
          expect(msg.injectType).toBe('inject')
          expect(msg.methodType).toBe('basic')
          expect(msg.payload).toMatchObject([{'statusCode': {'value': 0, 'description': 'No Error', 'name': 'Good'}, 'outputArguments': [{'dataType': 'String', 'arrayType': 'Array', 'value': ['Whaff!!!!!', 'Whaff!!!!!', 'Whaff!!!!!']}]}])
          done()
        })
      })
    })
  })
})
