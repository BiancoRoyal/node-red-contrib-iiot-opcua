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

var goodTestFlowPayload = [
  {
    "id": "n1",
    "type": "inject",
    "name": "TestInject",
    "topic": "TestTopic",
    "payload": "[{\"value\":{\"dataType\":\"Double\",\"arrayType\":\"Scalar\",\"value\":19.1},\"statusCode\":{\"value\":0,\"description\":\"No Error\",\"name\":\"Good\"},\"sourcePicoseconds\":0,\"serverPicoseconds\":0}]",
    "payloadType": "json",
    "once": true,
    "onceDelay": 0.1,
    "wires": [["n2", "n3"]]
  },
  {id:"n2", type:"helper"},
  {
    "id": "n3",
    "type": "function",
    "name": "",
    "func": "msg.nodetype = 'read'\nmsg.injectType = 'read'\nreturn msg;",
    "outputs": 1,
    "noerr": 0,
    "wires": [["n4", "n5"]]
  },
  {id:"n4", type:"helper"},
  {
    "id": "n5",
    "type": "OPCUA-IIoT-Response",
    "name": "",
    "showStatusActivities": false,
    "showErrors": false,
    "wires": [["n6"]]
  },
  {id:"n6", type:"helper"}
]

var badTestFlowPayload = [
  {
    "id": "n1",
    "type": "inject",
    "name": "TestInject",
    "topic": "TestTopic",
    "payload": "[{\"value\":{\"dataType\":\"Double\",\"arrayType\":\"Scalar\",\"value\":21.1},\"statusCode\":{\"value\":0,\"description\":\"Some Error\",\"name\":\"Bad\"},\"sourcePicoseconds\":0,\"serverPicoseconds\":0}]",
    "payloadType": "json",
    "once": true,
    "onceDelay": 0.1,
    "wires": [["n2", "n3"]]
  },
  {id:"n2", type:"helper"},
  {
    "id": "n3",
    "type": "function",
    "name": "",
    "func": "msg.nodetype = 'read'\nmsg.injectType = 'read'\nreturn msg;",
    "outputs": 1,
    "noerr": 0,
    "wires": [["n4", "n5"]]
  },
  {id:"n4", type:"helper"},
  {
    "id": "n5",
    "type": "OPCUA-IIoT-Response",
    "name": "",
    "showStatusActivities": false,
    "showErrors": false,
    "wires": [["n6"]]
  },
  {id:"n6", type:"helper"}
]

var otherTestFlowPayload = [
  {
    "id": "n1",
    "type": "inject",
    "name": "TestInject",
    "topic": "TestTopic",
    "payload": "[{\"value\":{\"dataType\":\"Double\",\"arrayType\":\"Scalar\",\"value\":21.1},\"statusCode\":{\"value\":0,\"description\":\"Some Unknown\",\"name\":\"Other\"},\"sourcePicoseconds\":0,\"serverPicoseconds\":0}]",
    "payloadType": "json",
    "once": true,
    "onceDelay": 0.1,
    "wires": [["n2", "n3"]]
  },
  {id:"n2", type:"helper"},
  {
    "id": "n3",
    "type": "function",
    "name": "",
    "func": "msg.nodetype = 'read'\nmsg.injectType = 'read'\nreturn msg;",
    "outputs": 1,
    "noerr": 0,
    "wires": [["n4", "n5"]]
  },
  {id:"n4", type:"helper"},
  {
    "id": "n5",
    "type": "OPCUA-IIoT-Response",
    "name": "",
    "showStatusActivities": false,
    "showErrors": false,
    "wires": [["n6"]]
  },
  {id:"n6", type:"helper"}
]

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

    it('should get a message with payload', function(done) {
      helper.load([injectNode, functionNode, inputNode], goodTestFlowPayload, function() {
        let n4 = helper.getNode("n4")
        n4.on("input", function(msg) {
          msg.should.have.property('payload', [{"value":{"dataType":"Double","arrayType":"Scalar","value":19.1},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0}])
          done()
        })
      })
    })

    it('should verify a good message', function(done) {
      helper.load([injectNode, functionNode, inputNode], goodTestFlowPayload, function() {
        let n6 = helper.getNode("n6")
        n6.on("input", function(msg) {
          msg.should.have.property('payload', [{"value":{"dataType":"Double","arrayType":"Scalar","value":19.1},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0}])
          msg.should.have.property('entryStatus', [1,0,0])
          done()
        })
      })
    })

    it('should verify a bad message', function(done) {
      helper.load([injectNode, functionNode, inputNode], badTestFlowPayload, function() {
        let n6 = helper.getNode("n6")
        n6.on("input", function(msg) {
          msg.should.have.property('payload', [{"value":{"dataType":"Double","arrayType":"Scalar","value":21.1},"statusCode":{"value":0,"description":"Some Error","name":"Bad"},"sourcePicoseconds":0,"serverPicoseconds":0}])
          msg.should.have.property('entryStatus', [0,1,0])
          done()
        })
      })
    })

    it('should verify a other message', function(done) {
      helper.load([injectNode, functionNode, inputNode], otherTestFlowPayload, function() {
        let n6 = helper.getNode("n6")
        n6.on("input", function(msg) {
          msg.should.have.property('payload', [{"value":{"dataType":"Double","arrayType":"Scalar","value":21.1},"statusCode":{"value":0,"description":"Some Unknown","name":"Other"},"sourcePicoseconds":0,"serverPicoseconds":0}])
          msg.should.have.property('entryStatus', [0,0,1])
          done()
        })
      })
    })
  })
})
