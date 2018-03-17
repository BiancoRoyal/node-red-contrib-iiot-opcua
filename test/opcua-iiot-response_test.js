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

var assert = require('chai').assert
var injectNode = require('node-red/nodes/core/core/20-inject')
var functionNode = require('node-red/nodes/core/core/80-function')
var inputNode = require('../src/opcua-iiot-response')
var helper = require('./helper.js')

var readGoodInject = {
  "id": "n1",
  "type": "inject",
  "name": "TestInject Read",
  "topic": "TestTopic",
  "payload": "[{\"value\":{\"dataType\":\"Double\",\"arrayType\":\"Scalar\",\"value\":20},\"statusCode\":{\"value\":0,\"description\":\"No Error\",\"name\":\"Good\"},\"sourcePicoseconds\":0,\"serverPicoseconds\":0}]",
  "payloadType": "json",
  "repeat": "",
  "crontab": "",
  "once": true,
  "onceDelay": 0.1,
  "wires": [["n2", "n3"]]
}

var readBadInject = {
  "id": "n1",
  "type": "inject",
  "name": "TestInject Read",
  "topic": "TestTopic",
  "payload": "[{\"value\":{\"dataType\":\"Double\",\"arrayType\":\"Scalar\",\"value\":20},\"statusCode\":{\"value\":0,\"description\":\"Fatal Error\",\"name\":\"Bad\"},\"sourcePicoseconds\":0,\"serverPicoseconds\":0}]",
  "payloadType": "json",
  "repeat": "",
  "crontab": "",
  "once": true,
  "onceDelay": 0.1,
  "wires": [["n2", "n3"]]
}

var readOtherInject = {
  "id": "n1",
  "type": "inject",
  "name": "TestInject Read",
  "topic": "TestTopic",
  "payload": "[{\"value\":{\"dataType\":\"Double\",\"arrayType\":\"Scalar\",\"value\":20},\"statusCode\":{\"value\":0,\"description\":\"Some Error\",\"name\":\"Best\"},\"sourcePicoseconds\":0,\"serverPicoseconds\":0}]",
  "payloadType": "json",
  "repeat": "",
  "crontab": "",
  "once": true,
  "onceDelay": 0.1,
  "wires": [["n2", "n3"]]
}

var readResultSimulation = {
  "id": "n3",
  "type": "function",
  "name": "",
  "func": "msg.nodetype = 'read'\nmsg.injectType = 'read'\nreturn msg;",
  "outputs": 1,
  "noerr": 0,
  "wires": [["n4", "n5"]]
}

var writeGoodInject = {
  "id": "n1",
  "type": "inject",
  "name": "TestInject Write",
  "topic": "TestTopic",
  "payload": "{\"statusCodes\":[{\"value\":0,\"description\":\"No Error\",\"name\":\"Good\"}]}",
  "payloadType": "json",
  "repeat": "",
  "crontab": "",
  "once": true,
  "onceDelay": 0.1,
  "wires": [["n2", "n3"]]
}

var writeBadInject = {
  "id": "n1",
  "type": "inject",
  "name": "TestInject Write",
  "topic": "TestTopic",
  "payload": "{\"statusCodes\":[{\"value\":0,\"description\":\"Fatal Error\",\"name\":\"Bad\"}]}",
  "payloadType": "json",
  "repeat": "",
  "crontab": "",
  "once": true,
  "onceDelay": 0.1,
  "wires": [["n2", "n3"]]
}

var writeOtherInject = {
  "id": "n1",
  "type": "inject",
  "name": "TestInject Write",
  "topic": "TestTopic",
  "payload": "{\"statusCodes\":[{\"value\":0,\"description\":\"Some Error\",\"name\":\"Best\"}]}",
  "payloadType": "json",
  "repeat": "",
  "crontab": "",
  "once": true,
  "onceDelay": 0.1,
  "wires": [["n2", "n3"]]
}

var writeResultSimulation = {
  "id": "n3",
  "type": "function",
  "name": "",
  "func": "msg.nodetype = 'write'\nmsg.injectType = 'write'\nreturn msg;",
  "outputs": 1,
  "noerr": 0,
  "wires": [["n4", "n5"]]
}

