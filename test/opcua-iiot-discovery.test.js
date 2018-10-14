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

jest.setTimeout(10000)

var inputNode = require('../src/opcua-iiot-discovery')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testDiscoveryFlow = [
  {
    'id': 'n1dsf1',
    'type': 'OPCUA-IIoT-Discovery',
    'name': 'TestName',
    'wires': [['n2dsf1']]
  },
  {id: 'n2dsf1', type: 'helper'}
]

describe('OPC UA Discovery node Unit Testing', function () {
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

  describe('Discovery node', function () {
    it('should be loaded', function (done) {
      helper.load(
        [inputNode], testDiscoveryFlow,
        function () {
          let nodeUnderTest = helper.getNode('n1dsf1')
          expect(nodeUnderTest.type).toBe('OPCUA-IIoT-Discovery')
          expect(nodeUnderTest.name).toBe('TestName')
          setTimeout(done, 3000)
        })
    })
  })
})
