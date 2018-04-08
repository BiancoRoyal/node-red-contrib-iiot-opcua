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
var helper = require('node-red-contrib-test-helper')

var browseNodesToLoad = [injectNode, connectorNode, inputNode, serverNode]

var testBrowseFlow = [
  {
    "id": "n1f1",
    "type": "OPCUA-IIoT-Inject",
    "injectType": "inject",
    "payload": "testpayload",
    "payloadType": "str",
    "topic": "TestTopicBrowse",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "2.4",
    "name": "Root",
    "addressSpaceItems": [],
    "wires": [["n2f1", "n3f1"]]
  },
  {id:"n2f1", type:"helper"},
  {
    "id": "n3f1",
    "type": "OPCUA-IIoT-Browser",
    "connector": "c1f1",
    "nodeId": "ns=4;i=1234",
    "name": "TestBrowse",
    "justValue": true,
    "sendNodesToRead": false,
    "sendNodesToListener": false,
    "sendNodesToBrowser": false,
    "singleBrowseResult": true,
    "showStatusActivities": false,
    "showErrors": false,
    "wires": [["n5f1"]]
  },
  {
    "id": "c1f1",
    "type": "OPCUA-IIoT-Connector",
    "discoveryUrl": "",
    "endpoint": "opc.tcp://localhost:1958/",
    "keepSessionAlive": false,
    "loginEnabled": false,
    "securityPolicy": "None",
    "securityMode": "NONE",
    "name": "LOCAL DEMO SERVER",
    "showErrors": false,
    "publicCertificateFile": "",
    "privateKeyFile": "",
    "defaultSecureTokenLifetime": "60000",
    "endpointMustExist": false,
    "autoSelectRightEndpoint": false,
    "strategyMaxRetry": "",
    "strategyInitialDelay": "",
    "strategyMaxDelay": "",
    "strategyRandomisationFactor": ""
  },
  {id:"n5f1", type:"helper"},
  {
    "id": "s1f1",
    "type": "OPCUA-IIoT-Server",
    "port": "1958",
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

var testBrowseLevelsFlow = [
  {
    "id": "n1f2",
    "type": "OPCUA-IIoT-Inject",
    "injectType": "inject",
    "payload": "testpayload",
    "payloadType": "str",
    "topic": "TestTopicBrowse",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "2.4",
    "name": "Root",
    "addressSpaceItems": [],
    "wires": [["n2f2", "n3f2"]]
  },
  {id:"n2f2", type:"helper"},
  {
    "id": "n3f2",
    "type": "OPCUA-IIoT-Browser",
    "connector": "c1f2",
    "nodeId": "ns=4;i=1234",
    "name": "TestBrowse",
    "justValue": true,
    "sendNodesToRead": false,
    "sendNodesToListener": false,
    "sendNodesToBrowser": true,
    "singleBrowseResult": true,
    "showStatusActivities": false,
    "showErrors": false,
    "wires": [["n4f2", "n5f2"]]
  },
  {id:"n4f2", type:"helper"},
  {
    "id": "n5f2",
    "type": "OPCUA-IIoT-Browser",
    "connector": "c1f2",
    "nodeId": "",
    "name": "TestBrowseLevel2",
    "justValue": true,
    "sendNodesToRead": false,
    "sendNodesToListener": true,
    "sendNodesToBrowser": false,
    "singleBrowseResult": true,
    "showStatusActivities": false,
    "showErrors": false,
    "wires": [["n6f2"]]
  },
  {
    "id": "c1f2",
    "type": "OPCUA-IIoT-Connector",
    "discoveryUrl": "",
    "endpoint": "opc.tcp://localhost:1959/",
    "keepSessionAlive": false,
    "loginEnabled": false,
    "securityPolicy": "None",
    "securityMode": "NONE",
    "name": "LOCAL DEMO SERVER",
    "showErrors": false,
    "publicCertificateFile": "",
    "privateKeyFile": "",
    "defaultSecureTokenLifetime": "60000",
    "endpointMustExist": false,
    "autoSelectRightEndpoint": false,
    "strategyMaxRetry": "",
    "strategyInitialDelay": "",
    "strategyMaxDelay": "",
    "strategyRandomisationFactor": ""
  },
  {id:"n6f2", type:"helper"},
  {
    "id": "s1f2",
    "type": "OPCUA-IIoT-Server",
    "port": "1959",
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

var testBrowseItemFlow = [
  {
    "id": "n1f3",
    "type": "OPCUA-IIoT-Inject",
    "injectType": "inject",
    "payload": "testpayload",
    "payloadType": "str",
    "topic": "TestTopicBrowse",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "2.4",
    "name": "Root",
    "addressSpaceItems": [
      {
        "name": "",
        "nodeId": "ns=4;i=1234",
        "datatypeName": ""
      }
    ],
    "wires": [["n2f3", "n3f3"]]
  },
  {id:"n2f3", type:"helper"},
  {
    "id": "n3f3",
    "type": "OPCUA-IIoT-Browser",
    "connector": "c1f3",
    "nodeId": "",
    "name": "TestBrowse",
    "justValue": true,
    "sendNodesToRead": false,
    "sendNodesToListener": false,
    "sendNodesToBrowser": false,
    "singleBrowseResult": true,
    "showStatusActivities": false,
    "showErrors": false,
    "wires": [["n5f3"]]
  },
  {
    "id": "c1f3",
    "type": "OPCUA-IIoT-Connector",
    "discoveryUrl": "",
    "endpoint": "opc.tcp://localhost:1960/",
    "keepSessionAlive": false,
    "loginEnabled": false,
    "securityPolicy": "None",
    "securityMode": "NONE",
    "name": "LOCAL DEMO SERVER",
    "showErrors": false,
    "publicCertificateFile": "",
    "privateKeyFile": "",
    "defaultSecureTokenLifetime": "60000",
    "endpointMustExist": false,
    "autoSelectRightEndpoint": false,
    "strategyMaxRetry": "",
    "strategyInitialDelay": "",
    "strategyMaxDelay": "",
    "strategyRandomisationFactor": ""
  },
  {id:"n5f3", type:"helper"},
  {
    "id": "s1f3",
    "type": "OPCUA-IIoT-Server",
    "port": "1960",
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
  beforeEach(function(done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function(done) {
    helper.unload().then(function () {
      helper.stopServer(function () {
        done()
      })
    }).catch(function (err) {
      console.log('events error ' + err)
      helper.stopServer(function () {
        done()
      })
    })
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
            "sendNodesToBrowser": true,
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
            "endpoint": "opc.tcp://localhost:1961/",
            "keepSessionAlive": false,
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
          nodeUnderTest.should.have.property('sendNodesToBrowser', true)
          nodeUnderTest.should.have.property('showStatusActivities', false)
          done()
        })
    })

    it('should get a message with payload', function(done) {

      helper.load(browseNodesToLoad, testBrowseFlow, function() {
        let n2 = helper.getNode("n2f1")
        n2.on("input", function(msg) {
          msg.should.have.property('payload', 'testpayload')
          done()
        })
      })
    })

    it('should verify browser items as result', function(done) {

      helper.load(browseNodesToLoad, testBrowseFlow, function() {
        let n5 = helper.getNode("n5f1")
        n5.on("input", function(msg) {
          msg.payload.should.have.property('browserItems')
          expect(msg.payload.browserItems).to.be.an('array')
          expect(msg.payload.browserItems.length).to.equal(15)
          done()
        })
      })
    })

    it('should verify browser items as single result', function(done) {

      helper.load(browseNodesToLoad, testBrowseItemFlow, function() {
        let n5 = helper.getNode("n5f3")
        n5.on("input", function(msg) {
          msg.payload.should.have.property('browserItems')
          expect(msg.payload.browserItems).to.be.an('array')
          expect(msg.payload.browserItems.length).to.equal(15)
          done()
        })
      })
    })

    it('should verify browser items as single of full result', function(done) {

      testBrowseItemFlow[2].justValue = false
      helper.load(browseNodesToLoad, testBrowseItemFlow, function() {
        let n5 = helper.getNode("n5f3")
        n5.on("input", function(msg) {
          msg.payload.should.have.property('browserItems')
          msg.payload.should.have.property('endpoint')
          msg.payload.should.have.property('session')
          expect(msg.payload.browserItems).to.be.an('array')
          expect(msg.payload.browserItems.length).to.equal(15)
          expect(msg.payload.browserItems.length).to.equal(msg.payload.browserItemsCount)
          done()
        })
      })
    })

    it('should verify browser items as single result with Nodes To Read', function(done) {

      testBrowseItemFlow[2].sendNodesToRead = true
      helper.load(browseNodesToLoad, testBrowseItemFlow, function() {
        let n5 = helper.getNode("n5f3")
        n5.on("input", function(msg) {
          msg.payload.should.have.property('browserItems')
          expect(msg.nodesToRead).to.be.an('array')
          expect(msg.nodesToRead.length).to.equal(15)
          done()
        })
      })
    })

    it('should verify browser items as single result with Nodes To Listener', function(done) {

      testBrowseItemFlow[2].sendNodesToListener = true
      helper.load(browseNodesToLoad, testBrowseItemFlow, function() {
        let n5 = helper.getNode("n5f3")
        n5.on("input", function(msg) {
          msg.payload.should.have.property('browserItems')
          expect(msg.addressItemsToRead).to.be.an('array')
          expect(msg.addressItemsToRead.length).to.equal(15)
          done()
        })
      })
    })

    it('should verify browser items as single result with Nodes To Browser', function(done) {

      testBrowseItemFlow[2].sendNodesToBrowser = true
      helper.load(browseNodesToLoad, testBrowseItemFlow, function() {
        let n5 = helper.getNode("n5f3")
        n5.on("input", function(msg) {
          msg.payload.should.have.property('browserItems')
          expect(msg.addressItemsToBrowse).to.be.an('array')
          expect(msg.addressItemsToBrowse.length).to.equal(15)
          done()
        })
      })
    })

    it('should verify browser items as single result with nodes to Read, Browse, and Listener', function(done) {

      testBrowseItemFlow[2].sendNodesToRead = true
      testBrowseItemFlow[2].sendNodesToListener = true
      testBrowseItemFlow[2].sendNodesToBrowser = true
      helper.load(browseNodesToLoad, testBrowseItemFlow, function() {
        let n5 = helper.getNode("n5f3")
        n5.on("input", function(msg) {
          msg.payload.should.have.property('browserItems')
          expect(msg.nodesToRead).to.be.an('array')
          expect(msg.nodesToRead.length).to.equal(15)
          expect(msg.addressItemsToRead).to.be.an('array')
          expect(msg.addressItemsToRead.length).to.equal(15)
          expect(msg.addressItemsToBrowse).to.be.an('array')
          expect(msg.addressItemsToBrowse.length).to.equal(15)
          done()
        })
      })
    })

    it('should verify browser items as single result with nodes to Browse with levels', function(done) {

      helper.load(browseNodesToLoad, testBrowseLevelsFlow, function() {
        let n4 = helper.getNode("n4f2")
        n4.on("input", function(msg) {
          msg.payload.should.have.property('browserItems')
          expect(msg.addressItemsToBrowse).to.be.an('array')
          expect(msg.addressItemsToBrowse.length).to.equal(15)
          done()
        })
      })
    })

    it('should verify browser items as single result with nodes to Read with levels', function(done) {

      helper.load(browseNodesToLoad, testBrowseLevelsFlow, function() {
        let n6 = helper.getNode("n6f2")
        n6.on("input", function(msg) {
          msg.payload.should.have.property('browserItems')
          expect(msg.addressItemsToRead).to.be.an('array')
          expect(msg.addressItemsToRead.length).to.equal(10)
          done()
        })
      })
    })
  })

  describe('Browser node HTTP requests', function () {

    it('should success on browse for a root id without session', function (done) {
      testBrowseItemFlow[5].port = 1997
      helper.load(browseNodesToLoad, testBrowseItemFlow, function() {
        let n3 = helper.getNode("n3f3")
        n3.opcuaSession = null
        helper.request()
          .get('/opcuaIIoT/browse/' + n3.id + '/' + encodeURIComponent('ns=0;i=85'))
          .expect(200)
          .end(done);
      })
    })

    it('should success on browse for a root id', function (done) {

      helper.load(browseNodesToLoad, testBrowseFlow, function() {
        let n3 = helper.getNode("n3f1")
        n3.on("input", function(msg) {
          helper.request()
            .get('/opcuaIIoT/browse/' + n3.id + '/' + encodeURIComponent('ns=0;i=85'))
            .expect(200)
            .end(done);
        })
      })
    })
  })
})
