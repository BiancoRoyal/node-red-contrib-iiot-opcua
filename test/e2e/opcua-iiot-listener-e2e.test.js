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

jest.setTimeout(40000)

// iiot opc ua nodes
var injectNode = require('../../src/opcua-iiot-inject')
var serverNode = require('../../src/opcua-iiot-server')
var responseNode = require('../../src/opcua-iiot-response')
var connectorNode = require('../../src/opcua-iiot-connector')
var inputNode = require('../../src/opcua-iiot-listener')
var browserNode = require('../../src/opcua-iiot-browser')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var listenerNodesToLoad = [injectNode, browserNode, connectorNode, inputNode, responseNode, serverNode]

var testFlows = require('./flows/listener-e2e-flows')

describe('OPC UA Listener monitoring node e2e Testing', function () {
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

  describe('Listen node', function () {
    let msgCounter = 0

    it('should get a message with payload after inject on unsubscribe', function (done) {
      helper.load(listenerNodesToLoad, testFlows.testListenerMonitoringFlow, function () {
        msgCounter = 0
        let n2 = helper.getNode('n2li')
        n2.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 2) {
            expect(msg.topic).toBe('TestTopicUnsubscribe')
            expect(msg.payload.nodetype).toBe('inject')
            expect(msg.payload.injectType).toBe('listen')
            setTimeout(done, 5000)
          }
        })
      })
    })

    it('should verify a message on changed monitored item with statusCode on subscribe', function (done) {
      helper.load(listenerNodesToLoad, testFlows.testListenerMonitoringFlow, function () {
        msgCounter = 0
        let n3 = helper.getNode('n3li')
        n3.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.value).toBeDefined()
            expect(msg.topic).toBe('TestTopicSubscribe')
            expect(msg.payload.value.value.dataType).toBe('Int32')
            expect(msg.payload.value.statusCode).toBeDefined()
            setTimeout(done, 4000)
          }
        })
      })
    })

    it('should verify a compressed message from response node on subscribe', function (done) {
      helper.load(listenerNodesToLoad, testFlows.testListenerMonitoringFlow, function () {
        msgCounter = 0
        let n4 = helper.getNode('n4li')
        n4.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.value).toBeDefined()
            expect(msg.topic).toBe('TestTopicSubscribe')
            expect(msg.payload.value.value.dataType).toBe('Int32')
            expect(msg.payload.payload.nodeId).toBe('ns=1;s=FullCounter')
            expect(msg.payload.value.statusCode).toBeDefined()
            setTimeout(done, 2000)
          }
        })
      })
    })

    it('should get a message with payload after injecting twice', function (done) {
      helper.load(listenerNodesToLoad, testFlows.testListenerMonitoringAboFlow, function () {
        msgCounter = 0
        let n1 = helper.getNode('n1lia')
        n1.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.topic).toBe('TestTopicSubscribe1')
            expect(msg.payload.nodetype).toBe('inject')
            expect(msg.payload.injectType).toBe('listen')
          }

          if (msgCounter === 2) {
            expect(msg.topic).toBe('TestTopicUnsubscribe1')
            expect(msg.payload.nodetype).toBe('inject')
            expect(msg.payload.injectType).toBe('listen')
            setTimeout(done, 5000)
          }
        })
      })
    })

    it('should verify a message on changed monitored item with statusCode on subscribing twice', function (done) {
      helper.load(listenerNodesToLoad, testFlows.testListenerMonitoringAboFlow, function () {
        msgCounter = 0
        let n2 = helper.getNode('n2lia')
        n2.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.topic).toBe('TestTopicSubscribe2')
            expect(msg.payload.nodetype).toBe('inject')
            expect(msg.payload.injectType).toBe('listen')
            expect(msg.payload.value).toBeDefined()
          }

          if (msgCounter === 2) {
            expect(msg.topic).toBe('TestTopicUnsubscribe2')
            expect(msg.payload.nodetype).toBe('inject')
            expect(msg.payload.injectType).toBe('listen')
            setTimeout(done, 5000)
          }
        })
      })
    })

    it('should verify message from listener node on subscribing twice', function (done) {
      helper.load(listenerNodesToLoad, testFlows.testListenerMonitoringAboFlow, function () {
        msgCounter = 0
        let n3 = helper.getNode('n3lia')
        n3.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.value).toBeDefined()
            setTimeout(done, 1000)
          }
        })
      })
    })

    it('should verify a compressed message from response node on subscribing twice', function (done) {
      helper.load(listenerNodesToLoad, testFlows.testListenerMonitoringAboFlow, function () {
        msgCounter = 0
        let n4 = helper.getNode('n4lia')
        n4.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.value).toBeDefined()
            setTimeout(done, 500)
          }
        })
      })
    })

    it('should verify a message from browse node on subscribe recursive', function (done) {
      helper.load(listenerNodesToLoad, testFlows.recursiveBrowserAboFlow, function () {
        msgCounter = 0
        let n2 = helper.getNode('n2abo')
        n2.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload.browserResults).toBeDefined()
            expect(msg.payload.browserResults.length).toBe(95)
          }

          if (msgCounter === 2) {
            expect(msg.payload.browserResults).toBeDefined()
            expect(msg.payload).toBeDefined()
            expect(msg.topic).toBe('unsub')
            setTimeout(done, 3000)
          }

          /* TODO: we have to check why this were three msg's
          if (msgCounter === 3) {
            expect(msg.payload.browserResults).toBeDefined()
            expect(msg.payload).toBeDefined()
            expect(msg.topic).toBe('unsub')
            setTimeout(done, 3000)
          }
           */
        })
      })
    })

    it('should verify a compressed message from response after browser node on subscribe recursive', function (done) {
      helper.load(listenerNodesToLoad, testFlows.recursiveBrowserAboFlow, function () {
        msgCounter = 0
        let n3 = helper.getNode('n3abo')
        n3.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload).toBeDefined()
            expect(msg.payload.browserResults.length).toBe(95)
            expect(msg.payload.recursiveDepth).toBe(0)
          }

          /* TODO: we have to check why this were three msg's
          if (msgCounter === 2) {
            expect(msg.payload).toBeDefined()
            expect(msg.payload.browserResults).toBeDefined()
            expect(msg.payload.recursiveDepth).toBe(0)
            setTimeout(done, 5000)
          }
           */
        })
      })
    })

    it('should verify a message from listener node on subscribe recursive', function (done) {
      helper.load(listenerNodesToLoad, testFlows.recursiveBrowserAboFlow, function () {
        msgCounter = 0
        let n4 = helper.getNode('n4abo')
        n4.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload).toBeDefined()
          }

          /* TODO: we have to check why this were three msg's
          if (msgCounter === 2) {
            expect(msg.payload).toBeDefined()
            setTimeout(done, 3000)
          }
          */
        })
      })
    })

    it('should verify a compressed message from response after listener node on subscribe recursive as single result', function (done) {
      helper.load(listenerNodesToLoad, testFlows.recursiveBrowserAboFlow, function () {
        msgCounter = 0
        let n5 = helper.getNode('n5abo')
        n5.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload).toBeDefined()
            done()
          }
        })
      })
    })

    it('should subscribe from recursive browse from multiple results', function (done) {
      testFlows.feedListenerWithRecursiveBrowse[1].singleBrowseResult = false
      helper.load(listenerNodesToLoad, testFlows.feedListenerWithRecursiveBrowse, function () {
        msgCounter = 0
        let n2 = helper.getNode('n2brli')
        n2.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload).toBeDefined()
            setTimeout(done, 2000)
          }
        })
      })
    })

    it('should subscribe from recursive browse from single result', function (done) {
      testFlows.feedListenerWithRecursiveBrowse[1].singleBrowseResult = true
      helper.load(listenerNodesToLoad, testFlows.feedListenerWithRecursiveBrowse, function () {
        msgCounter = 0
        let n2 = helper.getNode('n2brli')
        n2.on('input', function (msg) {
          msgCounter++
          if (msgCounter === 1) {
            expect(msg.payload).toBeDefined()
            setTimeout(done, 2000)
          }
        })
      })
    })
  })
})
