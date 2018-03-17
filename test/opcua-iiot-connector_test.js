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

var assert = require('chai').assert
var helper = require('./helper.js')

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

var testBrowserFlowPayload = [
  {
    "id": "n1",
    "type": "OPCUA-IIoT-Inject",
    "injectType": "inject",
    "payload": "testpayload",
    "payloadType": "str",
    "topic": "",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "3.3",
    "name": "TestInject",
    "addressSpaceItems": [],
    "wires": [["n2", "n3"]]
  },
  {id:"n2", type:"helper"},
  {
    "id": "n3",
    "type": "OPCUA-IIoT-Browser",
    "connector": "n4",
    "nodeId": "ns=4;i=1234",
    "name": "TestBrowser",
    "justValue": true,
    "sendNodesToRead": false,
    "sendNodesToListener": false,
    "showStatusActivities": false,
    "showErrors": false,
    "wires": [["n5"]]
  },
  {
    "id": "n4",
    "type": "OPCUA-IIoT-Connector",
    "discoveryUrl": "",
    "endpoint": "opc.tcp://localhost:1979/",
    "keepSessionAlive": true,
    "loginEnabled": false,
    "securityPolicy": "None",
    "securityMode": "NONE",
    "name": "TESTSERVER",
    "showStatusActivities": false,
    "showErrors": false,
    "publicCertificateFile": "",
    "privateKeyFile": "",
    "defaultSecureTokenLifetime": "60000",
    "endpointMustExist": false,
    "autoSelectRightEndpoint": false
  },
  {id:"n5", type:"helper"},
  {
    "id": "n6",
    "type": "OPCUA-IIoT-Server",
    "port": "1979",
    "endpoint": "",
    "acceptExternalCommands": true,
    "maxAllowedSessionNumber": "",
    "maxConnectionsPerEndpoint": "",
    "maxAllowedSubscriptionNumber": "",
    "alternateHostname": "",
    "name": "TestServer",
    "showStatusActivities": false,
    "showErrors": false,
    "asoDemo": true,
    "allowAnonymous": true,
    "isAuditing": false,
    "serverDiscovery": true,
    "users": [],
    "xmlsets": [],
    "publicCertificateFile": "",
    "privateCertificateFile": "",
    "maxNodesPerRead": 1000,
    "maxNodesPerBrowse": 2000,
    "wires": [[]]
  }
]


var testReadFlowPayload = [
  {
    "id": "n1",
    "type": "OPCUA-IIoT-Inject",
    "injectType": "read",
    "payload": "testpayload",
    "payloadType": "str",
    "topic": "TestTopicRead",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "3",
    "name": "",
    "addressSpaceItems": [
      {
        "name": "",
        "nodeId": "ns=4;s=Pressure",
        "datatypeName": ""
      }
    ],
    "wires": [["n2", "n3"]]
  },
  {id:"n2", type:"helper"},
  {
    "id": "n3",
    "type": "OPCUA-IIoT-Read",
    "attributeId": 0,
    "maxAge": 1,
    "depth": 1,
    "connector": "n4",
    "name": "TestRead",
    "justValue": true,
    "showStatusActivities": false,
    "showErrors": false,
    "parseStrings": false,
    "wires": [["n5"]]
  },
  {
    "id": "n4",
    "type": "OPCUA-IIoT-Connector",
    "discoveryUrl": "",
    "endpoint": "opc.tcp://localhost:1980/",
    "keepSessionAlive": true,
    "loginEnabled": false,
    "securityPolicy": "None",
    "securityMode": "NONE",
    "name": "TESTSERVER",
    "showStatusActivities": false,
    "showErrors": false,
    "publicCertificateFile": "",
    "privateKeyFile": "",
    "defaultSecureTokenLifetime": "60000",
    "endpointMustExist": false,
    "autoSelectRightEndpoint": false
  },
  {id:"n5", type:"helper"},
  {
    "id": "n6",
    "type": "OPCUA-IIoT-Server",
    "port": "1980",
    "endpoint": "",
    "acceptExternalCommands": true,
    "maxAllowedSessionNumber": "",
    "maxConnectionsPerEndpoint": "",
    "maxAllowedSubscriptionNumber": "",
    "alternateHostname": "",
    "name": "TestServer",
    "showStatusActivities": false,
    "showErrors": false,
    "asoDemo": true,
    "allowAnonymous": true,
    "isAuditing": false,
    "serverDiscovery": true,
    "users": [],
    "xmlsets": [],
    "publicCertificateFile": "",
    "privateCertificateFile": "",
    "maxNodesPerRead": 1000,
    "maxNodesPerBrowse": 2000,
    "wires": [[]]
  }
]

