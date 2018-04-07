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
var inputNode = require('../src/opcua-iiot-event')
var helper = require('node-red-contrib-test-helper')

var testEventNodeFlow = [
  {
    "id": "n1evf1",
    "type": "inject",
    "topic": "TestTopic",
    "payload": "{\"queueSize\":10, \"interval\":1000}",
    "payloadType": "json",
    "repeat": "",
    "crontab": "",
    "once": true,
    "wires": [["n2evf1", "n3evf1"]]
  },
  {id:"n2evf1", type:"helper"},
  {
    "id":"n3evf1",
    "type":"OPCUA-IIoT-Event",
    "eventType":"i=2041",
    "eventTypeLabel":"BaseTypeEvent",
    "queueSize":1,
    "usingListener":true,
    "name":"TestName",
    "showStatusActivities":false,
    "showErrors":false,
    "wires":[["n4evf1"]]
  },
  {id:"n4evf1", type:"helper"}
]

describe('OPC UA Event node Testing', function () {
  before(function(done) {
    helper.startServer(function () {
      console.log('Event start server done')
      done()
    })
  })

  afterEach(function(done) {
    helper.unload().then(function () {
      console.log('Event unload done')
      done()
    }).catch(function (err) {
      console.log('Event error ' + err)
      done()
    })
  })

  after(function (done) {
    helper.stopServer(function () {
      console.log('Event stop server done')
      done()
    })
  })


  describe('Event node', function () {
    it('should load with basic settings', function (done) {
      helper.load(
        [inputNode],
        [{
            "id": "67c521a2.07429",
            "type": "OPCUA-IIoT-Event",
            "eventType": "i=2041",
            "eventTypeLabel": "BaseTypeEvent",
            "queueSize": 1,
            "usingListener": true,
            "name": "TestName",
            "showStatusActivities": false,
            "showErrors": false,
            "wires": [[]]
          }
        ],
        function () {
          let nodeUnderTest = helper.getNode('67c521a2.07429')
          nodeUnderTest.should.have.property('name', 'TestName')
          nodeUnderTest.should.have.property('eventTypeLabel', 'BaseTypeEvent')
          nodeUnderTest.should.have.property('eventType', 'i=2041')
          nodeUnderTest.should.have.property('usingListener', true)
          nodeUnderTest.should.have.property('queueSize', 1)
          done()
        })
    })

    it('should get a message with payload', function(done) {
      helper.load([injectNode, inputNode], testEventNodeFlow, function() {
        let n2 = helper.getNode("n2evf1")
        n2.on("input", function(msg) {
          msg.should.have.property('payload', {"queueSize":10,"interval":1000})
          done()
        })
      })
    })

    it('should verify a message for event parameters', function(done) {
      helper.load([injectNode, inputNode], testEventNodeFlow, function() {
        let n4 = helper.getNode("n4evf1")
        n4.on("input", function(msg) {
          assert.match(JSON.stringify(msg.payload), /eventType/)
          assert.match(JSON.stringify(msg.payload), /eventFilter/)
          assert.match(JSON.stringify(msg.payload), /eventFields/)
          msg.payload.should.have.property('queueSize', 10)
          msg.payload.should.have.property('interval', 1000)
          /* payload: { eventType: 'i=2041',
            eventFilter: EventFilter { selectClauses: [Array], whereClause: [ContentFilter] }, eventFields: [ 'EventId', 'SourceName', 'Message', 'ReceiveTime' ],
            queueSize: 10,
            interval: 1000 }) */
          done()
        })
      })
    })
  })
})
