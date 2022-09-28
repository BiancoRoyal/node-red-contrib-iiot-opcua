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

var serverNode = require('../../src/opcua-iiot-server')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testFlows = require('./flows/sever-flows')

describe('OPC UA Server node Unit Testing', function () {
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

  describe('Server node', function () {
    it('should be loaded with demo address-space', function (done) {
      helper.load(serverNode, testFlows.testServerWithDemoFlow,
        function () {
          let nodeUnderTest = helper.getNode('6ec4ef50.86dc1')
          // expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.on('server_running', () => {
            expect(nodeUnderTest.name).toBe('DEMOSERVER')
            expect(nodeUnderTest.maxAllowedSessionNumber).toBe(10)
            expect(nodeUnderTest.maxNodesPerRead).toBe(1000)
            expect(nodeUnderTest.maxNodesPerBrowse).toBe(2000)
            setTimeout(done, 3000)
          })
          // done()
        })
    })

    it('should be loaded with discovery and without demo address-space', function (done) {
      helper.load(serverNode, testFlows.testServerWithoutDemoFlow,
        function () {
          let nodeUnderTest = helper.getNode('6ec4ef50.86dc2')
          expect(nodeUnderTest).toBeDefined()
          nodeUnderTest.on('server_running', () => {
            expect(nodeUnderTest.name).toBe('DEMOSERVER')
            expect(nodeUnderTest.maxAllowedSessionNumber).toBe(10)
            expect(nodeUnderTest.maxNodesPerRead).toBe(1000)
            expect(nodeUnderTest.maxNodesPerBrowse).toBe(2000)
            setTimeout(done, 3000)
          })
          done()
        })
    })
  })
})
