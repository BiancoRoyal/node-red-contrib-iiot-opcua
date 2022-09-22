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

jest.setTimeout(12000)

var injectNode = require('../../src/opcua-iiot-inject')
var connectorNode = require('../../src/opcua-iiot-connector')
var responseNode = require('../../src/opcua-iiot-response')
var readNode = require('../../src/opcua-iiot-read')
var listenerNode = require('../../src/opcua-iiot-listener')
var crawlerNode = require('../../src/opcua-iiot-crawler')
var serverNode = require('../../src/opcua-iiot-server')
var filterNode = require('../../src/opcua-iiot-result-filter')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testFilterNodes = [injectNode, connectorNode, readNode, responseNode, serverNode, crawlerNode, filterNode, listenerNode]

var testFilterReadFlow = [
  {
    'id': 'ac8b3930.dce72',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'read',
    'payload': '',
    'payloadType': 'date',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': '',
    'addressSpaceItems': [
      {
        'name': '',
        'nodeId': 'ns=1;s=TestReadWrite',
        'datatypeName': ''
      },
      {
        'name': '',
        'nodeId': 'ns=1;s=Counter',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        '264129c0.ffc7c6'
      ]
    ]
  },
  {
    'id': '264129c0.ffc7c6',
    'type': 'OPCUA-IIoT-Read',
    'attributeId': '13',
    'maxAge': 1,
    'depth': 1,
    'connector': '370c0d61.becf9a',
    'name': '',
    'justValue': true,
    'showStatusActivities': false,
    'showErrors': false,
    'parseStrings': false,
    'historyDays': '',
    'wires': [
      [
        '14bba4a7.aa0f1b'
      ]
    ]
  },
  {
    'id': '14bba4a7.aa0f1b',
    'type': 'OPCUA-IIoT-Result-Filter',
    'nodeId': 'ns=1;s=TestReadWrite',
    'datatype': 'Double',
    'fixedValue': false,
    'fixPoint': 2,
    'withPrecision': false,
    'precision': 2,
    'entry': '1',
    'justValue': false,
    'withValueCheck': false,
    'minvalue': '',
    'maxvalue': '',
    'defaultvalue': '',
    'topic': '',
    'name': '',
    'showErrors': false,
    'wires': [
      [
        '72c83822.3e81d8'
      ]
    ]
  },
  {
    'id': '72c83822.3e81d8',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': true,
    'activateFilters': false,
    'negateFilter': false,
    'filters': [],
    'wires': [
      ['n1frf1']
    ]
  },
  {id: 'n1frf1', type: 'helper'},
  {
    'id': '370c0d61.becf9a',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:49100/',
    'keepSessionAlive': false,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'None',
    'name': 'LOCAL DEMO SERVER',
    'showErrors': false,
    'individualCerts': false,
    'publicCertificateFile': '',
    'privateKeyFile': '',
    'defaultSecureTokenLifetime': '60000',
    'endpointMustExist': false,
    'autoSelectRightEndpoint': false,
    'strategyMaxRetry': '',
    'strategyInitialDelay': '',
    'strategyMaxDelay': '',
    'strategyRandomisationFactor': '',
    'requestedSessionTimeout': '',
    'connectionStartDelay': '',
    'reconnectDelay': '',
    'maxBadSessionRequests': ''
  },
  {
    'id': '5c9db1b6.2b4488',
    'type': 'OPCUA-IIoT-Server',
    'port': '49100',
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
    'users': [
      {
        'name': 'peter',
        'password': 'peter'
      }
    ],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'registerServerMethod': '1',
    'discoveryServerEndpointUrl': '',
    'capabilitiesForMDNS': '',
    'maxNodesPerRead': '',
    'maxNodesPerBrowse': '',
    'delayToClose': '',
    'wires': [
      [
      ]
    ]
  }
]

