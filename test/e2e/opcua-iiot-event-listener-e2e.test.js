/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2018,2019 Klaus Landsdorf (https://bianco-royal.com/)
 * All rights reserved.
 * node-red-contrib-iiot-opcua
 *
 **/

'use strict'

jest.setTimeout(60000)

// iiot opc ua nodes
var injectNode = require('../../src/opcua-iiot-inject')
var eventNode = require('../../src/opcua-iiot-event')
var responseNode = require('../../src/opcua-iiot-response')
var serverNode = require('../../src/opcua-iiot-server')
var connectorNode = require('../../src/opcua-iiot-connector')
var inputNode = require('../../src/opcua-iiot-listener')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var eventNodesToLoad = [injectNode, eventNode, connectorNode, inputNode, serverNode, responseNode]

var testListenerEventFlow = [
  {
    'id': 'n1ev',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': '{ "interval": 250, "queueSize": 1 }',
    'payloadType': 'num',
    'topic': 'TestTopicEvent',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'listen with 200 ms',
    'addressSpaceItems': [
      {
        'name': 'Tanks',
        'nodeId': 'ns=1;i=1000',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        'n2ev', 'n3ev'
      ]
    ]
  },
  {
    'id': 'u1ev',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': 'unsubscribe',
    'payloadType': 'str',
    'topic': 'TestTopicEventUnsubscribe',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '6',
    'name': 'Unsubscribe',
    'addressSpaceItems': [
      {
        'name': 'Tanks',
        'nodeId': 'ns=1;i=1000',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        'n2ev', 'n3ev'
      ]
    ]
  },
  {id: 'n2ev', type: 'helper'},
  {
    'id': 'n3ev',
    'type': 'OPCUA-IIoT-Event',
    'eventType': 'BaseEventType',
    'eventTypeLabel': 'BaseEventType (i=2041)',
    'queueSize': '1',
    'usingListener': true,
    'name': 'Base Events',
    'showStatusActivities': false,
    'showErrors': true,
    'wires': [
      [
        'n4ev', 'n5ev'
      ]
    ]
  },
  {id: 'n4ev', type: 'helper'},
  {
    'id': 'n5ev',
    'type': 'OPCUA-IIoT-Listener',
    'connector': 'c1ev',
    'action': 'events',
    'queueSize': '1',
    'name': '',
    'justValue': true,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        'n6ev'
      ]
    ]
  },
  {id: 'n6ev', type: 'helper'},
  {
    'id': 'c1ev',
    'type': 'OPCUA-IIoT-Connector',
    'z': '9deca36b.f0384',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:51988',
    'keepSessionAlive': false,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'NONE',
    'name': 'LOCAL DEMO SERVER',
    'showErrors': true,
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
    'id': 's1ev',
    'type': 'OPCUA-IIoT-Server',
    'port': '51988',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'TestServer',
    'showStatusActivities': false,
    'showErrors': false,
    'asoDemo': true,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': false,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'delayToClose': 4000,
    'wires': [[]]
  }
]

var listenToEventsOnServer = [
  {
    'id': 'c4107b6c.885328',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': '250',
    'payloadType': 'num',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '4',
    'name': 'listen with 200 ms',
    'addressSpaceItems': [
      {
        'name': 'BiancoRoyal',
        'nodeId': 'ns=1;i=1234',
        'datatypeName': ''
      },
      {
        'name': 'Tanks',
        'nodeId': 'ns=1;i=1000',
        'datatypeName': ''
      },
      {
        'name': 'Server',
        'nodeId': 'ns=0;i=2253',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        '7a62a52a.b16114'
      ]
    ]
  },
  {
    'id': '7a62a52a.b16114',
    'type': 'OPCUA-IIoT-Event',
    'eventType': 'BaseEventType',
    'eventTypeLabel': 'BaseEventType (i=2041)',
    'queueSize': '1000',
    'usingListener': true,
    'name': 'Base Events',
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        '76db0764.6b88c8'
      ]
    ]
  },
  {
    'id': '76db0764.6b88c8',
    'type': 'OPCUA-IIoT-Listener',
    'connector': '4de0c979.b3757',
    'action': 'events',
    'queueSize': '100',
    'name': '',
    'justValue': true,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        'nh1ev'
      ]
    ]
  },
  {id: 'nh1ev', type: 'helper'},
  {
    'id': '4de0c979.b3757',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:51648/',
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
    'autoSelectRightEndpoint': false
  },
  {
    'id': 's1ev',
    'type': 'OPCUA-IIoT-Server',
    'port': '51648',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'TestServer',
    'showStatusActivities': false,
    'showErrors': false,
    'asoDemo': true,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': false,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'delayToClose': 4000,
    'wires': [[]]
  }
]

