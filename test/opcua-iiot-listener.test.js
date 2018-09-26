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

// iiot opc ua nodes
var injectNode = require('node-red/nodes/core/core/20-inject')
var functionNode = require('node-red/nodes/core/core/80-function')
var inputNode = require('../src/opcua-iiot-listener')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var listenerNodesToLoad = [injectNode, functionNode, inputNode]

describe('OPC UA Listener monitoring node Unit Testing', function () {
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

  describe('Listen node', function () {
    it('should be loaded', function (done) {
      helper.load(listenerNodesToLoad, [
        {
          'id': 'bee3e3b0.ca1a08',
          'type': 'OPCUA-IIoT-Listener',
          'connector': 'c30aa44e.9ed95',
          'action': 'subscribe',
          'queueSize': 10,
          'name': 'TestListener',
          'justValue': true,
          'showStatusActivities': false,
          'showErrors': false,
          'wires': [
            [
              '3497534.af772ac'
            ]
          ]
        }
      ],
      function () {
        let nodeUnderTest = helper.getNode('bee3e3b0.ca1a08')
        expect(nodeUnderTest.name).toBe('TestListener')
        expect(nodeUnderTest.action).toBe('subscribe')
        setTimeout(done, 3000)
      })
    })
  })
})
