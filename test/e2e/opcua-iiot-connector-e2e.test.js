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

var helper = require('node-red-node-test-helper')
var portHelper = require('./../helper/test-helper-extensions')
helper.init(require.resolve('node-red'))

// iiot opc ua nodes
var serverNode = require('../../src/opcua-iiot-server')
var injectNode = require('../../src/opcua-iiot-inject')
var inputNode = require('../../src/opcua-iiot-connector')
// services
var readNode = require('../../src/opcua-iiot-read')
var writeNode = require('../../src/opcua-iiot-write')
var browserNode = require('../../src/opcua-iiot-browser')
var listenerNode = require('../../src/opcua-iiot-listener')
var methodCallerNode = require('../../src/opcua-iiot-method-caller')

var nodesToLoadForBrowser = [injectNode, browserNode, inputNode, serverNode]
var nodesToLoadForReader = [injectNode, readNode, inputNode, serverNode]
var nodesToLoadForWriter = [injectNode, writeNode, inputNode, serverNode]
var nodesToLoadForListener = [injectNode, listenerNode, inputNode, serverNode]
var nodesToLoadForMethodCaller = [injectNode, methodCallerNode, inputNode, serverNode]

// https://www.dailycred.com/article/bcrypt-calculator
var testCredentials = {
  user: 'peter',
  password: '$2a$04$Dj8UfDYcMLjttad0Qi67DeKtqJM6SZ8XR.Oy70.GUvle4MlrVWaYC'
}

var testFlows = require('./flows/connector-e2e-flows')

