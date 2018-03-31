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

// iiot opcua
var injectNode = require('../src/opcua-iiot-inject')
var functionNode = require('node-red/nodes/core/core/80-function')
var connectorNode = require('../src/opcua-iiot-connector')
var inputNode = require('../src/opcua-iiot-write')
var responseNode = require('../src/opcua-iiot-response')
var serverNode = require('../src/opcua-iiot-server')
var helper = require('node-red-contrib-test-helper')

var nodesToLoad = [injectNode, functionNode, connectorNode, inputNode, responseNode, serverNode]

var testFlowPayload = [
  {
    "id": "n1",
    "type": "OPCUA-IIoT-Inject",
    "injectType": "write",
    "payload": "12345.67",
    "payloadType": "num",
    "topic": "TestTopicWrite",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "3",
    "name": "TestReadWrite",
    "addressSpaceItems": [
      {
        "name": "TestReadWrite",
        "nodeId": "ns=4;s=TestReadWrite",
        "datatypeName": "Double"
      }
    ],
    "wires": [["n2", "n3"]]
  },
  {"id":"n2", "type":"helper"},
  {
    "id": "n3",
    "type": "function",
    "name": "",
    "func": "msg.valuesToWrite = [12345.22];\nreturn msg;",
    "outputs": 1,
    "noerr": 0,
    "wires": [["n4", "n5"]]
  },
  {"id":"n4", "type":"helper"},
  {
    "id": "n5",
    "type": "OPCUA-IIoT-Write",
    "connector": "c1",
    "name": "TestWrite",
    "justValue": true,
    "showStatusActivities": false,
    "showErrors": true,
    "wires": [["n6", "n7"]]
  },
  {
    "id": "c1",
    "type": "OPCUA-IIoT-Connector",
    "discoveryUrl": "",
    "endpoint": "opc.tcp://localhost:1972/",
    "keepSessionAlive": true,
    "loginEnabled": false,
    "securityPolicy": "None",
    "securityMode": "NONE",
    "name": "LOCAL DEMO SERVER",
    "showErrors": false,
    "publicCertificateFile": "",
    "privateKeyFile": "",
    "defaultSecureTokenLifetime": "60000",
    "endpointMustExist": false,
    "autoSelectRightEndpoint": false
  },
  {"id":"n6", "type":"helper"},
  {
    "id": "n7",
    "type": "OPCUA-IIoT-Response",
    "name": "TestWriteResponse",
    "showStatusActivities": false,
    "showErrors": false,
    "wires": [["n8"]]
  },
  {"id":"n8", "type":"helper"},
  {
    "id": "s1",
    "type": "OPCUA-IIoT-Server",
    "port": "1972",
    "endpoint": "",
    "acceptExternalCommands": true,
    "maxAllowedSessionNumber": "",
    "maxConnectionsPerEndpoint": "",
    "maxAllowedSubscriptionNumber": "",
    "alternateHostname": "",
    "name": "",
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

var testWithoutValuesToWriteFlow = [
  {
    "id": "n1",
    "type": "OPCUA-IIoT-Inject",
    "injectType": "write",
    "payload": "12345.67",
    "payloadType": "num",
    "topic": "TestTopicWrite",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "3",
    "name": "TestReadWrite",
    "addressSpaceItems": [
      {
        "name": "TestReadWrite",
        "nodeId": "ns=4;s=TestReadWrite",
        "datatypeName": "Double"
      }
    ],
    "wires": [["n2", "n3"]]
  },
  {"id":"n2", "type":"helper"},
  {
    "id": "n3",
    "type": "OPCUA-IIoT-Write",
    "connector": "c1",
    "name": "TestWrite",
    "justValue": true,
    "showStatusActivities": false,
    "showErrors": true,
    "wires": [["n4", "n5"]]
  },
  {
    "id": "c1",
    "type": "OPCUA-IIoT-Connector",
    "discoveryUrl": "",
    "endpoint": "opc.tcp://localhost:1973/",
    "keepSessionAlive": true,
    "loginEnabled": false,
    "securityPolicy": "None",
    "securityMode": "NONE",
    "name": "LOCAL DEMO SERVER",
    "showErrors": false,
    "publicCertificateFile": "",
    "privateKeyFile": "",
    "defaultSecureTokenLifetime": "60000",
    "endpointMustExist": false,
    "autoSelectRightEndpoint": false
  },
  {"id":"n4", "type":"helper"},
  {
    "id": "n5",
    "type": "OPCUA-IIoT-Response",
    "name": "TestWriteResponse",
    "showStatusActivities": false,
    "showErrors": false,
    "wires": [["n6"]]
  },
  {"id":"n6", "type":"helper"},
  {
    "id": "s1",
    "type": "OPCUA-IIoT-Server",
    "port": "1973",
    "endpoint": "",
    "acceptExternalCommands": true,
    "maxAllowedSessionNumber": "",
    "maxConnectionsPerEndpoint": "",
    "maxAllowedSubscriptionNumber": "",
    "alternateHostname": "",
    "name": "",
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

var writeNodeToBeLoaded = [
  {
    "id": "34d2c6bc.43275a",
    "type": "OPCUA-IIoT-Write",
    "connector": "d35ceb8e.d06aa8",
    "name": "TestWrite",
    "justValue": false,
    "showStatusActivities": false,
    "showErrors": true,
    "wires": [[]]
  },
  {
    "id": "d35ceb8e.d06aa8",
    "type": "OPCUA-IIoT-Connector",
    "discoveryUrl": "",
    "endpoint": "opc.tcp://localhost:2000/",
    "keepSessionAlive": true,
    "loginEnabled": false,
    "securityPolicy": "None",
    "securityMode": "NONE",
    "name": "TESTSERVER",
    "showErrors": false,
    "publicCertificateFile": "",
    "privateKeyFile": "",
    "defaultSecureTokenLifetime": "60000",
    "endpointMustExist": false,
    "autoSelectRightEndpoint": false
  }
]

describe('OPC UA Write node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Write node', function () {
    it('should be loaded', function (done) {
      helper.load([inputNode, connectorNode], writeNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('34d2c6bc.43275a')
          nodeUnderTest.should.have.property('name', 'TestWrite')
          nodeUnderTest.should.have.property('showErrors', true)
          nodeUnderTest.should.have.property('justValue', false)
          done()
        })
    })

    it('should get a message with payload', function (done) {
      this.timeout(4000)
      helper.load(nodesToLoad, testFlowPayload, function () {
        let n2 = helper.getNode("n2")
        n2.on("input", function (msg) {
          msg.should.have.property('payload', 12345.67)
          msg.should.have.property('topic', "TestTopicWrite")
          done()
        })
      })
    })

    it('should verify addressSpaceItems', function (done) {
      this.timeout(4000)
      helper.load(nodesToLoad, testFlowPayload, function () {
        let n2 = helper.getNode("n2")
        n2.on("input", function (msg) {
          msg.should.have.property('addressSpaceItems', [{
            "name": "TestReadWrite",
            "nodeId": "ns=4;s=TestReadWrite",
            "datatypeName": "Double"
          }]);
          done()
        })
      })
    })

    it('should have values to write', function (done) {
      this.timeout(4000)
      helper.load(nodesToLoad, testFlowPayload, function () {
        let n4 = helper.getNode("n4")
        n4.on("input", function (msg) {
          msg.should.have.property('addressSpaceItems', [ {
            name: 'TestReadWrite',
            nodeId: 'ns=4;s=TestReadWrite',
            datatypeName: 'Double'
          } ]);
          msg.valuesToWrite[0].should.be.equal(12345.22)
          msg.should.have.property('topic', "TestTopicWrite")
          msg.should.have.property('nodetype', "inject")
          msg.should.have.property('injectType', "write")
          done()
        })
      })
    })

    it('should have write results', function (done) {
      this.timeout(4000)
      helper.load(nodesToLoad, testFlowPayload, function () {
        let n6 = helper.getNode("n6")
        n6.on("input", function (msg) {
          msg.should.have.property('addressSpaceItems', [{
            "name": "TestReadWrite",
            "nodeId": "ns=4;s=TestReadWrite",
            "datatypeName": "Double"
          }]);
          msg.payload.should.have.property('statusCodes', [{"value":0,"description":"No Error","name":"Good"}])
          msg.should.have.property('topic', "TestTopicWrite")
          msg.should.have.property('nodetype', "write")
          msg.should.have.property('injectType', "write")
          done()
        })
      })
    })

    it('should have write results from payload without a valuesToWrite property', function (done) {
      this.timeout(4000)
      helper.load(nodesToLoad, testWithoutValuesToWriteFlow, function () {
        let n6 = helper.getNode("n6")
        n6.on("input", function (msg) {
          msg.should.have.property('addressSpaceItems', [{
            "name": "TestReadWrite",
            "nodeId": "ns=4;s=TestReadWrite",
            "datatypeName": "Double"
          }]);
          msg.payload.should.have.property('statusCodes', [{"value":0,"description":"No Error","name":"Good"}])
          msg.should.have.property('topic', "TestTopicWrite")
          msg.should.have.property('nodetype', "write")
          msg.should.have.property('injectType', "write")
          done()
        })
      })
    })

    it('should have write results with response', function (done) {
      this.timeout(4000)
      helper.load(nodesToLoad, testFlowPayload, function () {
        let n8 = helper.getNode("n8")
        n8.on("input", function (msg) {
          msg.should.have.property('entryStatus', [1, 0, 0])
          msg.should.have.property('topic', "TestTopicWrite")
          msg.should.have.property('nodetype', "write")
          msg.should.have.property('injectType', "write")
          done()
        })
      })
    })
  })
})
