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

// jest.setTimeout(30000)

var inputNode = require('../../src/opcua-iiot-flex-connector')

var helper = require('node-red-node-test-helper')
var portHelper = require('./../helper/test-helper-extensions')
helper.init(require.resolve('node-red'))

var testFlows = require('./flows/flex-connector-flows')
global.lastOpcuaPort = 56900

describe('OPC UA Flex Connector node Unit Testing', function () {
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

  describe('Flex Connector node', function () {
    it('should be loaded without connector', function (done) {
      helper.load([inputNode], testFlows.testUnitFlexConnectorFlow,
      function () {
        let nodeUnderTest = helper.getNode('14d54403.f94f04')
        expect(nodeUnderTest).toBeDefined()
        expect(nodeUnderTest.name).toBe('TestFlexConnector')
        done()
      })
    })

    it('should be loaded without connector and showing activities', function (done) {
      helper.load([inputNode], testFlows.testUnitFlexConnectorShowActivitiesFlow,
      function () {
        let nodeUnderTest = helper.getNode('14d54403.f94f05')
        expect(nodeUnderTest).toBeDefined()
        expect(nodeUnderTest.name).toBe('TestFlexConnector2')
        done()
      })
    })
  })
})