var testListenerFlowPayload = [
  {
    "id": "n1",
    "type": "OPCUA-IIoT-Inject",
    "injectType": "listen",
    "payload": "{\"interval\":1000,\"queueSize\":1,\"options\":{\"requestedPublishingInterval\":2000,\"requestedLifetimeCount\":60,\"requestedMaxKeepAliveCount\":10,\"maxNotificationsPerPublish\":4,\"publishingEnabled\":true,\"priority\":1}}",
    "payloadType": "json",
    "topic": "TestTopicListen",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "3.4",
    "name": "",
    "addressSpaceItems": [
      {
        "name": "",
        "nodeId": "ns=4;s=Pressure",
        "datatypeName": ""
      }
    ],
    "wires": [["n2", "n3"]]
  },
  {id:"n2", type:"helper"},
  {
    "id": "n3",
    "type": "OPCUA-IIoT-Listener",
    "connector": "n4",
    "action": "subscribe",
    "queueSize": 10,
    "name": "TestListener",
    "justValue": true,
    "showStatusActivities": false,
    "showErrors": false,
    "wires": [["n5"]]
  },
  {
    "id": "n4",
    "type": "OPCUA-IIoT-Connector",
    "discoveryUrl": "",
    "endpoint": "opc.tcp://localhost:1981/",
    "keepSessionAlive": true,
    "loginEnabled": false,
    "securityPolicy": "None",
    "securityMode": "NONE",
    "name": "TESTSERVER",
    "showStatusActivities": false,
    "showErrors": false,
    "publicCertificateFile": "",
    "privateKeyFile": "",
    "defaultSecureTokenLifetime": "60000",
    "endpointMustExist": false,
    "autoSelectRightEndpoint": false
  },
  {id:"n5", type:"helper"},
  {
    "id": "n6",
    "type": "OPCUA-IIoT-Server",
    "port": "1981",
    "endpoint": "",
    "acceptExternalCommands": true,
    "maxAllowedSessionNumber": "",
    "maxConnectionsPerEndpoint": "",
    "maxAllowedSubscriptionNumber": "",
    "alternateHostname": "",
    "name": "TestServer",
    "showStatusActivities": false,
    "showErrors": false,
    "asoDemo": true,
    "allowAnonymous": true,
    "isAuditing": false,
    "serverDiscovery": true,
    "users": [],
    "xmlsets": [],
    "publicCertificateFile": "",
    "privateCertificateFile": "",
    "maxNodesPerRead": 1000,
    "maxNodesPerBrowse": 2000,
    "wires": [[]]
  }
]

var testWriteFlowPayload = [
  {
    "id": "n1",
    "type": "OPCUA-IIoT-Inject",
    "injectType": "write",
    "payload": "1000",
    "payloadType": "num",
    "topic": "TestTopicWrite",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "3",
    "name": "",
    "addressSpaceItems": [
      {
        "name": "Pressure",
        "nodeId": "ns=4;s=Pressure",
        "datatypeName": "Double"
      }
    ],
    "wires": [["n2", "n3"]]
  },
  {id:"n2", type:"helper"},
  {
    "id": "n3",
    "type": "OPCUA-IIoT-Write",
    "connector": "n4",
    "name": "TestWrite",
    "justValue": true,
    "showStatusActivities": false,
    "showErrors": false,
    "wires": [["n5"]]
  },
  {
    "id": "n4",
    "type": "OPCUA-IIoT-Connector",
    "discoveryUrl": "",
    "endpoint": "opc.tcp://localhost:1982/",
    "keepSessionAlive": true,
    "loginEnabled": false,
    "securityPolicy": "None",
    "securityMode": "NONE",
    "name": "TESTSERVER",
    "showStatusActivities": false,
    "showErrors": false,
    "publicCertificateFile": "",
    "privateKeyFile": "",
    "defaultSecureTokenLifetime": "60000",
    "endpointMustExist": false,
    "autoSelectRightEndpoint": false
  },
  {id:"n5", type:"helper"},
  {
    "id": "n6",
    "type": "OPCUA-IIoT-Server",
    "port": "1982",
    "endpoint": "",
    "acceptExternalCommands": true,
    "maxAllowedSessionNumber": "",
    "maxConnectionsPerEndpoint": "",
    "maxAllowedSubscriptionNumber": "",
    "alternateHostname": "",
    "name": "TestServer",
    "showStatusActivities": false,
    "showErrors": false,
    "asoDemo": true,
    "allowAnonymous": true,
    "isAuditing": false,
    "serverDiscovery": true,
    "users": [],
    "xmlsets": [],
    "publicCertificateFile": "",
    "privateCertificateFile": "",
    "maxNodesPerRead": 1000,
    "maxNodesPerBrowse": 2000,
    "wires": [[]]
  }
]

