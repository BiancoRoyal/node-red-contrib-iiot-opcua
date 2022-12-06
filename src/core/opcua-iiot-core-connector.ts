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
import {TodoTypeAny} from "../types/placeholders";
import {ClientSession, OPCUAClient, OPCUADiscoveryServer, UserIdentityInfo} from "node-opcua";
import {OPCUAClientOptions} from "node-opcua-client/dist/opcua_client";
import {Node} from "node-red";
import {createMachine, interpret} from "@xstate/fsm";
import {ConnectorIIoT, FsmConnectorStates} from "./opcua-iiot-core";

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
    | { value: FsmConnectorStates.StateIdle; context: ConnectorTestContext & { debugContext: undefined } }
    | { value: FsmConnectorStates.StateInit; context: ConnectorTestContext & { debugContext: undefined } }
    | { value: FsmConnectorStates.StateOpened; context: ConnectorTestContext & { debugContext: undefined } }
    | { value: FsmConnectorStates.StateSessionRequested; context: ConnectorTestContext & { debugContext: undefined } }
    | { value: FsmConnectorStates.StateSessionActive; context: ConnectorTestContext & { debugContext: undefined } }
    | { value: FsmConnectorStates.StateSessionClosed; context: ConnectorTestContext & { debugContext: undefined } }
    | { value: FsmConnectorStates.StateSessionRestart; context: ConnectorTestContext & { debugContext: undefined } }
    | { value: FsmConnectorStates.StateClosed; context: ConnectorTestContext & { debugContext: undefined } }
    | { value: FsmConnectorStates.StateLocked; context: ConnectorTestContext & { debugContext: undefined } }
    | { value: FsmConnectorStates.StateUnlocked; context: ConnectorTestContext & { debugContext: undefined } }
    | { value: FsmConnectorStates.StateStopped; context: ConnectorTestContext & { debugContext: undefined } }
    | { value: FsmConnectorStates.StateEnd; context: ConnectorTestContext & { debugContext: undefined } }
    | { value: FsmConnectorStates.StateReconfigured; context: ConnectorTestContext  & { debugContext: undefined }}
    | { value: FsmConnectorStates.StateRenewed; context: ConnectorTestContext & { debugContext: undefined } };

