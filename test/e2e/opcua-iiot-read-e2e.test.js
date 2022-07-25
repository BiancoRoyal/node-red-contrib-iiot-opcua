/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2022 DATATRONiQ GmbH (https://datatroniq.com)
 * Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 * All rights reserved.
 * node-red-contrib-iiot-opcua
 *
 **/

'use strict'

jest.setTimeout(20000)

var functionNode = require('@node-red/nodes/core/function/10-function')
const helperExtensions = require('../../test/test-helper-extensions')

// iiot opcua
var injectNode = require('../../src/opcua-iiot-inject')
var connectorNode = require('../../src/opcua-iiot-connector')
var inputNode = require('../../src/opcua-iiot-read')
var responseNode = require('../../src/opcua-iiot-response')
var serverNode = require('../../src/opcua-iiot-server')
var flexServerNode = require('../../src/opcua-iiot-flex-server')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var readNodesToLoad = [injectNode, functionNode, connectorNode, inputNode, responseNode, serverNode]
var readNodesToLoadWithFlexServer = [injectNode, functionNode, connectorNode, inputNode, responseNode, flexServerNode]

var testReadFlow = helperExtensions.cleanFlowPositionData([
  {
    "id": "n1rdf1",
    "type": "OPCUA-IIoT-Inject",
    "z": "d336b83d0a89384c",
    "injectType": "read",
    "payload": "testpayload",
    "payloadType": "str",
    "topic": "TestTopicRead",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "3",
    "name": "TestName",
    "addressSpaceItems": [
      {
        "name": "ServerStatus",
        "nodeId": "ns=0;i=2256",
        "datatypeName": ""
      }
    ],
    "x": 130,
    "y": 140,
    "wires": [
      [
        "n2rdf1",
        "n3rdf1"
      ]
    ]
  },
  {
    "id": "n2rdf1",
    "type": "helper",
    "z": "d336b83d0a89384c",
    "active": true,
    "x": 350,
    "y": 200,
    "wires": []
  },
  {
    "id": "n3rdf1",
    "type": "OPCUA-IIoT-Read",
    "z": "d336b83d0a89384c",
    "attributeId": 0,
    "maxAge": 1,
    "depth": 1,
    "connector": "c1rdf1",
    "name": "ReadAll",
    "justValue": true,
    "showStatusActivities": false,
    "showErrors": false,
    "parseStrings": false,
    "x": 340,
    "y": 140,
    "wires": [
      [
        "n4rdf1",
        "n5rdf1"
      ]
    ]
  },
  {
    "id": "n4rdf1",
    "type": "helper",
    "z": "d336b83d0a89384c",
    "active": true,
    "x": 570,
    "y": 200,
    "wires": []
  },
  {
    "id": "n5rdf1",
    "type": "OPCUA-IIoT-Response",
    "z": "d336b83d0a89384c",
    "name": "TestResponse",
    "showStatusActivities": false,
    "showErrors": false,
    "x": 580,
    "y": 140,
    "wires": [
      [
        "n6rdf1"
      ]
    ]
  },
  {
    "id": "n6rdf1",
    "type": "helper",
    "z": "d336b83d0a89384c",
    "active": true,
    "x": 790,
    "y": 140,
    "wires": []
  },
  {
    "id": "s1rdf1",
    "type": "OPCUA-IIoT-Server",
    "z": "d336b83d0a89384c",
    "port": "51970",
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
    "individualCerts": false,
    "isAuditing": false,
    "serverDiscovery": false,
    "users": [],
    "xmlsets": [],
    "publicCertificateFile": "",
    "privateCertificateFile": "",
    "discoveryServerEndpointUrl": "",
    "capabilitiesForMDNS": "",
    "maxNodesPerRead": 1000,
    "maxNodesPerBrowse": 2000,
    "delayToClose": "",
    "x": 330,
    "y": 80,
    "wires": [
      []
    ]
  },
  {
    "id": "c1rdf1",
    "type": "OPCUA-IIoT-Connector",
    "discoveryUrl": "",
    "endpoint": "opc.tcp://localhost:51970/",
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
  }
])

var testReadHistoryRangeFlow = helperExtensions.cleanFlowPositionData([
  {
    "id": "b6e5bc66.864128",
    "type": "OPCUA-IIoT-Inject",
    "z": "a1ff9de256ed91d9",
    "injectType": "read",
    "payload": "{\"historyStart\":0,\"historyEnd\":0}",
    "payloadType": "json",
    "topic": "TestTopicRead1",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "3",
    "name": "",
    "addressSpaceItems": [
      {
        "name": "",
        "nodeId": "ns=1;s=free_memory",
        "datatypeName": ""
      }
    ],
    "x": 110,
    "y": 360,
    "wires": [
      [
        "ed779eb9.7b89"
      ]
    ]
  },
  {
    "id": "5ab9594f.f9358",
    "type": "OPCUA-IIoT-Inject",
    "z": "a1ff9de256ed91d9",
    "injectType": "read",
    "payload": "{\"historyStart\":0,\"historyEnd\":0}",
    "payloadType": "json",
    "topic": "TestTopicRead2",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "5",
    "name": "",
    "addressSpaceItems": [
      {
        "name": "",
        "nodeId": "ns=1;s=free_memory",
        "datatypeName": ""
      }
    ],
    "x": 110,
    "y": 280,
    "wires": [
      [
        "cb36ad39.f475b8"
      ]
    ]
  },
  {
    "id": "cb36ad39.f475b8",
    "type": "function",
    "z": "a1ff9de256ed91d9",
    "name": "",
    "func": "let startDate = new Date()\nlet historyStart = new Date()\nhistoryStart.setDate(startDate.getDate() - 2)\nlet historyEnd = new Date()\n\nmsg.payload.historyStart = historyStart\nmsg.payload.historyEnd = historyEnd\n\nreturn msg;",
    "outputs": 1,
    "noerr": 0,
    "x": 260,
    "y": 280,
    "wires": [
      [
        "ed779eb9.7b89"
      ]
    ]
  },
  {
    "id": "ed779eb9.7b89",
    "type": "OPCUA-IIoT-Read",
    "z": "a1ff9de256ed91d9",
    "attributeId": "130",
    "maxAge": 1,
    "depth": 1,
    "connector": "ef9763f4.0e6728",
    "name": "Read History",
    "justValue": true,
    "showStatusActivities": false,
    "showErrors": false,
    "parseStrings": false,
    "historyDays": "",
    "x": 450,
    "y": 360,
    "wires": [
      [
        "37d1d8fb.5f4908",
        "dd2554f4.e88bd8"
      ]
    ]
  },
  {
    "id": "37d1d8fb.5f4908",
    "type": "OPCUA-IIoT-Response",
    "z": "a1ff9de256ed91d9",
    "name": "",
    "compressStructure": false,
    "showStatusActivities": false,
    "showErrors": false,
    "x": 640,
    "y": 360,
    "wires": [
      [
        "nr1h"
      ]
    ]
  },
  {
    "id": "nr1h",
    "type": "helper",
    "z": "a1ff9de256ed91d9",
    "x": 830,
    "y": 360,
    "wires": []
  },
  {
    "id": "dd2554f4.e88bd8",
    "type": "OPCUA-IIoT-Response",
    "z": "a1ff9de256ed91d9",
    "name": "",
    "compressStructure": true,
    "showStatusActivities": false,
    "showErrors": false,
    "activateFilters": false,
    "filters": [],
    "x": 650,
    "y": 300,
    "wires": [
      [
        "nr2h"
      ]
    ]
  },
  {
    "id": "nr2h",
    "type": "helper",
    "z": "a1ff9de256ed91d9",
    "x": 830,
    "y": 300,
    "wires": []
  },
  {
    "id": "920108b3.753a68",
    "type": "OPCUA-IIoT-Server",
    "z": "a1ff9de256ed91d9",
    "port": "55603",
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
    "individualCerts": false,
    "isAuditing": false,
    "serverDiscovery": false,
    "users": [],
    "xmlsets": [],
    "publicCertificateFile": "",
    "privateCertificateFile": "",
    "registerServerMethod": "1",
    "discoveryServerEndpointUrl": "",
    "capabilitiesForMDNS": "",
    "maxNodesPerRead": 1000,
    "maxNodesPerBrowse": 2000,
    "delayToClose": "",
    "x": 310,
    "y": 180,
    "wires": [
      []
    ]
  },
  {
    "id": "ef9763f4.0e6728",
    "type": "OPCUA-IIoT-Connector",
    "discoveryUrl": "",
    "endpoint": "opc.tcp://localhost:55603/",
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
    "strategyRandomisationFactor": "",
    "requestedSessionTimeout": "",
    "connectionStartDelay": "",
    "reconnectDelay": ""
  }
])

var testReadFlexServerFlow = helperExtensions.cleanFlowPositionData([
  {
    "id": "n1rdf3",
    "type": "OPCUA-IIoT-Inject",
    "z": "b337d9dd536e363a",
    "injectType": "read",
    "payload": "testpayload",
    "payloadType": "str",
    "topic": "TestTopicRead",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "3",
    "name": "TestName",
    "addressSpaceItems": [
      {
        "name": "ServerStatus",
        "nodeId": "ns=0;i=2256",
        "datatypeName": ""
      }
    ],
    "x": 210,
    "y": 140,
    "wires": [
      [
        "n2rdf3",
        "n3rdf3"
      ]
    ]
  },
  {
    "id": "n2rdf3",
    "type": "helper",
    "z": "b337d9dd536e363a",
    "x": 430,
    "y": 200,
    "wires": []
  },
  {
    "id": "n3rdf3",
    "type": "OPCUA-IIoT-Read",
    "z": "b337d9dd536e363a",
    "attributeId": 0,
    "maxAge": 1,
    "depth": 1,
    "connector": "c1rdf3",
    "name": "ReadAll",
    "justValue": true,
    "showStatusActivities": false,
    "showErrors": false,
    "parseStrings": false,
    "historyDays": "",
    "x": 420,
    "y": 140,
    "wires": [
      [
        "n4rdf3",
        "n5rdf3"
      ]
    ]
  },
  {
    "id": "n4rdf3",
    "type": "helper",
    "z": "b337d9dd536e363a",
    "x": 690,
    "y": 200,
    "wires": []
  },
  {
    "id": "n5rdf3",
    "type": "OPCUA-IIoT-Response",
    "z": "b337d9dd536e363a",
    "name": "TestResponse",
    "compressStructure": false,
    "showStatusActivities": false,
    "showErrors": false,
    "activateUnsetFilter": false,
    "activateFilters": false,
    "negateFilter": false,
    "filters": [],
    "x": 700,
    "y": 140,
    "wires": [
      [
        "n6rdf3"
      ]
    ]
  },
  {
    "id": "n6rdf3",
    "type": "helper",
    "z": "b337d9dd536e363a",
    "x": 890,
    "y": 140,
    "wires": []
  },
  {
    "id": "s1rdf3",
    "type": "OPCUA-IIoT-Flex-Server",
    "z": "b337d9dd536e363a",
    "port": "49979",
    "endpoint": "",
    "acceptExternalCommands": true,
    "maxAllowedSessionNumber": "",
    "maxConnectionsPerEndpoint": "",
    "maxAllowedSubscriptionNumber": "",
    "alternateHostname": "",
    "name": "DEMOFLEXSERVER",
    "showStatusActivities": false,
    "showErrors": false,
    "allowAnonymous": true,
    "individualCerts": false,
    "isAuditing": false,
    "serverDiscovery": false,
    "users": [],
    "xmlsets": [],
    "publicCertificateFile": "",
    "privateCertificateFile": "",
    "registerServerMethod": "1",
    "discoveryServerEndpointUrl": "",
    "capabilitiesForMDNS": "",
    "maxNodesPerRead": 1000,
    "maxNodesPerBrowse": 2000,
    "delayToClose": 500,
    "addressSpaceScript": "function constructAlarmAddressSpace(server, addressSpace, eventObjects, done) {\n  done()\n}",
    "x": 320,
    "y": 60,
    "wires": [
      []
    ]
  },
  {
    "id": "c1rdf3",
    "type": "OPCUA-IIoT-Connector",
    "discoveryUrl": "",
    "endpoint": "opc.tcp://localhost:49979/",
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
  }
])

describe('OPC UA Read node e2e Testing', function () {
  beforeEach(function (done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function (done) {
    helper.unload().then(function () {
      helper.stopServer(function () {
        done()
      })
    }).catch(function () {
      helper.stopServer(function () {
        done()
      })
    })
  })

  describe('Read node',  function () {
    it('should get a message with payload for attributeId All',  function (done) {
      testReadFlow[2].attributeId = 0
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', async function (msg) {
          expect(msg.payload.value).toBe('testpayload')
          expect(msg.payload.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
          await done()
        })
      })
    })

    it('should have read results for attributeId All', function (done) {
      testReadFlow[2].attributeId = 0
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', async function (msg) {
          expect(msg.payload.value[0].nodeId).toBe('ns=0;i=2256')
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(0)
          await done()
        })
      })
    })

    it('should have read results with response for attributeId 0', function (done) {
      testReadFlow[2].attributeId = 0
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', async function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({
            "good": 1,
            "bad": 0,
            "other": 0
          })
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(0)
          await done()
        })
      })
    })

    it('should have read results with response for attributeId 0 from flex server', function (done) {
      testReadFlow[2].attributeId = 0
      helper.load(readNodesToLoadWithFlexServer, testReadFlexServerFlow, function () {
        let n6 = helper.getNode('n6rdf3')
        n6.on('input', async function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ "good": 1, "bad": 0, "other": 0 })
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(0)
         await done()
        })
      })
    })

    it('should get a message with payload for attributeId Node-ID', function (done) {
      testReadFlow[2].attributeId = 1
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', async function (msg) {
          expect(msg.payload.value).toBe('testpayload')
          expect(msg.payload.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
         await done()
        })
      })
    })

    it('should have read results for attributeId Node-ID', function (done) {
      testReadFlow[2].attributeId = 1
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', async function (msg) {
          expect(msg.payload.value[0]).toBeDefined()
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(1)
         await done()
        })
      })
    })

    it('should have read results with response for attributeId Node-ID', function (done) {
      testReadFlow[2].attributeId = 1
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', async function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ "good": 1, "bad": 0, "other": 0 })
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(1)
         await done()
        })
      })
    })

    it('should get a message with payload for attributeId Node-Class', function (done) {
      testReadFlow[2].attributeId = 2
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', async function (msg) {
          expect(msg.payload.value).toBe('testpayload')
          expect(msg.payload.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
         await done()
        })
      })
    })

    it('should have read results for attributeId Node-Class', function (done) {
      testReadFlow[2].attributeId = 2
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', async function (msg) {
          expect(msg.payload.value[0]).toBeDefined()
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(2)
         await done()
        })
      })
    })

    it('should have read results with response for attributeId Node-Class', function (done) {
      testReadFlow[2].attributeId = 2
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', async function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ "good": 1, "bad": 0, "other": 0 })
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(2)
         await done()
        })
      })
    })

    it('should get a message with payload for attributeId Browse-Name', function (done) {
      testReadFlow[2].attributeId = 3
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', async function (msg) {
          expect(msg.payload.value).toBe('testpayload')
          expect(msg.payload.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
         await done()
        })
      })
    })

    it('should have read results for attributeId Browse-Name', function (done) {
      testReadFlow[2].attributeId = 3
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', async function (msg) {
          expect(msg.payload.value[0]).toBeDefined()
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(3)
         await done()
        })
      })
    })

    it('should have read results with response for attributeId Browse-Name', function (done) {
      testReadFlow[2].attributeId = 3
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', async function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ "good": 1, "bad": 0, "other": 0 })
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(3)
         await done()
        })
      })
    })

    it('should get a message with payload for attributeId Display-Name', function (done) {
      testReadFlow[2].attributeId = 4
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', async function (msg) {
          expect(msg.payload.value).toBe('testpayload')
          expect(msg.payload.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
         await done()
        })
      })
    })

    it('should have read results for attributeId Display-Name', function (done) {
      testReadFlow[2].attributeId = 4
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', async function (msg) {
          expect(msg.payload.value[0]).toBeDefined()
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(4)
         await done()
        })
      })
    })

    it('should have read results with response for attributeId Display-Name', function (done) {
      testReadFlow[2].attributeId = 4
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', async function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ "good": 1, "bad": 0, "other": 0 })
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(4)
         await done()
        })
      })
    })

    it('should get a message with payload for attributeId Value', function (done) {
      testReadFlow[2].attributeId = 13
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', async function (msg) {
          expect(msg.payload.value).toBe('testpayload')
          expect(msg.payload.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
         await done()
        })
      })
    })

    it('should have read results for attributeId Value', function (done) {
      testReadFlow[2].attributeId = 13
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', async function (msg) {
          expect(msg.payload.value[0]).toBeDefined()
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(13)
         await done()
        })
      })
    })

    it('should have read results with response for attributeId Value', function (done) {
      testReadFlow[2].attributeId = 13
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', async function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ "good": 1, "bad": 0, "other": 0 })
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.attributeId).toBe(13)
         await done()
        })
      })
    })

    it('should get a message with payload for attributeId History', function (done) {
      testReadFlow[2].attributeId = 130
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', async function (msg) {
          expect(msg.payload.value).toBe('testpayload')
          expect(msg.payload.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
         await done()
        })
      })
    })

    it('should have read results for attributeId History', function (done) {
      testReadFlow[2].attributeId = 130
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', async function (msg) {
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.value[0]).toBeDefined()
          expect(msg.payload.historyStart).toBeDefined()
          expect(msg.payload.historyEnd).toBeDefined()
          expect(msg.payload.attributeId).toBe(130)
         await done()
        })
      })
    })

    it('should have read results with response for attributeId History', function (done) {
      testReadFlow[2].attributeId = 130
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', async function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ "good": 1, "bad": 0, "other": 0 })
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.readtype).toBe('HistoryValue')
          expect(msg.payload.historyStart).toBeDefined()
          expect(msg.payload.historyEnd).toBeDefined()
          expect(msg.payload.attributeId).toBe(130)
         await done()
        })
      })
    })

    it('should have read with an injected time range results with response for attributeId History', function (done) {
      helper.load(readNodesToLoad, testReadHistoryRangeFlow, function () {
        let msgCounter = 0
        let n1 = helper.getNode('nr1h')
        n1.on('input', async function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.entryStatus).toMatchObject({ "good": 1, "bad": 0, "other": 0 })
            expect(msg.topic).toBe('TestTopicRead1')
            expect(msg.payload.readtype).toBe('HistoryValue')
            expect(msg.payload.historyStart).toBeDefined()
            expect(msg.payload.historyEnd).toBeDefined()
            expect(msg.payload.attributeId).toBe(130)
          }

          if (msgCounter === 2) {
            expect(msg.payload.entryStatus).toMatchObject({ "good": 1, "bad": 0, "other": 0 })
            expect(msg.topic).toBe('TestTopicRead2')
            expect(msg.payload.readtype).toBe('HistoryValue')
            expect(msg.payload.historyStart).toBeDefined()
            expect(msg.payload.historyEnd).toBeDefined()
            expect(msg.payload.attributeId).toBe(130)
           await done()
          }
        })
      })
    })

    it('should have read with an injected time range results with compressed response for attributeId History', function (done) {
      helper.load(readNodesToLoad, testReadHistoryRangeFlow, function () {
        let msgCounter = 0
        let n2 = helper.getNode('nr2h')
        n2.on('input', async function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.entryStatus).toMatchObject({ "good": 1, "bad": 0, "other": 0 })
            expect(msg.topic).toBe('TestTopicRead1')
            expect(msg.payload.historyStart).toBeDefined()
            expect(msg.payload.historyEnd).toBeDefined()
            expect(msg.payload.attributeId).toBeUndefined()
          }

          if (msgCounter === 2) {
            expect(msg.payload.entryStatus).toMatchObject({ "good": 1, "bad": 0, "other": 0 })
            expect(msg.topic).toBe('TestTopicRead2')
            expect(msg.payload.historyStart).toBeDefined()
            expect(msg.payload.historyEnd).toBeDefined()
            expect(msg.payload.attributeId).toBeUndefined()
           await done()
          }
        })
      })
    })
  })
})
