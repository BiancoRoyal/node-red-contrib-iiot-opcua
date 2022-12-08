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
var inputNode = require('../../src/opcua-iiot-response')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testFlows = require('./flows/response-flows')
var testStatusAddons = require('./flows/response-status-flows')

var readGoodTestFlowPayload = testFlows.testUnitFlowPayloadFlow.concat([testStatusAddons.readResultSimulation, testStatusAddons.readGoodInject])
var writeGoodTestFlowPayload = testFlows.testUnitFlowPayloadFlow.concat([testStatusAddons.writeResultSimulation, testStatusAddons.writeGoodInject])
var listenGoodTestFlowPayload = testFlows.testUnitFlowPayloadFlow.concat([testStatusAddons.listenResultSimulation, testStatusAddons.listenGoodInject])

var readBadTestFlowPayload = testFlows.testUnitFlowPayloadFlow.concat([testStatusAddons.readResultSimulation, testStatusAddons.readBadInject])
var writeBadTestFlowPayload = testFlows.testUnitFlowPayloadFlow.concat([testStatusAddons.writeResultSimulation, testStatusAddons.writeBadInject])
var listenBadTestFlowPayload = testFlows.testUnitFlowPayloadFlow.concat([testStatusAddons.listenResultSimulation, testStatusAddons.listenBadInject])

var readOtherTestFlowPayload = testFlows.testUnitFlowPayloadFlow.concat([testStatusAddons.readResultSimulation, testStatusAddons.readOtherInject])
var writeOtherTestFlowPayload = testFlows.testUnitFlowPayloadFlow.concat([testStatusAddons.writeResultSimulation, testStatusAddons.writeOtherInject])
var listenOtherTestFlowPayload = testFlows.testUnitFlowPayloadFlow.concat([testStatusAddons.listenResultSimulation, testStatusAddons.listenOtherInject])

let testingOpcUaPort = 0

describe('OPC UA Response Status node Unit Testing', function () {

  beforeAll(() => {
    testingOpcUaPort = 58050
  })

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

  describe('Response Status node', function () {
    it('should get a message with payload on read', function (done) {
      helper.load([injectNode, functionNode, inputNode], readGoodTestFlowPayload, function () {
        let n4 = helper.getNode('n4rsf')
        n4.on('input', function (msg) {
          expect(msg.payload).toMatchObject({
            'value': {
              'dataType': 'Double',
              'arrayType': 'Scalar',
              'value': 20,
              'statusCode': { 'value': 0, 'description': 'No Error', 'name': 'Good' }
            }, 'sourcePicoseconds': 0, 'serverPicoseconds': 0
          })
          done()
        })
      })
    })

    it('should get a message with payload on write', function (done) {
      helper.load([injectNode, functionNode, inputNode], writeGoodTestFlowPayload, function () {
        let n4 = helper.getNode('n4rsf')
        n4.on('input', function (msg) {
          expect(msg.payload).toMatchObject({
            'statusCodes': [{
              'value': 0,
              'description': 'No Error',
              'name': 'Good'
            }]
          })
          done()
        })
      })
    })

    it('should get a message with payload on listen', function (done) {
      helper.load([injectNode, functionNode, inputNode], listenGoodTestFlowPayload, function () {
        let n4 = helper.getNode('n4rsf')
        n4.on('input', function (msg) {
          expect(msg.payload).toMatchObject({
            'value': {
              'dataType': 'UInt16',
              'arrayType': 'Scalar',
              'value': 0,
              'statusCode': { 'value': 0, 'description': 'No Error', 'name': 'Good' }
            }, 'sourceTimestamp': '0', 'sourcePicoseconds': 0, 'serverTimestamp': '0', 'serverPicoseconds': 0
          })
          done()
        })
      })
    })

    it('should verify a good message on read', function (done) {
      helper.load([injectNode, functionNode, inputNode], readGoodTestFlowPayload, function () {
        let n6 = helper.getNode('n6rsf')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ good: 1, bad: 0, other: 0 })
          done()
        })
      })
    })

    it('should verify a good message on write', function (done) {
      helper.load([injectNode, functionNode, inputNode], writeGoodTestFlowPayload, function () {
        let n6 = helper.getNode('n6rsf')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ good: 1, bad: 0, other: 0 })
          done()
        })
      })
    })

    it('should verify a good message on listen', function (done) {
      helper.load([injectNode, functionNode, inputNode], listenGoodTestFlowPayload, function () {
        let n6 = helper.getNode('n6rsf')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ good: 1, bad: 0, other: 0 })
          done()
        })
      })
    })

    it('should verify a bad message on read', function (done) {
      helper.load([injectNode, functionNode, inputNode], readBadTestFlowPayload, function () {
        let n6 = helper.getNode('n6rsf')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ good: 0, bad: 1, other: 0 })
          done()
        })
      })
    })

    it('should verify a bad message on write', function (done) {
      helper.load([injectNode, functionNode, inputNode], writeBadTestFlowPayload, function () {
        let n6 = helper.getNode('n6rsf')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ good: 0, bad: 1, other: 0 })
          done()
        })
      })
    })

    it('should verify a bad message on listen', function (done) {
      helper.load([injectNode, functionNode, inputNode], listenBadTestFlowPayload, function () {
        let n6 = helper.getNode('n6rsf')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ good: 0, bad: 1, other: 0 })
          done()
        })
      })
    })

    it('should verify a other message on read', function (done) {
      helper.load([injectNode, functionNode, inputNode], readOtherTestFlowPayload, function () {
        let n6 = helper.getNode('n6rsf')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ good: 0, bad: 0, other: 1 })
          done()
        })
      })
    })

    it('should verify a other message on write', function (done) {
      helper.load([injectNode, functionNode, inputNode], writeOtherTestFlowPayload, function () {
        let n6 = helper.getNode('n6rsf')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ good: 0, bad: 0, other: 1 })
          done()
        })
      })
    })

    it('should verify a other message on listen', function (done) {
      helper.load([injectNode, functionNode, inputNode], listenOtherTestFlowPayload, function () {
        let n6 = helper.getNode('n6rsf')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({ good: 0, bad: 0, other: 1 })
          done()
        })
      })
    })
  })
})
