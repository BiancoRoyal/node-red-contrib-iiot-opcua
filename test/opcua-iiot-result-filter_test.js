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
var inputNode = require('../src/opcua-iiot-result-filter')
var helper = require('node-red-contrib-test-helper')

var readTestFlowPayload = [
  {
    id: 'n1rff1',
    type: 'inject',
    name: 'TestName',
    topic: 'TestTopic',
    payload: '[{"node":"ns=1;s=TemperatureAnalogItem","nodeId":"ns=1;s=TemperatureAnalogItem","nodeClass":2,"browseName":{"namespaceIndex":0,"name":"TemperatureAnalogItem"},"displayName":{"text":"TemperatureAnalogItem"},"description":{},"writeMask":0,"userWriteMask":0,"value":16.041979,"dataType":"Double","valueRank":-1,"arrayDimensions":{},"accessLevel":3,"userAccessLevel":3,"minimumSamplingInterval":0,"historizing":false,"statusCode":{"value":0,"description":"No Error","name":"Good"}}]',
    payloadType: 'json',
    repeat: '',
    crontab: '',
    once: true,
    onceDelay: 0.1,
    wires: [['n2rff1', 'n3rff1']]
  },
  {id: 'n2rff1', type: 'helper'},
  {
    id: 'n3rff1',
    type: 'function',
    name: '',
    func: "msg.nodetype = 'read'\nmsg.injectType = 'read'\nmsg.addressSpaceItems = [{name:'',nodeId:'ns=1;s=TemperatureAnalogItem',datatypeName:''}]\nreturn msg;",
    outputs: 1,
    noerr: 0,
    wires: [['n4rff1', 'n5rff1']]
  },
  {id: 'n4rff1', type: 'helper'},
  {id: 'n5rff1',
    'type': 'OPCUA-IIoT-Result-Filter',
    'nodeId': 'ns=1;s=TemperatureAnalogItem',
    'datatype': 'Double',
    'fixedValue': true,
    'fixPoint': 2,
    'withPrecision': false,
    'precision': 2,
    'entry': 1,
    'justValue': true,
    'withValueCheck': false,
    'minvalue': '',
    'maxvalue': '',
    'defaultvalue': '',
    'topic': '',
    'name': 'AnalogItem',
    'showErrors': true,
    'wires': [['n6rff1']]
  },
  {id: 'n6rff1', type: 'helper'}
]

var listenTestFlowPayload = [
  {
    'id': 'n1rff2',
    'type': 'inject',
    'name': '',
    'topic': 'TestTopic',
    'payload': '{"value":{"dataType":"Double","arrayType":"Scalar","value":16.041979},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourceTimestamp":"2018-03-13T21:43:10.470Z","sourcePicoseconds":0,"serverTimestamp":"2018-03-13T21:43:11.051Z","serverPicoseconds":3}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 0.1,
    'wires': [['n2rff2', 'n3rff2']]
  },
  {id: 'n2rff2', type: 'helper'},
  {
    'id': 'n3rff2',
    'type': 'function',
    'name': '',
    'func': "msg.nodetype = 'listen'\nmsg.injectType = 'subscribe'\nmsg.addressSpaceItems = [{\"name\":\"\",\"nodeId\":\"ns=4;s=Pressure\",\"datatypeName\":\"\"}]\nreturn msg;",
    'outputs': 1,
    'noerr': 0,
    'wires': [['n4rff2', 'n5rff2']]
  },
  {id: 'n4rff2', type: 'helper'},
  {id: 'n5rff2',
    'type': 'OPCUA-IIoT-Result-Filter',
    'nodeId': 'ns=4;s=Pressure',
    'datatype': 'Double',
    'fixedValue': true,
    'fixPoint': 2,
    'withPrecision': false,
    'precision': 2,
    'entry': 1,
    'justValue': true,
    'withValueCheck': false,
    'minvalue': '',
    'maxvalue': '',
    'defaultvalue': '',
    'topic': '',
    'name': 'AnalogItem',
    'showErrors': true,
    'wires': [['n6rff2']]
  },
  {id: 'n6rff2', type: 'helper'}
]

