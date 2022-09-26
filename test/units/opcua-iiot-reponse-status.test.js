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

jest.setTimeout(10000)

var injectNode = require('@node-red/nodes/core/common/20-inject')
var functionNode = require('@node-red/nodes/core/function/10-function')
var inputNode = require('../../src/opcua-iiot-response')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var readGoodInject = {
  'id': 'n1rsf1',
  'type': 'inject',
  'name': 'TestInject Read',
  'topic': 'TestTopic',
  'payload': '{"value":{"dataType":"Double","arrayType":"Scalar","value":20, "statusCode":{"value":0,"description":"No Error","name":"Good"}},"sourcePicoseconds":0,"serverPicoseconds":0}',
  'payloadType': 'json',
  'repeat': '',
  'crontab': '',
  'once': true,
  'onceDelay': 0.1,
  'wires': [['n2rsf', 'n3rsfrd']]
}

var readBadInject = {
  'id': 'n1rsf2',
  'type': 'inject',
  'name': 'TestInject Read',
  'topic': 'TestTopic',
  'payload': '{"value":{"dataType":"Double","arrayType":"Scalar","value":20, "statusCode":{"value":0,"description":"Fatal Error","name":"Bad"}},"sourcePicoseconds":0,"serverPicoseconds":0}',
  'payloadType': 'json',
  'repeat': '',
  'crontab': '',
  'once': true,
  'onceDelay': 0.1,
  'wires': [['n2rsf', 'n3rsfrd']]
}

var readOtherInject = {
  'id': 'n1rsf3',
  'type': 'inject',
  'name': 'TestInject Read',
  'topic': 'TestTopic',
  'payload': '{"value":{"dataType":"Double","arrayType":"Scalar","value":20, "statusCode":{"value":0,"description":"Some Error","name":"Best"}},"sourcePicoseconds":0,"serverPicoseconds":0}',
  'payloadType': 'json',
  'repeat': '',
  'crontab': '',
  'once': true,
  'onceDelay': 0.1,
  'wires': [['n2rsf', 'n3rsfrd']]
}

var readResultSimulation = {
  'id': 'n3rsfrd',
  'type': 'function',
  'name': '',
  'func': "msg.payload.nodetype = 'read'\nmsg.payload.injectType = 'read'\nreturn msg;",
  'outputs': 1,
  'noerr': 0,
  'wires': [['n4rsf', 'n5rsf']]
}

var writeGoodInject = {
  'id': 'n1rsf5',
  'type': 'inject',
  'name': 'TestInject Write',
  'topic': 'TestTopic',
  'payload': '{"statusCodes":[{"value":0,"description":"No Error","name":"Good"}]}',
  'payloadType': 'json',
  'repeat': '',
  'crontab': '',
  'once': true,
  'onceDelay': 0.1,
  'wires': [['n2rsf', 'n3rsfwr']]
}

var writeBadInject = {
  'id': 'n1rsf6',
  'type': 'inject',
  'name': 'TestInject Write',
  'topic': 'TestTopic',
  'payload': '{"statusCodes":[{"value":0,"description":"Fatal Error","name":"Bad"}]}',
  'payloadType': 'json',
  'repeat': '',
  'crontab': '',
  'once': true,
  'onceDelay': 0.1,
  'wires': [['n2rsf', 'n3rsfwr']]
}

var writeOtherInject = {
  'id': 'n1rsf7',
  'type': 'inject',
  'name': 'TestInject Write',
  'topic': 'TestTopic',
  'payload': '{"statusCodes":[{"value":0,"description":"Some Error","name":"Best"}]}',
  'payloadType': 'json',
  'repeat': '',
  'crontab': '',
  'once': true,
  'onceDelay': 0.1,
  'wires': [['n2rsf', 'n3rsfwr']]
}

