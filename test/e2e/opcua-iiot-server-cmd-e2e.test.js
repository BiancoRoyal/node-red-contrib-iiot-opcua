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
var injectOPCUANode = require('../../src/opcua-iiot-inject')
var inputNode = require('../../src/opcua-iiot-server-cmd')
var serverNode = require('../../src/opcua-iiot-server')
var flexServerNode = require('../../src/opcua-iiot-flex-server')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testFlows = require('./flows/server-cmd-e2e-flows')

describe('OPC UA Server Command node e2e Testing', function () {
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
    it('should get a message with payload on restart command', function (done) {
      helper.load([injectNode, inputNode], testFlows.testCMDFlow, function () {
        let n5 = helper.getNode('n5cmdf1')
        n5.on('input', function (msg) {
          expect(msg.payload.commandType).toBe('restart')
          expect(msg.payload.nodeId).toBeUndefined()
          expect(msg.payload.nodetype).toBe('inject')
          expect(msg.payload.injectType).toBe('CMD')
          done()
        })
      })
    })

    it('should get a message with payload on delete ASO command', function (done) {
      helper.load([injectNode, inputNode], testFlows.testCMDFlow, function () {
        let n6 = helper.getNode('n6cmdf1')
        n6.on('input', function (msg) {
          expect(msg.payload.commandType).toBe('deleteNode')
          expect(msg.payload.nodeId).toBe('ns=1;s=TestFolder')
          expect(msg.payload.nodetype).toBe('inject')
          expect(msg.payload.injectType).toBe('CMD')
          done()
        })
      })
    })

    it('should get a message with inject to delete ASO', function (done) {
      helper.load([injectOPCUANode, inputNode, serverNode], testFlows.testInjectCMDFlow, function () {
        let n5 = helper.getNode('n5cmdf2')
        n5.on('input', function (msg) {
          expect(msg.payload.commandType).toBe('deleteNode')
          expect(msg.payload.nodeId).toBe('ns=1;s=TestFolder')
          expect(msg.payload.nodetype).toBe('inject')
          expect(msg.payload.injectType).toBe('CMD')
          done()
        })
      })
    })

    it('should get a message with inject to restart server', function (done) {
      helper.load([injectNode, injectOPCUANode, inputNode, serverNode], testFlows.testCMDWithServerFlow, function () {
        let n5 = helper.getNode('n5csf1')
        n5.on('input', function (msg) {
          expect(msg.payload.commandType).toBe('restart')
          expect(msg.payload.nodeId).toBeUndefined()
          expect(msg.payload.nodetype).toBe('inject')
          expect(msg.payload.injectType).toBe('CMD')
          setTimeout(done, 3000)
        })
      })
    })

    it('should get a message with inject to restart flex server', function (done) {
      helper.load([injectNode, injectOPCUANode, inputNode, flexServerNode], testFlows.testCMDWithFlexServerFlow, function () {
        let n5 = helper.getNode('n5csf3')
        n5.on('input', function (msg) {
          expect(msg.payload.commandType).toBe('restart')
          expect(msg.payload.nodeId).toBeUndefined()
          expect(msg.payload.nodetype).toBe('inject')
          expect(msg.payload.injectType).toBe('CMD')
          setTimeout(done, 3000)
        })
      })
    })

    it('should get no message with wrong command inject to restart flex server', function (done) {
      helper.load([injectNode, injectOPCUANode, inputNode, flexServerNode], testFlows.testWrongCMDWithFlexServerFlow, function () {
        let n5 = helper.getNode('n5csf4')
        n5.on('input', function (msg) {
          expect(false).toBeTruthy()
        })
        setTimeout(done, 3500)
      })
    })

    it('should get no message on wrong inject type sent to flex server', function (done) {
      helper.load([injectNode, injectOPCUANode, inputNode, flexServerNode], testFlows.testWrongInjectWithFlexServerFlow, function () {
        let n5 = helper.getNode('n5csf4')
        n5.on('input', function (msg) {
          expect(false).toBeTruthy()
        })
        setTimeout(done, 3500)
      })
    })
  })
})
