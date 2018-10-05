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

var injectNode = require('node-red/nodes/core/core/20-inject')
var functionNode = require('node-red/nodes/core/core/80-function')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

// iiot opc ua nodes
var inputNode = require('../src/opcua-iiot-connector')

var nodesToLoadConnector = [injectNode, functionNode, inputNode]

describe('OPC UA Connector node Unit Testing', function () {
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

  describe('Connector node', function () {
    it('should be loaded without server for the endpoint', function (done) {
      try {
        helper.load(nodesToLoadConnector, [
          {
            'id': 'n4',
            'type': 'OPCUA-IIoT-Connector',
            'discoveryUrl': '',
            'endpoint': 'opc.tcp://localhost:48402/',
            'keepSessionAlive': false,
            'loginEnabled': false,
            'securityPolicy': 'None',
            'securityMode': 'NONE',
            'name': 'TESTSERVER',
            'showStatusActivities': false,
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
        ], () => {
          let n4 = helper.getNode('n4')
          if (n4) {
            done()
          }
        })
      } catch (e) {
        done()
      }
    })

    it('should be loaded with no endpoint', function (done) {
      helper.load(nodesToLoadConnector, [
        {
          'id': 'n4',
          'type': 'OPCUA-IIoT-Connector',
          'discoveryUrl': '',
          'endpoint': '',
          'keepSessionAlive': false,
          'loginEnabled': false,
          'securityPolicy': 'None',
          'securityMode': 'NONE',
          'name': 'TESTSERVER',
          'showStatusActivities': false,
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
      ], () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          done()
        }
      })
    })
  })
})
