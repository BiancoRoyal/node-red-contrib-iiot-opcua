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

jest.setTimeout(10000)

// iiot opcua
var injectNode = require('../../src/opcua-iiot-inject')
var connectorNode = require('../../src/opcua-iiot-connector')
var inputNode = require('../../src/opcua-iiot-read')
var responseNode = require('../../src/opcua-iiot-response')
var serverNode = require('../../src/opcua-iiot-server')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var readNodesToLoad = [injectNode, connectorNode, inputNode, responseNode, serverNode]

var testReadFlow = [
  {
    'id': 'n1rdf1',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'read',
    'payload': 'testpayload',
    'payloadType': 'str',
    'topic': 'TestTopicRead',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2.4',
    'name': 'TestName',
    'addressSpaceItems': [
      {
        'name': 'ServerStatus',
        'nodeId': 'ns=0;i=2256',
        'datatypeName': ''
      }
    ],
    'wires': [['n2rdf1', 'n3rdf1']]
  },
  {id: 'n2rdf1', type: 'helper'},
  {
    'id': 'n3rdf1',
    'type': 'OPCUA-IIoT-Read',
    'attributeId': 0,
    'maxAge': 1,
    'depth': 1,
    'connector': 'c1rdf1',
    'name': 'ReadAll',
    'justValue': true,
    'showStatusActivities': false,
    'showErrors': false,
    'parseStrings': false,
    'wires': [['n4rdf1', 'n5rdf1']]
  },
  {id: 'n4rdf1', type: 'helper'},
  {
    'id': 'n5rdf1',
    'type': 'OPCUA-IIoT-Response',
    'name': 'TestResponse',
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [['n6rdf1']]
  },
  {id: 'n6rdf1', type: 'helper'},
  {
    'id': 'c1rdf1',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:1970/',
    'keepSessionAlive': false,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'NONE',
    'name': 'LOCAL DEMO SERVER',
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
    'id': 's1rdf1',
    'type': 'OPCUA-IIoT-Server',
    'port': '1970',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': '',
    'showStatusActivities': false,
    'showErrors': false,
    'asoDemo': true,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': true,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [[]]
  }
]

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

  describe('Read node', function () {
    let attributeId = ''

    it('should get a message with payload for attributeId All', function (done) {
      attributeId = 0
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', function (msg) {
          expect(msg.payload).toBe('testpayload')
          expect(msg.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
          setTimeout(done, 2000)
        })
      })
    })

    it('should have read results for attributeId All', function (done) {
      attributeId = 0
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', function (msg) {
          expect(msg.payload[0].nodeId).toBe('ns=0;i=2256')
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.attributeId).toBe(attributeId)
          done()
        })
      })
    })

    it('should have read results with response for attributeId ' + attributeId, function (done) {
      attributeId = 0
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', function (msg) {
          expect(msg.entryStatus).toMatchObject([1, 0, 0])
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.attributeId).toBe(attributeId)
          done()
        })
      })
    })

    it('should get a message with payload for attributeId Node-ID', function (done) {
      attributeId = 1
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', function (msg) {
          expect(msg.payload).toBe('testpayload')
          expect(msg.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
          setTimeout(done, 2000)
        })
      })
    })

    it('should have read results for attributeId Node-ID', function (done) {
      attributeId = 1
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', function (msg) {
          expect(msg.payload[0].value).toBeDefined()
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.attributeId).toBe(attributeId)
          done()
        })
      })
    })

    it('should have read results with response for attributeId Node-ID', function (done) {
      attributeId = 1
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', function (msg) {
          expect(msg.entryStatus).toMatchObject([1, 0, 0])
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.attributeId).toBe(attributeId)
          done()
        })
      })
    })

    it('should get a message with payload for attributeId Node-Class', function (done) {
      attributeId = 2
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', function (msg) {
          expect(msg.payload).toBe('testpayload')
          expect(msg.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
          setTimeout(done, 2000)
        })
      })
    })

    it('should have read results for attributeId Node-Class', function (done) {
      attributeId = 2
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', function (msg) {
          expect(msg.payload[0].value).toBeDefined()
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.attributeId).toBe(attributeId)
          done()
        })
      })
    })

    it('should have read results with response for attributeId Node-Class', function (done) {
      attributeId = 2
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', function (msg) {
          expect(msg.entryStatus).toMatchObject([1, 0, 0])
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.attributeId).toBe(attributeId)
          done()
        })
      })
    })

    it('should get a message with payload for attributeId Browse-Name', function (done) {
      attributeId = 3
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', function (msg) {
          expect(msg.payload).toBe('testpayload')
          expect(msg.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
          setTimeout(done, 2000)
        })
      })
    })

    it('should have read results for attributeId Browse-Name', function (done) {
      attributeId = 3
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', function (msg) {
          expect(msg.payload[0].value).toBeDefined()
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.attributeId).toBe(attributeId)
          done()
        })
      })
    })

    it('should have read results with response for attributeId Browse-Name', function (done) {
      attributeId = 3
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', function (msg) {
          expect(msg.entryStatus).toMatchObject([1, 0, 0])
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.attributeId).toBe(attributeId)
          done()
        })
      })
    })

    it('should get a message with payload for attributeId Display-Name', function (done) {
      attributeId = 4
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', function (msg) {
          expect(msg.payload).toBe('testpayload')
          expect(msg.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
          setTimeout(done, 2000)
        })
      })
    })

    it('should have read results for attributeId Display-Name', function (done) {
      attributeId = 4
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', function (msg) {
          expect(msg.payload[0].value).toBeDefined()
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.attributeId).toBe(attributeId)
          done()
        })
      })
    })

    it('should have read results with response for attributeId Display-Name', function (done) {
      attributeId = 4
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', function (msg) {
          expect(msg.entryStatus).toMatchObject([1, 0, 0])
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.attributeId).toBe(attributeId)
          done()
        })
      })
    })

    it('should get a message with payload for attributeId Value', function (done) {
      attributeId = 13
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', function (msg) {
          expect(msg.payload).toBe('testpayload')
          expect(msg.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
          setTimeout(done, 2000)
        })
      })
    })

    it('should have read results for attributeId Value', function (done) {
      attributeId = 13
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', function (msg) {
          expect(msg.payload[0].value).toBeDefined()
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.attributeId).toBe(attributeId)
          done()
        })
      })
    })

    it('should have read results with response for attributeId Value', function (done) {
      attributeId = 13
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', function (msg) {
          expect(msg.entryStatus).toMatchObject([1, 0, 0])
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.attributeId).toBe(attributeId)
          done()
        })
      })
    })

    it('should get a message with payload for attributeId History', function (done) {
      attributeId = 130
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n2 = helper.getNode('n2rdf1')
        n2.on('input', function (msg) {
          expect(msg.payload).toBe('testpayload')
          expect(msg.addressSpaceItems).toMatchObject([{
            'name': 'ServerStatus',
            'nodeId': 'ns=0;i=2256',
            'datatypeName': ''
          }])
          setTimeout(done, 2000)
        })
      })
    })

    it('should have read results for attributeId History', function (done) {
      attributeId = 130
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n4 = helper.getNode('n4rdf1')
        n4.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.attributeId).toBe(attributeId)
          done()
        })
      })
    })

    it('should have read results with response for attributeId History', function (done) {
      attributeId = 130
      testReadFlow[2].attributeId = attributeId
      helper.load(readNodesToLoad, testReadFlow, function () {
        let n6 = helper.getNode('n6rdf1')
        n6.on('input', function (msg) {
          expect(msg.entryStatus).toMatchObject([0, 1, 0])
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.attributeId).toBe(attributeId)
          done()
        })
      })
    })
  })
})
