/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2022 DATATRONiQ GmbH (https://datatroniq.com)
 * Copyright (c) 2018 Klaus Landsdorf (http://bianco-royal.de/)
 * All rights reserved.
 * node-red-contrib-iiot-opcua
 *
 **/

'use strict'

jest.setTimeout(20000)

var injectNode = require('../../src/opcua-iiot-inject')
var connectorNode = require('../../src/opcua-iiot-connector')
var inputNode = require('../../src/opcua-iiot-browser')
var serverNode = require('../../src/opcua-iiot-server')
var responseNode = require('../../src/opcua-iiot-response')
var resultFilterNode = require('../../src/opcua-iiot-result-filter')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var browseNodesToLoad = [injectNode, connectorNode, resultFilterNode, inputNode, serverNode, responseNode]

var testBrowseFlow = [
  {
    'id': 'n1f1',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': 'testpayload',
    'payloadType': 'str',
    'topic': 'TestTopicBrowse',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'Root',
    'addressSpaceItems': [],
    'wires': [['n2f1', 'n3f1']]
  },
  {id: 'n2f1', type: 'helper'},
  {
    'id': 'n3f1',
    'type': 'OPCUA-IIoT-Browser',
    'connector': 'c1f1',
    'nodeId': 'ns=1;i=1234',
    'name': 'TestBrowse',
    'justValue': false,
    'recursiveBrowse': false,
    'recursiveDepth': 1,
    'sendNodesToRead': false,
    'sendNodesToListener': false,
    'sendNodesToBrowser': false,
    'singleBrowseResult': true,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [['n5f1', 'n4rf1', '14bba4a7.aa0f1b']]
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
        'n21rf1'
      ]
    ]
  },
  {id: 'n21rf1', type: 'helper'},
  {
    'id': 'n4rf1',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressedStruct': true,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [['n3rf1']]
  },
  {id: 'n3rf1', type: 'helper'},
  {
    'id': 'c1f1',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:51958/',
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
  {id: 'n5f1', type: 'helper'},
  {
    'id': 's1f1',
    'type': 'OPCUA-IIoT-Server',
    'port': '51958',
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
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [[]]
  }
]

var testBrowseLevelsFlow = [
  {
    'id': 'n1f2',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': 'testpayload',
    'payloadType': 'str',
    'topic': 'TestTopicBrowse',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'Root',
    'addressSpaceItems': [],
    'wires': [['n2f2', 'n3f2']]
  },
  {id: 'n2f2', type: 'helper'},
  {
    'id': 'n3f2',
    'type': 'OPCUA-IIoT-Browser',
    'connector': 'c1f2',
    'nodeId': 'ns=1;i=1234',
    'name': 'TestBrowse',
    'justValue': true,
    'recursiveBrowse': false,
    'recursiveDepth': 3,
    'sendNodesToRead': false,
    'sendNodesToListener': false,
    'sendNodesToBrowser': true,
    'multipleOutputs': false,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [['n4f2', 'n5f2']]
  },
  {id: 'n4f2', type: 'helper'},
  {
    'id': 'n5f2',
    'type': 'OPCUA-IIoT-Browser',
    'connector': 'c1f2',
    'nodeId': '',
    'name': 'TestBrowseLevel2',
    'justValue': true,
    'recursiveBrowse': false,
    'recursiveDepth': 1,
    'sendNodesToRead': false,
    'sendNodesToListener': true,
    'sendNodesToBrowser': false,
    'singleBrowseResult': true,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [['n6f2']]
  },
  {
    'id': 'c1f2',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:51959/',
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
  {id: 'n6f2', type: 'helper'},
  {
    'id': 's1f2',
    'type': 'OPCUA-IIoT-Server',
    'port': '51959',
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
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,

    'wires': [[]]
  }
]

var testBrowseItemFlow = [
  {
    'id': 'n1f3',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': 'testpayload',
    'payloadType': 'str',
    'topic': 'TestTopicBrowse',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'Root',
    'addressSpaceItems': [
      {
        'name': '',
        'nodeId': 'ns=1;i=1234',
        'datatypeName': ''
      }
    ],
    'wires': [['n2f3', 'n3f3']]
  },
  {id: 'n2f3', type: 'helper'},
  {
    'id': 'n3f3',
    'type': 'OPCUA-IIoT-Browser',
    'connector': 'c1f3',
    'nodeId': '',
    'name': 'TestBrowse',
    'justValue': true,
    'recursiveBrowse': false,
    'recursiveDepth': 1,
    'sendNodesToRead': false,
    'sendNodesToListener': false,
    'sendNodesToBrowser': false,
    'singleBrowseResult': true,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [['n5f3']]
  },
  {
    'id': 'c1f3',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:51960/',
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
  {id: 'n5f3', type: 'helper'},
  {
    'id': 's1f3',
    'type': 'OPCUA-IIoT-Server',
    'port': '51960',
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
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [[]]
  }
]

var testBrowserResponseResultFilterFlow = [
  {
    'id': '21337b84.2a8c2c',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': '',
    'payloadType': 'date',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '3',
    'name': 'Root',
    'addressSpaceItems': [],
    'wires': [
      [
        '54c417f.8f6eee8'
      ]
    ]
  },
  {
    'id': '54c417f.8f6eee8',
    'type': 'OPCUA-IIoT-Browser',
    'connector': 'df5067f7.317428',
    'nodeId': 'ns=1;i=1234',
    'name': '',
    'justValue': true,
    'sendNodesToRead': true,
    'sendNodesToListener': true,
    'sendNodesToBrowser': true,
    'singleBrowseResult': true,
    'recursiveBrowse': false,
    'recursiveDepth': '',
    'showStatusActivities': false,
    'showErrors': true,
    'wires': [
      [
        '29f70fe4.908768',
        '3b5f43b0.cb6b1c',
        '61fa9abd.d996d4',
        'd49ce601.91bc88',
        'dd4608.71f0c1f8',
        '21ddfba4.f81d6c',
        '8d4ecc1b.cf52f',
        'dae729d.4118f58',
        'f5ab27de.a2b94',
        '5aae2743.2bdad8'
      ]
    ]
  },
  {
    'id': '29f70fe4.908768',
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
        'n1f4'
      ]
    ]
  },
  {
    'id': '3b5f43b0.cb6b1c',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': false,
    'activateFilters': true,
    'negateFilter': false,
    'filters': [
      {
        'name': 'nodeId',
        'value': 'ns=1;s=PumpSpeed'
      }
    ],
    'wires': [
      [
        'n1f4'
      ]
    ]
  },
  {
    'id': '61fa9abd.d996d4',
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
        'value': 'ns=1;s=PumpSpeed'
      }
    ],
    'wires': [
      [
        'n1f4'
      ]
    ]
  },
  {
    'id': 'd49ce601.91bc88',
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
        'value': 'ns=1;s=PumpSpeed'
      }
    ],
    'wires': [
      [
        'n1f4'
      ]
    ]
  },
  {
    'id': 'dd4608.71f0c1f8',
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
      [
        'n1f4'
      ]
    ]
  },
  {
    'id': '21ddfba4.f81d6c',
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
      [
        'n1f4'
      ]
    ]
  },
  {
    'id': '8d4ecc1b.cf52f',
    'type': 'OPCUA-IIoT-Result-Filter',
    'nodeId': 'ns=1;s=Pressure',
    'datatype': '',
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
      [
        'n1f4'
      ]
    ]
  },
  {
    'id': 'dae729d.4118f58',
    'type': 'OPCUA-IIoT-Result-Filter',
    'nodeId': 'ns=1;s=Pressure',
    'datatype': 'Double',
    'fixedValue': false,
    'fixPoint': 2,
    'withPrecision': false,
    'precision': 2,
    'entry': 1,
    'justValue': true,
    'withValueCheck': true,
    'minvalue': '0.5',
    'maxvalue': '0.2',
    'defaultvalue': '1',
    'topic': '',
    'name': '',
    'showErrors': false,
    'wires': [
      [
        'n1f4'
      ]
    ]
  },
  {
    'id': 'f5ab27de.a2b94',
    'type': 'OPCUA-IIoT-Result-Filter',
    'nodeId': 'ns=1;s=Pressure',
    'datatype': 'Double',
    'fixedValue': false,
    'fixPoint': 2,
    'withPrecision': true,
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
      [
        'n1f4'
      ]
    ]
  },
  {
    'id': '5aae2743.2bdad8',
    'type': 'OPCUA-IIoT-Result-Filter',
    'nodeId': 'ns=1;s=Pressure',
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
      [
        'n1f4'
      ]
    ]
  },
  {id: 'n1f4', type: 'helper'},
  {
    'id': 'df5067f7.317428',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:51961/',
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
    'id': 's1f4',
    'type': 'OPCUA-IIoT-Server',
    'port': '51961',
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
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [[]]
  }
]

