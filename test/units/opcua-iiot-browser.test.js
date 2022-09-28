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

var functionNode = require('@node-red/nodes/core/function/10-function')
var injectNode = require('@node-red/nodes/core/common/20-inject')
var browserNode = require('../../src/opcua-iiot-browser')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var browseNodesToLoad = [injectNode, functionNode, browserNode]

var testFlows = require('./flows/browser-flows')

describe('OPC UA Browser node Unit Testing', function () {
  beforeEach(function (done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function (done) {
    helper.unload().then(function () {
      helper.stopServer(function () {
        done()
      })
    }).catch(function () {
      helper.stopServer(function () {
        done()
      })
    })
  })

  describe('Browser node', function () {
    it('should be loaded with correct defaults', function (done) {
      helper.load(browseNodesToLoad, testFlows.testUnitBrowseFlow,
        function () {
          let nodeUnderTest = helper.getNode('4ac0b7c8.bebe18')
          expect(nodeUnderTest.nodeId).toBe('ns=1;i=1234')
          expect(nodeUnderTest.name).toBe('TestNameBrowser')
          expect(nodeUnderTest.justValue).toBe(true)
          expect(nodeUnderTest.sendNodesToRead).toBe(false)
          expect(nodeUnderTest.sendNodesToListener).toBe(false)
          expect(nodeUnderTest.sendNodesToBrowser).toBe(false)
          expect(nodeUnderTest.multipleOutputs).toBe(false)
          expect(nodeUnderTest.recursiveBrowse).toBe(false)
          expect(nodeUnderTest.recursiveDepth).toBe(1)
          expect(nodeUnderTest.delayPerMessage).toBe(0.2)
          expect(nodeUnderTest.showStatusActivities).toBe(false)
          expect(nodeUnderTest.showErrors).toBe(false)
          setTimeout(done, 3000)
        })
    })
  })
})
