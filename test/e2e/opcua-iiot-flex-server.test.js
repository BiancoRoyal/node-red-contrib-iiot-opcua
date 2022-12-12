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

// jest.setTimeout(30000)

var injectNode = require('@node-red/nodes/core/common/20-inject')
var connectorNode = require('../../src/opcua-iiot-connector')
var readNode = require('../../src/opcua-iiot-read')
var serverNode = require('../../src/opcua-iiot-flex-server')
var nodeNode = require('../../src/opcua-iiot-node')
var writeNode = require('../../src/opcua-iiot-write')

var nodesToLoad = [injectNode, connectorNode, readNode, serverNode, nodeNode, writeNode]

var helper = require('node-red-node-test-helper')
var portHelper = require('./../helper/test-helper-extensions')
helper.init(require.resolve('node-red'))

const testFlows = require("./flows/flex-server-e2e-flows")

let testingOpcUaPort

describe("OPC UA Flex Server Node E2E testing", () => {
  beforeAll(() => {
    testingOpcUaPort = 56600
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

  describe("Flex Server Node", () => {
    it("should write 1 then 0 and read 0", (done) => {
      const flow = Array.from(testFlows.testFlexServerWriteZeroFlow)
      const port = portHelper.getPort(testingOpcUaPort)
      flow[1].port = port
      flow[11].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoad, flow, () => {
        const helperWrite = helper.getNode("fe3c32681ca3545d")
        const helperRead = helper.getNode("f82a189319618699")
        let writeCounter = 0;
        helperWrite.on('input', (msg) => {
          writeCounter++
          expect(msg.payload).toBeDefined()
          expect(msg.payload.injectType).toBeDefined()
          expect(msg.payload.value).toBeDefined()
          expect(msg.payload.valuesToWrite).toBeDefined()
          expect(msg.payload.addressSpaceItems).toBeDefined()
          expect(msg.payload.value.statusCodes).toBeDefined()
          expect(msg.payload.injectType).toBe("write")
          expect(msg.payload.value.statusCodes[0].value).toBe(0)
          expect(msg.payload.valuesToWrite.length).toBe(1)

          if(writeCounter === 1){
            expect(msg.payload.valuesToWrite[0]).toBe(1)
          } else if(writeCounter === 2) {
            expect(msg.payload.valuesToWrite[0]).toBe(0)
          }
        })
        helperRead.on('input', (msg) => {
          expect(msg.payload).toBeDefined()
          expect(msg.payload.injectType).toBeDefined()
          expect(msg.payload.value).toBeDefined()
          expect(typeof(msg.payload.value)).toBe(typeof [])
          expect(msg.payload.addressSpaceItems).toBeDefined()
          expect(msg.payload.value[0].statusCode).toBeDefined()
          expect(msg.payload.value[0].statusCode.value).toBe(0)
          expect(msg.payload.value[0].value?.value).toBeDefined()
          expect(msg.payload.injectType).toBe("read")
          done()
        })
      })
    })
  })
})
