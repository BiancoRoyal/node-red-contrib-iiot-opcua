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

var assert = require('chai').assert
var inputNode = require('../src/opcua-iiot-discovery')
var helper = require('./helper.js')

var testFlowPayload = [
    {
      "id": "n1",
      "type": "OPCUA-IIoT-Discovery",
      "name": "TestName",
      "wires": [["n2"]]
    }
  ,
  {id:"n2", type:"helper"}
]

describe('OPC UA Discovery node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Discovery node', function () {
    it('should be loaded', function (done) {
      helper.load(
        [inputNode], testFlowPayload,
        function () {
          let nodeUnderTest = helper.getNode('n1')
          nodeUnderTest.should.have.property('type', 'OPCUA-IIoT-Discovery')
          nodeUnderTest.should.have.property('name', 'TestName')
          done()
        })
    })
  })
})
