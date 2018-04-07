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

var readNodesToLoad = [injectNode, connectorNode, inputNode, responseNode, serverNode]

var testReadFlow = [
  {
    "id": "n1rdf1",
    "type": "OPCUA-IIoT-Inject",
    "injectType": "read",
    "payload": "testpayload",
    "payloadType": "str",
    "topic": "TestTopicRead",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "2.4",
    "name": "TestName",
    "addressSpaceItems": [
      {
        "name": "ServerStatus",
        "nodeId": "ns=0;i=2256",
        "datatypeName": ""
      }
    ],
    "wires": [["n2rdf1", "n3rdf1"]]
  },
  {id:"n2rdf1", type:"helper"},
  {
    "id": "n3rdf1",
    "type": "OPCUA-IIoT-Read",
    "attributeId": 0,
    "maxAge": 1,
    "depth": 1,
    "connector": "c1rdf1",
    "name": "ReadAll",
    "justValue": true,
    "showStatusActivities": false,
    "showErrors": false,
    "parseStrings": false,
    "wires": [["n4rdf1", "n5rdf1"]]
  },
  {id:"n4rdf1", type:"helper"},
  {
    "id": "n5rdf1",
    "type": "OPCUA-IIoT-Response",
    "name": "TestResponse",
    "showStatusActivities": false,
    "showErrors": false,
    "wires": [["n6rdf1"]]
  },
  {id:"n6rdf1", type:"helper"},
  {
    "id": "c1rdf1",
    "type": "OPCUA-IIoT-Connector",
    "discoveryUrl": "",
    "endpoint": "opc.tcp://localhost:1970/",
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
  {
    "id": "s1rdf1",
    "type": "OPCUA-IIoT-Server",
    "port": "1970",
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

var testReadNodeToBeLoaded = [
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
    "endpoint": "opc.tcp://localhost:1971/",
    "keepSessionAlive": false,
    "loginEnabled": false,
    "securityPolicy": "None",
    "securityMode": "NONE",
    "name": "TESTSERVER",
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
  }
]

describe('OPC UA Read node Testing', function () {
  before(function(done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function(done) {
    helper.unload().then(function () {
      done()
    }).catch(function (err) {
      console.log('Read error ' + err)
      done()
    })
  })

  after(function (done) {
    helper.stopServer(function () {
      done()
    })
  })


  describe('Read node', function () {
    let attributeId = ''

    it('should be loaded for all attributes', function (done) {
      testReadNodeToBeLoaded[0].attributeId = '0'
      testReadNodeToBeLoaded[0].name = 'ReadAll'
      helper.load([inputNode, connectorNode], testReadNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          nodeUnderTest.should.have.property('name', 'ReadAll')
          nodeUnderTest.should.have.property('attributeId', '0')
          nodeUnderTest.should.have.property('parseStrings', false)
          nodeUnderTest.should.have.property('justValue', true)
          done()
        })
    })

    it('should be loaded for Node-Id attributes', function (done) {
      testReadNodeToBeLoaded[0].attributeId = '1'
      testReadNodeToBeLoaded[0].name = 'ReadNodeId'
      helper.load([inputNode, connectorNode], testReadNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          nodeUnderTest.should.have.property('name', 'ReadNodeId')
          nodeUnderTest.should.have.property('attributeId', '1')
          nodeUnderTest.should.have.property('parseStrings', false)
          nodeUnderTest.should.have.property('justValue', true)
          done()
        })
    })

    it('should be loaded for Node-Class attributes', function (done) {
      testReadNodeToBeLoaded[0].attributeId = '2'
      testReadNodeToBeLoaded[0].name = 'ReadNodeClass'
      helper.load([inputNode, connectorNode], testReadNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          nodeUnderTest.should.have.property('name', 'ReadNodeClass')
          nodeUnderTest.should.have.property('attributeId', '2')
          nodeUnderTest.should.have.property('parseStrings', false)
          nodeUnderTest.should.have.property('justValue', true)
          done()
        })
    })

    it('should be loaded for browse name attributes', function (done) {
      testReadNodeToBeLoaded[0].attributeId = '3'
      testReadNodeToBeLoaded[0].name = 'ReadBrowseName'
      helper.load([inputNode, connectorNode], testReadNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          nodeUnderTest.should.have.property('name', 'ReadBrowseName')
          nodeUnderTest.should.have.property('attributeId', '3')
          nodeUnderTest.should.have.property('parseStrings', false)
          nodeUnderTest.should.have.property('justValue', true)
          done()
        })
    })

    it('should be loaded for display name attributes', function (done) {
      testReadNodeToBeLoaded[0].attributeId = '4'
      testReadNodeToBeLoaded[0].name = 'ReadDisplayName'
      helper.load([inputNode, connectorNode], testReadNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          nodeUnderTest.should.have.property('name', 'ReadDisplayName')
          nodeUnderTest.should.have.property('attributeId', '4')
          nodeUnderTest.should.have.property('parseStrings', false)
          nodeUnderTest.should.have.property('justValue', true)
          done()
        })
    })

    it('should be loaded for values attributes', function (done) {
      testReadNodeToBeLoaded[0].attributeId = '13'
      testReadNodeToBeLoaded[0].name = 'ReadValues'
      helper.load([inputNode, connectorNode], testReadNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          nodeUnderTest.should.have.property('name', 'ReadValues')
          nodeUnderTest.should.have.property('attributeId', '13')
          nodeUnderTest.should.have.property('parseStrings', false)
          nodeUnderTest.should.have.property('justValue', true)
          done()
        })
    })

    it('should be loaded for history values attributes', function (done) {
      testReadNodeToBeLoaded[0].attributeId = '130'
      testReadNodeToBeLoaded[0].name = 'ReadHistoryValues'
      helper.load([inputNode, connectorNode], testReadNodeToBeLoaded,
        function () {
          let nodeUnderTest = helper.getNode('41cb29d.1ab50d8')
          nodeUnderTest.should.have.property('name', 'ReadHistoryValues')
          nodeUnderTest.should.have.property('attributeId', '130')
          nodeUnderTest.should.have.property('parseStrings', false)
          nodeUnderTest.should.have.property('justValue', true)
          done()
        })
    })

    it('should get a message with payload for attributeId All', function (done) {
      attributeId = '0'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode("n2rdf1")
        n2.on("input", function (msg) {
          msg.should.have.property('payload', 'testpayload')
          msg.should.have.property('addressSpaceItems', [{
            "name": "ServerStatus",
            "nodeId": "ns=0;i=2256",
            "datatypeName": ""
          }]);
          done()
        })
      })
    })

    it('should have read results for attributeId All', function (done) {
      attributeId = '0'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode("n4rdf1")
        n4.on("input", function (msg) {
          msg.payload[0].should.have.property('nodeId', "ns=0;i=2256")
          msg.should.have.property('topic', "TestTopicRead")
          msg.should.have.property('attributeId', attributeId)
          done()
        })
      })
    })

    it('should have read results with response for attributeId ' + attributeId, function (done) {
      attributeId = '0'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode("n6rdf1")
        n6.on("input", function (msg) {
          msg.should.have.property('entryStatus', [1, 0, 0])
          msg.should.have.property('topic', "TestTopicRead")
          msg.should.have.property('attributeId', attributeId)
          done()
        })
      })
    })

    it('should get a message with payload for attributeId Node-ID', function (done) {
      attributeId = '1'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode("n2rdf1")
        n2.on("input", function (msg) {
          msg.should.have.property('payload', 'testpayload')
          msg.should.have.property('addressSpaceItems', [{
            "name": "ServerStatus",
            "nodeId": "ns=0;i=2256",
            "datatypeName": ""
          }]);
          done()
        })
      })
    })

    it('should have read results for attributeId Node-ID', function (done) {
      attributeId = '1'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode("n4rdf1")
        n4.on("input", function (msg) {
          msg.payload[0].should.have.property('value')
          msg.should.have.property('topic', "TestTopicRead")
          msg.should.have.property('attributeId', attributeId)
          done()
        })
      })
    })

    it('should have read results with response for attributeId Node-ID', function (done) {
      attributeId = '1'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode("n6rdf1")
        n6.on("input", function (msg) {
          msg.should.have.property('entryStatus', [1, 0, 0])
          msg.should.have.property('topic', "TestTopicRead")
          msg.should.have.property('attributeId', attributeId)
          done()
        })
      })
    })


    it('should get a message with payload for attributeId Node-Class', function (done) {
      attributeId = '2'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode("n2rdf1")
        n2.on("input", function (msg) {
          msg.should.have.property('payload', 'testpayload')
          msg.should.have.property('addressSpaceItems', [{
            "name": "ServerStatus",
            "nodeId": "ns=0;i=2256",
            "datatypeName": ""
          }]);
          done()
        })
      })
    })

    it('should have read results for attributeId Node-Class', function (done) {
      attributeId = '2'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode("n4rdf1")
        n4.on("input", function (msg) {
          msg.payload[0].should.have.property('value')
          msg.should.have.property('topic', "TestTopicRead")
          msg.should.have.property('attributeId', attributeId)
          done()
        })
      })
    })

    it('should have read results with response for attributeId Node-Class', function (done) {
      attributeId = '2'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode("n6rdf1")
        n6.on("input", function (msg) {
          msg.should.have.property('entryStatus', [1, 0, 0])
          msg.should.have.property('topic', "TestTopicRead")
          msg.should.have.property('attributeId', attributeId)
          done()
        })
      })
    })

    it('should get a message with payload for attributeId Browse-Name', function (done) {
      attributeId = '3'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode("n2rdf1")
        n2.on("input", function (msg) {
          msg.should.have.property('payload', 'testpayload')
          msg.should.have.property('addressSpaceItems', [{
            "name": "ServerStatus",
            "nodeId": "ns=0;i=2256",
            "datatypeName": ""
          }]);
          done()
        })
      })
    })

    it('should have read results for attributeId Browse-Name', function (done) {
      attributeId = '3'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode("n4rdf1")
        n4.on("input", function (msg) {
          msg.payload[0].should.have.property('value')
          msg.should.have.property('topic', "TestTopicRead")
          msg.should.have.property('attributeId', attributeId)
          done()
        })
      })
    })

    it('should have read results with response for attributeId Browse-Name', function (done) {
      attributeId = '3'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode("n6rdf1")
        n6.on("input", function (msg) {
          msg.should.have.property('entryStatus', [1, 0, 0])
          msg.should.have.property('topic', "TestTopicRead")
          msg.should.have.property('attributeId', attributeId)
          done()
        })
      })
    })

    it('should get a message with payload for attributeId Display-Name', function (done) {
      attributeId = '4'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode("n2rdf1")
        n2.on("input", function (msg) {
          msg.should.have.property('payload', 'testpayload')
          msg.should.have.property('addressSpaceItems', [{
            "name": "ServerStatus",
            "nodeId": "ns=0;i=2256",
            "datatypeName": ""
          }]);
          done()
        })
      })
    })

    it('should have read results for attributeId Display-Name', function (done) {
      attributeId = '4'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode("n4rdf1")
        n4.on("input", function (msg) {
          msg.payload[0].should.have.property('value')
          msg.should.have.property('topic', "TestTopicRead")
          msg.should.have.property('attributeId', attributeId)
          done()
        })
      })
    })

    it('should have read results with response for attributeId Display-Name', function (done) {
      attributeId = '4'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode("n6rdf1")
        n6.on("input", function (msg) {
          msg.should.have.property('entryStatus', [1, 0, 0])
          msg.should.have.property('topic', "TestTopicRead")
          msg.should.have.property('attributeId', attributeId)
          done()
        })
      })
    })

    it('should get a message with payload for attributeId Value', function (done) {
      attributeId = '13'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode("n2rdf1")
        n2.on("input", function (msg) {
          msg.should.have.property('payload', 'testpayload')
          msg.should.have.property('addressSpaceItems', [{
            "name": "ServerStatus",
            "nodeId": "ns=0;i=2256",
            "datatypeName": ""
          }]);
          done()
        })
      })
    })

    it('should have read results for attributeId Value', function (done) {
      attributeId = '13'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode("n4rdf1")
        n4.on("input", function (msg) {
          msg.payload[0].should.have.property('value')
          msg.should.have.property('topic', "TestTopicRead")
          msg.should.have.property('attributeId', attributeId)
          done()
        })
      })
    })

    it('should have read results with response for attributeId Value', function (done) {
      attributeId = '13'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode("n6rdf1")
        n6.on("input", function (msg) {
          msg.should.have.property('entryStatus', [1, 0, 0])
          msg.should.have.property('topic', "TestTopicRead")
          msg.should.have.property('attributeId', attributeId)
          done()
        })
      })
    })

    it('should get a message with payload for attributeId History', function (done) {
      attributeId = '130'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode("n2rdf1")
        n2.on("input", function (msg) {
          msg.should.have.property('payload', 'testpayload')
          msg.should.have.property('addressSpaceItems', [{
            "name": "ServerStatus",
            "nodeId": "ns=0;i=2256",
            "datatypeName": ""
          }]);
          done()
        })
      })
    })

    it('should have read results for attributeId History', function (done) {
      attributeId = '130'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode("n4rdf1")
        n4.on("input", function (msg) {
          msg.should.have.property('topic', "TestTopicRead")
          msg.should.have.property('attributeId', attributeId)
          done()
        })
      })
    })

    it('should have read results with response for attributeId History', function (done) {
      attributeId = '130'
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode("n6rdf1")
        n6.on("input", function (msg) {
          msg.should.have.property('entryStatus', [0, 1, 0])
          msg.should.have.property('topic', "TestTopicRead")
          msg.should.have.property('attributeId', attributeId)
          done()
        })
      })
    })
  })
})
