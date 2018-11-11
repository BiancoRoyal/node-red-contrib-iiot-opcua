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

var injectNode = require('../../src/opcua-iiot-inject')
var connectorNode = require('../../src/opcua-iiot-connector')
var serverNode = require('../../src/opcua-iiot-server')
var readNode = require('../../src/opcua-iiot-read')
var browserNode = require('../../src/opcua-iiot-browser')
var resultFilterNode = require('../../src/opcua-iiot-result-filter')
var responseNode = require('../../src/opcua-iiot-response')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testResponseNodes = [injectNode, connectorNode, browserNode, readNode, resultFilterNode, responseNode, serverNode]

var testReadResponseFlow = [
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
    'name': 'Read All',
    'justValue': true,
    'showStatusActivities': false,
    'showErrors': false,
    'parseStrings': false,
    'historyDays': '',
    'wires': [
      [
        '51acedc0.fb6714',
        '9a4e5b28.77363',
        'c888d8ca.514bd',
        'fe7af744.afaa'
      ]
    ]
  },
  {
    'id': '51acedc0.fb6714',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': false,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': false,
    'activateFilters': false,
    'negateFilter': false,
    'filters': [],
    'wires': [
      ['n1rsf1']
    ]
  },
  {id: 'n1rsf1', type: 'helper'},
  {
    'id': '9a4e5b28.77363',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': false,
    'activateFilters': false,
    'negateFilter': false,
    'filters': [],
    'wires': [
      ['n2rsf1']
    ]
  },
  {id: 'n2rsf1', type: 'helper'},
  {
    'id': 'c888d8ca.514bd',
    'type': 'OPCUA-IIoT-Result-Filter',
    'nodeId': 'ns=1;s=TestReadWrite',
    'datatype': '',
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
    'showErrors': true,
    'wires': [
      [
        'e5294795.fd081',
        '96defe75.dbed1'
      ]
    ]
  },
  {
    'id': 'e5294795.fd081',
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
      ['n3rsf1']
    ]
  },
  {id: 'n3rsf1', type: 'helper'},
  {
    'id': '96defe75.dbed1',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': false,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': true,
    'activateFilters': false,
    'negateFilter': false,
    'filters': [],
    'wires': [
      ['n4rsf1']
    ]
  },
  {id: 'n4rsf1', type: 'helper'},
  {
    'id': 'fe7af744.afaa',
    'type': 'OPCUA-IIoT-Result-Filter',
    'nodeId': 'ns=1;s=Counter',
    'datatype': '',
    'fixedValue': false,
    'fixPoint': 2,
    'withPrecision': false,
    'precision': 2,
    'entry': '2',
    'justValue': false,
    'withValueCheck': false,
    'minvalue': '',
    'maxvalue': '',
    'defaultvalue': '',
    'topic': '',
    'name': '',
    'showErrors': true,
    'wires': [
      [
        '2ee23d7c.edb4ba',
        '4ac2bede.10e978'
      ]
    ]
  },
  {
    'id': '2ee23d7c.edb4ba',
    'type': 'OPCUA-IIoT-Response',
    'z': '6fdb5dd6.99501c',
    'name': '',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': true,
    'activateFilters': false,
    'negateFilter': false,
    'filters': [],
    'wires': [
      ['n5rsf1']
    ]
  },
  {id: 'n5rsf1', type: 'helper'},
  {
    'id': '4ac2bede.10e978',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': false,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': true,
    'activateFilters': false,
    'negateFilter': false,
    'filters': [],
    'wires': [
      ['n6rsf1']
    ]
  },
  {id: 'n6rsf1', type: 'helper'},
  {
    'id': '370c0d61.becf9a',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:49300/',
    'keepSessionAlive': true,
    'loginEnabled': true,
    'securityPolicy': 'None',
    'securityMode': 'NONE',
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
    'id': '5c9db1b6.2b3478',
    'type': 'OPCUA-IIoT-Server',
    'port': '49300',
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

var testReadAllAttributesResponseFlow = [
  {
    'id': '6ee19719.8f30e8',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'read',
    'payload': '',
    'payloadType': 'date',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'Root',
    'addressSpaceItems': [
      {
        'name': 'Bianco Royal',
        'nodeId': 'ns=1;i=1234',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        '781a3759.15c1e8'
      ]
    ]
  },
  {
    'id': '781a3759.15c1e8',
    'type': 'OPCUA-IIoT-Browser',
    'connector': 'fc0c4360.d2f2b',
    'nodeId': '',
    'name': '',
    'justValue': true,
    'sendNodesToRead': true,
    'sendNodesToListener': false,
    'sendNodesToBrowser': false,
    'singleBrowseResult': true,
    'recursiveBrowse': false,
    'recursiveDepth': '',
    'delayPerMessage': '',
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        '83ac5514.5b6128'
      ]
    ]
  },

  {
    'id': '83ac5514.5b6128',
    'type': 'OPCUA-IIoT-Read',
    'attributeId': '0',
    'maxAge': '0',
    'depth': 1,
    'connector': 'fc0c4360.d2f2b',
    'name': 'Read browsed All',
    'justValue': true,
    'showStatusActivities': false,
    'showErrors': false,
    'parseStrings': false,
    'historyDays': '',
    'wires': [
      [
        'bc7ca6b4.bf3708',
        'fff0a5ff.dffe6',
        '149c68af.68d6b7',
        'fc7278e4.b49838'
      ]
    ]
  },
  {
    'id': 'bc7ca6b4.bf3708',
    'type': 'OPCUA-IIoT-Response',
    'name': 'Pressure',
    'compressStructure': false,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': false,
    'activateFilters': true,
    'negateFilter': false,
    'filters': [
      {
        'name': 'nodeId',
        'value': 'ns=1;s=Pressure'
      }
    ],
    'wires': [
      [
        'n1rsf2'
      ]
    ]
  },
  {
    'id': 'fff0a5ff.dffe6',
    'type': 'OPCUA-IIoT-Response',
    'name': 'Pressure',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': false,
    'activateFilters': true,
    'negateFilter': false,
    'filters': [
      {
        'name': 'nodeId',
        'value': 'ns=1;s=Pressure'
      }
    ],
    'wires': [
      [
        'n1rsf2'
      ]
    ]
  },
  {
    'id': '149c68af.68d6b7',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': false,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': false,
    'activateFilters': false,
    'negateFilter': false,
    'filters': [],
    'wires': [
      [
        'n1rsf2'
      ]
    ]
  },
  {
    'id': 'fc7278e4.b49838',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': false,
    'activateFilters': false,
    'negateFilter': false,
    'filters': [],
    'wires': [
      [
        'n1rsf2'
      ]
    ]
  },
  {id: 'n1rsf2', type: 'helper'},
  {
    'id': 'fc0c4360.d2f2b',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:49500/',
    'keepSessionAlive': false,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'NONE',
    'name': 'LOCAL SERVER',
    'showErrors': false,
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
    'reconnectDelay': ''
  },
  {
    'id': '5c9db1b6.2b3512',
    'type': 'OPCUA-IIoT-Server',
    'port': '49500',
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

var testAllResponseTypesWithBrowser = [
  {
    'id': '7417bc65.d8a5fc',
    'type': 'OPCUA-IIoT-Server',
    'port': '49600',
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
    'individualCerts': false,
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
    'delayToClose': 1000,
    'wires': [
      []
    ]
  },
  {
    'id': '8b417812.2d6b3',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '',
    'payloadType': 'date',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': '',
    'addressSpaceItems': [],
    'wires': [
      [
        'ea686e22.1f8a78'
      ]
    ]
  },
  {
    'id': 'ea686e22.1f8a78',
    'type': 'OPCUA-IIoT-Browser',
    'connector': '1c83d9b3.afba8e',
    'nodeId': 'ns=1;i=1234',
    'name': '',
    'justValue': true,
    'sendNodesToRead': false,
    'sendNodesToListener': false,
    'sendNodesToBrowser': false,
    'singleBrowseResult': false,
    'recursiveBrowse': false,
    'recursiveDepth': 1,
    'delayPerMessage': 0.2,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      [
        'abf469b7.094758',
        '9764f105.7c8df8',
        'f73eb010.203d78',
        '4325c2c7.8d17e4',
        '98e6951e.bf8608',
        'e8e71c61.dd0e08'
      ]
    ]
  },
  {
    'id': 'abf469b7.094758',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': false,
    'activateFilters': false,
    'negateFilter': false,
    'filters': [],
    'wires': [
      [
        'n1rsf3'
      ]
    ]
  },
  {
    'id': '9764f105.7c8df8',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': false,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': false,
    'activateFilters': false,
    'negateFilter': false,
    'filters': [],
    'wires': [
      [
        'n1rsf3'
      ]
    ]
  },
  {
    'id': 'f73eb010.203d78',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': false,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': false,
    'activateFilters': true,
    'negateFilter': false,
    'filters': [
      {
        'name': 'nodeId',
        'value': 'ns=1;s=FanSpeed'
      }
    ],
    'wires': [
      [
        'n1rsf3'
      ]
    ]
  },
  {
    'id': '4325c2c7.8d17e4',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': false,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': true,
    'activateFilters': true,
    'negateFilter': false,
    'filters': [
      {
        'name': 'nodeId',
        'value': 'ns=1;s=FanSpeed'
      }
    ],
    'wires': [
      [
        'n1rsf3'
      ]
    ]
  },
  {
    'id': '98e6951e.bf8608',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': true,
    'activateFilters': true,
    'negateFilter': false,
    'filters': [
      {
        'name': 'nodeId',
        'value': 'ns=1;s=FanSpeed'
      }
    ],
    'wires': [
      [
        'n1rsf3'
      ]
    ]
  },
  {
    'id': 'e8e71c61.dd0e08',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': true,
    'activateFilters': true,
    'negateFilter': true,
    'filters': [
      {
        'name': 'nodeId',
        'value': 'ns=1;s=FanSpeed'
      }
    ],
    'wires': [
      [
        'n1rsf3'
      ]
    ]
  },
  {id: 'n1rsf3', type: 'helper'},
  {
    'id': '1c83d9b3.afba8e',
    'type': 'OPCUA-IIoT-Connector',
    'z': '',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:49600/',
    'keepSessionAlive': true,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'NONE',
    'name': 'LOCAL SERVER',
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
    'maxBadSessionRequests': '10'
  }
]

