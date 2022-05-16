/**
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */

'use strict'
// SOURCE-MAP-REQUIRED

import * as core from './opcua-iiot-core'
// @ts-ignore
import * as Stately from 'stately.js'
import {Todo} from "../types/placeholders";
export { Stately }

export namespace logger {
    export const internalDebugLog = core.Debug('opcuaIIoT:connector')
    export const detailDebugLog = core.Debug('opcuaIIoT:connector:details')
    export const libDebugLog = core.Debug('opcuaIIoT:connector:nodeopcua')
}

// sets values within node.bianco.iiot (refactored to node.iiot)
function initConnectorNode() {
    return {
        ...core.initCoreNode(),
        sessionNodeRequests: 0,
        endpoints: [],
        userIdentity: null,
        opcuaClient: null,
        opcuaSession: null,
        discoveryServer: null,
        serverCertificate: null,
        discoveryServerEndpointUrl: null,
        createConnectionTimeout: null,
        hasOpcUaSubscriptions: false,
    }

}

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

// export type CoreStateMachine = Record<CoreMachineStates, Record<string, CoreMachineStates>>

function createCoreStatelyMachine() {
    const stateMachine = Stately.machine({
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

function setListenerToClient(node: Todo) {

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

        if (node.functions.isInactiveOnOPCUA()) {
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

function logSessionInformation(node: Todo) {
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
    createCoreStatelyMachine,
    setListenerToClient,
    logSessionInformation,
    checkEndpoint,
    internalDebugLog: logger.internalDebugLog
}

export default coreConnector
