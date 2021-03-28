/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2018,2019,2020,2021 Klaus Landsdorf (https://bianco-royal.space/)
 * All rights reserved.
 * node-red-contrib-iiot-opcua
 *
 **/

'use strict'

jest.setTimeout(5000)

var injectNode = require('@node-red/nodes/core/common/20-inject')
var functionNode = require('@node-red/nodes/core/function/10-function')
var serverCmdNode = require('../src/opcua-iiot-server-cmd')

var serverCmdNodes = [injectNode, functionNode, serverCmdNode]

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

describe('OPC UA Server Command node Unit Testing', function () {
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

  describe('Command node', function () {
    it('should be loaded', function (done) {
      helper.load(serverCmdNodes,
        [{
          'id': 'n3cmdf1',
          'type': 'OPCUA-IIoT-Server-Command',
          'commandtype': 'restart',
          'nodeId': '',
          'name': 'TestName',
          'wires': [[]]
        }
        ],
        function () {
          let nodeUnderTest = helper.getNode('n3cmdf1')
          expect(nodeUnderTest.name).toBe('TestName')
          expect(nodeUnderTest.commandtype).toBe('restart')
          expect(nodeUnderTest.nodeId).toBe('')
          done()
        })
    })
  })
})
