/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

let assert = require('chai').assert
let expect = require('chai').expect
let coreConnector= require('../../src/core/opcua-iiot-core-connector')

describe('OPC UA Core Connector', function () {
  describe('core functions', function () {
    it('should have INIT state', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      assert.equal(fsm.getMachineState(), 'INIT')
      done()
    })

    it('should change to OPEN state', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      assert.equal(fsm.open().getMachineState(), 'OPEN')
      done()
    })

    it('should change to CLOSED state', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      assert.equal(fsm.open().close().getMachineState(), 'CLOSED')
      done()
    })

    it('should change to END state from OPEN', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      assert.equal(fsm.open().end().getMachineState(), 'END')
      done()
    })

    it('should change to END state from CLOSE', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      assert.equal(fsm.open().close().end().getMachineState(), 'END')
      done()
    })

    it('should change to END state from LOCKED', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      assert.equal(fsm.open().lock().end().getMachineState(), 'END')
      done()
    })

    it('should change to LOCKED state from INIT', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      assert.equal(fsm.lock().getMachineState(), 'LOCKED')
      done()
    })

    it('should change to LOCKED state from OPEN', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      assert.equal(fsm.open().lock().getMachineState(), 'LOCKED')
      done()
    })

    it('should change to LOCKED state from CLOSE', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      assert.equal(fsm.open().close().lock().getMachineState(), 'LOCKED')
      done()
    })

    it('should change to UNLOCKED state from CLOSE', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      assert.equal(fsm.open().close().lock().unlock().getMachineState(), 'UNLOCKED')
      done()
    })

    it('should change to INIT state from UNLOCKED', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      assert.equal(fsm.open().close().lock().unlock().init().getMachineState(), 'INIT')
      done()
    })

    it('should change to OPEN state from UNLOCKED', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      assert.equal(fsm.open().close().lock().unlock().open().getMachineState(), 'OPEN')
      done()
    })
  })
})
