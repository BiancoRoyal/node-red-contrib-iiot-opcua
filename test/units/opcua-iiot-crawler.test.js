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

jest.setTimeout(5000)

var injectNode = require('@node-red/nodes/core/common/20-inject')
var functionNode = require('@node-red/nodes/core/function/10-function')
var inputNode = require('../../src/opcua-iiot-crawler')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var crawlerNodesToLoad = [injectNode, functionNode, inputNode]

var crawlerUnitFlow = [
  {
    'id': '13e5e190.e34516',
    'type': 'OPCUA-IIoT-Crawler',
    'connector': '',
    'name': 'TestNameCrawler',
    'justValue': true,
    'singleResult': false,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': true,
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
    'wires': [[]]
  }
]

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
      helper.load(crawlerNodesToLoad, crawlerUnitFlow,
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
  })
})
