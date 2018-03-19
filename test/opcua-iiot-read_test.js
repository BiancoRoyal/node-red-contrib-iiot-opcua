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
var connectorNode = require('../src/opcua-iiot-connector')
var inputNode = require('../src/opcua-iiot-read')
var responseNode = require('../src/opcua-iiot-response')
var serverNode = require('../src/opcua-iiot-server')
var helper = require('node-red-contrib-test-helper')

var nodesToLoad = [injectNode, connectorNode, inputNode, responseNode, serverNode]

var testFlowPayload = [
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
    "startDelay": "3.3",
    "name": "TestName",
    "addressSpaceItems": [
      {
        "name": "ServerStatus",
        "nodeId": "ns=0;i=2256",
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
    "connector": "n7",
    "name": "ReadAll",
    "justValue": true,
    "showStatusActivities": false,
    "showErrors": false,
    "parseStrings": false,
    "wires": [["n4", "n5"]]
  },
  {id:"n4", type:"helper"},
  {
    "id": "n5",
    "type": "OPCUA-IIoT-Response",
    "name": "TestResponse",
    "showStatusActivities": false,
    "showErrors": false,
    "wires": [["n6"]]
  },
  {id:"n6", type:"helper"},
  {
    "id": "n7",
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
  {
    "id": "n8",
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

var readNodeToBeLoaded = [
  {
    "id": "41cb29d.1ab50d8",
    "type": "OPCUA-IIoT-Read",
    "attributeId": 0,
    "maxAge": 1,
    "depth": 1,
    "connector": "e507077b.ccdc18",
    "name": "ReadAll",
    "justValue": true,
    "showStatusActivities": false,
    "showErrors": false,
    "parseStrings": false,
    "wires": [
      [
        "5e3fdc1.8b5d624"
      ]
    ]
  },
  {
    "id": "e507077b.ccdc18",
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

describe('OPC UA Read node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Read node', function () {
    it('should be loaded for all attributes', function (done) {
      readNodeToBeLoaded[0].attributeId = 0
      readNodeToBeLoaded[0].name = 'ReadAll'
      helper.load([inputNode, connectorNode], readNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          nodeUnderTest.should.have.property('name', 'ReadAll')
          nodeUnderTest.should.have.property('attributeId', 0)
          nodeUnderTest.should.have.property('parseStrings', false)
          nodeUnderTest.should.have.property('justValue', true)
          done()
        })
    })

    it('should be loaded for Node-Id attributes', function (done) {
      readNodeToBeLoaded[0].attributeId = 1
      readNodeToBeLoaded[0].name = 'ReadNodeId'
      helper.load([inputNode, connectorNode], readNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          nodeUnderTest.should.have.property('name', 'ReadNodeId')
          nodeUnderTest.should.have.property('attributeId', 1)
          nodeUnderTest.should.have.property('parseStrings', false)
          nodeUnderTest.should.have.property('justValue', true)
          done()
        })
    })

    it('should be loaded for Node-Class attributes', function (done) {
      readNodeToBeLoaded[0].attributeId = 2
      readNodeToBeLoaded[0].name = 'ReadNodeClass'
      helper.load([inputNode, connectorNode], readNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          nodeUnderTest.should.have.property('name', 'ReadNodeClass')
          nodeUnderTest.should.have.property('attributeId', 2)
          nodeUnderTest.should.have.property('parseStrings', false)
          nodeUnderTest.should.have.property('justValue', true)
          done()
        })
    })

    it('should be loaded for browse name attributes', function (done) {
      readNodeToBeLoaded[0].attributeId = 3
      readNodeToBeLoaded[0].name = 'ReadBrowseName'
      helper.load([inputNode, connectorNode], readNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          nodeUnderTest.should.have.property('name', 'ReadBrowseName')
          nodeUnderTest.should.have.property('attributeId', 3)
          nodeUnderTest.should.have.property('parseStrings', false)
          nodeUnderTest.should.have.property('justValue', true)
          done()
        })
    })

    it('should be loaded for display name attributes', function (done) {
      readNodeToBeLoaded[0].attributeId = 4
      readNodeToBeLoaded[0].name = 'ReadDisplayName'
      helper.load([inputNode, connectorNode], readNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          nodeUnderTest.should.have.property('name', 'ReadDisplayName')
          nodeUnderTest.should.have.property('attributeId', 4)
          nodeUnderTest.should.have.property('parseStrings', false)
          nodeUnderTest.should.have.property('justValue', true)
          done()
        })
    })

    it('should be loaded for values attributes', function (done) {
      readNodeToBeLoaded[0].attributeId = 13
      readNodeToBeLoaded[0].name = 'ReadValues'
      helper.load([inputNode, connectorNode], readNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          nodeUnderTest.should.have.property('name', 'ReadValues')
          nodeUnderTest.should.have.property('attributeId', 13)
          nodeUnderTest.should.have.property('parseStrings', false)
          nodeUnderTest.should.have.property('justValue', true)
          done()
        })
    })

    it('should be loaded for history values attributes', function (done) {
      readNodeToBeLoaded[0].attributeId = 130
      readNodeToBeLoaded[0].name = 'ReadHistoryValues'
      helper.load([inputNode, connectorNode], readNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          nodeUnderTest.should.have.property('name', 'ReadHistoryValues')
          nodeUnderTest.should.have.property('attributeId', 130)
          nodeUnderTest.should.have.property('parseStrings', false)
          nodeUnderTest.should.have.property('justValue', true)
          done()
        })
    })

    var attributeId = 0
    for (attributeId of [0,1,2,3,4,13,130]) {
      testFlowPayload[2].attributeId = attributeId

      it('should get a message with payload for attributeId ' + attributeId, function (done) {
        this.timeout(4000)
        helper.load(nodesToLoad, testFlowPayload, function () {
          let n2 = helper.getNode("n2")
          n2.on("input", function (msg) {
            msg.should.have.property('payload', 'testpayload')
            done()
          })
        })
      })

      it('should verify addressSpaceItems for attributeId ' + attributeId, function (done) {
        this.timeout(4000)
        helper.load(nodesToLoad, testFlowPayload, function () {
          let n2 = helper.getNode("n2")
          n2.on("input", function (msg) {
            msg.should.have.property('addressSpaceItems', [{
              "name": "ServerStatus",
              "nodeId": "ns=0;i=2256",
              "datatypeName": ""
            }]);
            done()
          })
        })
      })

      it('should have read results for attributeId ' + attributeId, function (done) {
        this.timeout(4000)
        helper.load(nodesToLoad, testFlowPayload, function () {
          let n4 = helper.getNode("n4")
          n4.on("input", function (msg) {
            if(attributeId !== 130) {
              msg.payload[0].should.have.property('value')
            }
            if(attributeId === 0) {
              msg.payload[0].should.have.property('nodeId', "ns=0;i=2256")
            }
            msg.should.have.property('topic', "TestTopicRead")
            done()
          })
        })
      })

      it('should have read results with response for attributeId ' + attributeId, function (done) {
        this.timeout(4000)
        helper.load(nodesToLoad, testFlowPayload, function () {
          let n6 = helper.getNode("n6")
          n6.on("input", function (msg) {
            if(attributeId === 130){
              msg.should.have.property('entryStatus', [0, 1, 0])
            } else {
              msg.should.have.property('entryStatus', [1, 0, 0])

            }
            msg.should.have.property('topic', "TestTopicRead")
            done()
          })
        })
      })
    }
  })
})
