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
var inputNode = require('../src/opcua-iiot-server-cmd')
var helper = require('./helper.js')

var testFlowPayload = [
  {
    "id": "n1",
    "type": "inject",
    "payload": "testpayload",
    "payloadType": "str",
    "repeat": "",
    "crontab": "",
    "once": true,
    "wires": [["n2", "n3", "n4"]]
  },
  {id:"n2", type:"helper"},
  {
    "id": "n3",
    "type": "OPCUA-IIoT-Server-Command",
    "commandtype": "restart",
    "nodeId": "",
    "name": "",
    "wires": [
      ["n5"]
    ]
  },
  {
    "id": "n4",
    "type": "OPCUA-IIoT-Server-Command",
    "commandtype": "deleteNode",
    "nodeId": "ns=4;s=TestFolder",
    "name": "",
    "wires": [
      ["n6"]
    ]
  },
  {id:"n5", type:"helper"},
  {id:"n6", type:"helper"}
]

describe('OPC UA Server Command node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Command node', function () {
    it('should be loaded', function (done) {
      helper.load(
        [inputNode],
        [{
          "id": "n3",
          "type": "OPCUA-IIoT-Server-Command",
          "commandtype": "restart",
          "nodeId": "",
          "name": "TestName",
          "wires": [[]]
        }
        ],
        function () {
          let nodeUnderTest = helper.getNode('n3')
          nodeUnderTest.should.have.property('name', 'TestName')
          nodeUnderTest.should.have.property('commandtype', 'restart')
          nodeUnderTest.should.have.property('nodeId', '')
          done()
        })
    })

    it('should get a message with payload on restart command', function(done) {
      helper.load([injectNode, inputNode], testFlowPayload, function() {
        let n5 = helper.getNode("n5")
        n5.on("input", function(msg) {
          msg.payload.should.have.property('commandtype', 'restart')
          msg.payload.should.have.property('nodeId', '')
          msg.should.have.property('nodetype', 'CMD')
          done()
        })
      })
    })

    it('should get a message with payload on delete ASO command', function(done) {
      helper.load([injectNode, inputNode], testFlowPayload, function() {
        let n6 = helper.getNode("n6")
        n6.on("input", function(msg) {
          msg.payload.should.have.property('commandtype', 'deleteNode')
          msg.payload.should.have.property('nodeId', 'ns=4;s=TestFolder')
          msg.should.have.property('nodetype', 'CMD')
          done()
        })
      })
    })
  })
})