describe('OPC UA Response node e2e Testing', function () {
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

  describe('Response node', function () {
    it('should get a message with payload on read not compressed', function (done) {
      helper.load(testResponseNodes, testReadResponseFlow, function () {
        let nut = helper.getNode('n1rsf1')
        nut.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
      })
    })

    it('should get a message with payload on read compressed', function (done) {
      helper.load(testResponseNodes, testReadResponseFlow, function () {
        let nut = helper.getNode('n2rsf1')
        nut.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
      })
    })

    it('should get a message with payload on read TestReadWrite filtered not compressed', function (done) {
      helper.load(testResponseNodes, testReadResponseFlow, function () {
        let nut = helper.getNode('n4rsf1')
        nut.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
      })
    })

    it('should get a message with payload on read TestReadWrite filtered compressed', function (done) {
      helper.load(testResponseNodes, testReadResponseFlow, function () {
        let nut = helper.getNode('n3rsf1')
        nut.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
      })
    })

    it('should get a message with payload on read Counter filtered not compressed', function (done) {
      helper.load(testResponseNodes, testReadResponseFlow, function () {
        let nut = helper.getNode('n6rsf1')
        nut.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
      })
    })

    it('should get a message with payload on read Counter filtered compressed', function (done) {
      helper.load(testResponseNodes, testReadResponseFlow, function () {
        let nut = helper.getNode('n5rsf1')
        nut.on('input', function (msg) {
          expect(msg.payload).toBeDefined()
          done()
        })
      })
    })

    it('should get four messages with payload on read after browse with four response nodes', function (done) {
      helper.load(testResponseNodes, testReadAllAttributesResponseFlow, function () {
        let n1 = helper.getNode('n1rsf2')
        let counter = 0
        n1.on('input', function (msg) {
          counter++
          expect(msg.payload).toBeDefined()
          expect(msg.payload.length).toBeGreaterThan(0)

          if (counter === 4) {
            done()
          }
        })
      })
    })

    it('should get six messages with payload on browse with six response nodes on all possibel setting of options', function (done) {
      helper.load(testResponseNodes, testAllResponseTypesWithBrowser, function () {
        let n1 = helper.getNode('n1rsf3')
        let counter = 0
        n1.on('input', function (msg) {
          counter++
          expect(msg.payload).toBeDefined()

          if (msg.payload.length) {
            expect(msg.payload.length).toBeGreaterThan(0)
          } else {
            expect(msg.payload.browserResults).toBeDefined()
            expect(msg.payload.browserResults.length).toBeGreaterThan(0)
          }

          if (counter === 6) {
            done()
          }
        })
      })
    })
  })
})
