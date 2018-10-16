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

jest.setTimeout(30000)

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
    'payload': '{"interval":250,"queueSize":4,"options":{"requestedPublishingInterval":500,"requestedLifetimeCount":60,"requestedMaxKeepAliveCount":10,"maxNotificationsPerPublish":4,"publishingEnabled":true,"priority":1}}',
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
    'payload': '{"interval":250,"queueSize":4,"options":{"requestedPublishingInterval":500,"requestedLifetimeCount":60,"requestedMaxKeepAliveCount":10,"maxNotificationsPerPublish":4,"publishingEnabled":true,"priority":1}}',
    'payloadType': 'json',
    'topic': 'TestTopicUnsubscribe',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '4.4',
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

var testListenerMonitoringAboFlow = [
  {
    'id': 'c9ca1bbe.d1cb3',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': '{"interval":500,"queueSize":4,"options":{"requestedPublishingInterval":1000,"requestedLifetimeCount":60,"requestedMaxKeepAliveCount":10,"maxNotificationsPerPublish":4,"publishingEnabled":true,"priority":1}}',
    'payloadType': 'json',
    'topic': 'TestTopicSubscribe1',
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
        'd9754392.9eb1e', 'n1lia'
      ]
    ]
  },
  {
    'id': 'c9ca1bbe.d1cb4',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': '',
    'payloadType': 'string',
    'topic': 'TestTopicUnsubscribe1',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '4.4',
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
        'd9754392.9eb1e', 'n1lia'
      ]
    ]
  },
  {id: 'n1lia', type: 'helper'},
  {
    'id': 'c9ca1bbe.d1cb5',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': '{"interval":500,"queueSize":4,"options":{"requestedPublishingInterval":1000,"requestedLifetimeCount":60,"requestedMaxKeepAliveCount":10,"maxNotificationsPerPublish":4,"publishingEnabled":true,"priority":1}}',
    'payloadType': 'json',
    'topic': 'TestTopicSubscribe2',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '6.4',
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
        'd9754392.9eb1e', 'n2lia'
      ]
    ]
  },
  {
    'id': 'c9ca1bbe.d1cb6',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': '',
    'payloadType': 'string',
    'topic': 'TestTopicUnsubscribe2',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '8.4',
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
        'd9754392.9eb1e', 'n2lia'
      ]
    ]
  },
  {id: 'n2lia', type: 'helper'},
  {
    'id': 'd9754392.9eb1e',
    'type': 'OPCUA-IIoT-Listener',
    'connector': 'c95fc9fc.64ccb',
    'action': 'subscribe',
    'queueSize': '1',
    'name': '',
    'justValue': true,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        'b0856b45.da4a19', 'n3lia'
      ]
    ]
  },
  {id: 'n3lia', type: 'helper'},
  {
    'id': 'b0856b45.da4a19',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateFilters': false,
    'filters': [],
    'wires': [
      [
        'n4lia'
      ]
    ]
  },
  {id: 'n4lia', type: 'helper'},
  {
    'id': '4ab7dc9.b7c5625',
    'type': 'OPCUA-IIoT-Server',
    'port': '5585',
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
  },
  {
    'id': 'c95fc9fc.64ccb',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:5585/',
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
    'payload': '{"interval":250,"queueSize":4,"options":{"requestedPublishingInterval":500,"requestedLifetimeCount":60,"requestedMaxKeepAliveCount":10,"maxNotificationsPerPublish":4,"publishingEnabled":true,"priority":1}}',
    'payloadType': 'json',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'Root',
    'addressSpaceItems': [
      {
        'name': 'BiancoRoyal',
        'nodeId': 'ns=1;i=1234',
        'datatypeName': ''
      },
      {
        'name': 'Tanks',
        'nodeId': 'ns=1;i=1001',
        'datatypeName': ''
      }
    ],
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
    'nodeId': '',
    'name': 'RootBrowser',
    'justValue': true,
    'sendNodesToRead': false,
    'sendNodesToListener': true,
    'sendNodesToBrowser': false,
    'singleBrowseResult': false,
    'recursiveBrowse': true,
    'recursiveDepth': '1',
    'delayPerMessage': '0.5',
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
    'compressStructure': false,
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
    'compressStructure': false,
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
    'endpoint': 'opc.tcp://localhost:5587/',
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
    'port': '5587',
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
    'payload': '{"interval":250,"queueSize":4,"options":{"requestedPublishingInterval":500,"requestedLifetimeCount":60,"requestedMaxKeepAliveCount":10,"maxNotificationsPerPublish":4,"publishingEnabled":true,"priority":1}}',
    'payloadType': 'json',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2.4',
    'name': '',
    'addressSpaceItems': [
      {
        'name': 'BiancoRoyal',
        'nodeId': 'ns=1;i=1234',
        'datatypeName': ''
      }
    ],
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
    'nodeId': '',
    'name': '',
    'justValue': true,
    'sendNodesToRead': false,
    'sendNodesToListener': true,
    'sendNodesToBrowser': false,
    'singleBrowseResult': false,
    'recursiveBrowse': true,
    'recursiveDepth': 1,
    'delayPerMessage': '2',
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
            setTimeout(done, 500)
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
            expect(msg.topic).toBe('TestTopicSubscribe')
            expect(msg.payload.value.dataType).toBe('Int32')
            expect(msg.payload.statusCode).toBeDefined()
            setTimeout(done, 2000)
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
            expect(msg.topic).toBe('TestTopicSubscribe')
            expect(msg.payload.dataType).toBe('Int32')
            expect(msg.payload.nodeId).toBe('ns=1;s=FullCounter')
            expect(msg.payload.statusCode).toBeUndefined()
            setTimeout(done, 2000)
          }
        })
      })
    })

    it('should get a message with payload after injecting twice', function (done) {
      helper.load(listenerNodesToLoad, testListenerMonitoringAboFlow, function () {
        msgCounter = 0
        let n1 = helper.getNode('n1lia')
        n1.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.topic).toBe('TestTopicSubscribe1')
            expect(msg.nodetype).toBe('inject')
            expect(msg.injectType).toBe('listen')
          }

          if (msgCounter === 2) {
            expect(msg.topic).toBe('TestTopicUnsubscribe1')
            expect(msg.nodetype).toBe('inject')
            expect(msg.injectType).toBe('listen')
            setTimeout(done, 500)
          }
        })
      })
    })

    it('should verify a message on changed monitored item with statusCode on subscribing twice', function (done) {
      helper.load(listenerNodesToLoad, testListenerMonitoringAboFlow, function () {
        msgCounter = 0
        let n2 = helper.getNode('n2lia')
        n2.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.topic).toBe('TestTopicSubscribe2')
            expect(msg.nodetype).toBe('inject')
            expect(msg.injectType).toBe('listen')
            expect(msg.payload.value).toBeDefined()
          }

          if (msgCounter === 2) {
            expect(msg.topic).toBe('TestTopicUnsubscribe2')
            expect(msg.nodetype).toBe('inject')
            expect(msg.injectType).toBe('listen')
            setTimeout(done, 500)
          }
        })
      })
    })

    it('should verify message from listener node on subscribing twice', function (done) {
      helper.load(listenerNodesToLoad, testListenerMonitoringAboFlow, function () {
        msgCounter = 0
        let n3 = helper.getNode('n3lia')
        n3.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.value).toBeDefined()
            setTimeout(done, 500)
          }
        })
      })
    })

    it('should verify a compressed message from response node on subscribing twice', function (done) {
      helper.load(listenerNodesToLoad, testListenerMonitoringAboFlow, function () {
        msgCounter = 0
        let n4 = helper.getNode('n4lia')
        n4.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.value).toBeDefined()
            setTimeout(done, 500)
          }
        })
      })
    })

    it('should verify a message from browse node on subscribe recursive', function (done) {
      helper.load(listenerNodesToLoad, recursiveBrowserAboFlow, function () {
        msgCounter = 0
        let n2 = helper.getNode('n2abo')
        n2.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.browserResults).toBeDefined()
            expect(msg.payload.browserResults.length).toBe(3)
          }

          if (msgCounter === 2) {
            expect(msg.payload.browserResults).toBeDefined()
            setTimeout(done, 500)
          }
        })
      })
    })

    it('should verify a compressed message from response after browser node on subscribe recursive', function (done) {
      helper.load(listenerNodesToLoad, recursiveBrowserAboFlow, function () {
        msgCounter = 0
        let n3 = helper.getNode('n3abo')
        n3.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload).toBeDefined()
            expect(msg.payload.browserResults.length).toBe(3)
            expect(msg.payload.recursiveDepth).toBe(1)
          }

          if (msgCounter === 2) {
            expect(msg.payload).toBeDefined()
            expect(msg.payload.browserResults).toBeDefined()
            expect(msg.payload.recursiveDepth).toBe(0)
            setTimeout(done, 1000)
          }
        })
      })
    })

    it('should verify a message from listener node on subscribe recursive', function (done) {
      helper.load(listenerNodesToLoad, recursiveBrowserAboFlow, function () {
        msgCounter = 0
        let n4 = helper.getNode('n4abo')
        n4.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload).toBeDefined()
          }

          if (msgCounter === 2) {
            expect(msg.payload).toBeDefined()
            setTimeout(done, 1000)
          }
        })
      })
    })

    it('should verify a compressed message from response after listener node on subscribe recursive as single result', function (done) {
      helper.load(listenerNodesToLoad, recursiveBrowserAboFlow, function () {
        msgCounter = 0
        let n5 = helper.getNode('n5abo')
        n5.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload).toBeDefined()
            done()
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
            expect(msg.payload).toBeDefined()
            setTimeout(done, 500)
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
            expect(msg.payload).toBeDefined()
            setTimeout(done, 2000)
          }
        })
      })
    })
  })
})
