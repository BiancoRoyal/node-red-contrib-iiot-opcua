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
var inputNode = require('../../src/opcua-iiot-crawler')

var helper = require('node-red-node-test-helper')
var portHelper = require('./../helper/test-helper-extensions')
helper.init(require.resolve('node-red'))

var crawlerNodesToLoad = [injectNode, functionNode, inputNode]

var testFlows = require('./flows/crawler-flows')
global.lastOpcuaPort = 56600

describe('OPC UA Crawler node Unit Testing', function () {
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

  describe('Crawler node', function () {
    it('should be loaded', function (done) {
      helper.load(crawlerNodesToLoad, testFlows.testUnitCrawlerFlow,
        function () {
          let nodeUnderTest = helper.getNode('13e5e190.e34516')
          expect(nodeUnderTest.name).toBe('TestNameCrawler')
          expect(nodeUnderTest.justValue).toBe(true)
          expect(nodeUnderTest.singleResult).toBe(false)
          expect(nodeUnderTest.showStatusActivities).toBe(false)
          expect(nodeUnderTest.showErrors).toBe(false)
          done()
        })
    })

    it('should be loaded with default settings', function (done) {
      helper.load(crawlerNodesToLoad, testFlows.testUnitDefaultCrawlerFlow,
        function () {
          let nodeUnderTest = helper.getNode('4bf9f1cbd3fe98bc')
          expect(nodeUnderTest.name).toBe('')
          expect(nodeUnderTest.justValue).toBe(true)
          expect(nodeUnderTest.singleResult).toBe(false)
          expect(nodeUnderTest.showStatusActivities).toBe(false)
          expect(nodeUnderTest.showErrors).toBe(false)
          expect(nodeUnderTest.activateUnsetFilter).toBe(false)
          expect(nodeUnderTest.activateFilters).toBe(false)
          expect(nodeUnderTest.negateFilter).toBe(false)
          expect(nodeUnderTest.filters).toBeInstanceOf(Array)
          expect(nodeUnderTest.filters.length).toBe(0)
          expect(nodeUnderTest.delayPerMessage).toBe(0.2)
          expect(nodeUnderTest.timeout).toBe(30)
          done()
        })
    })


  })
})
