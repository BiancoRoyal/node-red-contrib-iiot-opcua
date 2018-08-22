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

var expect = require('chai').expect

var injectNode = require('../src/opcua-iiot-inject')
var connectorNode = require('../src/opcua-iiot-connector')
var inputNode = require('../src/opcua-iiot-crawler')
var serverNode = require('../src/opcua-iiot-server')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var crawlerNodesToLoad = [injectNode, connectorNode, inputNode, serverNode]

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
    'startDelay': '2.4',
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
    'wires': [
      [
        'n4f1'
      ]
    ]
  },
  {id: 'n4f1', type: 'helper'},
  {
    'id': '6aff8d91.2081b4',
    'type': 'OPCUA-IIoT-Server',
    'port': '1965',
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
    'serverDiscovery': true,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 10000,
    'maxNodesPerBrowse': 10000,
    'wires': [
      []
    ]
  },
  {
    'id': 'n1c1',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:1965/',
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
    'startDelay': '2.4',
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
    'port': '1966',
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
    'serverDiscovery': true,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 10000,
    'maxNodesPerBrowse': 10000,
    'wires': [
      []
    ]
  },
  {
    'id': 'n1c2',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:1966/',
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
    'id': 'n1f2',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': 'testpayload',
    'payloadType': 'str',
    'topic': 'TestTopicCrawler',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2.4',
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
    'singleResult': true,
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
    'port': '1967',
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
    'serverDiscovery': true,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 10000,
    'maxNodesPerBrowse': 10000,
    'wires': [
      []
    ]
  },
  {
    'id': 'n1c2',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:1967/',
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
    'id': 'n1f2',
    'type': 'OPCUA-IIoT-Inject',
    'injectType': 'inject',
    'payload': 'testpayload',
    'payloadType': 'str',
    'topic': 'TestTopicCrawler',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2.4',
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
    'singleResult': true,
    'showStatusActivities': false,
    'showErrors': false,
    'filters': [{'name': 'Limits', 'nodeId': 'ns=0;i=11704'}],
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
    'port': '1967',
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
    'serverDiscovery': true,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 10000,
    'maxNodesPerBrowse': 10000,
    'wires': [
      []
    ]
  },
  {
    'id': 'n1c2',
    'type': 'OPCUA-IIoT-Connector',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:1967/',
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
    'id': '88f582a2.3b9028',
    'type': 'OPCUA-IIoT-Server',
    'port': '5388',
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
    'wires': [ [ ] ]
  },
  {
    'id': '7ca9c103.e1cec8',
    'type': 'OPCUA-IIoT-Crawler',
    'connector': 'b8172133.6e8a1',
    'name': '',
    'justValue': true,
    'singleResult': true,
    'showStatusActivities': true,
    'showErrors': true,
    'filters': [
      {
        'name': 'dataType',
        'value': 'ObjectType'
      },
      {
        'name': 'nodeClass',
        'value': 'Object'
      }
    ],
    'wires': [
      [
        '1h1f'
      ]
    ]
  },
  {id: 'h1f', type: 'helper'},
  {
    'id': '70c2f78b.a928a8',
    'type': 'OPCUA-IIoT-Inject',
    'z': '2c480163.82dc16',
    'injectType': 'inject',
    'payload': '',
    'payloadType': 'date',
    'topic': '',
    'repeat': '',
    'crontab': '',
    'once': true,
    'startDelay': '2.4',
    'name': '',
    'addressSpaceItems': [
      {
        'name': '',
        'nodeId': 'i=85',
        'datatypeName': ''
      }
    ],
    'wires': [
      [
        '7ca9c103.e1cec8'
      ]
    ]
  },
  {
    'id': 'b8172133.6e8a1',
    'type': 'OPCUA-IIoT-Connector',
    'z': '2c480163.82dc16',
    'discoveryUrl': '',
    'endpoint': 'opc.tcp://localhost:5388/',
    'keepSessionAlive': false,
    'loginEnabled': false,
    'securityPolicy': 'None',
    'securityMode': 'NONE',
    'name': 'LOCAL SERVER',
    'showErrors': true,
    'publicCertificateFile': '',
    'privateKeyFile': '',
    'defaultSecureTokenLifetime': '',
    'endpointMustExist': false,
    'autoSelectRightEndpoint': false,
    'strategyMaxRetry': '',
    'strategyInitialDelay': '',
    'strategyMaxDelay': '',
    'strategyRandomisationFactor': '',
    'requestedSessionTimeout': ''
  }
]

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
    it('should be loaded', function (done) {
      helper.load(
        [inputNode, connectorNode], [
          {
            'id': '13e5e190.e34516',
            'type': 'OPCUA-IIoT-Crawler',
            'connector': '951b5d66.94b0d8',
            'name': 'TestName',
            'justValue': true,
            'singleResult': false,
            'showStatusActivities': false,
            'showErrors': false,
            'filters': [
              {
                'name': 'Organizes',
                'nodeId': 'i=35'
              },
              {
                'name': 'GeneratesEvent',
                'nodeId': 'i=41'
              },
              {
                'name': 'References',
                'nodeId': 'i=31'
              }
            ],
            'wires': [
              [
                'f2d94c91.f7157'
              ]
            ]
          },
          {
            'id': '951b5d66.94b0d8',
            'type': 'OPCUA-IIoT-Connector',
            'discoveryUrl': '',
            'endpoint': 'opc.tcp://localhost:1963/',
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
          }
        ],
        function () {
          let nodeUnderTest = helper.getNode('13e5e190.e34516')
          nodeUnderTest.should.have.property('name', 'TestName')
          nodeUnderTest.should.have.property('justValue', true)
          nodeUnderTest.should.have.property('singleResult', false)
          nodeUnderTest.should.have.property('showStatusActivities', false)
          nodeUnderTest.should.have.property('showErrors', false)
          setTimeout(done, 3000)
        })
    })

    it('should get a message with payload', function (done) {
      helper.load(crawlerNodesToLoad, testCrawlerFlow, function () {
        let n2 = helper.getNode('n2f1')
        n2.on('input', function (msg) {
          msg.should.have.property('payload', 'testpayload')
        })
        let n4 = helper.getNode('n4f1')
        n4.on('input', function (msg) {
          done()
        })
      })
    })

    it('should verify crawler items as result', function (done) {
      helper.load(crawlerNodesToLoad, testCrawlerFlow, function () {
        let n4 = helper.getNode('n4f1')
        n4.on('input', function (msg) {
          msg.payload.should.have.property('browserItems')
          msg.payload.browserItems[0].should.have.property('references')

          expect(msg.payload.browserItems).to.be.an('array')
          expect(msg.payload.browserItems.length).to.equal(34)
          expect(msg.payload.browserItemsCount).to.equal(34)
          done()
        })
      })
    })

    it('should verify crawler items as just values result', function (done) {
      helper.load(crawlerNodesToLoad, testCrawlerJustValueFlow, function () {
        let n4 = helper.getNode('n4f2')
        n4.on('input', function (msg) {
          msg.payload.should.have.property('browserItems')
          expect(msg.payload.browserItems[0].references).to.equal(undefined)

          expect(msg.payload.browserItems).to.be.an('array')
          expect(msg.payload.browserItems.length).to.equal(34)
          done()
        })
      })
    })

    it('should verify crawler items as just values as single result', function (done) {
      helper.load(crawlerNodesToLoad, testCrawlerJustValueSingleFlow, function () {
        let n4 = helper.getNode('n4f2')
        n4.on('input', function (msg) {
          msg.payload.should.have.property('browserItems')
          expect(msg.payload.browserItems[0].references).to.equal(undefined)

          expect(msg.payload.browserItems).to.be.an('array')
          expect(msg.payload.browserItems.length).to.equal(34)
          done()
        })
      })
    })

    it('should verify filtered crawler items as just values as single result', function (done) {
      helper.load(crawlerNodesToLoad, testCrawlerJustValueSingleFilteredFlow, function () {
        let n4 = helper.getNode('n4f2')
        n4.on('input', function (msg) {
          msg.payload.should.have.property('browserItems')
          expect(msg.payload.browserItems[0].references).to.equal(undefined)

          expect(msg.payload.browserItems).to.be.an('array')
          expect(msg.payload.browserItems.length).to.equal(33)
          done()
        })
      })
    })

    it('should verify filtered crawler items as filtered results', function (done) {
      helper.load(crawlerNodesToLoad, testCrawlerWithFilter, function () {
        let h1f = helper.getNode('h1f')
        h1f.on('input', function (msg) {
          msg.payload.should.have.property('browserItems')
          expect(msg.payload.browserItems[0].references).to.equal(undefined)

          expect(msg.payload.browserItems).to.be.an('array')
          expect(msg.payload.browserItems.length).to.equal(33)
          done()
        })
      })
    })
  })
})
