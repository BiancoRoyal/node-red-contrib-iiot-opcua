/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2022 DATATRONiQ GmbH (https://datatroniq.com)
 * Copyright (c) 2018 Klaus Landsdorf (http://bianco-royal.de/)
 * All rights reserved.
 * node-red-contrib-iiot-opcua
 *
 **/

'use strict'

jest.setTimeout(5000)

var inputNode = require('../src/opcua-iiot-flex-connector')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

describe('OPC UA Flex Connector node Unit Testing', function () {
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

  describe('Flex Connector node', function () {
    it('should be loaded without connector', function (done) {
      helper.load([inputNode], [ {
        'id': '14d54403.f94f04',
        'type': 'OPCUA-IIoT-Flex-Connector',
        'name': 'TestFlexConnector',
        'showStatusActivities': false,
        'showErrors': false,
        'connector': '',
        'wires': [[]]
      }],
      function () {
        let nodeUnderTest = helper.getNode('14d54403.f94f04')
        expect(nodeUnderTest).toBeDefined()
        expect(nodeUnderTest.name).toBe('TestFlexConnector')
        done()
      })
    })

    it('should be loaded without connector and showing activities', function (done) {
      helper.load([inputNode], [ {
        'id': '14d54403.f94f05',
        'type': 'OPCUA-IIoT-Flex-Connector',
        'name': 'TestFlexConnector2',
        'showStatusActivities': true,
        'showErrors': false,
        'connector': '',
        'wires': [[]]
      }],
      function () {
        let nodeUnderTest = helper.getNode('14d54403.f94f05')
        expect(nodeUnderTest).toBeDefined()
        expect(nodeUnderTest.name).toBe('TestFlexConnector2')
        done()
      })
    })
  })
})
