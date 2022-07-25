/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2022 DATATRONiQ GmbH (https://datatroniq.com)
 * Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 * All rights reserved.
 * node-red-contrib-iiot-opcua
 *
 **/

'use strict'

process.env.isTest = 'TRUE'

jest.setTimeout(5000)

var injectNode = require('@node-red/nodes/core/common/20-inject')
var functionNode = require('@node-red/nodes/core/function/10-function')

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
            expect(n4.functions).toBeDefined()
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
          n4.functions.connectToClient()
          n4.functions.connectOPCUAEndpoint()
          done()
        }
      })
    })

    it('should be loaded and execute reset for Bad Session', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.functions.resetBadSession()
          done()
        }
      })
    })

    it('should be loaded and do not start session on state END', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.iiot.stateMachine.lock().end()
          n4.functions.startSession()
          done()
        }
      })
    })

    it('should be loaded and do not start session on state is not OPEN', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.iiot.stateMachine.lock()
          n4.functions.startSession()
          done()
        }
      })
    })

    it('should be loaded and do not start session without OPC UA client', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.iiot.stateMachine.lock().open()
          n4.functions.startSession()
          done()
        }
      })
    })

    // TODO whole new functions
    it('should be loaded and do restart session on state is not RECONFIGURED', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.iiot.stateMachine.lock().open()
          n4.functions.renewConnection(done)
        }
      })
    })

    it('should be loaded and do restart connection on state is RECONFIGURED', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.iiot.stateMachine.lock().reconfigure()
          n4.functions.renewConnection(done)
        }
      })
    })

    it('should be loaded and do reset BadSession on state is LOCKED', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.iiot.stateMachine.lock()
          n4.iiot.sessionNodeRequests = 10
          n4.functions.resetBadSession()
          setTimeout(done, 1000)
        }
      })
    })

    it('should be loaded and do reset BadSession on state is RECONFIGURED', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.iiot.stateMachine.lock().reconfigure()
          n4.iiot.sessionNodeRequests = 10
          n4.functions.resetBadSession()
          setTimeout(done, 1000)
        }
      })
    })

    it('should be loaded and handle error', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.functions.handleError(new Error('Testing Error To Handle'))
          done()
        }
      })
    })

    it('should be loaded and register call done without node', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.functions.registerForOPCUA(null)
          done()
        }
      })
    })

    it('should be loaded and deregister call done without node', function (done) {
      helper.load(nodesToLoadConnector, connectorUnitFlow, () => {
        let n4 = helper.getNode('n4')
        if (n4) {
          n4.functions.deregisterForOPCUA(null, done)
        }
      })
    })

    // TODO: Figure out why this isn't working
    // it('should success on FilterTypes request', function (done) {
    //   helper.load(nodesToLoadConnector, connectorUnitFlow, function () {
    //     helper.request()
    //       .get('/opcuaIIoT/list/FilterTypes')
    //       .expect(200)
    //       .end(done)
    //   })
    // })
  })
})
