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
var helper = require('node-red-contrib-test-helper')

var testCMDFlow = [
  {
    "id": "n1cmdf1",
    "type": "inject",
    "payload": "testpayload",
    "payloadType": "str",
    "repeat": "",
    "crontab": "",
    "once": true,
    "wires": [["n2cmdf1", "n3cmdf1", "n4cmdf1"]]
  },
  {id:"n2cmdf1", type:"helper"},
  {
    "id": "n3cmdf1",
    "type": "OPCUA-IIoT-Server-Command",
    "commandtype": "restart",
    "nodeId": "",
    "name": "",
    "wires": [
      ["n5cmdf1"]
    ]
  },
  {
    "id": "n4cmdf1",
    "type": "OPCUA-IIoT-Server-Command",
    "commandtype": "deleteNode",
    "nodeId": "ns=4;s=TestFolder",
    "name": "",
    "wires": [
      ["n6cmdf1"]
    ]
  },
  {id:"n5cmdf1", type:"helper"},
  {id:"n6cmdf1", type:"helper"}
]

describe('OPC UA Server Command node Testing', function () {
  before(function(done) {
    helper.startServer(function () {
      console.log('Command start server done')
      done()
    })
  })

  afterEach(function(done) {
    helper.unload().then(function () {
      console.log('Command unload done')
      done()
    }).catch(function (err) {
      console.log('Command error ' + err)
      done()
    })
  })

  after(function (done) {
    helper.stopServer(function () {
      console.log('Command stop server done')
      done()
    })
  })


  describe('Command node', function () {
    it('should be loaded', function (done) {
      helper.load(
        [inputNode],
        [{
          "id": "n3cmdf1",
          "type": "OPCUA-IIoT-Server-Command",
          "commandtype": "restart",
          "nodeId": "",
          "name": "TestName",
          "wires": [[]]
        }
        ],
        function () {
          let nodeUnderTest = helper.getNode('n3cmdf1')
          nodeUnderTest.should.have.property('name', 'TestName')
          nodeUnderTest.should.have.property('commandtype', 'restart')
          nodeUnderTest.should.have.property('nodeId', '')
          done()
        })
    })

    it('should get a message with payload on restart command', function(done) {
      helper.load([injectNode, inputNode], testCMDFlow, function() {
        let n5 = helper.getNode("n5cmdf1")
        n5.on("input", function(msg) {
          msg.payload.should.have.property('commandtype', 'restart')
          msg.payload.should.have.property('nodeId', '')
          msg.should.have.property('nodetype', 'CMD')
          done()
        })
      })
    })

    it('should get a message with payload on delete ASO command', function(done) {
      helper.load([injectNode, inputNode], testCMDFlow, function() {
        let n6 = helper.getNode("n6cmdf1")
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
