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

var injectNode = require('../../src/opcua-iiot-inject')
var connectorNode = require('../../src/opcua-iiot-connector')
var inputNode = require('../../src/opcua-iiot-crawler')
var serverNode = require('../../src/opcua-iiot-server')
var responseNode = require('../../src/opcua-iiot-response')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var crawlerNodesToLoad = [injectNode, connectorNode, inputNode, serverNode, responseNode]

var testCrawlerFlow = [
  {
    'id': 'ec2b4f2b.59a9e',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': 'testpayload',
    'payloadType': 'str',
    'topic': 'TestTopicCrawler',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'Limits',
    'addressSpaceItems': [
      {
        'name': 'Limits',
        'nodeId': 'ns=0;i=11704',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        'n2f1', 'n3f1'
      ]
    ]
  },
  {id: 'n2f1', type: 'helper'},
  {
    'id': 'n3f1',
    'type': 'OPCUA-IIoT-Crawler',
    'connector': 'n1c1',
    'name': 'TestCrawler',
    'justValue': false,
    'singleResult': false,
    'showStatusActivities': false,
    'showErrors': false,
    'filters': [],
    'wires': [['n4f1']]
  },
  {id: 'n4f1', type: 'helper'},
  {
    'id': '6aff8d91.2081b4',
    'type': 'OPCUA-IIoT-Server',
    'port': '51999',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': '',
    'showStatusActivities': false,
    'showErrors': false,
    'asoDemo': false,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': false,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 10000,
    'maxNodesPerBrowse': 10000,
    'wires': [[]]
  },
  {
    'id': 'n1c1',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:51999/',
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
  }
]

var testCrawlerJustValueFlow = [
  {
    'id': 'n1f2',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': 'testpayload',
    'payloadType': 'str',
    'topic': 'TestTopicCrawler',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'Limits',
    'addressSpaceItems': [
      {
        'name': 'Limits',
        'nodeId': 'ns=0;i=11704',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        'n2f2', 'n3f2'
      ]
    ]
  },
  {id: 'n2f2', type: 'helper'},
  {
    'id': 'n3f2',
    'type': 'OPCUA-IIoT-Crawler',
    'connector': 'n1c2',
    'name': 'TestCrawler',
    'justValue': true,
    'singleResult': false,
    'showStatusActivities': false,
    'showErrors': false,
    'filters': [],
    'wires': [
      [
        'n4f2'
      ]
    ]
  },
  {id: 'n4f2', type: 'helper'},
  {
    'id': 's1f2',
    'type': 'OPCUA-IIoT-Server',
    'port': '51966',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': '',
    'showStatusActivities': false,
    'showErrors': false,
    'asoDemo': false,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': false,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 10000,
    'maxNodesPerBrowse': 10000,
    'wires': [[]]
  },
  {
    'id': 'n1c2',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:51966/',
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
  }
]

var testCrawlerJustValueSingleFlow = [
  {
    'id': 'n1f3',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': 'testpayload',
    'payloadType': 'str',
    'topic': 'TestTopicCrawler',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'Limits',
    'addressSpaceItems': [
      {
        'name': 'Limits',
        'nodeId': 'ns=0;i=11704',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        'n2f3', 'n3f3'
      ]
    ]
  },
  {id: 'n2f3', type: 'helper'},
  {
    'id': 'n3f3',
    'type': 'OPCUA-IIoT-Crawler',
    'connector': 'n1c3',
    'name': 'TestCrawler',
    'justValue': true,
    'singleResult': true,
    'showStatusActivities': false,
    'showErrors': false,
    'filters': [],
    'wires': [
      [
        'n4f3'
      ]
    ]
  },
  {id: 'n4f3', type: 'helper'},
  {
    'id': 's1f3',
    'type': 'OPCUA-IIoT-Server',
    'port': '51967',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': '',
    'showStatusActivities': false,
    'showErrors': false,
    'asoDemo': false,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': false,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 10000,
    'maxNodesPerBrowse': 10000,
    'wires': [[]]
  },
  {
    'id': 'n1c3',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:51967/',
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
  }
]