var writeResultSimulation = {
  'id': 'n3rsfwr',
  'type': 'function',
  'name': '',
  'func': "msg.payload.nodetype = 'write'\nmsg.payload.injectType = 'write'\nreturn msg;",
  'outputs': 1,
  'noerr': 0,
  'wires': [['n4rsf', 'n5rsf']]
}

var listenGoodInject = {
  'id': 'n1rsf8',
  'type': 'inject',
  'name': 'TestInject Listen',
  'topic': 'TestTopic',
  'payload': '{"value":{"dataType":"UInt16","arrayType":"Scalar","value":0, "statusCode":{"value":0,"description":"No Error","name":"Good"}},"sourceTimestamp":"0","sourcePicoseconds":0,"serverTimestamp":"0","serverPicoseconds":0}',
  'payloadType': 'json',
  'repeat': '',
  'crontab': '',
  'once': true,
  'onceDelay': 0.1,
  'wires': [['n2rsf', 'n3rsfli']]
}

var listenBadInject = {
  'id': 'n1rsf9',
  'type': 'inject',
  'name': 'TestInject Listen',
  'topic': 'TestTopic',
  'payload': '{"value":{"dataType":"UInt16","arrayType":"Scalar","value":0, "statusCode":{"value":0,"description":"Fatal Error","name":"Bad"}},"sourceTimestamp":"0","sourcePicoseconds":0,"serverTimestamp":"0","serverPicoseconds":0}',
  'payloadType': 'json',
  'repeat': '',
  'crontab': '',
  'once': true,
  'onceDelay': 0.1,
  'wires': [['n2rsf', 'n3rsfli']]
}

var listenOtherInject = {
  'id': 'n1rsf10',
  'type': 'inject',
  'name': 'TestInject Listen',
  'topic': 'TestTopic',
  'payload': '{"value":{"dataType":"UInt16","arrayType":"Scalar","value":0, "statusCode":{"value":0,"description":"Some Error","name":"Best"}},"sourceTimestamp":"0","sourcePicoseconds":0,"serverTimestamp":"0","serverPicoseconds":0}',
  'payloadType': 'json',
  'repeat': '',
  'crontab': '',
  'once': true,
  'onceDelay': 0.1,
  'wires': [['n2rsf', 'n3rsfli']]
}

var listenResultSimulation = {
  'id': 'n3rsfli',
  'type': 'function',
  'name': '',
  'func': "msg.payload.nodetype = 'listen'\nmsg.payload.injectType = 'subscribe'\nreturn msg;",
  'outputs': 1,
  'noerr': 0,
  'wires': [['n4rsf', 'n5rsf']]
}

var testFlows = require('./flows/response-flows')

var readGoodTestFlowPayload = testFlows.testFlowPayload.concat([readResultSimulation, readGoodInject])
var writeGoodTestFlowPayload = testFlows.testFlowPayload.concat([writeResultSimulation, writeGoodInject])
var listenGoodTestFlowPayload = testFlows.testFlowPayload.concat([listenResultSimulation, listenGoodInject])

var readBadTestFlowPayload = testFlows.testFlowPayload.concat([readResultSimulation, readBadInject])
var writeBadTestFlowPayload = testFlows.testFlowPayload.concat([writeResultSimulation, writeBadInject])
var listenBadTestFlowPayload = testFlows.testFlowPayload.concat([listenResultSimulation, listenBadInject])

var readOtherTestFlowPayload = testFlows.testFlowPayload.concat([readResultSimulation, readOtherInject])
var writeOtherTestFlowPayload = testFlows.testFlowPayload.concat([writeResultSimulation, writeOtherInject])
var listenOtherTestFlowPayload = testFlows.testFlowPayload.concat([listenResultSimulation, listenOtherInject])

