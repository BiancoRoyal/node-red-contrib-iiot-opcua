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

jest.setTimeout(60000)

// iiot opc ua nodes
var injectNode = require('../../src/opcua-iiot-inject')
var serverNode = require('../../src/opcua-iiot-server')
var responseNode = require('../../src/opcua-iiot-response')
var connectorNode = require('../../src/opcua-iiot-connector')
var inputNode = require('../../src/opcua-iiot-listener')
var browserNode = require('../../src/opcua-iiot-browser')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var listenerNodesToLoad = [injectNode, browserNode, connectorNode, inputNode, responseNode, serverNode]

var testListenerMonitoringFlow = [
  {
    'id': 'c9ca1bbe.d1cb2',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': '{"interval":500,"queueSize":4,"options":{"requestedPublishingInterval":1000,"requestedLifetimeCount":60,"requestedMaxKeepAliveCount":10,"maxNotificationsPerPublish":4,"publishingEnabled":true,"priority":1}}',
    'payloadType': 'json',
    'topic': 'TestTopicSubscribe',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2.4',
    'name': 'Start Abo',
    'addressSpaceItems': [
      {
        'name': 'FullCounter',
        'nodeId': 'ns=1;s=FullCounter',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        'd9754392.9eb1d', 'n2li'
      ]
    ]
  },
  {
    'id': '273f8497.2f8b44',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': '{"interval":500,"queueSize":4,"options":{"requestedPublishingInterval":1000,"requestedLifetimeCount":60,"requestedMaxKeepAliveCount":10,"maxNotificationsPerPublish":4,"publishingEnabled":true,"priority":1}}',
    'payloadType': 'json',
    'topic': 'TestTopicUnsubscribe',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '5.5',
    'name': 'End Abo',
    'addressSpaceItems': [
      {
        'name': 'FullCounter',
        'nodeId': 'ns=1;s=FullCounter',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        'd9754392.9eb1d', 'n2li'
      ]
    ]
  },
  {id: 'n2li', type: 'helper'},
  {
    'id': 'd9754392.9eb1d',
    'type': 'OPCUA-IIoT-Listener',
    'connector': 'c95fc9fc.64ccc',
    'action': 'subscribe',
    'queueSize': '1',
    'name': '',
    'justValue': true,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        'b0856b45.da4a18', 'n3li'
      ]
    ]
  },
  {id: 'n3li', type: 'helper'},
  {
    'id': 'b0856b45.da4a18',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateFilters': false,
    'filters': [],
    'wires': [
      [
        'n4li'
      ]
    ]
  },
  {id: 'n4li', type: 'helper'},
  {
    'id': '4ab7dc9.b7c5624',
    'type': 'OPCUA-IIoT-Server',
    'port': '1985',
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
    'registerServerMethod': 1,
    'discoveryServerEndpointUrl': '',
    'capabilitiesForMDNS': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [
      []
    ]
  },
  {
    'id': 'c95fc9fc.64ccc',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:1985/',
    'keepSessionAlive': true,
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
  }
]

var recursiveBrowserAboFlow = [
  {
    'id': '8a761f37.f69808',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': '{"interval":500,"queueSize":4,"options":{"requestedPublishingInterval":1000,"requestedLifetimeCount":60,"requestedMaxKeepAliveCount":10,"maxNotificationsPerPublish":4,"publishingEnabled":true,"priority":1}}',
    'payloadType': 'json',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '4',
    'name': 'Root',
    'addressSpaceItems': [],
    'wires': [
      [
        '18b3e5b9.f9ba4a',
        'n1abo'
      ]
    ]
  },
  {id: 'n1abo', type: 'helper'},
  {
    'id': '18b3e5b9.f9ba4a',
    'type': 'OPCUA-IIoT-Browser',
    'connector': '296a2f29.56e248',
    'nodeId': 'i=85',
    'name': '',
    'justValue': true,
    'sendNodesToRead': false,
    'sendNodesToListener': true,
    'sendNodesToBrowser': false,
    'singleBrowseResult': false,
    'recursiveBrowse': true,
    'recursiveDepth': '1',
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        '44548ff9.287e48',
        'f142e56c.d7906',
        'n2abo'
      ]
    ]
  },
  {id: 'n2abo', type: 'helper'},
  {
    'id': '44548ff9.287e48',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateFilters': false,
    'filters': [],
    'wires': [
      [
        'n3abo'
      ]
    ]
  },
  {id: 'n3abo', type: 'helper'},
  {
    'id': 'f142e56c.d7906',
    'type': 'OPCUA-IIoT-Listener',
    'connector': '296a2f29.56e248',
    'action': 'subscribe',
    'queueSize': '1',
    'name': '',
    'justValue': true,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        'c2a66a6.1940198',
        'n4abo'
      ]
    ]
  },
  {id: 'n4abo', type: 'helper'},
  {
    'id': 'c2a66a6.1940198',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateFilters': false,
    'filters': [],
    'wires': [
      [
        'n5abo'
      ]
    ]
  },
  {id: 'n5abo', type: 'helper'},
  {
    'id': '296a2f29.56e248',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:3335/',
    'keepSessionAlive': true,
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
    'id': '37396e13.734bd2',
    'type': 'OPCUA-IIoT-Server',
    'port': '3335',
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
    'serverDiscovery': false,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'registerServerMethod': 1,
    'discoveryServerEndpointUrl': '',
    'capabilitiesForMDNS': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [
      []
    ]
  }
]