var testCrawlerJustValueSingleFilteredFlow = [
  {
    'id': 'n1f4',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': 'testpayload',
    'payloadType': 'str',
    'topic': 'TestTopicCrawler',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'Limits',
    'addressSpaceItems': [
      {
        'name': 'Limits',
        'nodeId': 'ns=0;i=11704',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        'n2f4', 'n3f4'
      ]
    ]
  },
  {id: 'n2f4', type: 'helper'},
  {
    'id': 'n3f4',
    'type': 'OPCUA-IIoT-Crawler',
    'connector': 'n1c4',
    'name': 'TestCrawler',
    'justValue': true,
    'singleResult': true,
    'showStatusActivities': false,
    'showErrors': false,
    'filters': [{'name': 'Limits', 'nodeId': 'ns=0;i=11704'}],
    'wires': [
      [
        'n4f4'
      ]
    ]
  },
  {id: 'n4f4', type: 'helper'},
  {
    'id': 's1f4',
    'type': 'OPCUA-IIoT-Server',
    'port': '52967',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': '',
    'showStatusActivities': false,
    'showErrors': false,
    'asoDemo': false,
    'allowAnonymous': true,
    'isAuditing': false,
    'serverDiscovery': false,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 10000,
    'maxNodesPerBrowse': 10000,
    'wires': [[]]
  },
  {
    'id': 'n1c4',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:52967/',
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
  }
]

let testCrawlerWithFilter = [
  {
    'id': 'n1f4',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': 'testpayload',
    'payloadType': 'str',
    'topic': 'TestTopicCrawler',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'Limits',
    'addressSpaceItems': [
      {
        'name': 'Limits',
        'nodeId': 'ns=0;i=11704',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        'n2f4', 'n3f4'
      ]
    ]
  },
  {id: 'n2f4', type: 'helper'},
  {
    'id': 'n3f4',
    'type': 'OPCUA-IIoT-Crawler',
    'connector': 'n1c4',
    'name': 'TestCrawler',
    'justValue': true,
    'singleResult': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateFilters': true,
    'filters': [
      {
        'name': 'nodeClass',
        'value': 'Variable'
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
    'wires': [
      [
        'n4f4'
      ]
    ]
  },
  {id: 'n4f4', type: 'helper'},
  {
  'id': '88f582a2.3b9028',
  'type': 'OPCUA-IIoT-Server',
  'port': '51188',
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
  'maxNodesPerRead': 6000,
  'maxNodesPerBrowse': 6000,

  'wires': [ [ ] ]
},
  {
    'id': 'n1c4',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:51188/',
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
  }
]



const backup =   [
  {
    'id': '61167469.38921c',
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
        'nodeId': 'i=85',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        '9a7df98e.660e68'
      ]
    ]
  },
  {
    'id': '9a7df98e.660e68',
    'type': 'OPCUA-IIoT-Crawler',
    'connector': '71a3171a.97466',
    'name': '',
    'justValue': true,
    'singleResult': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateFilters': true,
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
        'h1ff'
      ]
    ]
  },
  {id: 'h1ff', type: 'helper'},
  {
    'id': '71a3171a.97466',
    'type': 'OPCUA-IIoT-Connector',
    'z': '',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:51188',
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
    'strategyRandomisationFactor': '',
    'requestedSessionTimeout': '',
    'connectionStartDelay': '',
    'reconnectDelay': ''
  },
]