describe('OPC UA Response Status node Unit Testing', function () {
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

  describe('Response Status node', function () {
    it('should get a message with payload on read', function (done) {
      helper.load([injectNode, functionNode, inputNode], readGoodTestFlowPayload, function () {
        let n4 = helper.getNode('n4rsf')
        n4.on('input', function (msg) {
          expect(msg.payload).toMatchObject({'value': {'dataType': 'Double', 'arrayType': 'Scalar', 'value': 20,  'statusCode': {'value': 0, 'description': 'No Error', 'name': 'Good'}},'sourcePicoseconds': 0, 'serverPicoseconds': 0})
          done()
        })
      })
    })

    it('should get a message with payload on write', function (done) {
      helper.load([injectNode, functionNode, inputNode], writeGoodTestFlowPayload, function () {
        let n4 = helper.getNode('n4rsf')
        n4.on('input', function (msg) {
          expect(msg.payload).toMatchObject({'statusCodes': [{'value': 0, 'description': 'No Error', 'name': 'Good'}]})
          done()
        })
      })
    })

    it('should get a message with payload on listen', function (done) {
      helper.load([injectNode, functionNode, inputNode], listenGoodTestFlowPayload, function () {
        let n4 = helper.getNode('n4rsf')
        n4.on('input', function (msg) {
          expect(msg.payload).toMatchObject({'value': {'dataType': 'UInt16', 'arrayType': 'Scalar', 'value': 0,'statusCode': {'value': 0, 'description': 'No Error', 'name': 'Good'}},  'sourceTimestamp': '0', 'sourcePicoseconds': 0, 'serverTimestamp': '0', 'serverPicoseconds': 0})
          done()
        })
      })
    })

    it('should verify a good message on read', function (done) {
      helper.load([injectNode, functionNode, inputNode], readGoodTestFlowPayload, function () {
        let n6 = helper.getNode('n6rsf')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({good: 1, bad: 0, other: 0})
          done()
        })
      })
    })

    it('should verify a good message on write', function (done) {
      helper.load([injectNode, functionNode, inputNode], writeGoodTestFlowPayload, function () {
        let n6 = helper.getNode('n6rsf')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({good: 1, bad: 0, other: 0})
          done()
        })
      })
    })

    it('should verify a good message on listen', function (done) {
      helper.load([injectNode, functionNode, inputNode], listenGoodTestFlowPayload, function () {
        let n6 = helper.getNode('n6rsf')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({good: 1, bad: 0, other: 0})
          done()
        })
      })
    })

    it('should verify a bad message on read', function (done) {
      helper.load([injectNode, functionNode, inputNode], readBadTestFlowPayload, function () {
        let n6 = helper.getNode('n6rsf')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({good: 0, bad: 1, other: 0})
          done()
        })
      })
    })

    it('should verify a bad message on write', function (done) {
      helper.load([injectNode, functionNode, inputNode], writeBadTestFlowPayload, function () {
        let n6 = helper.getNode('n6rsf')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({good: 0, bad: 1, other: 0})
          done()
        })
      })
    })

    it('should verify a bad message on listen', function (done) {
      helper.load([injectNode, functionNode, inputNode], listenBadTestFlowPayload, function () {
        let n6 = helper.getNode('n6rsf')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({good: 0, bad: 1, other: 0})
          done()
        })
      })
    })

    it('should verify a other message on read', function (done) {
      helper.load([injectNode, functionNode, inputNode], readOtherTestFlowPayload, function () {
        let n6 = helper.getNode('n6rsf')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({good: 0, bad: 0, other: 1})
          done()
        })
      })
    })

    it('should verify a other message on write', function (done) {
      helper.load([injectNode, functionNode, inputNode], writeOtherTestFlowPayload, function () {
        let n6 = helper.getNode('n6rsf')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({good: 0, bad: 0, other: 1})
          done()
        })
      })
    })

    it('should verify a other message on listen', function (done) {
      helper.load([injectNode, functionNode, inputNode], listenOtherTestFlowPayload, function () {
        let n6 = helper.getNode('n6rsf')
        n6.on('input', function (msg) {
          expect(msg.payload.entryStatus).toMatchObject({good: 0, bad: 0, other: 1})
          done()
        })
      })
    })
  })
})