var listenGoodInject = {
    "id": "n1",
    "type": "inject",
    "name": "TestInject Listen",
    "topic": "TestTopic",
    "payload": "{\"value\":{\"dataType\":\"UInt16\",\"arrayType\":\"Scalar\",\"value\":0},\"statusCode\":{\"value\":0,\"description\":\"No Error\",\"name\":\"Good\"},\"sourceTimestamp\":\"0\",\"sourcePicoseconds\":0,\"serverTimestamp\":\"0\",\"serverPicoseconds\":0}",
    "payloadType": "json",
    "repeat": "",
    "crontab": "",
    "once": true,
    "onceDelay": 0.1,
    "wires": [["n2", "n3"]]
}

var listenBadInject = {
  "id": "n1",
  "type": "inject",
  "name": "TestInject Listen",
  "topic": "TestTopic",
  "payload": "{\"value\":{\"dataType\":\"UInt16\",\"arrayType\":\"Scalar\",\"value\":0},\"statusCode\":{\"value\":0,\"description\":\"Fatal Error\",\"name\":\"Bad\"},\"sourceTimestamp\":\"0\",\"sourcePicoseconds\":0,\"serverTimestamp\":\"0\",\"serverPicoseconds\":0}",
  "payloadType": "json",
  "repeat": "",
  "crontab": "",
  "once": true,
  "onceDelay": 0.1,
  "wires": [["n2", "n3"]]
}

var listenOtherInject = {
  "id": "n1",
  "type": "inject",
  "name": "TestInject Listen",
  "topic": "TestTopic",
  "payload": "{\"value\":{\"dataType\":\"UInt16\",\"arrayType\":\"Scalar\",\"value\":0},\"statusCode\":{\"value\":0,\"description\":\"Some Error\",\"name\":\"Best\"},\"sourceTimestamp\":\"0\",\"sourcePicoseconds\":0,\"serverTimestamp\":\"0\",\"serverPicoseconds\":0}",
  "payloadType": "json",
  "repeat": "",
  "crontab": "",
  "once": true,
  "onceDelay": 0.1,
  "wires": [["n2", "n3"]]
}

var listenResultSimulation = {
  "id": "n3",
  "type": "function",
  "name": "",
  "func": "msg.nodetype = 'listen'\nmsg.injectType = 'subscribe'\nreturn msg;",
  "outputs": 1,
  "noerr": 0,
  "wires": [["n4", "n5"]]
}

var testFlowPayload = [
  {id:"n2", type:"helper"},
  {id:"n4", type:"helper"},
  {
    "id": "n5",
    "type": "OPCUA-IIoT-Response",
    "name": "TestResponse",
    "showStatusActivities": false,
    "showErrors": false,
    "wires": [["n6"]]
  },
  {id:"n6", type:"helper"}
]

var readGoodTestFlowPayload = testFlowPayload.concat([readResultSimulation, readGoodInject])
var writeGoodTestFlowPayload = testFlowPayload.concat([writeResultSimulation, writeGoodInject])
var listenGoodTestFlowPayload = testFlowPayload.concat([listenResultSimulation, listenGoodInject])

var readBadTestFlowPayload = testFlowPayload.concat([readResultSimulation, readBadInject])
var writeBadTestFlowPayload = testFlowPayload.concat([writeResultSimulation, writeBadInject])
var listenBadTestFlowPayload = testFlowPayload.concat([listenResultSimulation, listenBadInject])

var readOtherTestFlowPayload = testFlowPayload.concat([readResultSimulation, readOtherInject])
var writeOtherTestFlowPayload = testFlowPayload.concat([writeResultSimulation, writeOtherInject])
var listenOtherTestFlowPayload = testFlowPayload.concat([listenResultSimulation, listenOtherInject])

