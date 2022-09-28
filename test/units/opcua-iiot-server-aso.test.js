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

var injectNode = require('@node-red/nodes/core/common/20-inject')
var functionNode = require('@node-red/nodes/core/function/10-function')
var serverAsoNode = require('../../src/opcua-iiot-server-aso')

var serverAsoFlowNodes = [injectNode, functionNode, serverAsoNode]

var testFlows = require('./flows/sever-aso-flows')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

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

describe('Address Space Operation node Unit Testing', function () {
  it('should be loaded', function (done) {
    helper.load(serverAsoFlowNodes, testFlows.testUnitServerASOFlow,
    function () {
      let nodeUnderTest = helper.getNode('7cb85115.7635')
      expect(nodeUnderTest.name).toBe('Folder')
      expect(nodeUnderTest.nodeId.toString()).toBe('ns=1;s=TestVariables')
      expect(nodeUnderTest.datatype).toBe('Double')
      expect(nodeUnderTest.value).toBe('1.0')
      expect(nodeUnderTest.browsename).toBe('TestVariables')
      expect(nodeUnderTest.displayname).toBe('Test Variables')
      done()
    })
  })
})