describe('OPC UA Result Filter node Testing', function () {
  before(function (done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function (done) {
    helper.unload().then(function () {
      done()
    }).catch(function (err) {
      console.log('Result Filter error ' + err)
      done()
    })
  })

  after(function (done) {
    helper.stopServer(function () {
      done()
    })
  })

  describe('Result Filter node', function () {
    it('node should be loaded', function (done) {
      helper.load(
        [inputNode],
        [
          {
            'id': '21c01ed7.c1c372',
            'type': 'OPCUA-IIoT-Result-Filter',
            'nodeId': 'ns=1;s=TemperatureAnalogItem',
            'datatype': 'Double',
            'fixedValue': true,
            'fixPoint': 2,
            'withPrecision': false,
            'precision': 2,
            'entry': 1,
            'justValue': true,
            'withValueCheck': false,
            'minvalue': '',
            'maxvalue': '',
            'defaultvalue': '',
            'topic': 'TestTopic',
            'name': 'AnalogItem',
            'showErrors': false,
            'wires': [[]]
          }
        ],
        function () {
          let nodeUnderTest = helper.getNode('21c01ed7.c1c372')
          nodeUnderTest.should.have.property('name', 'AnalogItem')
          nodeUnderTest.should.have.property('nodeId', 'ns=1;s=TemperatureAnalogItem')
          nodeUnderTest.should.have.property('datatype', 'Double')
          nodeUnderTest.should.have.property('fixedValue', true)
          nodeUnderTest.should.have.property('fixPoint', 2)
          nodeUnderTest.should.have.property('withPrecision', false)
          nodeUnderTest.should.have.property('precision', 2)
          nodeUnderTest.should.have.property('entry', 1)
          nodeUnderTest.should.have.property('topic', 'TestTopic')
          done()
        })
    })
  })

  describe('Result Filter node after read', function () {
    it('should get a message with payload', function (done) {
      helper.load([injectNode, functionNode, inputNode], readTestFlowPayload, function () {
        let n2 = helper.getNode('n2rff1')
        n2.on('input', function (msg) {
          msg.should.have.property('payload', [{'node': 'ns=1;s=TemperatureAnalogItem', 'nodeId': 'ns=1;s=TemperatureAnalogItem', 'nodeClass': 2, 'browseName': {'namespaceIndex': 0, 'name': 'TemperatureAnalogItem'}, 'displayName': {'text': 'TemperatureAnalogItem'}, 'description': {}, 'writeMask': 0, 'userWriteMask': 0, 'value': 16.041979, 'dataType': 'Double', 'valueRank': -1, 'arrayDimensions': {}, 'accessLevel': 3, 'userAccessLevel': 3, 'minimumSamplingInterval': 0, 'historizing': false, 'statusCode': {'value': 0, 'description': 'No Error', 'name': 'Good'}}])
          done()
        })
      })
    })

    it('should get a message with payload TemperatureAnalogItem', function (done) {
      helper.load([injectNode, functionNode, inputNode], readTestFlowPayload, function () {
        let n2 = helper.getNode('n2rff1')
        n2.on('input', function (msg) {
          assert.match(msg.payload[0].nodeId, /TemperatureAnalogItem/)
          done()
        })
      })
    })

    it('should contain addressSpaceItems in message', function (done) {
      helper.load([injectNode, functionNode, inputNode], readTestFlowPayload, function () {
        let n4 = helper.getNode('n4rff1')
        n4.on('input', function (msg) {
          assert.match(msg.addressSpaceItems[0].nodeId, /TemperatureAnalogItem/)
          done()
        })
      })
    })

    it('should have nodeId, payload and topic as result', function (done) {
      helper.load([injectNode, functionNode, inputNode], readTestFlowPayload, function () {
        let n6 = helper.getNode('n6rff1')
        n6.on('input', function (msg) {
          msg.should.have.property('nodeId', 'ns=1;s=TemperatureAnalogItem')
          msg.should.have.property('payload', 16.04)
          msg.should.have.property('topic', 'TestTopic')
          done()
        })
      })
    })
  })

  describe('Result Filter node after listener', function () {
    it('should get a message with payload', function (done) {
      helper.load([injectNode, functionNode, inputNode], listenTestFlowPayload, function () {
        let n2 = helper.getNode('n2rff2')
        n2.on('input', function (msg) {
          msg.should.have.property('payload', {'value': {'dataType': 'Double', 'arrayType': 'Scalar', 'value': 16.041979}, 'statusCode': {'value': 0, 'description': 'No Error', 'name': 'Good'}, 'sourceTimestamp': '2018-03-13T21:43:10.470Z', 'sourcePicoseconds': 0, 'serverTimestamp': '2018-03-13T21:43:11.051Z', 'serverPicoseconds': 3})
          done()
        })
      })
    })

    it('should get a message with payload Pressure', function (done) {
      helper.load([injectNode, functionNode, inputNode], listenTestFlowPayload, function () {
        let n2 = helper.getNode('n2rff2')
        n2.on('input', function (msg) {
          msg.payload.value.should.have.property('value', 16.041979)
          done()
        })
      })
    })

    it('should contain addressSpaceItems in message', function (done) {
      helper.load([injectNode, functionNode, inputNode], listenTestFlowPayload, function () {
        let n4 = helper.getNode('n4rff2')
        n4.on('input', function (msg) {
          assert.match(msg.addressSpaceItems[0].nodeId, /Pressure/)
          done()
        })
      })
    })

    it('should have nodeId, payload and topic as result', function (done) {
      helper.load([injectNode, functionNode, inputNode], listenTestFlowPayload, function () {
        let n6 = helper.getNode('n6rff2')
        n6.on('input', function (msg) {
          msg.should.have.property('nodeId', 'ns=4;s=Pressure')
          msg.should.have.property('payload', 16.04)
          msg.should.have.property('topic', 'TestTopic')
          done()
        })
      })
    })
  })
})