var testCrawlerWithFilterNS0 = [
  {
    'id': 'bb36ac76.436a7',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '',
    'payloadType': 'date',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'correct',
    'addressSpaceItems': [
      {
        'name': '',
        'nodeId': 'ns=1;i=1234',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        '23fcf6d.13b5d8a',
        'nc1h'
      ]
    ]
  },
  {id: 'nc1h', type: 'helper'},
  {
    'id': '23fcf6d.13b5d8a',
    'type': 'OPCUA-IIoT-Crawler',
    'connector': 'ef9763f4.0e6728',
    'name': '',
    'justValue': false,
    'singleResult': false,
    'showStatusActivities': false,
    'showErrors': false,
    'activateFilters': true,
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
    'delayPerMessage': '1',
    'wires': [
      [
        'nc2h'
      ]
    ]
  },
  {id: 'nc2h', type: 'helper'},
  {
    'id': 'ef9763f4.0e6728',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:54446/',
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
    'strategyRandomisationFactor': '',
    'requestedSessionTimeout': '',
    'connectionStartDelay': '',
    'reconnectDelay': ''
  },
  {
    'id': '920108b3.753a68',
    'type': 'OPCUA-IIoT-Server',
    'port': '54446',
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
    'registerServerMethod': '1',
    'discoveryServerEndpointUrl': '',
    'capabilitiesForMDNS': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,

    'wires': [[]]
  }
]

var testCrawlerWithAllBasicFilterTypes = [
  {
    'id': '848ce5aa.9991d',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '',
    'payloadType': 'date',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'correct',
    'addressSpaceItems': [
      {
        'name': '',
        'nodeId': 'ns=1;i=1234',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        '99b6cc9a.be7568',
        'ncf1h'
      ]
    ]
  },
  {id: 'ncf1h', type: 'helper'},
  {
    'id': '99b6cc9a.be7568',
    'type': 'OPCUA-IIoT-Crawler',
    'connector': 'ef9763f4.0e6728',
    'name': '',
    'justValue': false,
    'singleResult': true,
    'showStatusActivities': true,
    'showErrors': false,
    'activateFilters': true,
    'filters': [
      {
        'name': 'nodeClass',
        'value': 'Method'
      },
      {
        'name': 'nodeId',
        'value': 'ns=0;*'
      },
      {
        'name': 'browseName',
        'value': 'PumpSpeed'
      },
      {
        'name': 'dataType',
        'value': 'ns=0;i=21'
      },
      {
        'name': 'browseName',
        'value': 'BiancoRoyal'
      },
      {
        'name': 'dataValue',
        'value': '100'
      },
      {
        'name': 'typeDefinition',
        'value': 'ns=0;i=68'
      }
    ],
    'delayPerMessage': '1',
    'wires': [
      [
        'ncf2h',
        'nc4rf1'
      ]
    ]
  },
  {id: 'ncf2h', type: 'helper'},
  {
    'id': 'nc4rf1',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressedStruct': true,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [['nc3rf1']]
  },
  {id: 'nc3rf1', type: 'helper'},
  {
    'id': 'ef9763f4.0e6728',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:54451/',
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
    'strategyRandomisationFactor': '',
    'requestedSessionTimeout': '',
    'connectionStartDelay': '',
    'reconnectDelay': ''
  },
  {
    'id': '920108b3.753a68',
    'type': 'OPCUA-IIoT-Server',
    'port': '54451',
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
    'registerServerMethod': '1',
    'discoveryServerEndpointUrl': '',
    'capabilitiesForMDNS': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [[]]
  }
]

const receive = (node) => {
  node.receive({payload: { value: 'testPayload' }})
}

