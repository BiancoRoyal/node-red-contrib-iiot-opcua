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
var inputNode = require('../src/opcua-iiot-inject')
var helper = require('node-red-contrib-test-helper')

var testInjectFlow = [
  {
    "id": "n1ijf1",
    "type": "OPCUA-IIoT-Inject",
    "injectType": "inject",
    "payload": "12345",
    "payloadType": "num",
    "topic": "TestTopicInject",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "1",
    "name": "TestInject",
    "addressSpaceItems": [
      {
        "name": "ServerStatus",
        "nodeId": "ns=0;i=2256",
        "datatypeName": "String"
      }
    ],
    "wires": [["n2ijf1"]]
  },
  {id:"n2ijf1", type:"helper"}
]


var testInjectWithDelayFlow = [
  {
    "id": "n1ijf2",
    "type": "OPCUA-IIoT-Inject",
    "injectType": "inject",
    "payload": "12345",
    "payloadType": "num",
    "topic": "TestTopicInject",
    "repeat": "",
    "crontab": "",
    "once": true,
    "startDelay": "2.3",
    "name": "TestInject",
    "addressSpaceItems": [
      {
        "name": "ServerStatus",
        "nodeId": "ns=0;i=2256",
        "datatypeName": "String"
      }
    ],
    "wires": [["n2ijf2"]]
  },
  {id:"n2ijf2", type:"helper"}
]

