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
var inputNode = require('../src/opcua-iiot-crawler')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var crawlerNodesToLoad = [injectNode, functionNode, inputNode]

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
      helper.load(crawlerNodesToLoad, [
        {
          'id': '13e5e190.e34516',
          'type': 'OPCUA-IIoT-Crawler',
          'connector': '951b5d66.94b0d8',
          'name': 'TestNameCrawler',
          'justValue': true,
          'singleResult': false,
          'showStatusActivities': false,
          'showErrors': false,
          'filters': [
            {
              'name': 'Organizes',
              'nodeId': 'i=35'
            },
            {
              'name': 'GeneratesEvent',
              'nodeId': 'i=41'
            },
            {
              'name': 'References',
              'nodeId': 'i=31'
            }
          ],
          'wires': [
            [
              'f2d94c91.f7157'
            ]
          ]
        }
      ],
      function () {
        let nodeUnderTest = helper.getNode('13e5e190.e34516')
        expect(nodeUnderTest.name).toBe('TestNameCrawler')
        expect(nodeUnderTest.justValue).toBe(true)
        expect(nodeUnderTest.singleResult).toBe(false)
        expect(nodeUnderTest.showStatusActivities).toBe(false)
        expect(nodeUnderTest.showErrors).toBe(false)
        setTimeout(done, 3000)
      })
    })
  })
})
