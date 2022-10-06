/**
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */

'use strict'
// SOURCE-MAP-REQUIRED

import * as core from './opcua-iiot-core'
// @ts-ignore
import * as Stately from 'stately.js'
import {TodoTypeAny} from "../types/placeholders";
import {ClientSession, OPCUAClient, OPCUADiscoveryServer, UserIdentityInfo} from "node-opcua";
import {OPCUAClientOptions} from "node-opcua-client/dist/opcua_client";
import {Node} from "node-red";
import {createMachine, interpret, StateMachine} from "@xstate/fsm";
import Service = StateMachine.Service;

export type ConnectorIIoT = {
  endpoints: string[],
  opcuaClient?: OPCUAClient
  opcuaSession?: ClientSession
  discoveryServer?: OPCUADiscoveryServer
  serverCertificate?: string
  discoveryServerEndpointUrl?: string
  hasOpcUaSubscriptions: boolean
  userIdentity?: UserIdentityInfo
  //stateMachine?: Stately.machine
  stateMachine?: TodoTypeAny
  stateService?: TodoTypeAny
  stateSubscription?: TodoTypeAny
  opcuaClientOptions?: OPCUAClientOptions
  registeredNodeList?: Record<string, Node>
  functions?: Record<string, (...args: TodoTypeAny) => TodoTypeAny>
  sessionNodeRequests: number
}

export {Stately}

export namespace logger {
  export const internalDebugLog = core.Debug('opcuaIIoT:connector')
  export const detailDebugLog = core.Debug('opcuaIIoT:connector:details')
  export const libDebugLog = core.Debug('opcuaIIoT:connector:nodeopcua')
}

// sets values within node.iiot (refactored to node.iiot)
const initConnectorNode = (): ConnectorIIoT => {
  return {
    ...core.initCoreNode(),
    sessionNodeRequests: 0,
    endpoints: [],
    userIdentity: undefined,
    opcuaClient: undefined,
    opcuaSession: undefined,
    discoveryServer: undefined,
    serverCertificate: undefined,
    discoveryServerEndpointUrl: undefined,
    hasOpcUaSubscriptions: false,
  }

}
/*
export type CoreMachineStates =
  'IDLE' |
  'INITOPCUA' |
  'OPEN' |
  'SESSIONREQUESTED' |
  'SESSIONACTIVE' |
  'SESSIONRESTART' |
  'SESSIONCLOSED' |
  'CLOSED' |
  'LOCKED' |
  'UNLOCKED' |
  'RECONFIGURED' |
  'RENEW' |
  'STOPPED' |
  'END';

 */

// export type CoreStateMachine = Record<CoreMachineStates, Record<string, CoreMachineStates>>

/*
// TODO: @xstate/fsm is a good package to replace it. See: modbus contribution package core client
// many functions are now available and working well in node-opcua and maybe it needs less control from our package
function createConnectorStatelyMachine() {
  const stateMachine: Stately.stateMachine = Stately.machine({
    'IDLE': {
      'initopcua': 'INITOPCUA',
      'lock': 'LOCKED',
      'end': 'END'
    },
    'INITOPCUA': {
      'open': 'OPEN',
      'close': 'CLOSED',
      'lock': 'LOCKED',
      'end': 'END'
    },
    'OPEN': {
      'sessionrequest': 'SESSIONREQUESTED',
      'close': 'CLOSED',
      'lock': 'LOCKED',
      'end': 'END'
    },
    'SESSIONREQUESTED': {
      'open': 'OPEN',
      'sessionactive': 'SESSIONACTIVE',
      'lock': 'LOCKED',
      'end': 'END'
    },
    'SESSIONACTIVE': {
      'open': 'OPEN',
      'sessionclose': 'SESSIONCLOSED',
      'lock': 'LOCKED',
      'end': 'END'
    },
    'SESSIONRESTART': {
      'idle': 'IDLE',
      'open': 'OPEN',
      'sessionclose': 'SESSIONCLOSED',
      'close': 'CLOSED',
      'lock': 'LOCKED',
      'end': 'END'
    },
    'SESSIONCLOSED': {
      'idle': 'IDLE',
      'open': 'OPEN',
      'close': 'CLOSED',
      'sessionrestart': 'SESSIONRESTART',
      'lock': 'LOCKED',
      'unlock': 'UNLOCKED',
      'end': 'END'
    },
    'CLOSED': {
      'open': 'OPEN',
      'lock': 'LOCKED',
      'unlock': 'UNLOCKED',
      'end': 'END',
      'idle': 'IDLE'
    },
    'LOCKED': {
      'sessionclose': 'SESSIONCLOSED',
      'open': 'OPEN',
      'close': 'CLOSED',
      'unlock': 'UNLOCKED',
      'lock': 'LOCKED',
      'sessionrestart': 'SESSIONRESTART',
      'reconfigure': 'RECONFIGURED',
      'stopopcua': 'STOPPED',
      'renew': 'RENEW',
      'end': 'END'
    },
    'UNLOCKED': {
      'idle': 'IDLE',
      'lock': 'LOCKED',
      'open': 'OPEN',
      'end': 'END'
    },
    'RECONFIGURED': {},
    'RENEW': {},
    'STOPPED': {},
    'END': {}
  }, 'IDLE')
  logger.internalDebugLog('Start FSM: ' + stateMachine.getMachineState())
  logger.detailDebugLog('FSM events:' + stateMachine.getMachineEvents())
  return stateMachine
}
 */

