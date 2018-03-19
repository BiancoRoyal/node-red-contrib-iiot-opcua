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

// iiot opc ua nodes
var injectNode = require('../src/opcua-iiot-inject')
var serverNode = require('../src/opcua-iiot-server')
var connectorNode = require('../src/opcua-iiot-connector')
var inputNode = require('../src/opcua-iiot-listener')
var helper = require('node-red-contrib-test-helper')

var nodesToLoad = [injectNode, connectorNode, inputNode, serverNode]

var testFlowPayload = [
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
    "startDelay": "3.3",
    "name": "TestListen",
    "addressSpaceItems": [
      {
        "name": "",
        "nodeId": "ns=4;s=free_memory",
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
    "name": "",
    "justValue": true,
    "showStatusActivities": true,
    "showErrors": true,
    "wires": [["n5"]]
  },
  {
    "id": "n4",
    "type": "OPCUA-IIoT-Connector",
    "z": "",
    "discoveryUrl": "",
    "endpoint": "opc.tcp://localhost:1973/",
    "keepSessionAlive": true,
    "loginEnabled": false,
    "securityPolicy": "None",
    "securityMode": "NONE",
    "name": "TESTSERVER",
    "showStatusActivities": false,
    "showErrors": true,
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
    "port": "1973",
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

describe('OPC UA Listener node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Listen node', function () {
    it('should be loaded', function (done) {
      helper.load([inputNode, connectorNode], [
          {
            "id": "bee3e3b0.ca1a08",
            "type": "OPCUA-IIoT-Listener",
            "connector": "c30aa44e.9ed95",
            "action": "subscribe",
            "queueSize": 10,
            "name": "TestListener",
            "justValue": true,
            "showStatusActivities": false,
            "showErrors": false,
            "wires": [
              [
                "3497534.af772ac"
              ]
            ]
          },
          {
            "id": "c30aa44e.9ed95",
            "type": "OPCUA-IIoT-Connector",
            "discoveryUrl": "",
            "endpoint": "opc.tcp://localhost:1970/",
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
          let nodeUnderTest = helper.getNode('bee3e3b0.ca1a08')
          nodeUnderTest.should.have.property('name', 'TestListener')
          nodeUnderTest.should.have.property('action', 'subscribe')
          done()
        })
    })

    it('should get a message with payload after inject', function(done) {
      this.timeout(5000)
      helper.load(nodesToLoad, testFlowPayload, function() {
        let n2 = helper.getNode("n2")
        n2.on("input", function(msg) {
          msg.should.have.property('topic', 'TestTopicListen')
          msg.should.have.property('nodetype', 'inject')
          msg.should.have.property('injectType', 'listen')
          done()
        })
      })
    })

    it('should get a message with payload options after inject', function(done) {
      this.timeout(5000)
      helper.load(nodesToLoad, testFlowPayload, function() {
        let n2 = helper.getNode("n2")
        n2.on("input", function(msg) {
          msg.payload.options.should.have.property('requestedPublishingInterval', 2000)
          msg.payload.options.should.have.property('publishingEnabled', true)
          done()
        })
      })
    })

    it('should get a message with payload test after listener', function(done) {
      this.timeout(5000)
      helper.load(nodesToLoad, testFlowPayload, function() {
        let n3 = helper.getNode("n3")
        n3.on("input", function(msg) {
          msg.payload.options.should.have.property('requestedPublishingInterval', 2000)
          msg.payload.options.should.have.property('publishingEnabled', true)
          done()
        })
      })
    })

    it('should verify a message on changed monitored item', function(done) {
      this.timeout(6000)
      helper.load(nodesToLoad, testFlowPayload, function() {
        let n5 = helper.getNode("n5")
        n5.on("input", function(msg) {
          msg.payload.value.should.have.property('dataType', 'Double')
          msg.payload.should.have.property('statusCode')
          done()
        })
      })
    })
  })
})
