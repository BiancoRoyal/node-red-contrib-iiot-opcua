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
var inputNode = require('../src/opcua-iiot-node')
var helper = require('./helper.js')

var testFlowPayload = [
  {
    "id": "n1",
    "type": "inject",
    "payload": "testpayload",
    "payloadType": "str",
    "once": true,
    "wires": [["n2", "n3"]]
  },
  {id:"n2", type:"helper"},
  {id:"n3",
    type:"OPCUA-IIoT-Node",
    nodeId:"ns=2;s=TestReadWrite",
    datatype:"Double",
    value:"1",
    usingListener:false,
    name:"TestName",
    topic:"TestTopic",
    wires:[["n4"]]
  },
  {id:"n4", type:"helper"}
]

describe('OPC UA Node node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Node node', function () {
    it('node should be loaded', function (done) {
      helper.load(
        [inputNode],
        [{
        "id":"3a234e92.cbc0f2",
        "type":"OPCUA-IIoT-Node",
        "nodeId":"ns=2;s=TestReadWrite",
        "datatype":"Double",
        "value":"1",
        "name":"TestName",
        "topic":"TestTopic",
        "wires":[[]]}
        ],
        function () {
          let nodeUnderTest = helper.getNode('3a234e92.cbc0f2')
          nodeUnderTest.should.have.property('name', 'TestName')
          nodeUnderTest.should.have.property('nodeId', 'ns=2;s=TestReadWrite')
          nodeUnderTest.should.have.property('datatype', 'Double')
          nodeUnderTest.should.have.property('value', '1')
          nodeUnderTest.should.have.property('topic', 'TestTopic')
          done()
        })
    })

    it('should get a message with payload', function(done) {
      helper.load([injectNode, inputNode], testFlowPayload, function() {
        let n2 = helper.getNode("n2")
        n2.on("input", function(msg) {
          msg.should.have.property('payload', 'testpayload')
          done()
        })
      })
    })

    it('should get a message with payload test', function(done) {
      helper.load([injectNode, inputNode], testFlowPayload, function() {
        let n2 = helper.getNode("n2")
        n2.on("input", function(msg) {
          assert.match(msg.payload, /^test.*./)
          done()
        })
      })
    })

    it('should verify a message', function(done) {
      helper.load([injectNode, inputNode], testFlowPayload, function() {
        let n4 = helper.getNode("n4")
        n4.on("input", function(msg) {
          msg.should.have.property('addressSpaceItems', [{"name":"TestName","nodeId":"ns=2;s=TestReadWrite","datatypeName":"Double"}]);
          done()
        })
      })
    })

    it('should have valuesToWrite', function(done) {
      helper.load([injectNode, functionNode, inputNode], testFlowPayload, function() {
        let n5 = helper.getNode("n4")
        n5.on("input", function(msg) {
          msg.should.have.property('valuesToWrite', [1]);
          done()
        })
      })
    })
  })
})
