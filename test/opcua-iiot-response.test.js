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

jest.setTimeout(5000)

var injectNode = require('@node-red/nodes/core/common/20-inject')
var functionNode = require('@node-red/nodes/core/function/10-function')
var responseNode = require('../src/opcua-iiot-response')

var responseFlowNodes = [injectNode, functionNode, responseNode]

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testResponseFlow = [
  {
    'id': '76202549.fd7c1c',
    'type': 'OPCUA-IIoT-Response',
    'name': 'TestName',
    'compressStructure': false,
    'showStatusActivities': false,
    'showErrors': false,
    'activateUnsetFilter': true,
    'activateFilters': true,
    'filters': [
      {
        'name': 'dataType',
        'value': 'DateTime'
      }
    ],
    'wires': [
      [
        'n1rh'
      ]
    ]
  },
  {id: 'n1rh', type: 'helper'},
  {
    'id': '9ed1998a.92f74',
    'type': 'inject',
    'name': '',
    'topic': '',
    'payload': '',
    'payloadType': 'date',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 2.4,
    'wires': [
      [
        '806c7bdc.b926e'
      ]
    ]
  },
  {
    'id': '806c7bdc.b926e',
    'type': 'function',
    'name': '',
    'func': 'msg = {"_msgid":"98a1d195.a8a9","topic":"","nodetype":"read","injectType":"listen","addressSpaceItems":[],"payload":[{"value":{"dataType":"Double","arrayType":"Scalar","value":0.523478532226411},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Double","arrayType":"Matrix","value":{"0":1,"1":2,"2":3,"3":4,"4":5,"5":6,"6":7,"7":8,"8":9},"dimensions":[[3,3],[3,3]]},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Double","arrayType":"Array","value":{"0":1,"1":2,"2":3,"3":4}},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Double","arrayType":"Scalar","value":263.6659132826572},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"DateTime","arrayType":"Scalar","value":"2016-10-13T08:40:00.000Z"},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"LocalizedText","arrayType":"Array","value":[{"text":"multilingual text","locale":"en"},{"text":"mehrsprachiger Text","locale":"de"},{"text":"texte multilingue","locale":"fr"}]},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Double","arrayType":"Scalar","value":966.3275887250591},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Double","arrayType":"Scalar","value":19.861320655817437},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Double","arrayType":"Scalar","value":31},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Double","arrayType":"Scalar","value":10},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Double","arrayType":"Scalar","value":1000},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Double","arrayType":"Scalar","value":0.9765148162841797},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"UInt16","arrayType":"Scalar","value":3},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Int32","arrayType":"Scalar","value":3},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"statusCode":{"value":2150957056,"description":"The attribute is not supported for the specified Node.","name":"BadAttributeIdInvalid"},"sourcePicoseconds":0,"serverPicoseconds":0}],"nodesToRead":["ns=1;s=Pressure","ns=1;s=Matrix","ns=1;s=Position","ns=1;s=PumpSpeed","ns=1;s=SomeDate","ns=1;s=MultiLanguageText","ns=1;s=FanSpeed","ns=1;s=TemperatureAnalogItem","ns=1;i=16479","ns=1;b=1020ffaa","ns=1;s=TestReadWrite","ns=1;s=free_memory","ns=1;s=Counter","ns=1;s=FullCounter","ns=1;i=12345"],"nodesToReadCount":15,"addressItemsToRead":[{"name":"Pressure","nodeId":"ns=1;s=Pressure","datatypeName":"ns=0;i=63"},{"name":"Matrix","nodeId":"ns=1;s=Matrix","datatypeName":"ns=0;i=63"},{"name":"Position","nodeId":"ns=1;s=Position","datatypeName":"ns=0;i=63"},{"name":"PumpSpeed","nodeId":"ns=1;s=PumpSpeed","datatypeName":"ns=0;i=63"},{"name":"SomeDate","nodeId":"ns=1;s=SomeDate","datatypeName":"ns=0;i=63"},{"name":"MultiLanguageText","nodeId":"ns=1;s=MultiLanguageText","datatypeName":"ns=0;i=63"},{"name":"FanSpeed","nodeId":"ns=1;s=FanSpeed","datatypeName":"ns=0;i=63"},{"name":"TemperatureAnalogItem","nodeId":"ns=1;s=TemperatureAnalogItem","datatypeName":"ns=0;i=2368"},{"name":"MyVariable1","nodeId":"ns=1;i=16479","datatypeName":"ns=0;i=63"},{"name":"MyVariable2","nodeId":"ns=1;b=1020ffaa","datatypeName":"ns=0;i=63"},{"name":"TestReadWrite","nodeId":"ns=1;s=TestReadWrite","datatypeName":"ns=0;i=63"},{"name":"FreeMemory","nodeId":"ns=1;s=free_memory","datatypeName":"ns=0;i=63"},{"name":"Counter","nodeId":"ns=1;s=Counter","datatypeName":"ns=0;i=63"},{"name":"FullCounter","nodeId":"ns=1;s=FullCounter","datatypeName":"ns=0;i=63"},{"name":"Bark","nodeId":"ns=1;i=12345","datatypeName":"ns=0;i=0"}],"addressItemsToReadCount":15,"readtype":"VariableValue","attributeId":13}\nreturn msg;',
    'outputs': 1,
    'noerr': 0,
    'wires': [
      [
        '76202549.fd7c1c'
      ]
    ]
  }
]