interface ConnectorTestContext {
  debugContext?: string
}

type ConnectorEvent =
    | { type: 'INITOPCUA' }
    | { type: 'SESSIONACTIVATE'}
    | { type: 'SESSIONRESTART'}
    | { type: 'SESSIONCLOSE'}
    | { type: 'SESSIONREQUEST'}
    | { type: 'IDLE'}
    | { type: 'LOCK'}
    | { type: 'UNLOCK'}
    | { type: 'END'}
    | { type: 'CLOSE'}
    | { type: 'OPEN'}
    | { type: 'STOP'}
    | { type: 'RESTART'}
    | { type: 'RENEW'}
    | { type: 'RECONFIGURE'};

type ConnectorState =
    | { value: 'idle'; context: ConnectorTestContext & { testString: undefined } }
    | { value: 'init'; context: ConnectorTestContext & { testString: undefined } }
    | { value: 'opened'; context: ConnectorTestContext & { testString: undefined } }
    | { value: 'sessionRequested'; context: ConnectorTestContext & { testString: undefined } }
    | { value: 'sessionActive'; context: ConnectorTestContext & { testString: undefined } }
    | { value: 'sessionClosed'; context: ConnectorTestContext & { testString: undefined } }
    | { value: 'sessionRestart'; context: ConnectorTestContext & { testString: undefined } }
    | { value: 'closed'; context: ConnectorTestContext & { testString: undefined } }
    | { value: 'locked'; context: ConnectorTestContext & { testString: undefined } }
    | { value: 'unlocked'; context: ConnectorTestContext & { testString: undefined } }
    | { value: 'stopped'; context: ConnectorTestContext & { testString: undefined } }
    | { value: 'end'; context: ConnectorTestContext & { testString: undefined } }
    | { value: 'reconfigured'; context: ConnectorTestContext  & { testString: undefined }}
    | { value: 'renewed'; context: ConnectorTestContext & { testString: undefined } };

export enum fsmConnectorStates {
  StateIdle = 'idle',
  StateInit = 'init',
  StateOpened = 'opened',
  StateSessionRequested = 'sessionRequested',
  StateSessionActive = 'sessionActive',
  StateSessionClosed = 'sessionClosed',
  StateSessionRestart = 'sessionRestart',
  StateClosed = 'closed',
  StateLocked = 'locked',
  StateUnlocked = 'unlocked',
  StateStopped = 'stopped',
  StateEnd = 'end',
  StateReconfigured = 'reconfigured',
  StateRenewed = 'renewed',
}

