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

jest.setTimeout(60000)

var injectNode = require('../../src/opcua-iiot-inject')
var connectorNode = require('../../src/opcua-iiot-connector')
var inputNode = require('../../src/opcua-iiot-crawler')
var serverNode = require('../../src/opcua-iiot-server')
var responseNode = require('../../src/opcua-iiot-response')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var crawlerNodesToLoad = [injectNode, connectorNode, inputNode, serverNode, responseNode]

var testFlows = require('./flows/crawler-e2e-flows')

describe('OPC UA Crawler node Testing', function () {
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
    it('should verify crawler items as result', function (done) {
      helper.load(crawlerNodesToLoad, testFlows.testCrawlerFlow, function () {
        let n4 = helper.getNode('n4f1')
        n4.on('input', function (msg) {
          expect(msg.payload.crawlerResults).toBeDefined()
          expect(msg.payload.crawlerResults[0].references).toBeDefined()
          expect(msg.payload.crawlerResults).toBeInstanceOf(Array)
          expect(msg.payload.crawlerResults.length).toBe(32)
          expect(msg.payload.crawlerResultsCount).toBe(32)
          done()
        })
      })
    })

    it('should verify crawler items as just values result', function (done) {
      helper.load(crawlerNodesToLoad, testFlows.testCrawlerJustValueFlow, function () {
        let n4 = helper.getNode('n4f2')
        n4.on('input', function (msg) {
          expect(msg.payload.crawlerResults).toBeDefined()
          expect(msg.payload.crawlerResults[0].references).toBe(undefined)
          expect(msg.payload.crawlerResults).toBeInstanceOf(Array)
          expect(msg.payload.crawlerResults.length).toBe(32)
          done()
        })
      })
    })

    it('should verify crawler items as just values as single result', function (done) {
      helper.load(crawlerNodesToLoad, testFlows.testCrawlerJustValueSingleFlow, function () {
        let n4 = helper.getNode('n4f3')
        n4.on('input', function (msg) {
          expect(msg.payload.crawlerResults).toBeDefined()
          expect(msg.payload.crawlerResults[0].references).toBe(undefined)
          expect(msg.payload.crawlerResults).toBeInstanceOf(Array)
          expect(msg.payload.crawlerResults.length).toBe(32)
          done()
        })
      })
    })

    it('should verify filtered crawler items as just values as single result', function (done) {
      helper.load(crawlerNodesToLoad, testFlows.testCrawlerJustValueSingleFilteredFlow, function () {
        let n4 = helper.getNode('n4f4')
        n4.on('input', function (msg) {
          expect(msg.payload.crawlerResults).toBeDefined()
          expect(msg.payload.crawlerResults[0].references).toBe(undefined)
          expect(msg.payload.crawlerResults).toBeInstanceOf(Array)
          expect(msg.payload.crawlerResults.length).toBe(32)
          done()
        })
      })
    })

    it('should verify filtered crawler items as filtered results', function (done) {
      helper.load(crawlerNodesToLoad, testFlows.testCrawlerWithFilter, function () {
        let h1f = helper.getNode('n4f5')
        h1f.on('input', function (msg) {
          expect(msg.payload.crawlerResults).toBeDefined()
          expect(msg.payload.crawlerResults[0]).toBeUndefined()
          expect(msg.payload.crawlerResults).toBeInstanceOf(Array)
          done()
        })
      })
    })

    it('should verify filtered crawler items without ns=0', function (done) {
      helper.load(crawlerNodesToLoad, testFlows.testCrawlerWithFilterNS0, function () {
        let n2 = helper.getNode('nc2h')
        n2.on('input', function (msg) {
          expect(msg.payload.crawlerResults).toBeDefined()
          expect(msg.payload.crawlerResults).toBeInstanceOf(Array)
          expect(msg.payload.crawlerResults.length).toBeLessThan(100)
          done()
        })
      })
    })

    it('should filter all basic filter types of crawler result', function (done) {
      helper.load(crawlerNodesToLoad, testFlows.testCrawlerWithAllBasicFilterTypes, function () {
        let n2 = helper.getNode('ncf2h')
        n2.on('input', function (msg) {
          expect(msg.payload.crawlerResults).toBeDefined()
          expect(msg.payload.crawlerResults).toBeInstanceOf(Array)
          expect(msg.payload.crawlerResults.length).toBeLessThan(57)
          done()
        })
      })
    })
  })
})
