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

jest.setTimeout(3000)

var injectNode = require('node-red/nodes/core/core/20-inject')
var functionNode = require('node-red/nodes/core/core/80-function')
var serverAsoNode = require('../src/opcua-iiot-server-aso')

var serverAsoFlowNodes = [injectNode, functionNode, serverAsoNode]

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

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

describe('Address Space Operation node Unit Testing', function () {
  it('should be loaded', function (done) {
    helper.load(serverAsoFlowNodes, [
      {
        'id': '7cb85115.7635',
        'type': 'OPCUA-IIoT-Server-ASO',
        'nodeId': 'ns=1;s=TestVariables',
        'browsename': 'TestVariables',
        'displayname': 'Test Variables',
        'objecttype': 'FolderType',
        'datatype': 'Double',
        'value': '1.0',
        'referenceNodeId': 'ns=0;i=85',
        'referencetype': 'Organizes',
        'name': 'Folder'
      }
    ],
    function () {
      let nodeUnderTest = helper.getNode('7cb85115.7635')
      expect(nodeUnderTest.name).toBe('Folder')
      expect(nodeUnderTest.nodeId.toString()).toBe('ns=1;s=TestVariables')
      expect(nodeUnderTest.datatype).toBe('Double')
      expect(nodeUnderTest.value).toBe('1.0')
      expect(nodeUnderTest.browsename).toBe('TestVariables')
      expect(nodeUnderTest.displayname).toBe('Test Variables')
      done()
    })
  })
})