describe('OPC UA Connector node e2e Testing', function () {

  global.lastOpcuaPort = 55000

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

  describe('Connector node', function () {
    it('should success on discovery request', function (done) {
      const flow = Array.from(testFlows.testConnectorHTTPFlow)
      const port = portHelper.getPort()
      flow[2].port = port
      flow[3].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForBrowser, flow, function () {
        helper.request()
          .get('/opcuaIIoT/client/discover/c1cf6/' + encodeURIComponent('test'))
          .expect(200)
          .end(done)
      })
    })

    // TODO: needs to be checked if we get it back to work in tests with the new node-red version
    /* getNode has now data and flows anymore ...
    it('should success on endpoints request', function (done) {
      helper.load(nodesToLoadForBrowser, testFlows.testConnectorHTTPFlow, function () {
        const url = '/opcuaIIoT/client/endpoints/c1cf6/' + encodeURIComponent('test')
        setTimeout( () => {
          helper.request()
            .get(url)
            .expect(200)
            .end(done)
        }, 3000)
      })
    })
    */

    it('should success on DataTypeId request', function (done) {
      const flow = Array.from(testFlows.testConnectorHTTPFlow)
      const port = portHelper.getPort()
      flow[2].port = port
      flow[3].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForBrowser, flow, function () {
        helper.request()
          .get('/opcuaIIoT/plain/DataTypeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should success on AttributeIds request', function (done) {
      const flow = Array.from(testFlows.testConnectorHTTPFlow)
      const port = portHelper.getPort()
      flow[2].port = port
      flow[3].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForBrowser, flow, function () {
        helper.request()
          .get('/opcuaIIoT/plain/AttributeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should success on StatusCodes request', function (done) {
      const flow = Array.from(testFlows.testConnectorHTTPFlow)
      const port = portHelper.getPort()
      flow[2].port = port
      flow[3].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForBrowser, flow, function () {
        helper.request()
          .get('/opcuaIIoT/plain/StatusCodes')
          .expect(200)
          .end(done)
      })
    })

    it('should success on ObjectTypeIds request', function (done) {
      const flow = Array.from(testFlows.testConnectorHTTPFlow)
      const port = portHelper.getPort()
      flow[2].port = port
      flow[3].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForBrowser, flow, function () {
        helper.request()
          .get('/opcuaIIoT/plain/ObjectTypeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should success on VariableTypeIds request', function (done) {
      const flow = Array.from(testFlows.testConnectorHTTPFlow)
      const port = portHelper.getPort()
      flow[2].port = port
      flow[3].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForBrowser, flow, function () {
        helper.request()
          .get('/opcuaIIoT/plain/VariableTypeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should success on ReferenceTypeIds request', function (done) {
      const flow = Array.from(testFlows.testConnectorHTTPFlow)
      const port = portHelper.getPort()
      flow[2].port = port
      flow[3].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForBrowser, flow, function () {
        helper.request()
          .get('/opcuaIIoT/plain/ReferenceTypeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should success on XML sets request', function (done) {
      const flow = Array.from(testFlows.testConnectorHTTPFlow)
      const port = portHelper.getPort()
      flow[2].port = port
      flow[3].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForBrowser, flow, function () {
        helper.request()
          .get('/opcuaIIoT/xmlsets/public')
          .expect(200)
          .end(done)
      })
    })

    it('should success on DataTypeIds list request', function (done) {
      const flow = Array.from(testFlows.testConnectorHTTPFlow)
      const port = portHelper.getPort()
      flow[2].port = port
      flow[3].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForBrowser, flow, function () {
        helper.request()
          .get('/opcuaIIoT/list/DataTypeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should success on EventTypeIds list request', function (done) {
      const flow = Array.from(testFlows.testConnectorHTTPFlow)
      const port = portHelper.getPort()
      flow[2].port = port
      flow[3].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForBrowser, flow, function () {
        helper.request()
          .get('/opcuaIIoT/list/EventTypeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should success on InstanceTypeIds list request', function (done) {
      const flow = Array.from(testFlows.testConnectorHTTPFlow)
      const port = portHelper.getPort()
      flow[2].port = port
      flow[3].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForBrowser, flow, function () {
        helper.request()
          .get('/opcuaIIoT/list/InstanceTypeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should success on VariableTypeIds list request', function (done) {
      const flow = Array.from(testFlows.testConnectorHTTPFlow)
      const port = portHelper.getPort()
      flow[2].port = port
      flow[3].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForBrowser, flow, function () {
        helper.request()
          .get('/opcuaIIoT/list/VariableTypeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should success on ReferenceTypeIds list request', function (done) {
      const flow = Array.from(testFlows.testConnectorHTTPFlow)
      const port = portHelper.getPort()
      flow[2].port = port
      flow[3].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForBrowser, flow, function () {
        helper.request()
          .get('/opcuaIIoT/list/ReferenceTypeIds')
          .expect(200)
          .end(done)
      })
    })

    it('should get a message with payload after inject with browser', function (done) {
      const flow = Array.from(testFlows.testConnectorBrowseFlow)
      const port = portHelper.getPort()
      flow[5].port = port
      flow[6].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForBrowser, flow, function () {
        let n2 = helper.getNode('n2cf1')
        n2.on('input', function (msg) {
          expect(msg.payload.value).toBe('testpayload')
          setTimeout(done, 3000)
        })
      })
    })

    it('should get a message with topic after browse', function (done) {
      const flow = Array.from(testFlows.testConnectorBrowseFlow)
      const port = portHelper.getPort()
      flow[5].port = port
      flow[6].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForBrowser, flow, function () {
        let n5 = helper.getNode('n5cf1')
        n5.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicBrowse')
          done()
        })
      })
    })

    it('should get a message with rootNodeId after browse', function (done) {
      const flow = Array.from(testFlows.testConnectorBrowseFlow)
      const port = portHelper.getPort()
      flow[5].port = port
      flow[6].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForBrowser, flow, function () {
        let n5 = helper.getNode('n5cf1')
        n5.on('input', function (msg) {
          expect(msg.payload.rootNodeId).toBe('ns=1;i=1234')
          done()
        })
      })
    })

    it('should get a message with browserResults in payload after browse', function (done) {
      const flow = Array.from(testFlows.testConnectorBrowseFlow)
      const port = portHelper.getPort()
      flow[5].port = port
      flow[6].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForBrowser, flow, function () {
        let n5 = helper.getNode('n5cf1')
        n5.on('input', function (msg) {
          expect(msg.payload.rootNodeId).toBe('ns=1;i=1234')

          // TODO: nodeClass is now int and not string anymore
          expect(msg.payload.browserResults).toMatchObject([
            {
              "nodeId": "ns=1;s=Pressure",
              "browseName": "1:Pressure",
              "displayName": "locale=en-US text=Pressure",
              "nodeClass": "2",
              "datatypeName": "ns=0;i=63"
            },
            {
              "nodeId": "ns=1;s=Matrix",
              "browseName": "1:Matrix",
              "displayName": "locale=en-US text=Matrix",
              "nodeClass": "2",
              "datatypeName": "ns=0;i=63"
            },
            {
              "nodeId": "ns=1;s=Position",
              "browseName": "1:Position",
              "displayName": "locale=en-US text=Position",
              "nodeClass": "2",
              "datatypeName": "ns=0;i=63"
            },
            {
              "nodeId": "ns=1;s=PumpSpeed",
              "browseName": "1:PumpSpeed",
              "displayName": "locale=en-US text=Pump Speed",
              "nodeClass": "2",
              "datatypeName": "ns=0;i=63"
            },
            {
              "nodeId": "ns=1;s=SomeDate",
              "browseName": "1:SomeDate",
              "displayName": "locale=en-US text=Some Date",
              "nodeClass": "2",
              "datatypeName": "ns=0;i=63"
            },
            {
              "nodeId": "ns=1;s=MultiLanguageText",
              "browseName": "1:MultiLanguageText",
              "displayName": "locale=en-US text=Multi Language Text",
              "nodeClass": "2",
              "datatypeName": "ns=0;i=63"
            },
            {
              "nodeId": "ns=1;s=FanSpeed",
              "browseName": "1:FanSpeed",
              "displayName": "locale=en-US text=Fan Speed",
              "nodeClass": "2",
              "datatypeName": "ns=0;i=63"
            },
            {
              "nodeId": "ns=1;s=TemperatureAnalogItem",
              "browseName": "1:TemperatureAnalogItem",
              "displayName": "locale=en-US text=Temperature",
              "nodeClass": "2",
              "datatypeName": "ns=0;i=2368"
            },
            {
              "nodeId": "ns=1;i=16479",
              "browseName": "1:MyVariable1",
              "displayName": "locale=null text=My Variable 1",
              "nodeClass": "2",
              "datatypeName": "ns=0;i=63"
            },
            {
              "nodeId": "ns=1;b=1020FFAA",
              "browseName": "1:MyVariable2",
              "displayName": "locale=null text=My Variable 2",
              "nodeClass": "2",
              "datatypeName": "ns=0;i=63"
            },
            {
              "nodeId": "ns=1;s=TestReadWrite",
              "browseName": "1:TestReadWrite",
              "displayName": "locale=null text=Test Read and Write",
              "nodeClass": "2",
              "datatypeName": "ns=0;i=63"
            },
            {
              "nodeId": "ns=1;s=free_memory",
              "browseName": "1:FreeMemory",
              "displayName": "locale=en-US text=Free Memory",
              "nodeClass": "2",
              "datatypeName": "ns=0;i=63"
            },
            {
              "nodeId": "ns=1;s=Counter",
              "browseName": "1:Counter",
              "displayName": "locale=en-US text=Counter",
              "nodeClass": "2",
              "datatypeName": "ns=0;i=63"
            },
            {
              "nodeId": "ns=1;s=FullCounter",
              "browseName": "1:FullCounter",
              "displayName": "locale=en-US text=Full-Counter",
              "nodeClass": "2",
              "datatypeName": "ns=0;i=63"
            },
            {
              "nodeId": "ns=1;i=12345",
              "browseName": "1:Bark",
              "displayName": "locale=null text=Bark",
              "nodeClass": "4",
              "datatypeName": "ns=0;i=0"
            }
          ])
          done()
        })
      })
    })

    it('should get a message with payload after inject with read', function (done) {
      const flow = Array.from(testFlows.testConnectorReadFlow)
      const port = portHelper.getPort()
      flow[5].port = port
      flow[6].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForReader, flow, function () {
        let n2 = helper.getNode('n2cf2')
        n2.on('input', function (msg) {
          expect(msg.payload.value).toBe('testpayload')
          expect(msg.topic).toBe('TestTopicRead')
          setTimeout(done, 3000)
        })
      })
    })

    it('should get a message with nodeId in payload after read', function (done) {
      const flow = Array.from(testFlows.testConnectorReadFlow)
      const port = portHelper.getPort()
      flow[5].port = port
      flow[6].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForReader, flow, function () {
        let n5 = helper.getNode('n5cf2')
        n5.on('input', function (msg) {
          expect(msg.payload.value[0].nodeId).toBe('ns=1;s=Pressure')
          expect(msg.topic).toBe('TestTopicRead')
          expect(msg.payload.addressSpaceItems).toMatchObject([{'name': '', 'nodeId': 'ns=1;s=Pressure', 'datatypeName': ''}])
          done()
        })
      })
    })

    let msgCounter = 0
    it('should get a message with payload after inject with listener', function (done) {
      const flow = Array.from(testFlows.testConnectorListenerFlow)
      const port = portHelper.getPort()
      flow[5].port = port
      flow[6].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForListener, flow, function () {
        let n2 = helper.getNode('n2cf3')
        n2.on('input', function (msg) {
          expect(msg.payload.options).toBeDefined()
          expect(msg.topic).toBe('TestTopicListen')
        })

        let n5 = helper.getNode('n5cf3')
        n5.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.value.value.dataType).toBe('Int32')
            expect(msg.payload.value.statusCode.value).toBe(0)
            expect(msg.payload.nodetype).toBe('listen')
            expect(msg.payload.injectType).toBe('subscribe')
            done()
          }
        })
      })
    })

    it('should get a message with addressSpaceItems after write', function (done) {
      const flow = Array.from(testFlows.testConnectorWriteFlow)
      const port = portHelper.getPort()
      flow[5].port = port
      flow[6].endpoint = "opc.tcp://localhost:" + port
      flow[6].credentials = {user: 'peter', password: 'peter'}

      helper.load(nodesToLoadForWriter, flow, testCredentials, function () {
        let n5 = helper.getNode('n5cf4')
        n5.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicWrite')
          expect(msg.payload.addressSpaceItems).toMatchObject([{"name":"Pressure","nodeId":"ns=1;s=Pressure","datatypeName":"Double"}] )
          done()
        })
      })
    })

    it('should get a message with addressSpaceItems after write with autoselect endpoint', function (done) {
      const flow = Array.from(testFlows.testConnectorWriteFlow)
      const port = portHelper.getPort()
      flow[5].port = port
      flow[6].endpoint = "opc.tcp://localhost:" + port
      flow[6].autoSelectRightEndpoint = true
      flow[6].credentials = {user: 'peter', password: 'peter'}
      helper.load(nodesToLoadForWriter, testFlows.testConnectorWriteFlow, testCredentials, function () {
        let n5 = helper.getNode('n5cf4')
        n5.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicWrite')
          expect(msg.payload.addressSpaceItems).toMatchObject([{"name":"Pressure","nodeId":"ns=1;s=Pressure","datatypeName":"Double"}] )
          done()
        })
      })
    })

    it('should get a message with payload after inject with method', function (done) {
      const flow = Array.from(testFlows.testConnectorMethodCallerFlow)
      const port = portHelper.getPort()
      flow[5].port = port
      flow[6].endpoint = "opc.tcp://localhost:" + port

      helper.load(nodesToLoadForMethodCaller, flow, function () {
        let n2 = helper.getNode('n2cf5')
        n2.on('input', function (msg) {
          expect(msg.payload.value).toBe(1000)
          expect(msg.topic).toBe('TestTopicMethod')
          done()
        })
      })
    })

    it('should be loaded with secure mode and policy', function (done) {
      const flow = Array.from(testFlows.testConnectorBrowseFlow)
      flow[5].port = "50223"
      flow[5].users =  [
        {
          "name": "test",
          "password": "test"
        }
      ]
      flow[6].loginEnabled = true
      flow[6].credentials = {
        "user": "test",
        "password": "test"
      }
      flow[6].endpoint = "opc.tcp://localhost:50223/"
      flow[6].securityPolicy = "Basic128"
      flow[6].securityMode = "Sign"

      helper.load(nodesToLoadForBrowser, flow, () => {
        let n = helper.getNode('c1cf1')
        if (n) {
          expect(n.publicCertificateFile).toBeDefined()
          expect(n.publicCertificateFile !== "").toBe(true)
          expect(n.privateKeyFile).toBeDefined()
          expect(n.privateKeyFile !== "").toBe(true)
          setTimeout(done, 1000)
        }
      })
    })

    it('should get a message with addressSpaceItems after method', function (done) {
      const flow = Array.from(testFlows.testConnectorMethodCallerFlow)
      flow[5].port = "50225"
      flow[6].endpoint = "opc.tcp://localhost:50225/"

      helper.load(nodesToLoadForMethodCaller, flow, function () {
        let n5 = helper.getNode('n5cf5')
        n5.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicMethod')
          expect(msg.payload.nodetype).toBe('method')
          expect(msg.payload.injectType).toBe('inject')
          expect(msg.payload.methodType).toBe('basic')

          // TODO: string vs. int on ENUMS has problems in tests and outputs
          // if I copy the live data, then I get strings like Double etc.
          // the test needs node-opcua enums or int to compare, otherwise it fails here
          let value = msg.payload.value
          let valueJSON = JSON.stringify(value)
          expect(valueJSON).toBe(
            "[{\"statusCode\":{\"value\":0},\"outputArguments\":[{\"dataType\":\"String\",\"arrayType\":\"Array\",\"value\":[\"Whaff!!!!!\",\"Whaff!!!!!\",\"Whaff!!!!!\"]}]}]"
          )
          done()
        })
      })
    })
  })
})
