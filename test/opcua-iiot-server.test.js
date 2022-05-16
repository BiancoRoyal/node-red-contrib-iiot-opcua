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

jest.setTimeout(8000)

var serverNode = require('../src/opcua-iiot-server')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testServerFlow = [
  {
    'id': '6ec4ef50.86dc1',
    'type': 'OPCUA-IIoT-Server',
    'port': '55557',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'DEMOSERVER',
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
    'delayToClose': 200,
    'wires': [
      []
    ]
  }
]

var testServerWithDiscoveryFlow = [
  {
    'id': '6ec4ef50.86dc2',
    'type': 'OPCUA-IIoT-Server',
    'port': '57679',
    'endpoint': '',
    'acceptExternalCommands': true,
    'maxAllowedSessionNumber': '',
    'maxConnectionsPerEndpoint': '',
    'maxAllowedSubscriptionNumber': '',
    'alternateHostname': '',
    'name': 'DEMOSERVER',
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

describe('OPC UA Server node Unit Testing', function () {
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

  describe('Server node', function () {
    it('should be loaded', function (done) {
      helper.load(serverNode, testServerFlow,
        function () {
          let nodeUnderTest = helper.getNode('6ec4ef50.86dc1')
          expect(nodeUnderTest).toBeDefined()
          // nodeUnderTest.on('server_running', () => {
          //   expect(nodeUnderTest.name).toBe('DEMOSERVER')
          //   expect(nodeUnderTest.maxAllowedSessionNumber).toBe(10)
          //   expect(nodeUnderTest.maxNodesPerRead).toBe(1000)
          //   expect(nodeUnderTest.maxNodesPerBrowse).toBe(2000)
          //   setTimeout(done, 3000)
          // })
        })
    })

    it('should be loaded with discovery', function (done) {
      helper.load(serverNode, testServerWithDiscoveryFlow,
        function () {
          let nodeUnderTest = helper.getNode('6ec4ef50.86dc2')
          expect(nodeUnderTest).toBeDefined()
          // nodeUnderTest.on('server_running', () => {
          //   expect(nodeUnderTest.name).toBe('DEMOSERVER')
          //   expect(nodeUnderTest.maxAllowedSessionNumber).toBe(10)
          //   expect(nodeUnderTest.maxNodesPerRead).toBe(1000)
          //   expect(nodeUnderTest.maxNodesPerBrowse).toBe(2000)
          //   setTimeout(done, 3000)
          // })
        })
    })
  })
})