describe('OPC UA Response node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Response node', function () {
    it('should load with basic settings', function (done) {
      helper.load(
        [inputNode],
        [{
          "id":"595c852.3ea227c",
          "type":"OPCUA-IIoT-Response",
          "name":"TestName",
          "showStatusActivities":false,
          "showErrors":false,
          "wires":[[]]
        }],
        function () {
          let nodeUnderTest = helper.getNode('595c852.3ea227c')
          nodeUnderTest.should.have.property('name', 'TestName')
          done()
        })
    })

    it('should get a message with payload on read', function(done) {
      helper.load([injectNode, functionNode, inputNode], readGoodTestFlowPayload, function() {
        let n4 = helper.getNode("n4")
        n4.on("input", function(msg) {
          msg.should.have.property('payload', [{"value":{"dataType":"Double","arrayType":"Scalar","value":20},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0}])
          done()
        })
      })
    })

    it('should get a message with payload on write', function(done) {
      helper.load([injectNode, functionNode, inputNode], writeGoodTestFlowPayload, function() {
        let n4 = helper.getNode("n4")
        n4.on("input", function(msg) {
          msg.should.have.property('payload', {"statusCodes":[{"value":0,"description":"No Error","name":"Good"}]})
          done()
        })
      })
    })

    it('should get a message with payload on listen', function(done) {
      helper.load([injectNode, functionNode, inputNode], listenGoodTestFlowPayload, function() {
        let n4 = helper.getNode("n4")
        n4.on("input", function(msg) {
          msg.should.have.property('payload', {"value":{"dataType":"UInt16","arrayType":"Scalar","value":0},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourceTimestamp":"0","sourcePicoseconds":0,"serverTimestamp":"0","serverPicoseconds":0})
          done()
        })
      })
    })

    it('should verify a good message on read', function(done) {
      helper.load([injectNode, functionNode, inputNode], readGoodTestFlowPayload, function() {
        let n6 = helper.getNode("n6")
        n6.on("input", function(msg) {
          msg.should.have.property('entryStatus', [1,0,0])
          done()
        })
      })
    })

    it('should verify a good message on write', function(done) {
      helper.load([injectNode, functionNode, inputNode], writeGoodTestFlowPayload, function() {
        let n6 = helper.getNode("n6")
        n6.on("input", function(msg) {
          msg.should.have.property('entryStatus', [1,0,0])
          done()
        })
      })
    })

    it('should verify a good message on listen', function(done) {
      helper.load([injectNode, functionNode, inputNode], listenGoodTestFlowPayload, function() {
        let n6 = helper.getNode("n6")
        n6.on("input", function(msg) {
          msg.should.have.property('entryStatus', [1,0,0])
          done()
        })
      })
    })

    it('should verify a bad message on read', function(done) {
      helper.load([injectNode, functionNode, inputNode], readBadTestFlowPayload, function() {
        let n6 = helper.getNode("n6")
        n6.on("input", function(msg) {
          msg.should.have.property('entryStatus', [0,1,0])
          done()
        })
      })
    })

    it('should verify a bad message on write', function(done) {
      helper.load([injectNode, functionNode, inputNode], writeBadTestFlowPayload, function() {
        let n6 = helper.getNode("n6")
        n6.on("input", function(msg) {
          msg.should.have.property('entryStatus', [0,1,0])
          done()
        })
      })
    })

    it('should verify a bad message on listen', function(done) {
      helper.load([injectNode, functionNode, inputNode], listenBadTestFlowPayload, function() {
        let n6 = helper.getNode("n6")
        n6.on("input", function(msg) {
          msg.should.have.property('entryStatus', [0,1,0])
          done()
        })
      })
    })

    it('should verify a other message on read', function(done) {
      helper.load([injectNode, functionNode, inputNode], readOtherTestFlowPayload, function() {
        let n6 = helper.getNode("n6")
        n6.on("input", function(msg) {
          msg.should.have.property('entryStatus', [0,0,1])
          done()
        })
      })
    })

    it('should verify a other message on write', function(done) {
      helper.load([injectNode, functionNode, inputNode], writeOtherTestFlowPayload, function() {
        let n6 = helper.getNode("n6")
        n6.on("input", function(msg) {
          msg.should.have.property('entryStatus', [0,0,1])
          done()
        })
      })
    })

    it('should verify a other message on listen', function(done) {
      helper.load([injectNode, functionNode, inputNode], listenOtherTestFlowPayload, function() {
        let n6 = helper.getNode("n6")
        n6.on("input", function(msg) {
          msg.should.have.property('entryStatus', [0,0,1])
          done()
        })
      })
    })
  })
})