var testMethodCallerFlowPayload = [
  {
    "id": "n1",
    "type": "OPCUA-IIoT-Inject",
    "injectType": "inject",
    "payload": "1000",
    "payloadType": "num",
    "topic": "TestTopicMethod",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "3",
    "name": "TestInject",
    "addressSpaceItems": [],
    "wires": [["n2", "n3"]]
  },
  {id:"n2", type:"helper"},
  {
    "id": "n3",
    "type": "OPCUA-IIoT-Method-Caller",
    "connector": "n4",
    "objectId": "ns=4;i=1234",
    "methodId": "ns=4;i=12345",
    "methodType": "basic",
    "value": "",
    "justValue": true,
    "name": "TestMethodBark",
    "showStatusActivities": false,
    "showErrors": false,
    "inputArguments": [
      {
        "name": "barks",
        "dataType": "UInt32",
        "value": "3"
      },
      {
        "name": "volume",
        "dataType": "UInt32",
        "value": "6"
      }
    ],
    "wires": [["n5"]]
  },
  {
    "id": "n4",
    "type": "OPCUA-IIoT-Connector",
    "discoveryUrl": "",
    "endpoint": "opc.tcp://localhost:1983/",
    "keepSessionAlive": true,
    "loginEnabled": false,
    "securityPolicy": "None",
    "securityMode": "NONE",
    "name": "TESTSERVER",
    "showStatusActivities": false,
    "showErrors": false,
    "publicCertificateFile": "",
    "privateKeyFile": "",
    "defaultSecureTokenLifetime": "60000",
    "endpointMustExist": false,
    "autoSelectRightEndpoint": false
  },
  {id:"n5", type:"helper"},
  {
    "id": "n6",
    "type": "OPCUA-IIoT-Server",
    "port": "1983",
    "endpoint": "",
    "acceptExternalCommands": true,
    "maxAllowedSessionNumber": "",
    "maxConnectionsPerEndpoint": "",
    "maxAllowedSubscriptionNumber": "",
    "alternateHostname": "",
    "name": "TestServer",
    "showStatusActivities": false,
    "showErrors": false,
    "asoDemo": true,
    "allowAnonymous": true,
    "isAuditing": false,
    "serverDiscovery": true,
    "users": [],
    "xmlsets": [],
    "publicCertificateFile": "",
    "privateCertificateFile": "",
    "maxNodesPerRead": 1000,
    "maxNodesPerBrowse": 2000,
    "wires": [[]]
  }
]

