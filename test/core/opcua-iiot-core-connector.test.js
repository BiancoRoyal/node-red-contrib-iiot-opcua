/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

jest.setTimeout(5000)

let coreConnector = require('../../src/core/opcua-iiot-core-connector')
const events = require('events')

describe('OPC UA Core Connector', function () {
  describe('core functions', function () {
    it('should have IDLE state', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      expect(fsm.getMachineState()).toBe('IDLE')
      done()
    })

    it('should change to INIT state', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      expect(fsm.init().getMachineState()).toBe('INIT')
      done()
    })

    it('should change to OPEN state', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      expect(fsm.init().open().getMachineState()).toBe('OPEN')
      done()
    })

    it('should change to CLOSED state', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      expect(fsm.init().open().close().getMachineState()).toBe('CLOSED')
      done()
    })

    it('should change to END state from OPEN', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      expect(fsm.init().open().end().getMachineState()).toBe('END')
      done()
    })

    it('should change to END state from CLOSE', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      expect(fsm.init().open().close().end().getMachineState()).toBe('END')
      done()
    })

    it('should change to END state from LOCKED', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      expect(fsm.init().open().lock().end().getMachineState()).toBe('END')
      done()
    })

    it('should change to LOCKED state from INIT', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      expect(fsm.init().lock().getMachineState()).toBe('LOCKED')
      done()
    })

    it('should change to LOCKED state from OPEN', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      expect(fsm.init().open().lock().getMachineState()).toBe('LOCKED')
      done()
    })

    it('should change to LOCKED state from CLOSE', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      expect(fsm.init().open().close().lock().getMachineState()).toBe('LOCKED')
      done()
    })

    it('should change to UNLOCKED state from CLOSE', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      expect(fsm.init().open().close().lock().unlock().getMachineState()).toBe('UNLOCKED')
      done()
    })

    it('should change to INIT state from UNLOCKED', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      expect(fsm.init().open().close().lock().unlock().idle().init().getMachineState()).toBe('INIT')
      done()
    })

    it('should change to IDLE state from UNLOCKED', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      expect(fsm.init().open().close().lock().unlock().idle().getMachineState()).toBe('IDLE')
      done()
    })

    it('should change to OPEN state from UNLOCKED', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      expect(fsm.init().open().close().lock().unlock().open().getMachineState()).toBe('OPEN')
      done()
    })

    it('should change to LOCKED state on OPC UA event backoff', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      let node = { opcuaClient: new events.EventEmitter(), stateMachine: fsm }
      coreConnector.setListenerToClient(node)
      node.opcuaClient.emit('backoff')
      expect(fsm.getMachineState()).toBe('LOCKED')
      done()
    })

    it('should change to UNLOCKED state on OPC UA event connection reestablished', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      let node = { opcuaClient: new events.EventEmitter(), stateMachine: fsm }
      coreConnector.setListenerToClient(node)
      fsm.lock()
      node.opcuaClient.emit('connection_reestablished')
      expect(fsm.getMachineState()).toBe('UNLOCKED')
      done()
    })

    it('should change to LOCKED state on OPC UA event start reconnection', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      let node = { opcuaClient: new events.EventEmitter(), stateMachine: fsm }
      coreConnector.setListenerToClient(node)
      fsm.idle().init().open()
      node.opcuaClient.emit('start_reconnection')
      expect(fsm.getMachineState()).toBe('LOCKED')
      done()
    })

    it('should change to OPEN state on OPC UA event timed out request', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      let node = { opcuaClient: new events.EventEmitter(), stateMachine: fsm }
      coreConnector.setListenerToClient(node)
      fsm.idle().init().open()
      node.opcuaClient.emit('timed_out_request')
      expect(fsm.getMachineState()).toBe('OPEN')
      done()
    })

    it('should change to SESSIONACTIVE state on OPC UA event security token renewed', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      let node = { opcuaClient: new events.EventEmitter(), stateMachine: fsm }
      coreConnector.setListenerToClient(node)
      fsm.idle().init().open().sessionrequest().sessionactive()
      node.opcuaClient.emit('security_token_renewed')
      expect(fsm.getMachineState()).toBe('SESSIONACTIVE')
      done()
    })

    it('should change to UNLOCKED state on OPC UA event after reconnection', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      let node = new events.EventEmitter()
      node.opcuaClient = new events.EventEmitter()
      node.stateMachine = fsm
      coreConnector.setListenerToClient(node)
      fsm.idle().init().open().sessionrequest().sessionactive().lock()
      node.opcuaClient.emit('after_reconnection')
      expect(fsm.getMachineState()).toBe('UNLOCKED')
      done()
    })

    it('should be IDLE state on OPC UA log session parameter', function (done) {
      let fsm = coreConnector.createStatelyMachine()
      let node = new events.EventEmitter()
      node.opcuaClient = new events.EventEmitter()
      node.endpoint = 'opc.tcp://localhost'
      node.opcuaSession = {
        name: 'name',
        sessionId: 1,
        authenticationToken: '23434cc34566',
        serverSignature: 'serverSignature',
        lastRequestSentTime: new Date(),
        lastResponseReceivedTime: new Date()
      }
      node.stateMachine = fsm
      coreConnector.logSessionInformation(node)
      expect(fsm.getMachineState()).toBe('IDLE')
      expect(node.opcuaSession.name).toBe('name')
      done()
    })
  })
})
