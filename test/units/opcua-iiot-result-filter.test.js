/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2022 DATATRONiQ GmbH (https://datatroniq.com)
 * Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 * All rights reserved.
 * node-red-contrib-iiot-opcua
 *
 **/

'use strict'

process.env.TEST = 'true'

// jest.setTimeout(30000)

var injectNode = require('@node-red/nodes/core/common/20-inject')
var functionNode = require('@node-red/nodes/core/function/10-function')
var inputNode = require('../../src/opcua-iiot-result-filter')

var helper = require('node-red-node-test-helper')
var portHelper = require('./../helper/test-helper-extensions')
const { StatusCodes } = require('node-opcua')
helper.init(require.resolve('node-red'))

var testFlows = require('./flows/result-filter-flows')

let testingOpcUaPort = 0

describe('OPC UA Result Filter node Testing', function () {

  beforeAll(() => {
    testingOpcUaPort = 58250
  })

  beforeEach(function (done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function (done) {
    helper.unload().then(function () {
      helper.stopServer(function () {
        done()
      })
    }).catch(function () {
      helper.stopServer(function () {
        done()
      })
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
    helper.load([injectNode, functionNode, inputNode], testFlows.testUnitReadTestFlowPayloadFlow, function () {
      let n6 = helper.getNode('n6rff1')
      n6.on('input', function (msg) {
        expect(msg.payload.nodeId).toBe('ns=1;s=TemperatureAnalogItem')
        expect(msg.payload.value).toBe(16.04)
        expect(msg.topic).toBe('TestTopic')
        done()
      })
    })
  })

  describe('Result Filter node after listener', function () {
    it('should get a message with payload', function (done) {
      helper.load([injectNode, functionNode, inputNode], testFlows.testUnitListenTestFlowPayloadFlow, function () {
        let n2 = helper.getNode('n2rff2')
        n2.on('input', function (msg) {
          expect(msg.payload).toMatchObject({
            'value': {
              'dataType': 'Double',
              'arrayType': 'Scalar',
              'value': 16.041979
            },
            'statusCode': { 'value': 0, 'description': 'No Error', 'name': 'Good' },
            'sourceTimestamp': '2018-03-13T21:43:10.470Z',
            'sourcePicoseconds': 0,
            'serverTimestamp': '2018-03-13T21:43:11.051Z',
            'serverPicoseconds': 3
          })
          done()
        })
      })
    })

    it('should get a message with payload Pressure', function (done) {
      helper.load([injectNode, functionNode, inputNode], testFlows.testUnitListenTestFlowPayloadFlow, function () {
        let n2 = helper.getNode('n2rff2')
        n2.on('input', function (msg) {
          expect(msg.payload.value.value).toBe(16.041979)
          done()
        })
      })
    })

    it('should contain Pressure in message', function (done) {
      helper.load([injectNode, functionNode, inputNode], testFlows.testUnitListenTestFlowPayloadFlow, function () {
        let n4 = helper.getNode('n4rff2')
        n4.on('input', function (msg) {
          expect(msg.payload.addressSpaceItems[0].nodeId).toMatch(/Pressure/)
          done()
        })
      })
    })

    it('should have nodeId, payload and topic as result with fixed of two', function (done) {
      helper.load([injectNode, functionNode, inputNode], testFlows.testUnitListenTestFlowPayloadFlow, function () {
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
      helper.load([injectNode, functionNode, inputNode], testFlows.testUnitListenTestFlowPrecisionPayloadFlow, function () {
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
      helper.load([injectNode, functionNode, inputNode], testFlows.testUnitWriteTestFlowPayloadFlow, function () {
        let n2 = helper.getNode('n2rff4')
        n2.on('input', function (msg) {
          expect(msg.payload).toMatchObject({
            statusCodes: [
              {
                value: 0,
                description: 'Good',
                name: 'Good'
              }
            ],
            nodesToWrite: [
              {
                nodeId: 'ns=1;s=TestReadWrite',
                attributeId: 13,
                indexRange: null,
                value: {
                  value: {
                    dataType: 'Double',
                    value: 22980.7896,
                    arrayType: 'Scalar'
                  }
                }
              }
            ],
            msg: {
              _msgid: '11cc64dd.bde67b',
              topic: '',
              nodetype: 'inject',
              injectType: 'write',
              addressSpaceItems: [
                {
                  name: 'TestReadWrite',
                  nodeId: 'ns=1;s=TestReadWrite',
                  datatypeName: 'Double'
                }
              ],
              payload: 1539981968143,
              valuesToWrite: [
                22980.7896
              ]
            }
          })
          done()
        })
      })
    })

    it('should get a message with payload TestReadWrite', function (done) {
      helper.load([injectNode, functionNode, inputNode], testFlows.testUnitWriteTestFlowPayloadFlow, function () {
        let n2 = helper.getNode('n2rff4')
        n2.on('input', function (msg) {
          expect(msg.payload.nodesToWrite[0].nodeId).toMatch(/TestReadWrite/)
          done()
        })
      })
    })

    it('should contain TestReadWrite in message', function (done) {
      helper.load([injectNode, functionNode, inputNode], testFlows.testUnitWriteTestFlowPayloadFlow, function () {
        let n4 = helper.getNode('n4rff4')
        n4.on('input', function (msg) {
          expect(msg.payload.msg.addressSpaceItems[0].nodeId).toMatch(/TestReadWrite/)
          done()
        })
      })
    })

    it('should have nodeId, payload and topic as result', function (done) {
      helper.load([injectNode, functionNode, inputNode], testFlows.testUnitWriteTestFlowPayloadFlow, function () {
        let n6 = helper.getNode('n6rff4')
        n6.on('input', function (msg) {
          expect(msg.payload.nodeId).toBe('ns=1;s=TestReadWrite')
          expect(msg.payload.value).toBe(22980.7896)
          expect(msg.topic).toBe('TestTopic')
          done()
        })
      })
    })

    it('should have nodeId, payload and topic as result with value check', function (done) {
      helper.load([injectNode, functionNode, inputNode], testFlows.testUnitWriteTestValueCheckFlowPayloadFlow, function () {
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
      testFlows.testUnitWriteTestValueCheckFlowPayloadFlow[5].justValue = true
      helper.load([injectNode, functionNode, inputNode], testFlows.testUnitWriteTestValueCheckFlowPayloadFlow, function () {
        let n6 = helper.getNode('n6rff5')
        n6.on('input', function (msg) {
          expect(msg.payload.nodeId).toBe('ns=1;s=Pressure')
          expect(msg.payload.value).toBe(0.37883857546881394)
          expect(msg.topic).toBe('TestTopic')
          expect(msg.payload.filter).toBe(true)
          expect(msg.payload.justValue).toBe(true)
          expect(msg.payload.filtertype).toBe('filter')

          testFlows.testUnitWriteTestValueCheckFlowPayloadFlow[5].justValue = false
          done()
        })
      })
    })

    it('should have nodeId, payload and topic as result with value check on just value with precision two', function (done) {
      testFlows.testUnitWriteTestValueCheckFlowPayloadFlow[5].justValue = true
      testFlows.testUnitWriteTestValueCheckFlowPayloadFlow[5].withPrecision = true
      helper.load([injectNode, functionNode, inputNode], testFlows.testUnitWriteTestValueCheckFlowPayloadFlow, function () {
        let n6 = helper.getNode('n6rff5')
        n6.on('input', function (msg) {
          expect(msg.payload.nodeId).toBe('ns=1;s=Pressure')
          expect(msg.payload.value).toBe(0.38)
          expect(msg.topic).toBe('TestTopic')
          expect(msg.payload.filter).toBe(true)
          expect(msg.payload.justValue).toBe(true)
          expect(msg.payload.filtertype).toBe('filter')

          testFlows.testUnitWriteTestValueCheckFlowPayloadFlow[5].justValue = false
          testFlows.testUnitWriteTestValueCheckFlowPayloadFlow[5].withPrecision = false
          done()
        })
      })
    })

    it('should return null on null input to convertResultValue', function (done) {
      helper.load([injectNode, functionNode, inputNode], testFlows.testUnitWriteTestValueCheckFlowPayloadFlow, function () {
        let n5 = helper.getNode('n5rff5')
        expect(n5.functions.convertResultValue({ value: null })).toBe(null)
        done()
      })
    })

    it('should return given object on missing datatype input to convertResultValue', function (done) {
      testFlows.testUnitWriteTestValueCheckFlowPayloadFlow[5].datatype = 'String'
      helper.load([injectNode, functionNode, inputNode], testFlows.testUnitWriteTestValueCheckFlowPayloadFlow, function () {
        let n5 = helper.getNode('n5rff5')
        expect(n5.functions.convertResultValue({ value: 'Test' })).toBe('Test')
        testFlows.testUnitWriteTestValueCheckFlowPayloadFlow[5].datatype = 'Double'
        done()
      })
    })

    it('should return null on null with datatype input to convertResultValue', function (done) {
      helper.load([injectNode, functionNode, inputNode], testFlows.testUnitWriteTestValueCheckFlowPayloadFlow, function () {
        let n5 = helper.getNode('n5rff5')
        expect(n5.functions.convertResultValue({ payload: { value: null, datatype: 'Double' } })).toBeFalsy()
        done()
      })
    })

    it('should return min value with datatype input to convertResultValue', function (done) {
      helper.load([injectNode, functionNode, inputNode], testFlows.testUnitWriteTestValueCheckFlowPayloadFlow, function () {
        let n5 = helper.getNode('n5rff5')
        expect(n5.functions.convertResultValue({ value: { value: 0.6778, datatype: 'Double' } })).toBe(0.30)
        done()
      })
    })

    it('should return value in range with datatype input to convertResultValue', function (done) {
      helper.load([injectNode, functionNode, inputNode], testFlows.testUnitWriteTestValueCheckFlowPayloadFlow, function () {
        let n5 = helper.getNode('n5rff5')
        expect(n5.functions.convertResultValue({ value: 0.4778, datatype: 'Double' })).toBe(0.4778)
        done()
      })
    })
  })
})
