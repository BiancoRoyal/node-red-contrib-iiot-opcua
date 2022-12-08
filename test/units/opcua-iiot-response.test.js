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
var responseNode = require('../../src/opcua-iiot-response')

var responseFlowNodes = [injectNode, functionNode, responseNode]

var helper = require('node-red-node-test-helper')
var portHelper = require('./../helper/test-helper-extensions')
helper.init(require.resolve('node-red'))

var testFlows = require('./flows/response-flows')
const helperExtensions = require('../helper/test-helper-extensions')

let testingOpcUaPort = 0

describe('OPC UA Response node Unit Testing', function () {

  beforeAll(() => {
    testingOpcUaPort = 58150
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

  describe('Response node', function () {
    it('should load with default settings', function (done) {
      helper.load(responseNode, testFlows.testUnitDefaultResponseFlow,
        function () {
          let nodeUnderTest = helper.getNode('be0763d2593bd6ef')
          expect(nodeUnderTest.name).toBe('')
          expect(nodeUnderTest.type).toBe('OPCUA-IIoT-Response')
          expect(nodeUnderTest.compressStructure).toBe(true)
          expect(nodeUnderTest.showStatusActivities).toBe(false)
          expect(nodeUnderTest.showErrors).toBe(false)
          expect(nodeUnderTest.activateUnsetFilter).toBe(false)
          expect(nodeUnderTest.activateFilters).toBe(false)
          expect(nodeUnderTest.negateFilter).toBe(false)
          done()
        })
    })

    it('should load with basic settings', function (done) {
      helper.load(responseNode, helperExtensions.cleanFlowPositionData([
          {
            'id': '595c852.3ea227c',
            'type': 'OPCUA-IIoT-Response',
            'z': 'e41e66b2c57b1657',
            'name': 'TestName',
            'compressStructure': false,
            'showStatusActivities': false,
            'showErrors': false,
            'activateUnsetFilter': false,
            'activateFilters': false,
            'negateFilter': false,
            'filters': [],
            'x': 280,
            'y': 280,
            'wires': [
              []
            ]
          }
        ]),
        function () {
          let nodeUnderTest = helper.getNode('595c852.3ea227c')
          expect(nodeUnderTest.name).toBe('TestName')
          expect(nodeUnderTest.compressStructure).toBe(false)
          expect(nodeUnderTest.showStatusActivities).toBe(false)
          expect(nodeUnderTest.showErrors).toBe(false)
          done()
        })
    })

    it('should filter dataType from results', function (done) {
      helper.load(responseFlowNodes, testFlows.testUnitResponseFlow,
        function () {
          let nodeUnderTest = helper.getNode('n1rh')
          nodeUnderTest.on('input', (msg) => {
            expect(msg.payload.value[0].value.dataType).toBe('DateTime')
            done()
          })
        })
    })

    it('should filter dataType from results and compressing msg', function (done) {
      helper.load(responseFlowNodes, testFlows.testUnitCompressedResponseFlow,
        function () {
          let nodeUnderTest = helper.getNode('n1rh')
          nodeUnderTest.on('input', msg => {
            expect(msg.payload.value[0].dataType).toBe('DateTime')
            done()
          })
        })
    })

    it('should handle default msg', function (done) {
      helper.load(responseFlowNodes, testFlows.testUnitCompressedResponseFlow,
        function () {
          let nodeUnderTest = helper.getNode('76202549.fd7c1c')
          expect(nodeUnderTest).toBeDefined()
          let payload = { value: [] }
          nodeUnderTest.functions.handleNodeTypeOfMsg(payload)
          expect(payload).toStrictEqual({ value: [], entryStatus: { bad: 1, good: 0, other: 0 } })
          done()
        })
    })
  })
})