var testCompressedResponseFlow = [
  {
    'id': '76202549.fd7c1c',
    'type': 'OPCUA-IIoT-Response',
    'name': '',
    'compressStructure': true,
    'showStatusActivities': false,
    'showErrors': false,
    'activateFilters': true,
    'filters': [
      {
        'name': 'dataType',
        'value': 'DateTime'
      }
    ],
    'wires': [
      [
        'n1rh'
      ]
    ]
  },
  {id: 'n1rh', type: 'helper'},
  {
    'id': '9ed1998a.92f74',
    'type': 'inject',
    'name': '',
    'topic': '',
    'payload': '',
    'payloadType': 'date',
    'repeat': '',
    'crontab': '',
    'once': true,
    'onceDelay': 2.4,
    'wires': [
      [
        '806c7bdc.b926e'
      ]
    ]
  },
  {
    'id': '806c7bdc.b926e',
    'type': 'function',
    'name': '',
    'func': 'msg = {"_msgid":"98a1d195.a8a9","topic":"","nodetype":"read","injectType":"listen","addressSpaceItems":[],"payload":[{"value":{"dataType":"Double","arrayType":"Scalar","value":0.523478532226411},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Double","arrayType":"Matrix","value":{"0":1,"1":2,"2":3,"3":4,"4":5,"5":6,"6":7,"7":8,"8":9},"dimensions":[[3,3],[3,3]]},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Double","arrayType":"Array","value":{"0":1,"1":2,"2":3,"3":4}},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Double","arrayType":"Scalar","value":263.6659132826572},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"DateTime","arrayType":"Scalar","value":"2016-10-13T08:40:00.000Z"},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"LocalizedText","arrayType":"Array","value":[{"text":"multilingual text","locale":"en"},{"text":"mehrsprachiger Text","locale":"de"},{"text":"texte multilingue","locale":"fr"}]},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Double","arrayType":"Scalar","value":966.3275887250591},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Double","arrayType":"Scalar","value":19.861320655817437},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Double","arrayType":"Scalar","value":31},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Double","arrayType":"Scalar","value":10},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Double","arrayType":"Scalar","value":1000},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Double","arrayType":"Scalar","value":0.9765148162841797},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"UInt16","arrayType":"Scalar","value":3},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"value":{"dataType":"Int32","arrayType":"Scalar","value":3},"statusCode":{"value":0,"description":"No Error","name":"Good"},"sourcePicoseconds":0,"serverPicoseconds":0},{"statusCode":{"value":2150957056,"description":"The attribute is not supported for the specified Node.","name":"BadAttributeIdInvalid"},"sourcePicoseconds":0,"serverPicoseconds":0}],"nodesToRead":["ns=1;s=Pressure","ns=1;s=Matrix","ns=1;s=Position","ns=1;s=PumpSpeed","ns=1;s=SomeDate","ns=1;s=MultiLanguageText","ns=1;s=FanSpeed","ns=1;s=TemperatureAnalogItem","ns=1;i=16479","ns=1;b=1020ffaa","ns=1;s=TestReadWrite","ns=1;s=free_memory","ns=1;s=Counter","ns=1;s=FullCounter","ns=1;i=12345"],"nodesToReadCount":15,"addressItemsToRead":[{"name":"Pressure","nodeId":"ns=1;s=Pressure","datatypeName":"ns=0;i=63"},{"name":"Matrix","nodeId":"ns=1;s=Matrix","datatypeName":"ns=0;i=63"},{"name":"Position","nodeId":"ns=1;s=Position","datatypeName":"ns=0;i=63"},{"name":"PumpSpeed","nodeId":"ns=1;s=PumpSpeed","datatypeName":"ns=0;i=63"},{"name":"SomeDate","nodeId":"ns=1;s=SomeDate","datatypeName":"ns=0;i=63"},{"name":"MultiLanguageText","nodeId":"ns=1;s=MultiLanguageText","datatypeName":"ns=0;i=63"},{"name":"FanSpeed","nodeId":"ns=1;s=FanSpeed","datatypeName":"ns=0;i=63"},{"name":"TemperatureAnalogItem","nodeId":"ns=1;s=TemperatureAnalogItem","datatypeName":"ns=0;i=2368"},{"name":"MyVariable1","nodeId":"ns=1;i=16479","datatypeName":"ns=0;i=63"},{"name":"MyVariable2","nodeId":"ns=1;b=1020ffaa","datatypeName":"ns=0;i=63"},{"name":"TestReadWrite","nodeId":"ns=1;s=TestReadWrite","datatypeName":"ns=0;i=63"},{"name":"FreeMemory","nodeId":"ns=1;s=free_memory","datatypeName":"ns=0;i=63"},{"name":"Counter","nodeId":"ns=1;s=Counter","datatypeName":"ns=0;i=63"},{"name":"FullCounter","nodeId":"ns=1;s=FullCounter","datatypeName":"ns=0;i=63"},{"name":"Bark","nodeId":"ns=1;i=12345","datatypeName":"ns=0;i=0"}],"addressItemsToReadCount":15,"readtype":"VariableValue","attributeId":13}\nreturn msg;',
    'outputs': 1,
    'noerr': 0,
    'wires': [
      [
        '76202549.fd7c1c'
      ]
    ]
  }
]