var listenToEventsWithResponseOnServer = [
  {
    'id': 'c4107b6c.885322',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': '250',
    'payloadType': 'num',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '4',
    'name': 'listen with 200 ms',
    'addressSpaceItems': [
      {
        'name': 'BiancoRoyal',
        'nodeId': 'ns=1;i=1234',
        'datatypeName': ''
      },
      {
        'name': 'Tanks',
        'nodeId': 'ns=1;i=1000',
        'datatypeName': ''
      },
      {
        'name': 'Server',
        'nodeId': 'ns=0;i=2253',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        '7a62a52a.b16111'
      ]
    ]
  },
  {
    'id': '7a62a52a.b16111',
    'type': 'OPCUA-IIoT-Event',
    'eventType': 'BaseEventType',
    'eventTypeLabel': 'BaseEventType (i=2041)',
    'queueSize': '1000',
    'usingListener': true,
    'name': 'Base Events',
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        '76db0764.6b88c1'
      ]
    ]
  },
  {
    'id': '76db0764.6b88c1',
    'type': 'OPCUA-IIoT-Listener',
    'connector': 'nhcf2',
    'action': 'events',
    'queueSize': '100',
    'name': '',
    'justValue': true,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        'nh1evf2', 'nh2evf2', 'nh21evf2'
      ]
    ]
  },
  {id: 'nh1evf2', type: 'helper'},
  {
    'id': 'nh2evf2',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateFilters': true,
    'filters': [],
    'wires': [
      [
        'nh3evf2'
      ]
    ]
  },
  {id: 'nh3evf2', type: 'helper'},
  {
    'id': 'nh21evf2',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': false,
    'showStatusActivities': false,
    'showErrors': false,
    'activateFilters': false,
    'filters': [],
    'wires': [
      [
        'nh31evf2'
      ]
    ]
  },
  {id: 'nh31evf2', type: 'helper'},
  {
    'id': 'nhcf2',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:49448/',
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
    'autoSelectRightEndpoint': false
  },
  {
    'id': 's1evf2',
    'type': 'OPCUA-IIoT-Server',
    'port': '49448',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'TestServer',
    'showStatusActivities': false,
    'showErrors': false,
    'asoDemo': true,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': false,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'delayToClose': 4000,
    'wires': [[]]
  }
]

describe('OPC UA Listener event node e2e Testing', function () {
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

  describe('Listen event node', function () {
    let msgCounter = 0

    it('should get a message with nodetype events after base event node subscribe', function (done) {
      helper.load(eventNodesToLoad, testListenerEventFlow, function () {
        msgCounter = 0
        let n4 = helper.getNode('n4ev')
        n4.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.topic).toBe('TestTopicEvent')
            expect(msg.nodetype).toBe('events')
            expect(msg.injectType).toBe('listen')
            setTimeout(done, 2000)
          }
        })
      })
    })

    it('should get a message with payload test after base event node subscribe', function (done) {
      helper.load(eventNodesToLoad, testListenerEventFlow, function () {
        msgCounter = 0
        let n4 = helper.getNode('n4ev')
        n4.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.eventType).toBe('BaseEventType')
            expect(msg.payload.eventFilter).toBeDefined()
            expect(msg.payload.eventFields).toBeDefined()
            setTimeout(done, 2000)
          }
        })
      })
    })

    it('should get a message with payload after inject unsubscribe', function (done) {
      helper.load(eventNodesToLoad, testListenerEventFlow, function () {
        msgCounter = 0
        let n2 = helper.getNode('n2ev')
        n2.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 2) {
            expect(msg.topic).toBe('TestTopicEventUnsubscribe')
            expect(msg.nodetype).toBe('inject')
            expect(msg.injectType).toBe('listen')
            setTimeout(done, 2000)
          }
        })
      })
    })

    it('should get a message with payload after base event unsubscribe', function (done) {
      helper.load(eventNodesToLoad, testListenerEventFlow, function () {
        msgCounter = 0
        let n2 = helper.getNode('n4ev')
        n2.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 2) {
            expect(msg.topic).toBe('TestTopicEventUnsubscribe')
            expect(msg.nodetype).toBe('events')
            expect(msg.injectType).toBe('listen')
            setTimeout(done, 2000)
          }
        })
      })
    })

    it('should get a message with payload after base event subscribe', function (done) {
      helper.load(eventNodesToLoad, listenToEventsOnServer, function () {
        let n1 = helper.getNode('nh1ev')
        n1.on('input', function (msg) {
          done()
        })
      })
    })

    it('should get a compressed response with payload after base event subscribe', function (done) {
      helper.load(eventNodesToLoad, listenToEventsWithResponseOnServer, function () {
        let n2 = helper.getNode('nh2evf2')
        n2.on('input', function (msg) {
          done()
        })
      })
    })
  })
})
