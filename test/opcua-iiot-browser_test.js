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
var expect = require('chai').expect

var injectNode = require('../src/opcua-iiot-inject')
var connectorNode = require('../src/opcua-iiot-connector')
var inputNode = require('../src/opcua-iiot-browser')
var serverNode = require('../src/opcua-iiot-server')
var helper = require('./helper.js')

var nodesToLoad = [injectNode, connectorNode, inputNode, serverNode]

var testFlowPayload = [
  {
    "id": "n1",
    "type": "OPCUA-IIoT-Inject",
    "injectType": "inject",
    "payload": "testpayload",
    "payloadType": "str",
    "topic": "TestTopicBrowse",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "3",
    "name": "Root",
    "addressSpaceItems": [],
    "wires": [["n2", "n3"]]
  },
  {id:"n2", type:"helper"},
  {
    "id": "n3",
    "type": "OPCUA-IIoT-Browser",
    "connector": "n4",
    "nodeId": "ns=4;i=1234",
    "name": "TestBrowse",
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
    "endpoint": "opc.tcp://localhost:1971/",
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
  {id:"n5", type:"helper"},
  {
    "id": "n6",
    "type": "OPCUA-IIoT-Server",
    "port": "1971",
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

describe('OPC UA Browser node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Browser node', function () {
    it('should be loaded', function (done) {
      helper.load(
        [inputNode, connectorNode], [
          {
            "id": "13118ee.7ced371",
            "type": "OPCUA-IIoT-Browser",
            "connector": "a0513f1.9777fc",
            "nodeId": "ns=4;i=1234",
            "name": "TestName",
            "justValue": true,
            "sendNodesToRead": false,
            "sendNodesToListener": false,
            "showStatusActivities": false,
            "showErrors": false,
            "wires": [
              [
                "d95ee9c4.0840f8"
              ]
            ]
          },
          {
            "id": "a0513f1.9777fc",
            "type": "OPCUA-IIoT-Connector",
            "discoveryUrl": "",
            "endpoint": "opc.tcp://localhost:55388/",
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
          }
        ],
        function () {
          let nodeUnderTest = helper.getNode('13118ee.7ced371')
          nodeUnderTest.should.have.property('name', 'TestName')
          nodeUnderTest.should.have.property('nodeId', 'ns=4;i=1234')
          nodeUnderTest.should.have.property('justValue', true)
          nodeUnderTest.should.have.property('sendNodesToRead', false)
          nodeUnderTest.should.have.property('sendNodesToListener', false)
          nodeUnderTest.should.have.property('showStatusActivities', false)
          done()
        })
    })

    it('should get a message with payload', function(done) {
      this.timeout(4000)
      helper.load(nodesToLoad, testFlowPayload, function() {
        let n2 = helper.getNode("n2")
        n2.on("input", function(msg) {
          msg.should.have.property('payload', 'testpayload')
          done()
        })
      })
    })

    it('should verify browser items as result', function(done) {
      this.timeout(6000)
      helper.load(nodesToLoad, testFlowPayload, function() {
        let n5 = helper.getNode("n5")
        n5.on("input", function(msg) {
          msg.payload.should.have.property('browserItems')
          expect(msg.payload.browserItems).to.be.an('array')
          expect(msg.payload.browserItems.length).to.equal(15)
          done()
        })
      })
    })
  })
})