describe('OPC UA Response node Unit Testing', function () {
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

  describe('Response node', function () {
    it('should load with basic settings', function (done) {
      helper.load(responseNode,
        [{
          'id': '595c852.3ea227c',
          'type': 'OPCUA-IIoT-Response',
          'name': 'TestName',
          'compressedStructure': false,
          'showStatusActivities': false,
          'showErrors': false,
          'wires': [[]]
        }],
        function () {
          let nodeUnderTest = helper.getNode('595c852.3ea227c')
          expect(nodeUnderTest.name).toBe('TestName')
          done()
        })
    })

    it('should filter dataType from results', function (done) {
      helper.load(responseFlowNodes, testResponseFlow,
        function () {
          let nodeUnderTest = helper.getNode('n1rh')
          nodeUnderTest.on('input', (msg) => {
            console.log(msg.payload.value)
            expect(msg.payload.value[0].dataType).toBe('DateTime')
            done()
          })
        })
    })

    it('should filter dataType from results and compressing msg', function (done) {
      helper.load(responseFlowNodes, testCompressedResponseFlow,
        function () {
          let nodeUnderTest = helper.getNode('n1rh')
          nodeUnderTest.on('input', msg => {
            expect(msg.payload.value[0].dataType).toBe('DateTime')
            done()
          })
        })
    })

    it('should handle default msg', function (done) {
      helper.load(responseFlowNodes, testCompressedResponseFlow,
        function () {
          let nodeUnderTest = helper.getNode('76202549.fd7c1c')
          expect(nodeUnderTest).toBeDefined()
          let payload = {value: []}
          nodeUnderTest.functions.handleNodeTypeOfMsg(payload)
          console.log(payload)
          expect(payload).toStrictEqual({ value: [], entryStatus: { bad: 1, good: 0, other: 0 } })
          done()
        })
    })
  })
})