describe('OPC UA Inject node Testing', function () {
  before(function(done) {
    helper.startServer(function () {
      console.log('Inject start server done')
      done()
    })
  })

  afterEach(function(done) {
    helper.unload().then(function () {
      console.log('Inject unload done')
      done()
    }).catch(function (err) {
      console.log('Inject error ' + err)
      done()
    })
  })

  after(function (done) {
    helper.stopServer(function () {
      console.log('Inject stop server done')
      done()
    })
  })

  describe('Inject default node', function () {
    it('should load with basic settings', function (done) {
      helper.load([inputNode], [
          {
            "id": "f93b472c.486038",
            "type": "OPCUA-IIoT-Inject",
            "injectType": "inject",
            "payload": "123456",
            "payloadType": "num",
            "topic": "TestTopicInject",
            "repeat": "",
            "crontab": "",
            "once": false,
            "startDelay": "",
            "name": "TestName",
            "addressSpaceItems": [],
            "wires": [
              []
            ]
          }],
        function () {
          let nodeUnderTest = helper.getNode('f93b472c.486038')
          nodeUnderTest.should.have.property('name', 'TestName')
          nodeUnderTest.should.have.property('injectType', 'inject')
          nodeUnderTest.should.have.property('payload', '123456')
          nodeUnderTest.should.have.property('topic', 'TestTopicInject')
          nodeUnderTest.should.have.property('startDelay', 10)
          done()
        })
    })

    it('should send a message with payload', function(done) {
      helper.load([inputNode], testInjectFlow, function() {
        let n2 = helper.getNode("n2ijf1")
        n2.on("input", function(msg) {
          msg.should.have.property('payload', 12345)
          done()
        })
      })
    })

    it('should send a message with topic', function(done) {
      helper.load([inputNode], testInjectFlow, function() {
        let n2 = helper.getNode("n2ijf1")
        n2.on("input", function(msg) {
          msg.should.have.property('topic', 'TestTopicInject')
          done()
        })
      })
    })

    it('should load with basic settings read node', function (done) {
      helper.load([inputNode], [
          {
            "id": "f93b472c.486038",
            "type": "OPCUA-IIoT-Inject",
            "injectType": "read",
            "payload": "123456",
            "payloadType": "num",
            "topic": "TestTopicInject",
            "repeat": "",
            "crontab": "",
            "once": false,
            "startDelay": "1",
            "name": "TestName",
            "addressSpaceItems": [],
            "wires": [
              []
            ]
          }],
        function () {
          let nodeUnderTest = helper.getNode('f93b472c.486038')
          nodeUnderTest.should.have.property('name', 'TestName')
          nodeUnderTest.should.have.property('injectType', 'read')
          nodeUnderTest.should.have.property('payload', '123456')
          nodeUnderTest.should.have.property('topic', 'TestTopicInject')
          nodeUnderTest.should.have.property('startDelay', 1)
          done()
        })
    })

    it('should send a message with payload read node', function (done) {
      testInjectFlow[0].injectType = 'read'
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode("n2ijf1")
        n2.on("input", function (msg) {
          msg.should.have.property('payload', 12345)
          done()
        })
      })
    })

    it('should send a message with topic read node', function (done) {
      testInjectFlow[0].injectType = 'read'
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode("n2ijf1")
        n2.on("input", function (msg) {
          msg.should.have.property('topic', 'TestTopicInject')
          done()
        })
      })
    })

    it('should send a message with types read node', function (done) {
      testInjectFlow[0].injectType = 'read'
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode("n2ijf1")
        n2.on("input", function (msg) {
          msg.should.have.property('nodetype', 'inject')
          msg.should.have.property('injectType', 'read')
          done()
        })
      })
    })

    it('should load with basic settings listen node', function (done) {
      helper.load([inputNode], [
          {
            "id": "f93b472c.486038",
            "type": "OPCUA-IIoT-Inject",
            "injectType": "listen",
            "payload": "123456",
            "payloadType": "num",
            "topic": "TestTopicInject",
            "repeat": "",
            "crontab": "",
            "once": false,
            "startDelay": "1",
            "name": "TestName",
            "addressSpaceItems": [],
            "wires": [
              []
            ]
          }],
        function () {
          let nodeUnderTest = helper.getNode('f93b472c.486038')
          nodeUnderTest.should.have.property('name', 'TestName')
          nodeUnderTest.should.have.property('injectType', 'listen')
          nodeUnderTest.should.have.property('payload', '123456')
          nodeUnderTest.should.have.property('topic', 'TestTopicInject')
          nodeUnderTest.should.have.property('startDelay', 1)
          done()
        })
    })

    it('should send a message with payload listen node', function (done) {
      testInjectFlow[0].injectType = 'listen'
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode("n2ijf1")
        n2.on("input", function (msg) {
          msg.should.have.property('payload', 12345)
          done()
        })
      })
    })

    it('should send a message with topic listen node', function (done) {
      testInjectFlow[0].injectType = 'listen'
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode("n2ijf1")
        n2.on("input", function (msg) {
          msg.should.have.property('topic', 'TestTopicInject')
          done()
        })
      })
    })

    it('should send a message with types listen node', function (done) {
      testInjectFlow[0].injectType = 'listen'
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode("n2ijf1")
        n2.on("input", function (msg) {
          msg.should.have.property('nodetype', 'inject')
          msg.should.have.property('injectType', 'listen')
          done()
        })
      })
    })

    it('should load with basic settings write node', function (done) {
      helper.load([inputNode], [
          {
            "id": "f93b472c.486038",
            "type": "OPCUA-IIoT-Inject",
            "injectType": "write",
            "payload": "123456",
            "payloadType": "num",
            "topic": "TestTopicInject",
            "repeat": "",
            "crontab": "",
            "once": false,
            "startDelay": "1",
            "name": "TestName",
            "addressSpaceItems": [],
            "wires": [
              []
            ]
          }],
        function () {
          let nodeUnderTest = helper.getNode('f93b472c.486038')
          nodeUnderTest.should.have.property('name', 'TestName')
          nodeUnderTest.should.have.property('injectType', 'write')
          nodeUnderTest.should.have.property('payload', '123456')
          nodeUnderTest.should.have.property('topic', 'TestTopicInject')
          nodeUnderTest.should.have.property('startDelay', 1)
          done()
        })
    })

    it('should send a message with payload write node', function (done) {
      testInjectFlow[0].injectType = 'write'
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode("n2ijf1")
        n2.on("input", function (msg) {
          msg.should.have.property('payload', 12345)
          done()
        })
      })
    })

    it('should send a message with topic write node', function (done) {
      testInjectFlow[0].injectType = 'write'
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode("n2ijf1")
        n2.on("input", function (msg) {
          msg.should.have.property('topic', 'TestTopicInject')
          done()
        })
      })
    })

    it('should send a message with types write node', function (done) {
      testInjectFlow[0].injectType = 'write'
      helper.load([inputNode], testInjectFlow, function () {
        let n2 = helper.getNode("n2ijf1")
        n2.on("input", function (msg) {
          msg.should.have.property('nodetype', 'inject')
          msg.should.have.property('injectType', 'write')
          done()
        })
      })
    })

    it('should send a message with types and delay write node', function (done) {

      helper.load([inputNode], testInjectWithDelayFlow, function () {
        let n2 = helper.getNode("n2ijf2")
        n2.on("input", function (msg) {
          msg.should.have.property('nodetype', 'inject')
          msg.should.have.property('injectType', 'inject')
          done()
        })
      })
    })
  })
})