var feedListenerWithRecursiveBrowse = [
  {
    'id': '3b4d83c1.6b490c',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': '{"interval":500,"queueSize":4,"options":{"requestedPublishingInterval":1000,"requestedLifetimeCount":60,"requestedMaxKeepAliveCount":10,"maxNotificationsPerPublish":4,"publishingEnabled":true,"priority":1}}',
    'payloadType': 'json',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '4',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        '70a1a122.850e4'
      ]
    ]
  },
  {
    'id': '70a1a122.850e4',
    'type': 'OPCUA-IIoT-Browser',
    'connector': 'c95fc9fc.64ccc',
    'nodeId': 'ns=1;i=1001',
    'name': '',
    'justValue': false,
    'sendNodesToRead': false,
    'sendNodesToListener': true,
    'sendNodesToBrowser': false,
    'singleBrowseResult': true,
    'recursiveBrowse': true,
    'recursiveDepth': '1',
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        'n1brli',
        '66692416.1b2bb4'
      ]
    ]
  },
  {id: 'n1brli', type: 'helper'},
  {
    'id': '66692416.1b2bb4',
    'type': 'OPCUA-IIoT-Listener',
    'connector': 'c95fc9fc.64ccc',
    'action': 'subscribe',
    'queueSize': '1',
    'name': '',
    'justValue': true,
    'useGroupItems': true,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        'e604f20a.c8bd4',
        'n2brli'
      ]
    ]
  },
  {id: 'n2brli', type: 'helper'},
  {
    'id': 'e604f20a.c8bd4',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateFilters': true,
    'filters': [
      {
        'name': 'dataType',
        'value': 'Int32'
      }
    ],
    'wires': [
      [
        'n3brli'
      ]
    ]
  },
  {id: 'n3brli', type: 'helper'},
  {
    'id': 'c95fc9fc.64ccc',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:3336/',
    'keepSessionAlive': true,
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
    'id': '37396e13.734bd2',
    'type': 'OPCUA-IIoT-Server',
    'port': '3336',
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
    'registerServerMethod': 1,
    'discoveryServerEndpointUrl': '',
    'capabilitiesForMDNS': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [
      []
    ]
  }
]

describe('OPC UA Listener monitoring node e2e Testing', function () {
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

  describe('Listen node', function () {
    let msgCounter = 0

    it('should get a message with payload after inject on unsubscribe', function (done) {
      helper.load(listenerNodesToLoad, testListenerMonitoringFlow, function () {
        msgCounter = 0
        let n2 = helper.getNode('n2li')
        n2.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 2) {
            expect(msg.topic).toBe('TestTopicUnsubscribe')
            expect(msg.nodetype).toBe('inject')
            expect(msg.injectType).toBe('listen')
            setTimeout(done, 2000)
          }
        })
      })
    })

    it('should verify a message on changed monitored item with statusCode on subscribe', function (done) {
      helper.load(listenerNodesToLoad, testListenerMonitoringFlow, function () {
        msgCounter = 0
        let n3 = helper.getNode('n3li')
        n3.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.value).toBeDefined()
            expect(msg.payload.value.dataType).toBe('Int32')
            expect(msg.payload.statusCode).toBeDefined()
            done()
          }
        })
      })
    })

    it('should verify a compressed message from response node on subscribe', function (done) {
      helper.load(listenerNodesToLoad, testListenerMonitoringFlow, function () {
        msgCounter = 0
        let n4 = helper.getNode('n4li')
        n4.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.value).toBeDefined()
            expect(msg.payload.dataType).toBe('Int32')
            expect(msg.payload.nodeId).toBe('ns=1;s=FullCounter')
            expect(msg.payload.statusCode).not.toBeDefined()
            done()
          }
        })
      })
    })

    it('should verify a compressed message from response node on subscribe recursive', function (done) {
      recursiveBrowserAboFlow[2].singleBrowseResult = false
      helper.load(listenerNodesToLoad, recursiveBrowserAboFlow, function () {
        msgCounter = 0
        let n5 = helper.getNode('n5abo')
        n5.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            setTimeout(done, 2000)
          }
        })
      })
    })

    it('should verify a compressed message from response node on subscribe recursive as single result', function (done) {
      recursiveBrowserAboFlow[2].singleBrowseResult = true
      helper.load(listenerNodesToLoad, recursiveBrowserAboFlow, function () {
        msgCounter = 0
        let n5 = helper.getNode('n5abo')
        n5.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            setTimeout(done, 2000)
          }
        })
      })
    })

    it('should subscribe from recursive browse from multiple results', function (done) {
      feedListenerWithRecursiveBrowse[1].singleBrowseResult = false
      helper.load(listenerNodesToLoad, feedListenerWithRecursiveBrowse, function () {
        msgCounter = 0
        let n2 = helper.getNode('n2brli')
        n2.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            setTimeout(done, 2000)
          }
        })
      })
    })

    it('should subscribe from recursive browse from single result', function (done) {
      feedListenerWithRecursiveBrowse[1].singleBrowseResult = true
      helper.load(listenerNodesToLoad, feedListenerWithRecursiveBrowse, function () {
        msgCounter = 0
        let n2 = helper.getNode('n2brli')
        n2.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            setTimeout(done, 2000)
          }
        })
      })
    })
  })
})
