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

var inputNode = require('../src/opcua-iiot-server')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testServerFlow = [
  {
    'id': 'n1svrf1',
    'type': 'OPCUA-IIoT-Server',
    'port': '1999',
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
    'serverDiscovery': true,
    'users': [],
    'xmlsets': [],
    'publicCertificateFile': '',
    'privateCertificateFile': '',
    'maxNodesPerRead': 1000,
    'maxNodesPerBrowse': 2000,
    'wires': [[]]
  }
]

describe('OPC UA Server node Testing', function () {
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
      helper.load(
        [inputNode], testServerFlow,
        function () {
          let nodeUnderTest = helper.getNode('n1svrf1')
          expect(nodeUnderTest.name).toBe('DEMOSERVER')
          expect(nodeUnderTest.maxAllowedSessionNumber).toBe(10)
          expect(nodeUnderTest.maxNodesPerRead).toBe(1000)
          expect(nodeUnderTest.maxNodesPerBrowse).toBe(2000)
          setTimeout(done, 3000)
        })
    })
  })
})