const createConnectorFinalStateMachine = function () {
  return createMachine<ConnectorTestContext, ConnectorEvent, ConnectorState>({
    id: 'connector',
    initial: 'idle',
    states:{
      idle: { on: {
          INITOPCUA: 'init',
          LOCK: 'locked',
          END: 'end'
        }
      },
      init: { on: {
          OPEN: 'opened',
          CLOSE: 'closed',
          LOCK: 'locked',
          END: 'end'
        }
      },
      opened: { on: {
          SESSIONREQUEST: 'sessionRequested',
          CLOSE: 'closed',
          LOCK: 'locked',
          END: 'end'
        }
      },
      sessionRequested: { on: {
          OPEN: 'opened',
          SESSIONACTIVATE: 'sessionActive',
          LOCK: 'locked',
          END: 'end'
        }
      },
      sessionActive: { on: {
          OPEN: 'opened',
          SESSIONCLOSE: 'sessionClosed',
          LOCK: 'locked',
          END: 'end'
        }
      },
      sessionClosed: { on: {
          IDLE: 'idle',
          OPEN: 'opened',
          CLOSE: 'closed',
          SESSIONRESTART: 'sessionRestart',
          LOCK: 'locked',
          UNLOCK: 'unlocked',
          END: 'end'
        }
      },
      sessionRestart: { on: {
          IDLE: 'idle',
          SESSIONCLOSE: 'sessionClosed',
          OPEN: 'opened',
          CLOSE: 'closed',
          LOCK: 'locked',
          END: 'end'
        }
      },
      closed: { on: {
          OPEN: 'opened',
          LOCK: 'locked',
          UNLOCK: 'unlocked',
          END: 'end',
          IDLE: 'idle'
        }
      },
      locked: { on: {
          SESSIONCLOSE: 'sessionClosed',
          OPEN: 'opened',
          CLOSE: 'closed',
          LOCK: 'locked',
          UNLOCK: 'unlocked',
          SESSIONRESTART: 'sessionRestart',
          RECONFIGURE: 'reconfigured',
          STOP: 'stopped',
          RENEW: 'renewed',
          END: 'end'
        }
      },
      unlocked: { on: {
          IDLE: 'idle',
          OPEN: 'opened',
          END: 'end',
          LOCK: 'locked'
        }
      },
      stopped: { on: {}},
      end: { on: {}},
      reconfigured: { on: {}},
      renewed: { on: {}}
    }
  })
}

const startConnectorMachineService = (toggleMachine: any) => {
  return interpret(toggleMachine).start()
}

const subscribeConnectorFSMService = (service: TodoTypeAny, eventFn: (state: any) => void) => {
  if(service === undefined || eventFn === undefined) throw new Error('Service or event handler missing')

  return service.subscribe(eventFn)
}

function setListenerToClient(node: TodoTypeAny) {

  if (!node.iiot.opcuaClient) {
    logger.internalDebugLog('Client Not Valid On Setting Events To Client')
    if (node.showErrors) {
      node.error(new Error('Client Not Valid To Set Event Listeners'), {payload: 'No Client To Set Event Listeners'})
    }
    return
  }

  node.iiot.opcuaClient.on('close', function (err: Error) {
    if (err) {
      logger.internalDebugLog('Connection Error On Close ' + err)
    }

    if (node.iiot.isInactiveOnOPCUA()) {
      logger.detailDebugLog('Connector Not Active On OPC UA Close Event')
    } else {
      node.iiot.resetOPCUAConnection('Connector To Server Close')
    }

    logger.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION CLOSED !!!!!!!!!!!!!!!!!!!')
    logger.internalDebugLog('CONNECTION CLOSED: ' + node.endpoint)
    node.emit('server_connection_close')
  })

  node.iiot.opcuaClient.on('backoff', function (number: number, delay: number) {
    logger.internalDebugLog('!!! CONNECTION FAILED (backoff) FOR #', number, ' retrying ', delay / 1000.0, ' sec. !!!')
    logger.internalDebugLog('CONNECTION FAILED: ' + node.endpoint)
    node.iiot.stateMachine.lock()
  })

  node.iiot.opcuaClient.on('abort', function () {
    logger.internalDebugLog('!!! Abort backoff !!!')
    logger.internalDebugLog('CONNECTION BROKEN: ' + node.endpoint)

    if (node.iiot.isInactiveOnOPCUA()) {
      logger.detailDebugLog('Connector Not Active On OPC UA Backoff Abort Event')
    } else {
      node.iiot.resetOPCUAConnection('Connector To Server Backoff Abort')
    }

    node.emit('server_connection_abort')
  })

  node.iiot.opcuaClient.on('connection_lost', function () {
    logger.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION LOST !!!!!!!!!!!!!!!!!!!')
    logger.internalDebugLog('CONNECTION LOST: ' + node.endpoint)
    node.iiot.stateMachine.lock()
    node.emit('server_connection_lost')
  })

  node.iiot.opcuaClient.on('connection_reestablished', function () {
    logger.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION RE-ESTABLISHED !!!!!!!!!!!!!!!!!!!')
    logger.internalDebugLog('CONNECTION RE-ESTABLISHED: ' + node.endpoint)
    node.iiot.stateMachine.unlock()
  })

  node.iiot.opcuaClient.on('start_reconnection', function () {
    logger.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT STARTING RECONNECTION !!!!!!!!!!!!!!!!!!!')
    logger.internalDebugLog('CONNECTION STARTING RECONNECTION: ' + node.endpoint)
    node.iiot.stateMachine.lock()
  })

  node.iiot.opcuaClient.on('timed_out_request', function () {
    logger.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!! CLIENT TIMED OUT REQUEST !!!!!!!!!!!!!!!!!!!')
    logger.internalDebugLog('CONNECTION TIMED OUT REQUEST: ' + node.endpoint)
  })

  node.iiot.opcuaClient.on('security_token_renewed', function () {
    logger.detailDebugLog('!!!!!!!!!!!!!!!!!!!!!!!! CLIENT SECURITY TOKEN RENEWED !!!!!!!!!!!!!!!!!!!')
    logger.detailDebugLog('CONNECTION SECURITY TOKEN RENEWE: ' + node.endpoint)
  })

  node.iiot.opcuaClient.on('after_reconnection', function () {
    logger.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!      CLIENT RECONNECTED     !!!!!!!!!!!!!!!!!!!')
    logger.internalDebugLog('CONNECTION RECONNECTED: ' + node.endpoint)
    node.emit('after_reconnection', node.iiot.opcuaClient)
    node.iiot.stateMachine.unlock()
  })
}