var testListenerFilterFlow = [
  {
    'id': 'b8ff62e0.eccb98',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'listen',
    'payload': '{ "interval": 250, "queueSize": 10 }',
    'payloadType': 'json',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'Start Abo',
    'addressSpaceItems': [
      {
        'name': 'Counter',
        'nodeId': 'ns=1;s=Counter',
        'datatypeName': ''
      },
      {
        'name': 'FullCounter',
        'nodeId': 'ns=1;s=FullCounter',
        'datatypeName': ''
      },
      {
        'name': '',
        'nodeId': 'ns=1;s=TestReadWrite',
        'datatypeName': ''
      },
      {
        'name': '',
        'nodeId': 'ns=0;i=2277',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        '6e640595.cecfa4'
      ]
    ]
  },
  {
    'id': '6e640595.cecfa4',
    'type': 'OPCUA-IIoT-Listener',
    'connector': '670d2f00.3b53d',
    'action': 'subscribe',
    'queueSize': 10,
    'name': '',
    'topic': '',
    'justValue': true,
    'useGroupItems': false,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        'c9b90a13.153d8',
        'b784203d.460118',
        'ea3839ac.fb08c',
        '771dd0d1.f27d5'
      ]
    ]
  },
  {
    'id': 'c9b90a13.153d8',
    'type': 'OPCUA-IIoT-Result-Filter',
    'nodeId': 'ns=1;s=FullCounter',
    'datatype': 'UInt32',
    'fixedValue': false,
    'fixPoint': 2,
    'withPrecision': false,
    'precision': 2,
    'entry': 1,
    'justValue': true,
    'withValueCheck': false,
    'minvalue': '',
    'maxvalue': '',
    'defaultvalue': '',
    'topic': '',
    'name': '',
    'showErrors': false,
    'wires': [
      ['n1frf2']
    ]
  },
  {id: 'n1frf2', type: 'helper'},
  {
    'id': 'b784203d.460118',
    'type': 'OPCUA-IIoT-Result-Filter',
    'nodeId': 'ns=1;s=TestReadWrite',
    'datatype': 'Double',
    'fixedValue': true,
    'fixPoint': 2,
    'withPrecision': false,
    'precision': 2,
    'entry': 1,
    'justValue': true,
    'withValueCheck': false,
    'minvalue': '',
    'maxvalue': '',
    'defaultvalue': '',
    'topic': '',
    'name': '',
    'showErrors': false,
    'wires': [
      ['n2frf2']
    ]
  },
  {id: 'n2frf2', type: 'helper'},
  {
    'id': 'ea3839ac.fb08c',
    'type': 'OPCUA-IIoT-Result-Filter',
    'nodeId': 'ns=1;s=Counter',
    'datatype': 'UInt16',
    'fixedValue': false,
    'fixPoint': 2,
    'withPrecision': false,
    'precision': 2,
    'entry': 1,
    'justValue': true,
    'withValueCheck': false,
    'minvalue': '',
    'maxvalue': '',
    'defaultvalue': '',
    'topic': '',
    'name': '',
    'showErrors': false,
    'wires': [
      ['n3frf2']
    ]
  },
  {id: 'n3frf2', type: 'helper'},
  {
    'id': '771dd0d1.f27d5',
    'type': 'OPCUA-IIoT-Result-Filter',
    'nodeId': 'ns=0;i=2277',
    'datatype': 'UInt32',
    'fixedValue': false,
    'fixPoint': 2,
    'withPrecision': false,
    'precision': 2,
    'entry': 1,
    'justValue': true,
    'withValueCheck': false,
    'minvalue': '',
    'maxvalue': '',
    'defaultvalue': '',
    'topic': '',
    'name': '',
    'showErrors': false,
    'wires': [
      ['n4frf2']
    ]
  },
  {id: 'n4frf2', type: 'helper'},
  {
    'id': '670d2f00.3b53d',
    'type': 'OPCUA-IIoT-Connector',
    'z': '',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:49200/',
    'keepSessionAlive': false,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'None',
    'name': 'LOCAL DEMO SERVER',
    'showErrors': false,
    'individualCerts': false,
    'publicCertificateFile': '',
    'privateKeyFile': '',
    'defaultSecureTokenLifetime': '60000',
    'endpointMustExist': false,
    'autoSelectRightEndpoint': false,
    'strategyMaxRetry': '',
    'strategyInitialDelay': '',
    'strategyMaxDelay': '',
    'strategyRandomisationFactor': '',
    'requestedSessionTimeout': '',
    'connectionStartDelay': '',
    'reconnectDelay': '',
    'maxBadSessionRequests': ''
  },
  {
    'id': '5c9db1b6.2b4433',
    'type': 'OPCUA-IIoT-Server',
    'port': '49200',
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
    'users': [
      {
        'name': 'peter',
        'password': 'peter'
      }
    ],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'registerServerMethod': '1',
    'discoveryServerEndpointUrl': '',
    'capabilitiesForMDNS': '',
    'maxNodesPerRead': '',
    'maxNodesPerBrowse': '',
    'delayToClose': '',
    'wires': [
      [
      ]
    ]
  }
]

