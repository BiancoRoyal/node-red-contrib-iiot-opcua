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
var injectNodeRed = require('node-red/nodes/core/core/20-inject')
var functionNode = require('node-red/nodes/core/core/80-function')

// opcua iiot
var injectNode = require('../src/opcua-iiot-inject')
var inputNode = require('../src/opcua-iiot-method-caller')
var connectorNode = require('../src/opcua-iiot-connector')
var responseNode = require('../src/opcua-iiot-response')
var serverNode = require('../src/opcua-iiot-server')
var helper = require('node-red-contrib-test-helper')

var methodCallerNodesToLoad = [injectNode, connectorNode, inputNode, responseNode, serverNode]
var eventNodesToLoad = [injectNodeRed, functionNode, connectorNode, inputNode, responseNode, serverNode]

var testMethodFlowPayload = [
  {
    "id": "n1mcf1",
    "type": "OPCUA-IIoT-Inject",
    "injectType": "inject",
    "payload": "12345",
    "payloadType": "num",
    "topic": "TestTopicMethod",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "2.4",
    "name": "",
    "addressSpaceItems": [],
    "wires": [
      [
        "n2mcf1",
        "n3mcf1"
      ]
    ]
  },
  {id:"n2mcf1", type:"helper"},
  {
    "id": "n3mcf1",
    "type": "OPCUA-IIoT-Method-Caller",
    "connector": "c1mcf1",
    "objectId": "ns=4;i=1234",
    "methodId": "ns=4;i=12345",
    "methodType": "basic",
    "value": "",
    "justValue": true,
    "name": "",
    "showStatusActivities": false,
    "showErrors": true,
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
    "wires": [
      [
        "n4mcf1",
        "n5mcf1"
      ]
    ]
  },
  {id:"n4mcf1", type:"helper"},
  {
    "id": "n5mcf1",
    "type": "OPCUA-IIoT-Response",
    "name": "",
    "showStatusActivities": false,
    "showErrors": false,
    "wires": [
      ["n6mcf1"]
    ]
  },
  {id:"n6mcf1", type:"helper"},
  {
    "id": "c1mcf1",
    "type": "OPCUA-IIoT-Connector",
    "z": "",
    "discoveryUrl": "",
    "endpoint": "opc.tcp://localhost:1976/",
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
  },
  {
    "id": "s1mcf1",
    "type": "OPCUA-IIoT-Server",
    "port": "1976",
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

var testMethodInjectFlowPayload = [
  {
    "id": "n1mcf2",
    "type": "inject",
    "name": "TestName",
    "topic": "TestTopicMethod",
    "payload": "23456",
    "payloadType": "num",
    "repeat": "",
    "crontab": "",
    "once": true,
    "onceDelay": "3",
    "wires": [
      [
        "n2mcf2",
        "n3mcf2"
      ]
    ]
  },
  {id:"n2mcf2", type:"helper"},
  {
    "id": "n3mcf2",
    "type": "function",
    "name": "bark six times with volume twelve",
    "func": "msg.payload = {\n    objectId: 'ns=4;i=1234',\n    methodId: 'ns=4;i=12345',\n    inputArguments: [\n        " +
    "{name: 'barks', dataType:'UInt32', value:'6'},\n        {name: 'volume', dataType:'UInt32', value:'12'}\n    ],\n    " +
    "methodType: 'basic'\n}\nreturn msg;",
    "outputs": 1,
    "noerr": 0,
    "wires": [
      [
        "n4mcf2",
        "n5mcf2"
      ]
    ]
  },
  {id:"n4mcf2", type:"helper"},
  {
    "id": "n5mcf2",
    "type": "OPCUA-IIoT-Method-Caller",
    "connector": "c1mcf2",
    "objectId": "ns=4;i=1234",
    "methodId": "ns=4;i=12345",
    "methodType": "basic",
    "value": "",
    "justValue": false,
    "name": "",
    "showStatusActivities": false,
    "showErrors": true,
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
    "wires": [
      [
        "n6mcf2",
        "n7mcf2"
      ]
    ]
  },
  {id:"n6mcf2", type:"helper"},
  {
    "id": "n7mcf2",
    "type": "OPCUA-IIoT-Response",
    "name": "",
    "showStatusActivities": false,
    "showErrors": false,
    "wires": [
      ["n8mcf2"]
    ]
  },
  {id:"n8mcf2", type:"helper"},
  {
    "id": "c1mcf2",
    "type": "OPCUA-IIoT-Connector",
    "z": "",
    "discoveryUrl": "",
    "endpoint": "opc.tcp://localhost:1977/",
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
    "id": "s1mcf2",
    "type": "OPCUA-IIoT-Server",
    "port": "1977",
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

describe('OPC UA Method Caller node Testing', function () {
  before(function(done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function(done) {
    helper.unload().then(function () {
      done()
    }).catch(function (err) {
      console.log('Method Caller error ' + err)
      done()
    })
  })

  after(function (done) {
    helper.stopServer(function () {
      done()
    })
  })

  describe('Method Caller node', function () {
    it('should load with basic settings', function (done) {
      helper.load([connectorNode, inputNode], [
          {
            "id": "706d43c1.90baac",
            "type": "OPCUA-IIoT-Method-Caller",
            "connector": "6822ce7d.dcdb8",
            "objectId": "ns=4;i=1234",
            "methodId": "ns=4;i=12345",
            "methodType": "basic",
            "value": "",
            "justValue": false,
            "name": "TestName",
            "showStatusActivities": false,
            "showErrors": true,
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
            "wires": [[]]
          },
          {
            "id": "6822ce7d.dcdb8",
            "type": "OPCUA-IIoT-Connector",
            "discoveryUrl": "",
            "endpoint": "opc.tcp://localhost:1978/",
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
          let nodeUnderTest = helper.getNode('706d43c1.90baac')
          nodeUnderTest.should.have.property('name', 'TestName')
          nodeUnderTest.should.have.property('methodType', 'basic')
          nodeUnderTest.should.have.property('objectId', 'ns=4;i=1234')
          nodeUnderTest.should.have.property('methodId', 'ns=4;i=12345')
          nodeUnderTest.should.have.property('justValue', false)
          nodeUnderTest.should.have.property('inputArguments', [
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
          ])
          done()
        })
    })

    it('should get a message with payload after inject', function (done) {

      helper.load(methodCallerNodesToLoad, testMethodFlowPayload, function () {
        let n2 = helper.getNode("n2mcf1")
        n2.on("input", function (msg) {
          msg.should.have.property('topic', 'TestTopicMethod')
          msg.should.have.property('nodetype', 'inject')
          msg.should.have.property('injectType', 'inject')
          done()
        })
      })
    })

    it('should get a message with payload', function (done) {

      helper.load(methodCallerNodesToLoad, testMethodFlowPayload, function () {
        let n2 = helper.getNode("n2mcf1")
        n2.on("input", function (msg) {
          msg.should.have.property('payload', 12345)
          done()
        })
      })
    })

    it('should verify the result with response data', function (done) {

      helper.load(methodCallerNodesToLoad, testMethodFlowPayload, function () {
        let n6 = helper.getNode("n6mcf1")
        n6.on("input", function (msg) {
          msg.should.have.property('nodetype', 'method')
          msg.should.have.property('entryStatus', [1, 0, 0])
          msg.should.have.property('payload', [{"statusCode":{"value":0,"description":"No Error","name":"Good"},"outputArguments":[{"dataType":"String","arrayType":"Array","value":["Whaff!!!!!","Whaff!!!!!","Whaff!!!!!"]}]}])
          done()
        })
      })
    })

    it('should get a message with payload after inject event inject', function(done) {

      helper.load(eventNodesToLoad, testMethodInjectFlowPayload, function() {
        let n2 = helper.getNode("n2mcf2")
        n2.on("input", function(msg) {
          msg.should.have.property('topic', 'TestTopicMethod')
          msg.should.have.property('payload', 23456)
          done()
        })
      })
    })

    it('should get a message with payload event inject', function(done) {

      helper.load(eventNodesToLoad, testMethodInjectFlowPayload, function() {
        let n2 = helper.getNode("n2mcf2")
        n2.on("input", function(msg) {
          msg.should.have.property('payload', 23456)
          done()
        })
      })
    })

    it('should verify the result with response data event inject', function(done) {

      helper.load(eventNodesToLoad, testMethodInjectFlowPayload, function() {
        let n8 = helper.getNode("n8mcf2")
        n8.on("input", function(msg) {
          msg.should.have.property('nodetype', 'method')
          msg.should.have.property('entryStatus', [1,0,0])
          msg.should.have.property('payload', {"results":[{"statusCode":{"value":0,"description":"No Error","name":"Good"},"inputArgumentResults":[[{"value":0,"description":"No Error","name":"Good"},{"value":0,"description":"No Error","name":"Good"}],[{"value":0,"description":"No Error","name":"Good"},{"value":0,"description":"No Error","name":"Good"}]],"inputArgumentDiagnosticInfos":[],"outputArguments":[{"dataType":"String","arrayType":"Array","value":["Whaff!!!!!!!!!!!","Whaff!!!!!!!!!!!","Whaff!!!!!!!!!!!","Whaff!!!!!!!!!!!","Whaff!!!!!!!!!!!","Whaff!!!!!!!!!!!"]}]}],"definition":{"methodId":"ns=4;i=12345","methodDefinition":{"inputArguments":{"inputArguments":[{"name":"barks","dataType":"ns=0;i=7","valueRank":-1,"arrayDimensions":[[0]],"description":{"text":"specifies the number of time I should bark"}},{"name":"volume","dataType":"ns=0;i=7","valueRank":-1,"arrayDimensions":[[0]],"description":{"text":"specifies the sound volume [0 = quiet ,100 = loud]"}}],"outputArguments":[{"name":"Barks","dataType":"ns=0;i=12","valueRank":1,"arrayDimensions":[[0]],"description":{"text":"the generated barks"}}]}}}})
          done()
        })
      })
    })
  })
})
