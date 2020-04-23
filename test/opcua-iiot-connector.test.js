/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2018,2019 Klaus Landsdorf (https://bianco-royal.com/)
 * All rights reserved.
 * node-red-contrib-iiot-opcua
 *
 **/

'use strict'

jest.setTimeout(5000)

var injectNode = require('@node-red/nodes/core/core/20-inject')
var functionNode = require('@node-red/nodes/core/core/80-function')

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
            expect(n4.bianco).toBeDefined()
            expect(n4.bianco.iiot).toBeDefined()
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
          n4.bianco.iiot.connectToClient()
          n4.bianco.iiot.connectOPCUAEndpoint()
          done()
        }
      })
    })

    it('should be loaded and execute reset for Bad Session', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.bianco.iiot.resetBadSession()
          done()
        }
      })
    })

    it('should be loaded and do not start session on state END', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.bianco.iiot.stateMachine.lock().end()
          n4.bianco.iiot.startSession()
          done()
        }
      })
    })

    it('should be loaded and do not start session on state is not INIT', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.bianco.iiot.startSession()
          done()
        }
      })
    })

    it('should be loaded and do not start session on state is not OPEN', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.bianco.iiot.stateMachine.lock()
          n4.bianco.iiot.startSession()
          done()
        }
      })
    })

    it('should be loaded and do not start session without OPC UA client', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.bianco.iiot.stateMachine.lock().open()
          n4.bianco.iiot.startSession()
          done()
        }
      })
    })

    // TODO whole new functions
    it('should be loaded and do restart session on state is not RECONFIGURED', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.bianco.iiot.stateMachine.lock().open()
          n4.bianco.iiot.renewConnection(done)
        }
      })
    })

    it('should be loaded and do restart connection on state is RECONFIGURED', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.bianco.iiot.stateMachine.lock().reconfigure()
          n4.bianco.iiot.renewConnection(done)
        }
      })
    })

    it('should be loaded and do reset BadSession on state is LOCKED', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.bianco.iiot.stateMachine.lock()
          n4.bianco.iiot.sessionNodeRequests = 10
          n4.bianco.iiot.resetBadSession()
          setTimeout(done, 1000)
        }
      })
    })

    it('should be loaded and do reset BadSession on state is RECONFIGURED', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.bianco.iiot.stateMachine.lock().reconfigure()
          n4.bianco.iiot.sessionNodeRequests = 10
          n4.bianco.iiot.resetBadSession()
          setTimeout(done, 1000)
        }
      })
    })

    it('should be loaded and handle error', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.bianco.iiot.handleError(new Error('Testing Error To Handle'))
          done()
        }
      })
    })

    it('should be loaded and register call done without node', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.bianco.iiot.registerForOPCUA(null)
          done()
        }
      })
    })

    it('should be loaded and deregister call done without node', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.bianco.iiot.deregisterForOPCUA(null, done)
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
