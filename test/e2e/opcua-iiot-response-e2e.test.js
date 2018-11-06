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
var resultFilterNode = require('../../src/opcua-iiot-result-filter')
var responseNode = require('../../src/opcua-iiot-response')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testResponseNodes = [injectNode, connectorNode, readNode, resultFilterNode, responseNode, serverNode]

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
  })
})