const createConnectorFinalStateMachine = function () {
  return createMachine<ConnectorTestContext, ConnectorEvent, ConnectorState>({
    id: 'connector',
    initial: FsmConnectorStates.StateIdle,
    states:{
      idle: { on: {
          INITOPCUA: FsmConnectorStates.StateInit,
          LOCK: FsmConnectorStates.StateLocked,
          END: FsmConnectorStates.StateEnd
        }
      },
      init: { on: {
          OPEN: FsmConnectorStates.StateOpened,
          CLOSE: FsmConnectorStates.StateClosed,
          LOCK: FsmConnectorStates.StateLocked,
          END: FsmConnectorStates.StateEnd
        }
      },
      opened: { on: {
          SESSIONREQUEST: FsmConnectorStates.StateSessionRequested,
          CLOSE: FsmConnectorStates.StateClosed,
          LOCK: FsmConnectorStates.StateLocked,
          END: FsmConnectorStates.StateEnd
        }
      },
      sessionRequested: { on: {
          OPEN: FsmConnectorStates.StateOpened,
          SESSIONACTIVATE: FsmConnectorStates.StateSessionActive,
          LOCK: FsmConnectorStates.StateLocked,
          END: FsmConnectorStates.StateEnd
        }
      },
      sessionActive: { on: {
          OPEN: FsmConnectorStates.StateOpened,
          SESSIONCLOSE: FsmConnectorStates.StateClosed,
          LOCK: FsmConnectorStates.StateLocked,
          END: FsmConnectorStates.StateEnd
        }
      },
      sessionClosed: { on: {
          IDLE: FsmConnectorStates.StateIdle,
          OPEN: FsmConnectorStates.StateOpened,
          CLOSE: FsmConnectorStates.StateClosed,
          SESSIONRESTART: FsmConnectorStates.StateSessionRestart,
          LOCK: FsmConnectorStates.StateLocked,
          UNLOCK: FsmConnectorStates.StateUnlocked,
          END: FsmConnectorStates.StateEnd
        }
      },
      sessionRestart: { on: {
          IDLE: FsmConnectorStates.StateIdle,
          SESSIONCLOSE: FsmConnectorStates.StateClosed,
          OPEN: FsmConnectorStates.StateOpened,
          CLOSE: FsmConnectorStates.StateClosed,
          LOCK: FsmConnectorStates.StateLocked,
          END: FsmConnectorStates.StateEnd
        }
      },
      closed: { on: {
          OPEN: FsmConnectorStates.StateOpened,
          LOCK: FsmConnectorStates.StateLocked,
          UNLOCK: FsmConnectorStates.StateUnlocked,
          END: FsmConnectorStates.StateEnd,
          IDLE: FsmConnectorStates.StateIdle
        }
      },
      locked: { on: {
          SESSIONCLOSE: FsmConnectorStates.StateClosed,
          OPEN: FsmConnectorStates.StateOpened,
          CLOSE: FsmConnectorStates.StateClosed,
          LOCK: FsmConnectorStates.StateLocked,
          UNLOCK: FsmConnectorStates.StateUnlocked,
          SESSIONRESTART: FsmConnectorStates.StateSessionRestart,
          RECONFIGURE: FsmConnectorStates.StateReconfigured,
          STOP: FsmConnectorStates.StateStopped,
          RENEW: FsmConnectorStates.StateRenewed,
          END: FsmConnectorStates.StateEnd
        }
      },
      unlocked: { on: {
          IDLE: FsmConnectorStates.StateIdle,
          OPEN: FsmConnectorStates.StateOpened,
          END: FsmConnectorStates.StateEnd,
          LOCK: FsmConnectorStates.StateLocked
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
    node.iiot.stateService.send('LOCK')
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
    node.iiot.stateService.send('LOCK')
    node.emit('server_connection_lost')
  })

  node.iiot.opcuaClient.on('connection_reestablished', function () {
    logger.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION RE-ESTABLISHED !!!!!!!!!!!!!!!!!!!')
    logger.internalDebugLog('CONNECTION RE-ESTABLISHED: ' + node.endpoint)
    node.iiot.stateService.send('UNLOCK')
  })

  node.iiot.opcuaClient.on('start_reconnection', function () {
    logger.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT STARTING RECONNECTION !!!!!!!!!!!!!!!!!!!')
    logger.internalDebugLog('CONNECTION STARTING RECONNECTION: ' + node.endpoint)
    node.iiot.stateService.send('LOCK')
  })

  node.iiot.opcuaClient.on('timed_out_request', function () {
    logger.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!! CLIENT TIMED OUT REQUEST !!!!!!!!!!!!!!!!!!!')
    logger.internalDebugLog('CONNECTION TIMED OUT REQUEST: ' + node.endpoint)
  })

  node.iiot.opcuaClient.on('security_token_renewed', function () {
    logger.detailDebugLog('!!!!!!!!!!!!!!!!!!!!!!!! CLIENT SECURITY TOKEN RENEWED !!!!!!!!!!!!!!!!!!!')
    logger.detailDebugLog('CONNECTION SECURITY TOKEN RENEWED: ' + node.endpoint)
  })

  node.iiot.opcuaClient.on('after_reconnection', function () {
    logger.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!      CLIENT RECONNECTED     !!!!!!!!!!!!!!!!!!!')
    logger.internalDebugLog('CONNECTION RECONNECTED: ' + node.endpoint)
    node.emit('after_reconnection', node.iiot.opcuaClient)
    node.iiot.stateService.send('UNLOCK')
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
  createConnectorFinalStateMachine,
  startConnectorMachineService,
  subscribeConnectorFSMService,
  setListenerToClient,
  logSessionInformation,
  checkEndpoint,
  internalDebugLog: logger.internalDebugLog
}

export default coreConnector
