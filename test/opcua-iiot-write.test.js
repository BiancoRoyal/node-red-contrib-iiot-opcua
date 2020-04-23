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

var injectNodeRedNode = require('@node-red/nodes/core/core/20-inject')
var functionNodeRedNode = require('@node-red/nodes/core/core/80-function')

// iiot opcua
var inputNode = require('../src/opcua-iiot-write')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var writeNodesToLoad = [injectNodeRedNode, functionNodeRedNode, inputNode]

var writeUnitFlow = [
  {
    'id': '34d2c6bc.43275b',
    'type': 'OPCUA-IIoT-Write',
    'connector': '',
    'name': 'TestWrite',
    'justValue': false,
    'showStatusActivities': false,
    'showErrors': true,
    'wires': [[]]
  }
]

describe('OPC UA Write node Unit Testing', function () {
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

  describe('Write node', function () {
    it('should be loaded', function (done) {
      helper.load(writeNodesToLoad, writeUnitFlow,
        function () {
          let nodeUnderTest = helper.getNode('34d2c6bc.43275b')
          expect(nodeUnderTest.name).toBe('TestWrite')
          expect(nodeUnderTest.showErrors).toBe(true)
          expect(nodeUnderTest.justValue).toBe(false)
          done()
        })
    })

    it('should be loaded and handle error', function (done) {
      helper.load(writeNodesToLoad, writeUnitFlow, () => {
        let n1 = helper.getNode('34d2c6bc.43275b')
        if (n1) {
          n1.bianco.iiot.handleWriteError(new Error('Testing Error To Handle'), {payload: {}})
          done()
        }
      })
    })
  })
})