describe('OPC UA Crawler node Testing', function () {
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

  describe('Crawler node', function () {
    it('should verify crawler items as result', function (done) {
      helper.load(crawlerNodesToLoad, testCrawlerFlow, function () {
        let n4 = helper.getNode('n4f1')
        let n1 = helper.getNode('ec2b4f2b.59a9e')
        n4.on('input', function (msg) {
          expect(msg.payload.crawlerResults).toBeDefined()
          expect(msg.payload.crawlerResults[0].references).toBeDefined()

          expect(msg.payload.crawlerResults).toBeInstanceOf(Array)
          expect(msg.payload.crawlerResults.length).toBe(36)
          expect(msg.payload.crawlerResultsCount).toBe(36)
          done()
        })
        setTimeout(receive, 5000, n1)
      })
    })

    it('should verify crawler items as just values result', function (done) {
      helper.load(crawlerNodesToLoad, testCrawlerJustValueFlow, function () {
        let n4 = helper.getNode('n4f2')
        let n1 = helper.getNode('n1f2')
        n4.on('input', function (msg) {
          expect(msg.payload.crawlerResults).toBeDefined()
          expect(msg.payload.crawlerResults[0].references).toBe(undefined)

          expect(msg.payload.crawlerResults).toBeInstanceOf(Array)
          expect(msg.payload.crawlerResults.length).toBe(36)
          done()
        })
        setTimeout(receive, 5000, n1)
      })
    })

    it('should verify crawler items as just values as single result', function (done) {
      helper.load(crawlerNodesToLoad, testCrawlerJustValueSingleFlow, function () {
        let n4 = helper.getNode('n4f3')
        let n1 = helper.getNode('n1f3')
        n4.on('input', function (msg) {
          console.log(msg.payload.crawlerResults)
          expect(msg.payload.crawlerResults).toBeDefined()
          expect(msg.payload.crawlerResults[0].references).toBe(undefined)

          expect(msg.payload.crawlerResults).toBeInstanceOf(Array)
          expect(msg.payload.crawlerResults.length).toBe(36)
          done()
        })
        setTimeout(receive, 5000, n1)
      })
    })

    it('should verify filtered crawler items as just values as single result', function (done) {
      helper.load(crawlerNodesToLoad, testCrawlerJustValueSingleFilteredFlow, function () {
        let n4 = helper.getNode('n4f4')
        let n1 = helper.getNode('n1f4')
        n4.on('input', function (msg) {
          console.log(msg.payload.crawlerResults[0].references)
          expect(msg.payload.crawlerResults).toBeDefined()
          expect(msg.payload.crawlerResults[0].references).toBe(undefined)

          expect(msg.payload.crawlerResults).toBeInstanceOf(Array)
          expect(msg.payload.crawlerResults.length).toBe(36)
          done()
        })
        setTimeout(receive, 5000, n1)
      })
    })

    it('should verify filtered crawler items as filtered results', function (done) {
      helper.load(crawlerNodesToLoad, testCrawlerWithFilter, function () {
        let h1f = helper.getNode('n4f4')
        let inject = helper.getNode('n1f4')
        h1f.on('input', function (msg) {
          console.log(msg.payload)
          expect(msg.payload.crawlerResults).toBeDefined()
          expect(msg.payload.crawlerResults[0].references).toBeUndefined()

          expect(msg.payload.crawlerResults).toBeInstanceOf(Array)
          done()
        })
        setTimeout(receive, 5000, inject)
      })
    })

    it('should verify filtered crawler items without ns=0', function (done) {
      helper.load(crawlerNodesToLoad, testCrawlerWithFilterNS0, function () {
        let n2 = helper.getNode('nc2h')
        let inject = helper.getNode('bb36ac76.436a7')
        n2.on('input', function (msg) {
          expect(msg.payload.crawlerResults).toBeDefined()

          expect(msg.payload.crawlerResults).toBeInstanceOf(Array)
          expect(msg.payload.crawlerResults.length).toBeLessThan(100)
          done()
        })
        setTimeout(receive, 5000, inject)
      })
    })

    it('should filter all basic filter types of crawler result', function (done) {
      helper.load(crawlerNodesToLoad, testCrawlerWithAllBasicFilterTypes, function () {
        let n2 = helper.getNode('ncf2h')
        let inject = helper.getNode('848ce5aa.9991d')
        n2.on('input', function (msg) {
          expect(msg.payload.crawlerResults).toBeDefined()
          expect(msg.payload.crawlerResults).toBeInstanceOf(Array)
          expect(msg.payload.crawlerResults.length).toBeLessThan(57)
          done()
        })
        setTimeout(receive, 5000, inject)
      })
    })
  })
})
