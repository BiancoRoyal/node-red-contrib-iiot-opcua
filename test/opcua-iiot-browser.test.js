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
var browserNode = require('../src/opcua-iiot-browser')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var browseNodesToLoad = [injectNode, functionNode, browserNode]

var testUnitBrowserFlow = [
  {
    'id': '4ac0b7c8.bebe18',
    'type': 'OPCUA-IIoT-Browser',
    'connector': '',
    'nodeId': 'ns=1;i=1234',
    'name': 'TestNameBrowser',
    'justValue': true,
    'sendNodesToRead': false,
    'sendNodesToListener': false,
    'sendNodesToBrowser': false,
    'singleBrowseResult': false,
    'showStatusActivities': false,
    'showErrors': false,
    'wires': [
      []
    ]
  },
  {id: 'n1helper', type: 'helper'}
]

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
    it('should be loaded', function (done) {
      helper.load(browseNodesToLoad, testUnitBrowserFlow,
        function () {
          let nodeUnderTest = helper.getNode('4ac0b7c8.bebe18')
          expect(nodeUnderTest.name).toBe('TestNameBrowser')
          expect(nodeUnderTest.nodeId).toBe('ns=1;i=1234')
          expect(nodeUnderTest.justValue).toBe(true)
          expect(nodeUnderTest.sendNodesToRead).toBe(false)
          expect(nodeUnderTest.sendNodesToListener).toBe(false)
          expect(nodeUnderTest.sendNodesToBrowser).toBe(false)
          expect(nodeUnderTest.showStatusActivities).toBe(false)
          setTimeout(done, 3000)
        })
    })
  })
})