function logSessionInformation(node: TodoTypeAny) {
  if (!node.iiot?.opcuaSession) {
    logger.detailDebugLog('Session Not Valid To Log Information')
    return
  }

  logger.internalDebugLog('Session ' + node.iiot.opcuaSession.name + ' Id: ' + node.iiot.opcuaSession.sessionId + ' Started On ' + node.endpoint)
  logger.detailDebugLog('name :' + node.iiot.opcuaSession.name)
  logger.detailDebugLog('sessionId :' + node.iiot.opcuaSession.sessionId)
  logger.detailDebugLog('authenticationToken :' + node.iiot.opcuaSession.authenticationToken)
  logger.internalDebugLog('timeout :' + node.iiot.opcuaSession.timeout)

  if (node.iiot.opcuaSession.serverNonce) {
    logger.detailDebugLog('serverNonce :' + node.iiot.opcuaSession.serverNonce ? node.iiot.opcuaSession.serverNonce.toString('hex') : 'none')
  }

  if (node.iiot.opcuaSession.serverCertificate) {
    logger.detailDebugLog('serverCertificate :' + node.iiot.opcuaSession.serverCertificate ? node.iiot.opcuaSession.serverCertificate.toString('base64') : 'none')
  } else {
    logger.detailDebugLog('serverCertificate : None')
  }

  logger.detailDebugLog('serverSignature :' + node.iiot.opcuaSession.serverSignature ? node.iiot.opcuaSession.serverSignature : 'none')

  if (node.iiot.opcuaSession.lastRequestSentTime) {
    logger.detailDebugLog('lastRequestSentTime : ' + node.iiot.opcuaSession.lastRequestSentTime)
    logger.internalDebugLog('lastRequestSentTime converted :' + node.iiot.opcuaSession.lastRequestSentTime ? new Date(node.iiot.opcuaSession.lastRequestSentTime).toISOString() : 'none')
  }

  if (node.iiot.opcuaSession.lastResponseReceivedTime) {
    logger.detailDebugLog('lastResponseReceivedTime : ' + node.iiot.opcuaSession.lastResponseReceivedTime)
    logger.internalDebugLog('lastResponseReceivedTime converted :' + node.iiot.opcuaSession.lastResponseReceivedTime ? new Date(node.iiot.opcuaSession.lastResponseReceivedTime).toISOString() : 'none')
  }
}

function checkEndpoint(endpoint: string, errorHandler: (err: Error) => void) {
  if (endpoint && endpoint.includes('opc.tcp://')) {
    return true
  } else {
    logger.internalDebugLog('Endpoint Not Valid -> ' + endpoint)
    errorHandler(new Error('endpoint does not include opc.tcp://'))
    return false
  }
}

const coreConnector = {
  initConnectorNode,
  //createConnectorStatelyMachine,
  createConnectorFinalStateMachine,
  startConnectorMachineService,
  subscribeConnectorFSMService,
  setListenerToClient,
  logSessionInformation,
  checkEndpoint,
  internalDebugLog: logger.internalDebugLog
}

export default coreConnector
