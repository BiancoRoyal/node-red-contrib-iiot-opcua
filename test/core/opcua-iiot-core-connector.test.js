/*
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2017,2018,2019,2020,2021,2022 Klaus Landsdorf (https://bianco-royal.space/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

jest.setTimeout(5000)

let {default: coreConnector} = require('../../src/core/opcua-iiot-core-connector')
const events = require('events')

describe('OPC UA Core Connector', function () {
  describe('core functions', function () {
    it('should have IDLE state', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      expect(fsm.getMachineState()).toBe('IDLE')
      done()
    })

    it('should change to INIT state', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      expect(fsm.initopcua().getMachineState()).toBe('INITOPCUA')
      done()
    })

    it('should change to OPEN state', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      expect(fsm.initopcua().open().getMachineState()).toBe('OPEN')
      done()
    })

    it('should change to CLOSED state', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      expect(fsm.initopcua().open().close().getMachineState()).toBe('CLOSED')
      done()
    })

    it('should change to END state from OPEN', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      expect(fsm.initopcua().open().end().getMachineState()).toBe('END')
      done()
    })

    it('should change to END state from CLOSE', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      expect(fsm.initopcua().open().close().end().getMachineState()).toBe('END')
      done()
    })

    it('should change to END state from LOCKED', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      expect(fsm.initopcua().open().lock().end().getMachineState()).toBe('END')
      done()
    })

    it('should change to LOCKED state from INIT', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      expect(fsm.initopcua().lock().getMachineState()).toBe('LOCKED')
      done()
    })

    it('should change to LOCKED state from OPEN', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      expect(fsm.initopcua().open().lock().getMachineState()).toBe('LOCKED')
      done()
    })

    it('should change to LOCKED state from CLOSE', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      expect(fsm.initopcua().open().close().lock().getMachineState()).toBe('LOCKED')
      done()
    })

    it('should change to UNLOCKED state from CLOSE', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      expect(fsm.initopcua().open().close().lock().unlock().getMachineState()).toBe('UNLOCKED')
      done()
    })

    it('should change to INIT state from UNLOCKED', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      expect(fsm.initopcua().open().close().lock().unlock().idle().initopcua().getMachineState()).toBe('INITOPCUA')
      done()
    })

    it('should change to IDLE state from UNLOCKED', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      expect(fsm.initopcua().open().close().lock().unlock().idle().getMachineState()).toBe('IDLE')
      done()
    })

    it('should change to OPEN state from UNLOCKED', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      expect(fsm.initopcua().open().close().lock().unlock().open().getMachineState()).toBe('OPEN')
      done()
    })

    it('should change to LOCKED state on OPC UA event backoff', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      let node = { iiot: { opcuaClient: new events.EventEmitter(), stateMachine: fsm } }
      coreConnector.setListenerToClient(node)
      node.iiot.opcuaClient.emit('backoff')
      expect(fsm.getMachineState()).toBe('LOCKED')
      node.iiot.opcuaClient.removeAllListeners()
      done()
    })

    it('should change to UNLOCKED state on OPC UA event connection reestablished', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      let node = { iiot: { opcuaClient: new events.EventEmitter(), stateMachine: fsm } }
      coreConnector.setListenerToClient(node)
      fsm.lock()
      node.iiot.opcuaClient.emit('connection_reestablished')
      expect(fsm.getMachineState()).toBe('UNLOCKED')
      node.iiot.opcuaClient.removeAllListeners()
      done()
    })

    it('should change to LOCKED state on OPC UA event start reconnection', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      let node = { iiot: { opcuaClient: new events.EventEmitter(), stateMachine: fsm } }
      coreConnector.setListenerToClient(node)
      fsm.idle().initopcua().open()
      node.iiot.opcuaClient.emit('start_reconnection')
      expect(fsm.getMachineState()).toBe('LOCKED')
      node.iiot.opcuaClient.removeAllListeners()
      done()
    })

    it('should change to OPEN state on OPC UA event timed out request', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      let node = { iiot: { opcuaClient: new events.EventEmitter(), stateMachine: fsm } }
      coreConnector.setListenerToClient(node)
      fsm.idle().initopcua().open()
      node.iiot.opcuaClient.emit('timed_out_request')
      expect(fsm.getMachineState()).toBe('OPEN')
      node.iiot.opcuaClient.removeAllListeners()
      done()
    })

    it('should change to SESSIONACTIVE state on OPC UA event security token renewed', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      let node = { iiot: { opcuaClient: new events.EventEmitter(), stateMachine: fsm } }
      coreConnector.setListenerToClient(node)
      fsm.idle().initopcua().open().sessionrequest().sessionactive()
      node.iiot.opcuaClient.emit('security_token_renewed')
      expect(fsm.getMachineState()).toBe('SESSIONACTIVE')
      node.iiot.opcuaClient.removeAllListeners()
      done()
    })

    it('should change to UNLOCKED state on OPC UA event after reconnection', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      let node = new events.EventEmitter()
      node.iiot = coreConnector.initConnectorNode()
      node.iiot.opcuaClient = new events.EventEmitter()
      node.iiot.stateMachine = fsm
      coreConnector.setListenerToClient(node)
      fsm.idle().initopcua().open().sessionrequest().sessionactive().lock()
      node.iiot.opcuaClient.emit('after_reconnection')
      expect(fsm.getMachineState()).toBe('UNLOCKED')
      node.iiot.opcuaClient.removeAllListeners()
      done()
    })

    it('should be IDLE state on OPC UA log session parameter', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      let node = new events.EventEmitter()
      node.iiot = coreConnector.initConnectorNode()
      node.iiot.opcuaClient = new events.EventEmitter()
      node.endpoint = 'opc.tcp://localhost'
      node.iiot.opcuaSession = {
        name: 'name',
        sessionId: 1,
        authenticationToken: '23434cc34566',
        serverSignature: 'serverSignature',
        lastRequestSentTime: new Date(),
        lastResponseReceivedTime: new Date()
      }
      node.iiot.stateMachine = fsm
      coreConnector.logSessionInformation(node)
      expect(fsm.getMachineState()).toBe('IDLE')
      expect(node.iiot.opcuaSession.name).toBe('name')
      node.iiot.opcuaClient.removeAllListeners()
      done()
    })

    it('should handle OPC UA close event on State Lock', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      let node = new events.EventEmitter()
      node.iiot = coreConnector.initConnectorNode()
      node.iiot.opcuaClient = new events.EventEmitter()
      node.iiot.stateMachine = fsm
      node.iiot.isInactiveOnOPCUA = () => { return false }
      node.iiot.resetOPCUAConnection = () => { return true }
      coreConnector.setListenerToClient(node)
      fsm.lock()
      expect(fsm.getMachineState()).toBe('LOCKED')
      node.on('server_connection_close', () => {
        done()
      })
      node.iiot.opcuaClient.emit('close')
    })

    it('should handle OPC UA close event on State Stopped', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      let node = new events.EventEmitter()
      node.iiot = coreConnector.initConnectorNode()
      node.iiot.opcuaClient = new events.EventEmitter()
      node.iiot.stateMachine = fsm
      node.iiot.isInactiveOnOPCUA = () => { return true }
      node.iiot.resetOPCUAConnection = () => { return true }
      coreConnector.setListenerToClient(node)
      fsm.lock().stopopcua()
      expect(fsm.getMachineState()).toBe('STOPPED')
      node.on('server_connection_close', () => {
        node.iiot.opcuaClient.removeAllListeners()
        node.removeAllListeners()
        done()
      })
      node.iiot.opcuaClient.emit('close')
    })

    it('should handle OPC UA abort event on State Stopped', function (done) {
      let fsm = coreConnector.createConnectorStatelyMachine()
      let node = new events.EventEmitter()
      node.iiot = coreConnector.initConnectorNode()
      node.iiot.opcuaClient = new events.EventEmitter()
      node.iiot.stateMachine = fsm
      node.iiot.isInactiveOnOPCUA = () => { return true }
      node.iiot.resetOPCUAConnection = () => { return true }
      coreConnector.setListenerToClient(node)
      fsm.lock().stopopcua()
      expect(fsm.getMachineState()).toBe('STOPPED')
      node.on('server_connection_abort', () => {
        node.iiot.opcuaClient.removeAllListeners()
        node.removeAllListeners()
        done()
      })
      node.iiot.opcuaClient.emit('abort')
    })

    it('should handle no session on session information log', function (done) {
      let node = new events.EventEmitter()
      node.iiot = coreConnector.initConnectorNode()
      node.iiot.opcuaClient = null
      node.iiot.opcuaSession = null
      coreConnector.logSessionInformation(node)
      done()
    })
  })
})
