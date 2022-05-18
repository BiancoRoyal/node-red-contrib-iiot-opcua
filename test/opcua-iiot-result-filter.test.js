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

process.env.TEST = "true"

jest.setTimeout(10000)

var injectNode = require('@node-red/nodes/core/common/20-inject')
var functionNode = require('@node-red/nodes/core/function/10-function')
var inputNode = require('../src/opcua-iiot-result-filter')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var readTestFlowPayload = [
  {
    id: 'n1rff1',
    type: 'inject',
    name: 'TestName',
    topic: 'TestTopic',
    payload: {"node":"ns=1;s=TemperatureAnalogItem","nodeId":"ns=1;s=TemperatureAnalogItem","nodeClass":2,"browseName":{"namespaceIndex":0,"name":"TemperatureAnalogItem"},"displayName":{"text":"TemperatureAnalogItem"},"description":{},"writeMask":0,"userWriteMask":0,"value":16.041979,"dataType":"Double","valueRank":-1,"arrayDimensions":{},"accessLevel":3,"userAccessLevel":3,"minimumSamplingInterval":0,"historizing":false,"statusCode":{"value":0,"description":"No Error","name":"Good"}},
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
    'func': "msg.payload.nodetype = 'listen'\nmsg.payload.injectType = 'subscribe'\nmsg.payload.addressSpaceItems = [{\"name\":\"\",\"nodeId\":\"ns=1;s=Pressure\",\"datatypeName\":\"\"}]\nreturn msg;",
    'outputs': 1,
    'noerr': 0,
    'wires': [['n4rff2', 'n5rff2']]
  },
  {id: 'n4rff2', type: 'helper'},
  {id: 'n5rff2',
    'type': 'OPCUA-IIoT-Result-Filter',
    'nodeId': 'ns=1;s=Pressure',
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

var listenTestFlowWithPrecisionPayload = [
  {
    'id': 'n1rff3',
    'type': 'inject',
    'name': '',
    'topic': 'TestTopic',
    'payload': '{"nodetype": "read", "value":{"dataType":"Double","arrayType":"Scalar","value":16.041979},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourceTimestamp":"2018-03-13T21:43:10.470Z","sourcePicoseconds":0,"serverTimestamp":"2018-03-13T21:43:11.051Z","serverPicoseconds":3}',
    'payloadType': 'json',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 0.1,
    'wires': [['n2rff3', 'n3rff3']]
  },
  {id: 'n2rff3', type: 'helper'},
  {
    'id': 'n3rff3',
    'type': 'function',
    'name': '',
    'func': "msg.nodetype = 'listen'\nmsg.injectType = 'subscribe'\nmsg.addressSpaceItems = [{\"name\":\"\",\"nodeId\":\"ns=1;s=Pressure\",\"datatypeName\":\"\"}]\nreturn msg;",
    'outputs': 1,
    'noerr': 0,
    'wires': [['n4rff3', 'n5rff3']]
  },
  {id: 'n4rff3', type: 'helper'},
  {id: 'n5rff3',
    'type': 'OPCUA-IIoT-Result-Filter',
    'nodeId': 'ns=1;s=Pressure',
    'datatype': 'Double',
    'fixedValue': false,
    'fixPoint': 2,
    'withPrecision': true,
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
    'wires': [['n6rff3']]
  },
  {id: 'n6rff3', type: 'helper'}
]

var writeTestFlowPayload = [
  {
    id: 'n1rff4',
    type: 'inject',
    name: 'TestName',
    topic: 'TestTopic',
    payload: '{"statusCodes":[{"value":0,"description":"Good","name":"Good"}],"nodesToWrite":[{"nodeId":"ns=1;s=TestReadWrite","attributeId":13,"indexRange":null,"value":{"value":{"dataType":"Double","value":22980.7896,"arrayType":"Scalar"}}}],"msg":{"_msgid":"11cc64dd.bde67b","topic":"","nodetype":"inject","injectType":"write","addressSpaceItems":[{"name":"TestReadWrite","nodeId":"ns=1;s=TestReadWrite","datatypeName":"Double"}],"payload":1539981968143,"valuesToWrite":[22980.7896]}}',
    payloadType: 'json',
    repeat: '',
    crontab: '',
    once: true,
    onceDelay: 0.1,
    wires: [['n2rff4', 'n3rff4']]
  },
  {id: 'n2rff4', type: 'helper'},
  {
    id: 'n3rff4',
    type: 'function',
    name: '',
    func: "msg.payload.nodetype = 'write'\nmsg.payload.injectType = 'write'\nmsg.payload.addressSpaceItems = [{name:'',nodeId:'ns=1;s=TestReadWrite',datatypeName:''}]\nreturn msg;",
    outputs: 1,
    noerr: 0,
    wires: [['n4rff4', 'n5rff4']]
  },
  {id: 'n4rff4', type: 'helper'},
  {id: 'n5rff4',
    'type': 'OPCUA-IIoT-Result-Filter',
    'nodeId': 'ns=1;s=TestReadWrite',
    'datatype': 'Double',
    'fixedValue': false,
    'fixPoint': 2,
    'withPrecision': false,
    'precision': 2,
    'entry': 1,
    'justValue': false,
    'withValueCheck': false,
    'minvalue': '',
    'maxvalue': '',
    'defaultvalue': '',
    'topic': '',
    'name': 'AnalogItem',
    'showErrors': false,
    'wires': [['n6rff4']]
  },
  {id: 'n6rff4', type: 'helper'}
]

var writeTestValueCheckFlowPayload = [
  {
    id: 'n1rff5',
    type: 'inject',
    name: 'TestName',
    topic: 'TestTopic',
    payload: '{}',
    payloadType: 'json',
    repeat: '',
    crontab: '',
    once: true,
    onceDelay: 0.2,
    wires: [['n2rff5', 'n3rff5']]
  },
  {id: 'n2rff5', type: 'helper'},
  {
    id: 'n3rff5',
    type: 'function',
    name: '',
    func: 'msg = {"topic":"TestTopic","payload":{"nodetype":"read","injectType":"read","addressSpaceItems":[],"node":"ns=1;s=Pressure","nodeId":"ns=1;s=Pressure","nodeClass":2,"browseName":{"namespaceIndex":1,"name":"Pressure"},"displayName":{"text":"Pressure"},"description":{},"writeMask":0,"userWriteMask":0,"value":0.37883857546881394,"dataType":"ns=0;i=11","valueRank":-1,"arrayDimensions":{},"accessLevel":3,"userAccessLevel":3,"minimumSamplingInterval":0,"historizing":false,"statusCode":{"value":0,"description":"No Error","name":"Good"}},"justValue":true,"nodesToRead":["ns=1;s=Pressure"],"nodesToReadCount":1,"addressItemsToRead":[{"nodeId":"ns=1;s=Pressure","browseName":"1:Pressure","displayName":"locale=null text=Pressure","nodeClass":"Variable","datatypeName":"ns=0;i=63"}],"addressItemsToReadCount":1,"addressItemsToBrowse":[{"nodeId":"ns=1;s=Pressure","browseName":"1:Pressure","displayName":"locale=null text=Pressure","nodeClass":"Variable","datatypeName":"ns=0;i=63"}],"addressItemsToBrowseCount":1,"nodeId":"ns=1;s=Pressure","filter":true,"filtertype":"filter","_event":"node:37af887d.3001c8","readtype":"AllAttributes","attributeId":0};\nreturn msg;',
    outputs: 1,
    noerr: 0,
    wires: [['n4rff5', 'n5rff5']]
  },
  {id: 'n4rff5', type: 'helper'},
  {
    id: 'n5rff5',
    'type': 'OPCUA-IIoT-Result-Filter',
    'nodeId': 'ns=1;s=Pressure',
    'datatype': 'Double',
    'fixedValue': false,
    'fixPoint': 2,
    'withPrecision': false,
    'precision': 2,
    'entry': 1,
    'justValue': false,
    'withValueCheck': true,
    'minvalue': 0.30,
    'maxvalue': 0.60,
    'defaultvalue': 0.30,
    'topic': '',
    'name': 'AnalogItem',
    'showErrors': false,
    'wires': [['n6rff5']]
  },
  {id: 'n6rff5', type: 'helper'}
]

describe('OPC UA Result Filter node Testing', function () {
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

  describe('Result Filter node Unit Testing', function () {
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
          expect(nodeUnderTest.name).toBe('AnalogItem')
          expect(nodeUnderTest.nodeId).toBe('ns=1;s=TemperatureAnalogItem')
          expect(nodeUnderTest.datatype).toBe('Double')
          expect(nodeUnderTest.fixedValue).toBe(true)
          expect(nodeUnderTest.fixPoint).toBe(2)
          expect(nodeUnderTest.withPrecision).toBe(false)
          expect(nodeUnderTest.precision).toBe(2)
          expect(nodeUnderTest.entry).toBe(1)
          expect(nodeUnderTest.topic).toBe('TestTopic')
          done()
        })
    })
  })

    it('should have nodeId, payload and topic as result', function (done) {
      helper.load([injectNode, functionNode, inputNode], readTestFlowPayload, function () {
        let n6 = helper.getNode('n6rff1')
        let n5 = helper.getNode('n5rff1')
        n6.on('input', function (msg) {
          expect(msg.payload.nodeId).toBe('ns=1;s=TemperatureAnalogItem')
          expect(msg.payload.value).toBe(16.04)
          expect(msg.topic).toBe('TestTopic')
          done()
        })
        n5.receive({
          topic: "TestTopic",
          payload: {
            "node": "ns=1;s=TemperatureAnalogItem",
            "nodeId": "ns=1;s=TemperatureAnalogItem",
            "nodetype": "read",
            "nodeClass": 2,
            "browseName": {"namespaceIndex": 0, "name": "TemperatureAnalogItem"},
            "displayName": {"text": "TemperatureAnalogItem"},
            "description": {},
            "writeMask": 0,
            "userWriteMask": 0,
            "value": 16.041979,
            "dataType": "Double",
            "valueRank": -1,
            "arrayDimensions": {},
            "accessLevel": 3,
            "userAccessLevel": 3,
            "minimumSamplingInterval": 0,
            "historizing": false,
            "statusCode": {"value": 0, "description": "No Error", "name": "Good"}
          }
        })
      })
    })

  describe('Result Filter node after listener', function () {
    it('should get a message with payload', function (done) {
      helper.load([injectNode, functionNode, inputNode], listenTestFlowPayload, function () {
        let n2 = helper.getNode('n2rff2')
        n2.on('input', function (msg) {
          expect(msg.payload).toMatchObject({'value': {'dataType': 'Double', 'arrayType': 'Scalar', 'value': 16.041979}, 'statusCode': {'value': 0, 'description': 'No Error', 'name': 'Good'}, 'sourceTimestamp': '2018-03-13T21:43:10.470Z', 'sourcePicoseconds': 0, 'serverTimestamp': '2018-03-13T21:43:11.051Z', 'serverPicoseconds': 3})
          done()
        })
      })
    })

    it('should get a message with payload Pressure', function (done) {
      helper.load([injectNode, functionNode, inputNode], listenTestFlowPayload, function () {
        let n2 = helper.getNode('n2rff2')
        n2.on('input', function (msg) {
          expect(msg.payload.value.value).toBe(16.041979)
          done()
        })
      })
    })

    it('should contain Pressure in message', function (done) {
      helper.load([injectNode, functionNode, inputNode], listenTestFlowPayload, function () {
        let n4 = helper.getNode('n4rff2')
        n4.on('input', function (msg) {
          expect(msg.payload.addressSpaceItems[0].nodeId).toMatch(/Pressure/)
          done()
        })
      })
    })

    it('should have nodeId, payload and topic as result with fixed of two', function (done) {
      helper.load([injectNode, functionNode, inputNode], listenTestFlowPayload, function () {
        let n6 = helper.getNode('n6rff2')
        let n5 = helper.getNode('n5rff2')
        n6.on('input', function (msg) {
          expect(msg.payload.nodeId).toBe('ns=1;s=Pressure')
          expect(msg.payload.value).toBe(16.04)
          expect(msg.topic).toBe('TestTopic')
          done()
        })
      })
    })

    it('should have nodeId, payload and topic with precision of two as result', function (done) {
      helper.load([injectNode, functionNode, inputNode], listenTestFlowWithPrecisionPayload, function () {
        let n6 = helper.getNode('n6rff3')
        n6.on('input', function (msg) {
          expect(msg.payload.nodeId).toBe('ns=1;s=Pressure')
          let expectedResult = Number.parseFloat('16.041979').toPrecision(2)
          expectedResult = parseFloat(expectedResult)
          expect(msg.payload.value).toBe(expectedResult)
          expect(msg.topic).toBe('TestTopic')
          done()
        })
      })
    })
  })

  describe('Result Filter node after write', function () {
    it('should get a message with payload', function (done) {
      helper.load([injectNode, functionNode, inputNode], writeTestFlowPayload, function () {
        let n2 = helper.getNode('n2rff4')
        n2.on('input', function (msg) {
          expect(msg.payload).toMatchObject({
            statusCodes: [ { value: 0, description: 'Good', name: 'Good' } ],
            nodesToWrite: [
              {
                nodeId: 'ns=1;s=TestReadWrite',
                attributeId: 13,
                indexRange: null,
                value: {
                  value: { dataType: 'Double', value: 22980.7896, arrayType: 'Scalar' }
                }
              }
            ],
            msg: {
              _msgid: '11cc64dd.bde67b',
              topic: '',
              nodetype: 'inject',
              injectType: 'write',
              addressSpaceItems: [ {
                name: 'TestReadWrite',
                nodeId: 'ns=1;s=TestReadWrite',
                datatypeName: 'Double'
              } ],
              payload: 1539981968143,
              valuesToWrite: [ 22980.7896 ]
            }
          })
          done()
        })
      })
    })

    it('should get a message with payload TestReadWrite', function (done) {
      helper.load([injectNode, functionNode, inputNode], writeTestFlowPayload, function () {
        let n2 = helper.getNode('n2rff4')
        n2.on('input', function (msg) {
          expect(msg.payload.nodesToWrite[0].nodeId).toMatch(/TestReadWrite/)
          done()
        })
      })
    })

    it('should contain TestReadWrite in message', function (done) {
      helper.load([injectNode, functionNode, inputNode], writeTestFlowPayload, function () {
        let n4 = helper.getNode('n4rff4')
        n4.on('input', function (msg) {
          expect(msg.payload.msg.addressSpaceItems[0].nodeId).toMatch(/TestReadWrite/)
          done()
        })
      })
    })

    it('should have nodeId, payload and topic as result', function (done) {
      helper.load([injectNode, functionNode, inputNode], writeTestFlowPayload, function () {
        let n6 = helper.getNode('n6rff4')
        let n1 = helper.getNode('n1rff4')
        n6.on('input', function (msg) {
          console.log(msg)
          expect(msg.payload.nodeId).toBe('ns=1;s=TestReadWrite')
          console.log('good morrow 494')
          expect(msg.payload.value).toBe(22980.7896)
          console.log('good morrow 496')
          expect(msg.topic).toBe('TestTopic')
          console.log('good morrow 498')
          done()
        })
        n1.receive({
          _msgid: '11cc64dd.bde67b',
          topic: 'TestTopic',
        })
        // n5.receive({
        //   payload: {
        //     "node": "ns=1;s=TemperatureAnalogItem",
        //     "nodeId": 'ns=1;s=TestReadWrite',
        //     "value": 22980.7896,
        //     "nodetype": "read",
        //     "nodeClass": 2,
        //     "browseName": {"namespaceIndex": 0, "name": "TemperatureAnalogItem"},
        //     "displayName": {"text": "TemperatureAnalogItem"},
        //     "description": {},
        //     "writeMask": 0,
        //     "userWriteMask": 0,
        //     "dataType": "Double",
        //     "valueRank": -1,
        //     "arrayDimensions": {},
        //     "accessLevel": 3,
        //     "userAccessLevel": 3,
        //     "minimumSamplingInterval": 0,
        //     "historizing": false,
        //     "statusCode": {"value": 0, "description": "No Error", "name": "Good"}
        //   },
        //   topic: 'TestTopic'
        // })
      })
    })

    it('should have nodeId, payload and topic as result with value check', function (done) {
      helper.load([injectNode, functionNode, inputNode], writeTestValueCheckFlowPayload, function () {
        let n6 = helper.getNode('n6rff5')
        n6.on('input', function (msg) {
          expect(msg.payload.nodeId).toBe('ns=1;s=Pressure')
          expect(msg.payload.value).toBe(0.37883857546881394)
          expect(msg.topic).toBe('TestTopic')
          expect(msg.payload.filter).toBe(true)
          expect(msg.payload.justValue).toBe(false)
          expect(msg.payload.filtertype).toBe('filter')
          done()
        })
      })
    })

    it('should have nodeId, payload and topic as result with value check on just value', function (done) {
      writeTestValueCheckFlowPayload[4].justValue = true
      helper.load([injectNode, functionNode, inputNode], writeTestValueCheckFlowPayload, function () {
        let n6 = helper.getNode('n6rff5')
        n6.on('input', function (msg) {
          expect(msg.payload.nodeId).toBe('ns=1;s=Pressure')
          expect(msg.payload.value).toBe(0.37883857546881394)
          expect(msg.topic).toBe('TestTopic')
          expect(msg.payload.filter).toBe(true)
          expect(msg.payload.justValue).toBe(true)
          expect(msg.payload.filtertype).toBe('filter')

          writeTestValueCheckFlowPayload[4].justValue = false
          done()
        })
      })
    })

    it('should have nodeId, payload and topic as result with value check on just value with precision two', function (done) {
      writeTestValueCheckFlowPayload[4].justValue = true
      writeTestValueCheckFlowPayload[4].withPrecision = true
      helper.load([injectNode, functionNode, inputNode], writeTestValueCheckFlowPayload, function () {
        let n6 = helper.getNode('n6rff5')
        n6.on('input', function (msg) {
          expect(msg.payload.nodeId).toBe('ns=1;s=Pressure')
          expect(msg.payload.value).toBe(0.38)
          expect(msg.topic).toBe('TestTopic')
          expect(msg.payload.filter).toBe(true)
          expect(msg.payload.justValue).toBe(true)
          expect(msg.payload.filtertype).toBe('filter')

          writeTestValueCheckFlowPayload[4].justValue = false
          writeTestValueCheckFlowPayload[4].withPrecision = false
          done()
        })
      })
    })

    it('should return null on null input to convertResultValue', function (done) {
      helper.load([injectNode, functionNode, inputNode], writeTestValueCheckFlowPayload, function () {
        let n5 = helper.getNode('n5rff5')
        expect(n5.functions.convertResultValue({ value: null })).toBe(null)
        done()
      })
    })

    it('should return given object on missing datatype input to convertResultValue', function (done) {
      writeTestValueCheckFlowPayload[4].datatype = "String"
      helper.load([injectNode, functionNode, inputNode], writeTestValueCheckFlowPayload, function () {
        let n5 = helper.getNode('n5rff5')
        expect(n5.functions.convertResultValue({ value: 'Test' })).toBe('Test')
        writeTestValueCheckFlowPayload[4].datatype = "Double"
        done()
      })
    })

    it('should return null on null with datatype input to convertResultValue', function (done) {
      helper.load([injectNode, functionNode, inputNode], writeTestValueCheckFlowPayload, function () {
        let n5 = helper.getNode('n5rff5')
        expect(n5.functions.convertResultValue({ payload: { value: null, datatype: 'Double' } })).toBeFalsy()
        done()
      })
    })

    it('should return min value with datatype input to convertResultValue', function (done) {
      helper.load([injectNode, functionNode, inputNode], writeTestValueCheckFlowPayload, function () {
        let n5 = helper.getNode('n5rff5')
        expect(n5.functions.convertResultValue({value: {value: 0.6778, datatype: 'Double'}})).toBe(0.30)
        done()
      })
    })

    it('should return value in range with datatype input to convertResultValue', function (done) {
      helper.load([injectNode, functionNode, inputNode], writeTestValueCheckFlowPayload, function () {
        let n5 = helper.getNode('n5rff5')
        expect(n5.functions.convertResultValue({ value: 0.4778, datatype: 'Double' })).toBe(0.4778)
        done()
      })
    })
  })
})
