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

var inputNode = require('../src/opcua-iiot-server')
var helper = require('node-red-contrib-test-helper')

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
  before(function (done) {
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

  after(function (done) {
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
          nodeUnderTest.should.have.property('name', 'DEMOSERVER')
          nodeUnderTest.should.have.property('maxAllowedSessionNumber', 10)
          nodeUnderTest.should.have.property('maxNodesPerRead', 1000)
          nodeUnderTest.should.have.property('maxNodesPerBrowse', 2000)
          setTimeout(done, 3000)
        })
    })
  })
})
