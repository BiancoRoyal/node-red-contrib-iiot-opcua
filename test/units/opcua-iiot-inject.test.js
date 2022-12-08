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

var inputNode = require('../../src/opcua-iiot-inject')
const helperExtensions = require('../helper/test-helper-extensions')

var helper = require('node-red-node-test-helper')
var portHelper = require('./../helper/test-helper-extensions')
helper.init(require.resolve('node-red'))

var testFlows = require('./flows/inject-flows')

let testingOpcUaPort = 0

describe('OPC UA Inject node Unit Testing', function () {

  beforeAll(() => {
    testingOpcUaPort = 57750
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

  describe('Inject node', function () {

    it('should load with default settings', function (done) {
      helper.load([inputNode], testFlows.testUnitDefaultInjectFlow,
        function () {
          let nodeUnderTest = helper.getNode('0128054740bdc14c')
          expect(nodeUnderTest.name).toBe('')
          expect(nodeUnderTest.injectType).toBe('inject')
          expect(nodeUnderTest.payload).toBe('')
          expect(nodeUnderTest.topic).toBe('')
          expect(nodeUnderTest.payloadType).toBe('date')
          expect(nodeUnderTest.startDelay).toBe(10)
          expect(nodeUnderTest.repeat).toBe(0)
          expect(nodeUnderTest.crontab).toBe('')
          expect(nodeUnderTest.once).toBe(false)
          done()
        })
    })

    it('should load with basic settings', function (done) {
      helper.load([inputNode], testFlows.testUnitInjectFlow,
        function () {
          let nodeUnderTest = helper.getNode('f93b472c.486038')
          expect(nodeUnderTest.name).toBe('TestName')
          expect(nodeUnderTest.injectType).toBe('inject')
          expect(nodeUnderTest.payload).toBe('123456')
          expect(nodeUnderTest.topic).toBe('TestTopicInject')
          expect(nodeUnderTest.startDelay).toBe(10)
          done()
        })
    })

    it('should send a message with payload', function (done) {
      helper.load([inputNode], testFlows.testInjectFlow, function () {
        const n2 = helper.getNode('n2ijf1')
        const n1 = helper.getNode('n1ijf1')
        n2.on('input', function (msg) {
          msg.should.have.property('payload')
          done()
        })
      })
    })

    it('should send a message with topic', function (done) {
      helper.load([inputNode], testFlows.testInjectFlow, function () {
        const n2 = helper.getNode('n2ijf1')
        const n1 = helper.getNode('n1ijf1')
        n2.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicInject')
          msg.should.have.property('topic')
          done()
        })
      })
    })

    it('should load with basic settings read node', function (done) {
      helper.load([inputNode], testFlows.testUnitReadInjectFlow,
        function () {
          let nodeUnderTest = helper.getNode('f93b472c.486038')
          expect(nodeUnderTest.name).toBe('TestName')
          expect(nodeUnderTest.injectType).toBe('read')
          expect(nodeUnderTest.payload).toBe('123456')
          expect(nodeUnderTest.topic).toBe('TestTopicInject')
          expect(nodeUnderTest.startDelay).toBe(1)
          done()
        })
    })

    it('should send a message with payload read node', function (done) {
      testFlows.testInjectFlow[1].injectType = 'read'
      helper.load([inputNode], testFlows.testInjectFlow, function () {
        const n2 = helper.getNode('n2ijf1')
        const n1 = helper.getNode('n1ijf1')
        n2.on('input', function (msg) {
          expect(msg.payload.injectType).toBe('read')
          done()
        })
      })
    })

    it('should send a message with topic read node', function (done) {
      testFlows.testInjectFlow[1].injectType = 'read'
      helper.load([inputNode], testFlows.testInjectFlow, function () {
        const n2 = helper.getNode('n2ijf1')
        const n1 = helper.getNode('n1ijf1')
        n2.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicInject')
          done()
        })
      })
    })

    it('should send a message with types read node', function (done) {
      testFlows.testInjectFlow[1].injectType = 'read'
      helper.load([inputNode], testFlows.testInjectFlow, function () {
        const n2 = helper.getNode('n2ijf1')
        const n1 = helper.getNode('n1ijf1')
        n2.on('input', function (msg) {
          expect(msg.payload.nodetype).toBe('inject')
          expect(msg.payload.injectType).toBe('read')
          done()
        })
      })
    })

    it('should load with basic settings listen node', function (done) {
      helper.load([inputNode], testFlows.testUnitListenInjectFlow,
        function () {
          let nodeUnderTest = helper.getNode('f93b472c.486038')
          expect(nodeUnderTest.name).toBe('TestName')
          expect(nodeUnderTest.injectType).toBe('listen')
          expect(nodeUnderTest.payload).toBe('123456')
          expect(nodeUnderTest.topic).toBe('TestTopicInject')
          expect(nodeUnderTest.startDelay).toBe(1)
          done()
        })
    })

    it('should send a message with payload listen node', function (done) {
      testFlows.testInjectFlow[1].injectType = 'listen'
      helper.load([inputNode], testFlows.testInjectFlow, function () {
        const n2 = helper.getNode('n2ijf1')
        const n1 = helper.getNode('n1ijf1')
        n2.on('input', function (msg) {
          expect(msg.payload.value).toBe(12345)
          done()
        })
      })
    })

    it('should send a message with topic listen node', function (done) {
      testFlows.testInjectFlow[1].injectType = 'listen'
      helper.load([inputNode], testFlows.testInjectFlow, function () {
        const n2 = helper.getNode('n2ijf1')
        const n1 = helper.getNode('n1ijf1')
        n2.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicInject')
          done()
        })
      })
    })

    it('should send a message with types listen node', function (done) {
      testFlows.testInjectFlow[1].injectType = 'listen'
      helper.load([inputNode], testFlows.testInjectFlow, function () {
        const n2 = helper.getNode('n2ijf1')
        const n1 = helper.getNode('n1ijf1')
        n2.on('input', function (msg) {
          expect(msg.payload.nodetype).toBe('inject')
          expect(msg.payload.injectType).toBe('listen')
          done()
        })
      })
    })

    it('should load with basic settings write node', function (done) {
      helper.load([inputNode], testFlows.testUnitWriteInjectFlow,
        function () {
          let nodeUnderTest = helper.getNode('f93b472c.486038')
          expect(nodeUnderTest.name).toBe('TestName')
          expect(nodeUnderTest.injectType).toBe('write')
          expect(nodeUnderTest.payload).toBe('123456')
          expect(nodeUnderTest.topic).toBe('TestTopicInject')
          expect(nodeUnderTest.startDelay).toBe(1)
          done()
        })
    })

    it('should send a message with payload write node', function (done) {
      testFlows.testInjectFlow[1].injectType = 'write'
      helper.load([inputNode], testFlows.testInjectFlow, function () {
        const n2 = helper.getNode('n2ijf1')
        const n1 = helper.getNode('n1ijf1')
        n2.on('input', function (msg) {
          expect(msg.payload.value).toBe(12345)
          done()
        })
      })
    })

    it('should send a message with topic write node', function (done) {
      testFlows.testInjectFlow[1].injectType = 'write'
      helper.load([inputNode], testFlows.testInjectFlow, function () {
        const n2 = helper.getNode('n2ijf1')
        const n1 = helper.getNode('n1ijf1')
        n2.on('input', function (msg) {
          expect(msg.topic).toBe('TestTopicInject')
          done()
        })
      })
    })

    it('should send a message with types write node', function (done) {
      testFlows.testInjectFlow[1].injectType = 'write'
      helper.load([inputNode], testFlows.testInjectFlow, function () {
        const n2 = helper.getNode('n2ijf1')
        const n1 = helper.getNode('n1ijf1')
        n2.on('input', function (msg) {
          expect(msg.payload.nodetype).toBe('inject')
          expect(msg.payload.injectType).toBe('write')
          done()
        })
      })
    })

    it('should send a message with types and delay write node', function (done) {
      helper.load([inputNode], testFlows.testInjectWithDelayFlow, function () {
        const n2 = helper.getNode('n2ijf2')
        const n1 = helper.getNode('n1ijf2')
        n2.on('input', function (msg) {
          expect(msg.payload.nodetype).toBe('inject')
          expect(msg.payload.injectType).toBe('inject')
          done()
        })
      })
    })

    it('should send a message with types and long delay', function (done) {
      helper.load([inputNode], testFlows.testInjectWithLongDelayFlow, function () {
        const n2 = helper.getNode('n2ijf3')
        const n1 = helper.getNode('n1ijf3')
        n2.on('input', function (msg) {
          expect(msg.payload.nodetype).toBe('inject')
          expect(msg.payload.injectType).toBe('inject')
          done()
        })
      })
    })

    it('should send a messages at an interval of 2 seconds +-10ms ', function (done) {
      helper.load([inputNode], testFlows.testInjectWithIntervalFlow, function () {
        const n1 = helper.getNode('920deb27a882f242')
        let messages = []
        n1.on('input', function (msg) {
          messages.push(msg)

          if (messages.length >= 4) {
            let dif0 = messages[1].payload.value - messages[0].payload.value
            let dif1 = messages[2].payload.value - messages[1].payload.value
            let dif2 = messages[3].payload.value - messages[2].payload.value

            let difAverage = (dif0 + dif1 + dif2) / 3

            expect(difAverage).toBeGreaterThanOrEqual(1990)
            expect(difAverage).toBeLessThanOrEqual(2010)

            done()
          }

        })
      })
    })

    it('should send a message payload Date with invalid payloadType = null and empty payload', function (done) {
      const flow = Array.from(testFlows.testInjectFlow)
      flow[1].payload = ''
      flow[1].payloadType = null
      helper.load([inputNode], flow, function () {
        const n1 = helper.getNode('n2ijf1')
        n1.on('input', function (msg) {

          expect(msg.payload).toBeDefined()
          expect(msg.payload.value).toBeGreaterThan(1000000000000)
          expect(msg.payload.payloadType).toBe(null)
          done()
        })
      })
    })

    it('should fail on inject button request with wrong id', function (done) {
      helper.load([inputNode], testFlows.testInjectFlow, function () {
        helper.request()
          .get('/opcuaIIoT/inject/1')
          .expect(404)
          .end(done)
      })
    })

    // it('should success on inject button request', function (done) {
    //   helper.load([inputNode], testFlows.testInjectFlow, function () {
    //       helper.request()
    //         .post('/opcuaIIoT/inject/n1ijf1')
    //         .expect(200)
    //         .end(done)
    //   })
    // })
  })
})
