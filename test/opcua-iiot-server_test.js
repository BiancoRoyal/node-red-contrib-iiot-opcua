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

var assert = require('chai').assert
var inputNode = require('../src/opcua-iiot-server')
var helper = require('node-red-contrib-test-helper')

var testFlowPayload = [
  {
    "id": "n1",
    "type": "OPCUA-IIoT-Server",
    "port": "1999",
    "endpoint": "",
    "acceptExternalCommands": true,
    "maxAllowedSessionNumber": "",
    "maxConnectionsPerEndpoint": "",
    "maxAllowedSubscriptionNumber": "",
    "alternateHostname": "",
    "name": "DEMOSERVER",
    "showStatusActivities": false,
    "showErrors": false,
    "asoDemo": true,
    "allowAnonymous": true,
    "isAuditing": false,
    "serverDiscovery": true,
    "users": [],
    "xmlsets": [],
    "publicCertificateFile": "",
    "privateCertificateFile": "",
    "maxNodesPerRead": 1000,
    "maxNodesPerBrowse": 2000,
    "wires": [[]]
  }
]

describe('OPC UA Server node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Server node', function () {
    it('should be loaded', function (done) {
      helper.load(
        [inputNode], testFlowPayload,
        function () {
          let nodeUnderTest = helper.getNode('n1')
          nodeUnderTest.should.have.property('name', 'DEMOSERVER')
          nodeUnderTest.should.have.property('maxAllowedSessionNumber', 10)
          nodeUnderTest.should.have.property('maxNodesPerRead', 1000)
          nodeUnderTest.should.have.property('maxNodesPerBrowse', 2000)
          done()
        })
    })
  })
})
