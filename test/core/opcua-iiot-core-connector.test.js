/*
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

// jest.setTimeout(30000)

let { default: coreConnector } = require('../../src/core/opcua-iiot-core-connector')
const events = require('events')
const { FsmConnectorStates } = require('../../src/core/opcua-iiot-core')

let testingOpcUaPort = 0

describe('OPC UA Core Connector', function () {

  beforeAll(() => {
    testingOpcUaPort = 50620
  })

  describe('core functions', function () {
    it('should have IDLE state', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      expect(service.state.value).toBe(FsmConnectorStates.StateIdle)
      done()
    })

    it('should change to INIT state', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      service.send('INITOPCUA')
      expect(service.state.value).toBe(FsmConnectorStates.StateInit)
      done()
    })

    it('should change to OPEN state', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      service.send('INITOPCUA')
      service.send('OPEN')
      expect(service.state.value).toBe(FsmConnectorStates.StateOpened)
      done()
    })

    it('should change to CLOSED state', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      service.send('LOCK')
      service.send('CLOSE')
      expect(service.state.value).toBe(FsmConnectorStates.StateClosed)
      done()
    })

    it('should change to END state from OPEN', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      service.send('OPEN')
      service.send('END')
      expect(service.state.value).toBe(FsmConnectorStates.StateEnd)
      done()
    })

    it('should change to END state from CLOSE', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      service.send('OPEN')
      service.send('CLOSE')
      service.send('END')
      expect(service.state.value).toBe(FsmConnectorStates.StateEnd)
      done()
    })

    it('should change to END state from LOCKED', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      service.send('INIT')
      service.send('OPEN')
      service.send('LOCK')
      service.send('END')
      expect(service.state.value).toBe(FsmConnectorStates.StateEnd)
      done()
    })

    it('should change to LOCKED state from INIT', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      service.send('INIT')
      service.send('LOCK')
      expect(service.state.value).toBe(FsmConnectorStates.StateLocked)
      done()
    })

    it('should change to LOCKED state from OPEN', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      service.send('OPEN')
      service.send('LOCK')
      expect(service.state.value).toBe(FsmConnectorStates.StateLocked)
      done()
    })

    it('should change to LOCKED state from CLOSE', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      service.send('OPEN')
      service.send('CLOSE')
      service.send('LOCK')
      expect(service.state.value).toBe(FsmConnectorStates.StateLocked)
      done()
    })

    it('should change to UNLOCKED state from CLOSE', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      service.send('OPEN')
      service.send('CLOSE')
      service.send('LOCK')
      service.send('UNLOCK')
      expect(service.state.value).toBe(FsmConnectorStates.StateUnlocked)
      done()
    })

    it('should change to INIT state from UNLOCKED', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      service.send('INITOPCUA')
      service.send('OPEN')
      service.send('CLOSE')
      service.send('LOCK')
      service.send('UNLOCK')
      service.send('IDLE')
      service.send('INITOPCUA')
      expect(service.state.value).toBe(FsmConnectorStates.StateInit)
      done()
    })

    it('should change to IDLE state from UNLOCKED', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      service.send('INITOPCUA')
      service.send('OPEN')
      service.send('CLOSE')
      service.send('LOCK')
      service.send('UNLOCK')
      service.send('IDLE')
      expect(service.state.value).toBe(FsmConnectorStates.StateIdle)
      done()
    })

    it('should change to OPEN state from UNLOCKED', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      service.send('INITOPCUA')
      service.send('OPEN')
      service.send('CLOSE')
      service.send('LOCK')
      service.send('UNLOCK')
      service.send('OPEN')
      expect(service.state.value).toBe(FsmConnectorStates.StateOpened)
      done()
    })

    it('should change to LOCKED state on OPC UA event backoff', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      let node = { iiot: { opcuaClient: new events.EventEmitter(), stateMachine: fsm, stateService: service } }
      coreConnector.setListenerToClient(node)
      node.iiot.opcuaClient.emit('backoff')
      expect(service.state.value).toBe(FsmConnectorStates.StateLocked)
      node.iiot.opcuaClient.removeAllListeners()
      done()
    })

    it('should change to UNLOCKED state on OPC UA event connection reestablished', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      let node = { iiot: { opcuaClient: new events.EventEmitter(), stateMachine: fsm, stateService: service } }
      coreConnector.setListenerToClient(node)
      service.send('LOCK')
      node.iiot.opcuaClient.emit('connection_reestablished')
      expect(service.state.value).toBe(FsmConnectorStates.StateUnlocked)
      node.iiot.opcuaClient.removeAllListeners()
      done()
    })

    it('should change to LOCKED state on OPC UA event start reconnection', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      let node = { iiot: { opcuaClient: new events.EventEmitter(), stateMachine: fsm, stateService: service } }
      coreConnector.setListenerToClient(node)
      service.send('IDLE')
      service.send('INITOPCUA')
      service.send('OPEN')
      node.iiot.opcuaClient.emit('start_reconnection')
      expect(service.state.value).toBe(FsmConnectorStates.StateLocked)
      node.iiot.opcuaClient.removeAllListeners()
      done()
    })

    it('should change to OPEN state on OPC UA event timed out request', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      let node = { iiot: { opcuaClient: new events.EventEmitter(), stateMachine: fsm, stateService: service } }
      coreConnector.setListenerToClient(node)
      service.send('IDLE')
      service.send('INITOPCUA')
      service.send('OPEN')
      node.iiot.opcuaClient.emit('timed_out_request')
      expect(service.state.value).toBe(FsmConnectorStates.StateOpened)
      node.iiot.opcuaClient.removeAllListeners()
      done()
    })

    it('should change to SESSIONACTIVE state on OPC UA event security token renewed', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      let node = { iiot: { opcuaClient: new events.EventEmitter(), stateMachine: fsm, stateService: service } }
      coreConnector.setListenerToClient(node)
      service.send('IDLE')
      service.send('INITOPCUA')
      service.send('OPEN')
      service.send('SESSIONREQUEST')
      service.send('SESSIONACTIVATE')
      node.iiot.opcuaClient.emit('security_token_renewed')
      expect(service.state.value).toBe(FsmConnectorStates.StateSessionActive)
      node.iiot.opcuaClient.removeAllListeners()
      done()
    })

    it('should change to UNLOCKED state on OPC UA event after reconnection', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      let node = new events.EventEmitter()
      node.iiot = coreConnector.initConnectorNode()
      node.iiot.opcuaClient = new events.EventEmitter()
      node.iiot.stateMachine = fsm
      node.iiot.stateService = service
      coreConnector.setListenerToClient(node)
      service.send('IDLE')
      service.send('INITOPCUA')
      service.send('OPEN')
      service.send('SESSIONREQUEST')
      service.send('SESSIONACTIVATE')
      service.send('LOCK')
      node.iiot.opcuaClient.emit('after_reconnection')
      expect(service.state.value).toBe(FsmConnectorStates.StateUnlocked)
      node.iiot.opcuaClient.removeAllListeners()
      done()
    })

    it('should be IDLE state on OPC UA log session parameter', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
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
      node.iiot.stateService = service
      coreConnector.logSessionInformation(node)
      expect(service.state.value).toBe(FsmConnectorStates.StateIdle)
      expect(node.iiot.opcuaSession.name).toBe('name')
      node.iiot.opcuaClient.removeAllListeners()
      done()
    })

    it('should handle OPC UA close event on State Lock', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      let node = new events.EventEmitter()
      node.iiot = coreConnector.initConnectorNode()
      node.iiot.opcuaClient = new events.EventEmitter()
      node.iiot.stateMachine = fsm
      node.iiot.stateService = service
      node.iiot.isInactiveOnOPCUA = () => { return false }
      node.iiot.resetOPCUAConnection = () => { return true }
      coreConnector.setListenerToClient(node)
      service.send('LOCK')
      expect(service.state.value).toBe(FsmConnectorStates.StateLocked)
      node.on('server_connection_close', () => {
        done()
      })
      node.iiot.opcuaClient.emit('close')
    })

    it('should handle OPC UA close event on State Stopped', function (done) {
      let fsm = coreConnector.createConnectorFinalStateMachine()
      let service = coreConnector.startConnectorMachineService(fsm)
      let node = new events.EventEmitter()
      node.iiot = coreConnector.initConnectorNode()
      node.iiot.opcuaClient = new events.EventEmitter()
      node.iiot.stateMachine = fsm
      node.iiot.stateService = service
      node.iiot.isInactiveOnOPCUA = () => { return true }
      node.iiot.resetOPCUAConnection = () => { return true }
      coreConnector.setListenerToClient(node)
      service.send('LOCK')
      service.send('STOP')
      expect(service.state.value).toBe(FsmConnectorStates.StateStopped)
      node.on('server_connection_close', () => {
        node.iiot.opcuaClient.removeAllListeners()
        node.removeAllListeners()
        done()
      })
      node.iiot.opcuaClient.emit('close')
    })

    it('should handle OPC UA abort event on State Stopped', function (done) {
      let node = new events.EventEmitter()
      node.iiot = coreConnector.initConnectorNode()
      node.iiot.opcuaClient = new events.EventEmitter()
      node.iiot.stateMachine = coreConnector.createConnectorFinalStateMachine()
      node.iiot.stateService = coreConnector.startConnectorMachineService(node.iiot.stateMachine)
      node.iiot.isInactiveOnOPCUA = () => { return true }
      node.iiot.resetOPCUAConnection = () => { return true }
      coreConnector.setListenerToClient(node)
      node.iiot.stateService.send('LOCK')
      node.iiot.stateService.send('STOP')
      expect(node.iiot.stateService.state.value).toBe(FsmConnectorStates.StateStopped)
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