export const trigger = require('./receive.js');

describe('OPC UA Browser node e2e Testing', function () {
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

  describe('Browser node', function () {
    it('should verify browser items as result', function (done) {
      helper.load(browseNodesToLoad, testBrowseFlow, function () {
        let n5 = helper.getNode('n5f1')
        let n1 = helper.getNode('n1f1')
        n5.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.browserResults).toBeInstanceOf(Array)
          expect(msg.payload.browserResults.length).toBe(15)
          done()
        })

        setTimeout(trigger, 5000, n1)
      })
    })

    it('should verify browser items as single result', function (done) {
      helper.load(browseNodesToLoad, testBrowseItemFlow, function () {
        let n5 = helper.getNode('n5f3')
        let n1 = helper.getNode('n1f3')
        n5.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.browserResults).toBeInstanceOf(Array)
          expect(msg.payload.browserResults.length).toBe(15)
          done()
        })

        setTimeout(trigger, 5000, n1)
      })
    })

    it('should verify browser items as single of full result', function (done) {
      testBrowseItemFlow[2].justValue = false
      helper.load(browseNodesToLoad, testBrowseItemFlow, function () {
        let n5 = helper.getNode('n5f3')
        let n1 = helper.getNode('n1f3')
        n5.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.endpoint).toBeDefined()
          expect(msg.payload.session).toBeDefined()
          expect(msg.payload.browserResults).toBeInstanceOf(Array)
          expect(msg.payload.browserResults.length).toBe(15)
          expect(msg.payload.browserResults.length).toBe(msg.payload.browserResultsCount)
          done()
        })

        setTimeout(trigger, 5000, n1)
      })
    })

    it('should verify browser items as single result with Nodes To Read', function (done) {
      testBrowseItemFlow[2].sendNodesToRead = true
      helper.load(browseNodesToLoad, testBrowseItemFlow, function () {
        let n5 = helper.getNode('n5f3')
        let n1 = helper.getNode('n1f3')
        n5.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.nodesToRead).toBeInstanceOf(Array)
          expect(msg.payload.nodesToRead.length).toBe(15)
          done()
        })

        setTimeout(trigger, 5000, n1)
      })
    })

    it('should verify browser items as single result with Nodes To Listener', function (done) {
      testBrowseItemFlow[2].sendNodesToListener = true
      helper.load(browseNodesToLoad, testBrowseItemFlow, function () {
        let n5 = helper.getNode('n5f3')
        let n1 = helper.getNode('n1f3')
        n5.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.nodesToRead).toBeInstanceOf(Array)
          expect(msg.payload.nodesToRead.length).toBe(15)
          done()
        })
        setTimeout(trigger, 5000, n1)
      })
    })

    it('should verify browser items as single result with Nodes To Browser', function (done) {
      testBrowseItemFlow[2].sendNodesToBrowser = true
      helper.load(browseNodesToLoad, testBrowseItemFlow, function () {
        let n5 = helper.getNode('n5f3')
        let n1 = helper.getNode('n1f3')
        n5.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.addressItemsToBrowse).toBeInstanceOf(Array)
          expect(msg.payload.addressItemsToBrowse.length).toBe(15)
          done()
        })

        setTimeout(trigger, 5000, n1)
      })
    })

    it('should verify browser items as single result with nodes to Read, Browse, and Listener', function (done) {
      testBrowseItemFlow[2].sendNodesToRead = true
      testBrowseItemFlow[2].sendNodesToListener = true
      testBrowseItemFlow[2].sendNodesToBrowser = true
      helper.load(browseNodesToLoad, testBrowseItemFlow, function () {
        let n5 = helper.getNode('n5f3')
        let n1 = helper.getNode('n1f3')
        n5.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.nodesToRead).toBeInstanceOf(Array)
          expect(msg.payload.nodesToRead.length).toBe(15)
          expect(msg.payload.nodesToRead).toBeInstanceOf(Array)
          expect(msg.payload.nodesToRead.length).toBe(15)
          expect(msg.payload.addressItemsToBrowse).toBeInstanceOf(Array)
          expect(msg.payload.addressItemsToBrowse.length).toBe(15)
          done()
        })

        setTimeout(trigger, 5000, n1)
      })
    })

    it('should verify browser items as single result with nodes to Browse with levels', function (done) {
      helper.load(browseNodesToLoad, testBrowseLevelsFlow, function () {
        let n4 = helper.getNode('n4f2')
        let n1 = helper.getNode('n1f2')
        n4.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.addressItemsToBrowse).toBeInstanceOf(Array)
          expect(msg.payload.addressItemsToBrowse.length).toBe(15)
          done()
        })

        setTimeout(trigger, 5000, n1)
      })
    })

    it('should verify browser items as single result with nodes to Read with levels', function (done) {
      helper.load(browseNodesToLoad, testBrowseLevelsFlow, function () {
        let n6 = helper.getNode('n6f2')
        let n1 = helper.getNode('n1f2')
        n6.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.nodesToRead).toBeInstanceOf(Array)
          expect(msg.payload.nodesToRead.length).toBe(10)
          done()
        })

        setTimeout(trigger, 8000, n1)
      })
    })

    it('should verify browser items as single result with nodes to Read with levels recursive', function (done) {
      testBrowseLevelsFlow[2].recursiveBrowse = true
      helper.load(browseNodesToLoad, testBrowseLevelsFlow, function () {
        let n6 = helper.getNode('n6f2')
        let n1 = helper.getNode('n1f2')
        n6.on('input', function (msg) {
          expect(msg.payload.browserResults).toBeDefined()
          expect(msg.payload.nodesToRead).toBeInstanceOf(Array)
          expect(msg.payload.nodesToRead.length).toBeGreaterThan(10)
          done()
        })

        setTimeout(trigger, 5000, n1)
      })
    })

    it('should get ten messages with payload on browser with six response nodes and four result-filter nodes', function (done) {
      helper.load(browseNodesToLoad, testBrowserResponseResultFilterFlow, function () {
        let n1 = helper.getNode('n1f4')
        let inject = helper.getNode('21337b84.2a8c2c')
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

          if (counter === 10) {
            done()
          }
        })
        setTimeout(trigger, 5000, inject)
      })
    })
  })

  describe('Browser node HTTP requests', function () {
    it('should success on browse for a root id', function (done) {
      helper.load(browseNodesToLoad, testBrowseFlow, function () {
        let n3 = helper.getNode('n3f1')
        let n1 = helper.getNode('n1f1')
        n3.on('input', function (msg) {
          helper.request()
            .get('/opcuaIIoT/browse/' + n3.id + '/' + encodeURIComponent('ns=0;i=85'))
            .expect(200)
            .end(done)
        })

        setTimeout(trigger, 5000, n1)
      })
    })
  })
})