describe('OPC UA Connector node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Connector node', function () {
    it('should be loaded', function (done) {
      helper.load([inputNode], [
          {
            "id": "n4",
            "type": "OPCUA-IIoT-Connector",
            "discoveryUrl": "opc.tcp://localhost:4840/",
            "endpoint": "opc.tcp://localhost:1979/",
            "keepSessionAlive": true,
            "loginEnabled": false,
            "securityPolicy": "None",
            "securityMode": "NONE",
            "name": "TESTSERVER",
            "showStatusActivities": false,
            "showErrors": false,
            "publicCertificateFile": "",
            "privateKeyFile": "",
            "defaultSecureTokenLifetime": "60000",
            "endpointMustExist": false,
            "autoSelectRightEndpoint": false
          }
        ],
        function () {
          let n4 = helper.getNode("n4")
          n4.should.have.property('name', 'TESTSERVER')
          n4.should.have.property('discoveryUrl', 'opc.tcp://localhost:4840/')
          n4.should.have.property('endpoint', 'opc.tcp://localhost:1979/')
          n4.should.have.property('securityPolicy', 'None')
          n4.should.have.property('messageSecurityMode', 'NONE')
          n4.should.have.property('publicCertificateFile', null)
          n4.should.have.property('privateKeyFile', null)
          done()
        })
    })
  })

  describe('Connector node with browser', function () {
    it('should get a message with payload after inject', function(done) {
      this.timeout(5000)
      helper.load(nodesToLoadForBrowser, testBrowserFlowPayload, function() {
        let n2 = helper.getNode("n2")
        n2.on("input", function(msg) {
          msg.should.have.property('payload', 'testpayload')
          done()
        })
      })
    })

    it('should get a message with browseTopic in payload after browse', function(done) {
      this.timeout(5000)
      helper.load(nodesToLoadForBrowser, testBrowserFlowPayload, function() {
        let n5 = helper.getNode("n5")
        n5.on("input", function (msg) {
          msg.payload.should.have.property('browseTopic', "ns=4;i=1234")
          done()
        })
      })
    })

    it('should get a message with browserItems in payload after browse', function(done) {
      this.timeout(5000)
      helper.load(nodesToLoadForBrowser, testBrowserFlowPayload, function() {
        let n5 = helper.getNode("n5")
        n5.on("input", function (msg) {
          msg.payload.should.have.property('browserItems', [{
            "referenceTypeId": "ns=0;i=35",
            "isForward": true,
            "nodeId": "ns=4;s=Pressure",
            "browseName": {"namespaceIndex": 0, "name": "Pressure"},
            "displayName": {"text": "Pressure"},
            "nodeClass": "Variable",
            "typeDefinition": "ns=0;i=63"
          }, {
            "referenceTypeId": "ns=0;i=35",
            "isForward": true,
            "nodeId": "ns=4;s=Matrix",
            "browseName": {"namespaceIndex": 0, "name": "Matrix"},
            "displayName": {"text": "Matrix"},
            "nodeClass": "Variable",
            "typeDefinition": "ns=0;i=63"
          }, {
            "referenceTypeId": "ns=0;i=35",
            "isForward": true,
            "nodeId": "ns=4;s=Position",
            "browseName": {"namespaceIndex": 0, "name": "Position"},
            "displayName": {"text": "Position"},
            "nodeClass": "Variable",
            "typeDefinition": "ns=0;i=63"
          }, {
            "referenceTypeId": "ns=0;i=35",
            "isForward": true,
            "nodeId": "ns=4;s=PumpSpeed",
            "browseName": {"namespaceIndex": 0, "name": "PumpSpeed"},
            "displayName": {"text": "Pump Speed"},
            "nodeClass": "Variable",
            "typeDefinition": "ns=0;i=63"
          }, {
            "referenceTypeId": "ns=0;i=35",
            "isForward": true,
            "nodeId": "ns=4;s=SomeDate",
            "browseName": {"namespaceIndex": 0, "name": "SomeDate"},
            "displayName": {"text": "Some Date"},
            "nodeClass": "Variable",
            "typeDefinition": "ns=0;i=63"
          }, {
            "referenceTypeId": "ns=0;i=35",
            "isForward": true,
            "nodeId": "ns=4;s=MultiLanguageText",
            "browseName": {"namespaceIndex": 0, "name": "MultiLanguageText"},
            "displayName": {"text": "Multi Language Text"},
            "nodeClass": "Variable",
            "typeDefinition": "ns=0;i=63"
          }, {
            "referenceTypeId": "ns=0;i=35",
            "isForward": true,
            "nodeId": "ns=4;s=FanSpeed",
            "browseName": {"namespaceIndex": 0, "name": "FanSpeed"},
            "displayName": {"text": "FanSpeed"},
            "nodeClass": "Variable",
            "typeDefinition": "ns=0;i=63"
          }, {
            "referenceTypeId": "ns=0;i=35",
            "isForward": true,
            "nodeId": "ns=1;s=TemperatureAnalogItem",
            "browseName": {"namespaceIndex": 0, "name": "TemperatureAnalogItem"},
            "displayName": {"text": "TemperatureAnalogItem"},
            "nodeClass": "Variable",
            "typeDefinition": "ns=0;i=2368"
          }, {
            "referenceTypeId": "ns=0;i=47",
            "isForward": true,
            "nodeId": "ns=4;i=16479",
            "browseName": {"namespaceIndex": 0, "name": "MyVariable1"},
            "displayName": {"text": "MyVariable1"},
            "nodeClass": "Variable",
            "typeDefinition": "ns=0;i=63"
          }, {
            "referenceTypeId": "ns=0;i=47",
            "isForward": true,
            "nodeId": "ns=4;b=1020ffaa",
            "browseName": {"namespaceIndex": 0, "name": "MyVariable2"},
            "displayName": {"text": "MyVariable2"},
            "nodeClass": "Variable",
            "typeDefinition": "ns=0;i=63"
          }, {
            "referenceTypeId": "ns=0;i=47",
            "isForward": true,
            "nodeId": "ns=4;s=TestReadWrite",
            "browseName": {"namespaceIndex": 0, "name": "TestReadWrite"},
            "displayName": {"text": "Test Read and Write"},
            "nodeClass": "Variable",
            "typeDefinition": "ns=0;i=63"
          }, {
            "referenceTypeId": "ns=0;i=47",
            "isForward": true,
            "nodeId": "ns=4;s=free_memory",
            "browseName": {"namespaceIndex": 0, "name": "FreeMemory"},
            "displayName": {"text": "Free Memory"},
            "nodeClass": "Variable",
            "typeDefinition": "ns=0;i=63"
          }, {
            "referenceTypeId": "ns=0;i=47",
            "isForward": true,
            "nodeId": "ns=4;s=Counter",
            "browseName": {"namespaceIndex": 0, "name": "Counter"},
            "displayName": {"text": "Counter"},
            "nodeClass": "Variable",
            "typeDefinition": "ns=0;i=63"
          }, {
            "referenceTypeId": "ns=0;i=47",
            "isForward": true,
            "nodeId": "ns=4;s=FullCounter",
            "browseName": {"namespaceIndex": 0, "name": "FullCounter"},
            "displayName": {"text": "FullCounter"},
            "nodeClass": "Variable",
            "typeDefinition": "ns=0;i=63"
          }, {
            "referenceTypeId": "ns=0;i=47",
            "isForward": true,
            "nodeId": "ns=4;i=12345",
            "browseName": {"namespaceIndex": 0, "name": "Bark"},
            "displayName": {"text": "Bark"},
            "nodeClass": "Method",
            "typeDefinition": "ns=0;i=0"
          }])
          done()
        })
      })
    })
  })

  describe('Connector node with read', function () {
    it('should get a message with payload after inject', function(done) {
      this.timeout(5000)
      helper.load(nodesToLoadForReader, testReadFlowPayload, function() {
        let n2 = helper.getNode("n2")
        n2.on("input", function(msg) {
          msg.should.have.property('payload', 'testpayload')
          msg.should.have.property('topic', "TestTopicRead")
          done()
        })
      })
    })

    it('should get a message with nodeId in payload after read', function(done) {
      this.timeout(5000)
      helper.load(nodesToLoadForReader, testReadFlowPayload, function() {
        let n5 = helper.getNode("n5")
        n5.on("input", function (msg) {
          msg.payload[0].should.have.property('nodeId', "ns=4;s=Pressure")
          msg.should.have.property('topic', "TestTopicRead")
          done()
        })
      })
    })

    it('should get a message with addressSpaceItems after read', function(done) {
      this.timeout(5000)
      helper.load(nodesToLoadForReader, testReadFlowPayload, function() {
        let n5 = helper.getNode("n5")
        n5.on("input", function (msg) {
          msg.should.have.property('addressSpaceItems', [{"name":"","nodeId":"ns=4;s=Pressure","datatypeName":""}])
          done()
        })
      })
    })
  })

  describe('Connector node with listener', function () {
    it('should get a message with payload after inject', function(done) {
      this.timeout(5000)
      helper.load(nodesToLoadForListener, testListenerFlowPayload, function() {
        let n2 = helper.getNode("n2")
        n2.on("input", function(msg) {
          msg.payload.should.have.property('options')
          msg.should.have.property('topic', "TestTopicListen")
          done()
        })
      })
    })

    it('should get a message with nodeId in payload after listen', function(done) {
      this.timeout(6000)
      helper.load(nodesToLoadForListener, testListenerFlowPayload, function() {
        let n5 = helper.getNode("n5")
        n5.on("input", function (msg) {
          msg.payload.value.should.have.property('dataType', 'Double')
          msg.payload.statusCode.should.have.property('name', 'Good')
          msg.should.have.property('nodetype', "listen")
          msg.should.have.property('injectType', "subscribe")
          done()
        })
      })
    })

    it('should get a message with addressSpaceItems after listen', function(done) {
      this.timeout(6000)
      helper.load(nodesToLoadForListener, testListenerFlowPayload, function() {
        let n5 = helper.getNode("n5")
        n5.on("input", function (msg) {
          msg.should.have.property('addressSpaceItems', [{"name":"","nodeId":"ns=4;s=Pressure","datatypeName":""}])
          done()
        })
      })
    })
  })

  describe('Connector node with write', function () {
    it('should get a message with payload after inject', function(done) {
      this.timeout(5000)
      helper.load(nodesToLoadForWriter, testWriteFlowPayload, function() {
        let n2 = helper.getNode("n2")
        n2.on("input", function(msg) {
          msg.should.have.property('payload', 1000)
          msg.should.have.property('topic', "TestTopicWrite")
          done()
        })
      })
    })

    it('should get a message with nodeId in payload after write', function(done) {
      this.timeout(5000)
      helper.load(nodesToLoadForWriter, testWriteFlowPayload, function() {
        let n5 = helper.getNode("n5")
        n5.on("input", function (msg) {
          msg.should.have.property('topic', "TestTopicWrite")
          done()
        })
      })
    })

    it('should get a message with addressSpaceItems after write', function(done) {
      this.timeout(5000)
      helper.load(nodesToLoadForWriter, testWriteFlowPayload, function() {
        let n5 = helper.getNode("n5")
        n5.on("input", function (msg) {
          msg.should.have.property('addressSpaceItems', [{"name":"Pressure","nodeId":"ns=4;s=Pressure","datatypeName":"Double"}])
          done()
        })
      })
    })
  })

  describe('Connector node with method', function () {
    it('should get a message with payload after inject', function(done) {
      this.timeout(5000)
      helper.load(nodesToLoadForMethodCaller, testMethodCallerFlowPayload, function() {
        let n2 = helper.getNode("n2")
        n2.on("input", function(msg) {
          msg.should.have.property('payload', 1000)
          msg.should.have.property('topic', "TestTopicMethod")
          done()
        })
      })
    })

    it('should get a message with nodeId in payload after method', function(done) {
      this.timeout(5000)
      helper.load(nodesToLoadForMethodCaller, testMethodCallerFlowPayload, function() {
        let n5 = helper.getNode("n5")
        n5.on("input", function (msg) {
          msg.should.have.property('topic', "TestTopicMethod")
          done()
        })
      })
    })

    it('should get a message with addressSpaceItems after method', function(done) {
      this.timeout(5000)
      helper.load(nodesToLoadForMethodCaller, testMethodCallerFlowPayload, function() {
        let n5 = helper.getNode("n5")
        n5.on("input", function (msg) {
          msg.should.have.property('nodetype', "method")
          msg.should.have.property('injectType', "inject")
          msg.should.have.property('methodType', "basic")
          msg.should.have.property('payload', [{"statusCode":{"value":0,"description":"No Error","name":"Good"},"outputArguments":[{"dataType":"String","arrayType":"Array","value":["Whaff!!!!!","Whaff!!!!!","Whaff!!!!!"]}]}])
          done()
        })
      })
    })
  })
})