var testCrawlerFilterFlow = [
  {
    'id': '651594be.d15a94',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '',
    'payloadType': 'date',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'inject',
    'addressSpaceItems': [
      {
        'name': '',
        'nodeId': 'ns=1;i=1001',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        'fb606b23.b773c8'
      ]
    ]
  },
  {
    'id': 'fb606b23.b773c8',
    'type': 'OPCUA-IIoT-Crawler',
    'connector': '9428fd82.ba05b8',
    'name': '',
    'justValue': true,
    'singleResult': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': false,
    'activateFilters': true,
    'negateFilter': false,
    'filters': [
      {
        'name': 'nodeClass',
        'value': 'Method'
      },
      {
        'name': 'nodeClass',
        'value': 'ObjectType*'
      },
      {
        'name': 'typeDefinition',
        'value': 'ns=0;i=58'
      },
      {
        'name': 'nodeId',
        'value': 'ns=0;*'
      }
    ],
    'delayPerMessage': '0.5',
    'wires': [
      [
        '3025bc7e.1aabac'
      ]
    ]
  },
  {
    'id': '3025bc7e.1aabac',
    'type': 'OPCUA-IIoT-Result-Filter',
    'nodeId': 'ns=1;i=1002',
    'datatype': '',
    'fixedValue': false,
    'fixPoint': 2,
    'withPrecision': false,
    'precision': 2,
    'entry': 1,
    'justValue': false,
    'withValueCheck': false,
    'minvalue': '',
    'maxvalue': '',
    'defaultvalue': '',
    'topic': '',
    'name': '',
    'showErrors': false,
    'wires': [
      [
        'n1crf3'
      ]
    ]
  },
  {id: 'n1crf3', type: 'helper'},
  {
    'id': '9428fd82.ba05b8',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:49400/',
    'keepSessionAlive': false,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'None',
    'name': 'LOCAL CRAWLER SERVER',
    'showErrors': false,
    'individualCerts': false,
    'publicCertificateFile': '',
    'privateKeyFile': '',
    'defaultSecureTokenLifetime': '',
    'endpointMustExist': false,
    'autoSelectRightEndpoint': false,
    'strategyMaxRetry': '',
    'strategyInitialDelay': '',
    'strategyMaxDelay': '',
    'strategyRandomisationFactor': '',
    'requestedSessionTimeout': '',
    'connectionStartDelay': '',
    'reconnectDelay': '',
    'maxBadSessionRequests': ''
  },
  {
    'id': '5c9db1b6.2b2233',
    'type': 'OPCUA-IIoT-Server',
    'port': '49400',
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
    'users': [
      {
        'name': 'peter',
        'password': 'peter'
      }
    ],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'registerServerMethod': '1',
    'discoveryServerEndpointUrl': '',
    'capabilitiesForMDNS': '',
    'maxNodesPerRead': '',
    'maxNodesPerBrowse': '',
    'delayToClose': '',
    'wires': [
      [
      ]
    ]
  }
]

describe('OPC UA Result Filter node e2e Testing', function () {
  beforeAll(function (done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function (done) {
    helper.unload().then(function () {
      done()
    }).catch(function () {
      done()
    })
  })

  afterAll(function (done) {
    helper.stopServer(function () {
      done()
    })
  })

  describe('Result Filter node Unit Testing', function () {
    it('should read and filter the right node named TestReadWrite', function (done) {
      helper.load(testFilterNodes, testFilterReadFlow, function () {
        let n1 = helper.getNode('n1frf1')
        n1.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          expect(msg.payload).toBe(1000)
          expect(msg.nodeId).toBe('ns=1;s=TestReadWrite')
          done()
        })
      })
    })

    it('should read and filter the right node named Counter', function (done) {
      testFilterReadFlow[2].entry = 2
      testFilterReadFlow[2].nodeId = 'ns=1;s=Counter'
      helper.load(testFilterNodes, testFilterReadFlow, function () {
        let n1 = helper.getNode('n1frf1')
        n1.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          expect(msg.payload).toBeGreaterThan(0)
          expect(msg.nodeId).toBe('ns=1;s=Counter')
          done()
        })
      })
    })

    it('should monitor and filter the right node named FullCounter', function (done) {
      helper.load(testFilterNodes, testListenerFilterFlow, function () {
        let n1 = helper.getNode('n1frf2')
        n1.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          expect(msg.payload).toBeGreaterThan(0)
          expect(msg.nodeId).toBe('ns=1;s=FullCounter')
          done()
        })
      })
    })

    it('should monitor and filter the right node named TestReadWrite', function (done) {
      helper.load(testFilterNodes, testListenerFilterFlow, function () {
        let n2 = helper.getNode('n2frf2')
        n2.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          expect(msg.payload).toBe(1000)
          expect(msg.nodeId).toBe('ns=1;s=TestReadWrite')
          done()
        })
      })
    })

    it('should monitor and filter the right node named Counter', function (done) {
      helper.load(testFilterNodes, testListenerFilterFlow, function () {
        let n3 = helper.getNode('n3frf2')
        n3.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          expect(msg.payload).toBeGreaterThan(0)
          expect(msg.nodeId).toBe('ns=1;s=Counter')
          done()
        })
      })
    })

    it('should monitor and filter the right node i=2277', function (done) {
      helper.load(testFilterNodes, testListenerFilterFlow, function () {
        let n4 = helper.getNode('n4frf2')
        n4.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          expect(msg.payload).toBeGreaterThan(0)
          expect(msg.nodeId).toBe('ns=0;i=2277')
          done()
        })
      })
    })

    it('should crawl and filter the right node i=1002', function (done) {
      helper.load(testFilterNodes, testCrawlerFilterFlow, function () {
        let n1 = helper.getNode('n1crf3')
        n1.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          expect(msg.nodeId).toBe('ns=1;i=1002')
          done()
        })
      })
    })
  })
})
