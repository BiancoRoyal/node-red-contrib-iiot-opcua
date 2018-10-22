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

jest.setTimeout(5000)

var injectNode = require('node-red/nodes/core/core/20-inject')
var functionNode = require('node-red/nodes/core/core/80-function')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

// iiot opc ua nodes
var inputNode = require('../src/opcua-iiot-connector')

var nodesToLoadConnector = [injectNode, functionNode, inputNode]

var connectorUnitFlow = [
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
]

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
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.connectToClient()
          n4.connectOPCUAEndpoint()
          done()
        }
      })
    })

    it('should be loaded and execute reset for Bad Session', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.resetBadSession()
          done()
        }
      })
    })

    it('should be loaded and do not start session on state END', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.stateMachine.lock().end()
          n4.startSession()
          done()
        }
      })
    })

    it('should be loaded and do not start session on state is not OPEN', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.stateMachine.lock()
          n4.startSession()
          done()
        }
      })
    })

    it('should be loaded and do not start session without OPC UA client', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.stateMachine.lock().open()
          n4.startSession()
          done()
        }
      })
    })

    it('should be loaded and do not restart session on state is not SESSIONRESTART', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.stateMachine.lock().open()
          n4.renewSession('Test Connector')
          done()
        }
      })
    })

    it('should be loaded and do not restart session on state is SESSIONRESTART', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.stateMachine.lock().open().sessionactive().sessionrestart()
          n4.renewSession('Test Connector')
          done()
        }
      })
    })

    it('should be loaded and handle error', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.handleError(new Error('Testing Error To Handle'))
          done()
        }
      })
    })

    it('should be loaded and register call done without node', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.registerForOPCUA(null)
          done()
        }
      })
    })

    it('should be loaded and deregister call done without node', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.deregisterForOPCUA(null, done)
        }
      })
    })

    it('should success on FilterTypes request', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, function () {
        helper.request()
          .get('/opcuaIIoT/list/FilterTypes')
          .expect(200)
          .end(done)
      })
    })
  })
})
