/**
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

import * as core from './opcua-iiot-core'
import { assert } from './opcua-iiot-core';
import {OPCUAIIoTConnectorConfiguration} from '../opcua-iiot-connector'
// @ts-ignore
import * as Stately from 'stately.js'
export { Stately }

export namespace logger {
    export const internalDebugLog = core.Debug('opcuaIIoT:connector')
    export const detailDebugLog = core.Debug('opcuaIIoT:connector:details')
    export const libDebugLog = core.Debug('opcuaIIoT:connector:nodeopcua')
}

export function initConnectorNode(node: OPCUAIIoTConnectorConfiguration) {
    core.initClientNode(node)
    node.bianco.iiot.sessionNodeRequests = 0
    node.bianco.iiot.endpoints = []
    node.bianco.iiot.userIdentity = null
    node.bianco.iiot.opcuaClient = null
    node.bianco.iiot.opcuaSession = null
    node.bianco.iiot.discoveryServer = null
    node.bianco.iiot.serverCertificate = null
    node.bianco.iiot.discoveryServerEndpointUrl = null
    node.bianco.iiot.createConnectionTimeout = null
    node.bianco.iiot.hasOpcUaSubscriptions = false
    return node
}

export function createStatelyMachine() {
    return de.biancoroyal.opcua.iiot.core.connector.Stately.machine({
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
}

export function setListenerToClient(node) {
    assert(node.bianco.iiot)

    if (!node.bianco.iiot.opcuaClient) {
        logger.internalDebugLog('Client Not Valid On Setting Events To Client')
        if (node.showErrors) {
            node.error(new Error('Client Not Valid To Set Event Listeners'), {payload: 'No Client To Set Event Listeners'})
        }
        return
    }

    node.bianco.iiot.opcuaClient.on('close', function (err) {
        if (err) {
            logger.internalDebugLog('Connection Error On Close ' + err)
        }

        if (node.bianco.iiot.isInactiveOnOPCUA()) {
            logger.detailDebugLog('Connector Not Active On OPC UA Close Event')
        } else {
            node.bianco.iiot.resetOPCUAConnection('Connector To Server Close')
        }

        logger.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION CLOSED !!!!!!!!!!!!!!!!!!!'.bgWhite.red)
        logger.internalDebugLog('CONNECTION CLOSED: ' + node.endpoint)
        node.emit('server_connection_close')
    })

    node.bianco.iiot.opcuaClient.on('backoff', function (number, delay) {
        logger.internalDebugLog('!!! CONNECTION FAILED (backoff) FOR #'.bgWhite.yellow, number, ' retrying ', delay / 1000.0, ' sec. !!!')
        logger.internalDebugLog('CONNECTION FAILED: ' + node.endpoint)
        node.bianco.iiot.stateMachine.lock()
    })

    node.bianco.iiot.opcuaClient.on('abort', function () {
        logger.internalDebugLog('!!! Abort backoff !!!')
        logger.internalDebugLog('CONNECTION BROKEN: ' + node.endpoint)

        if (node.bianco.iiot.isInactiveOnOPCUA()) {
            logger.detailDebugLog('Connector Not Active On OPC UA Backoff Abort Event')
        } else {
            node.bianco.iiot.resetOPCUAConnection('Connector To Server Backoff Abort')
        }

        node.emit('server_connection_abort')
    })

    node.bianco.iiot.opcuaClient.on('connection_lost', function () {
        logger.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION LOST !!!!!!!!!!!!!!!!!!!'.bgWhite.orange)
        logger.internalDebugLog('CONNECTION LOST: ' + node.endpoint)
        node.bianco.iiot.stateMachine.lock()
        node.emit('server_connection_lost')
    })

    node.bianco.iiot.opcuaClient.on('connection_reestablished', function () {
        logger.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION RE-ESTABLISHED !!!!!!!!!!!!!!!!!!!'.bgWhite.orange)
        logger.internalDebugLog('CONNECTION RE-ESTABLISHED: ' + node.endpoint)
        node.bianco.iiot.stateMachine.unlock()
    })

    node.bianco.iiot.opcuaClient.on('start_reconnection', function () {
        logger.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT STARTING RECONNECTION !!!!!!!!!!!!!!!!!!!'.bgWhite.yellow)
        logger.internalDebugLog('CONNECTION STARTING RECONNECTION: ' + node.endpoint)
        node.bianco.iiot.stateMachine.lock()
    })

    node.bianco.iiot.opcuaClient.on('timed_out_request', function () {
        logger.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!! CLIENT TIMED OUT REQUEST !!!!!!!!!!!!!!!!!!!'.bgWhite.blue)
        logger.internalDebugLog('CONNECTION TIMED OUT REQUEST: ' + node.endpoint)
    })

    node.bianco.iiot.opcuaClient.on('security_token_renewed', function () {
        logger.detailDebugLog('!!!!!!!!!!!!!!!!!!!!!!!! CLIENT SECURITY TOKEN RENEWED !!!!!!!!!!!!!!!!!!!'.bgWhite.violet)
        logger.detailDebugLog('CONNECTION SECURITY TOKEN RENEWE: ' + node.endpoint)
    })

    node.bianco.iiot.opcuaClient.on('after_reconnection', function () {
        logger.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!      CLIENT RECONNECTED     !!!!!!!!!!!!!!!!!!!'.bgWhite.green)
        logger.internalDebugLog('CONNECTION RECONNECTED: ' + node.endpoint)
        node.emit('after_reconnection', node.bianco.iiot.opcuaClient)
        node.bianco.iiot.stateMachine.unlock()
    })
}

export function logSessionInformation(node) {
    if (!node.bianco.iiot.opcuaSession) {
        logger.detailDebugLog('Session Not Valid To Log Information')
        return
    }

    logger.internalDebugLog('Session ' + node.bianco.iiot.opcuaSession.name + ' Id: ' + node.bianco.iiot.opcuaSession.sessionId + ' Started On ' + node.endpoint)
    logger.detailDebugLog('name :' + node.bianco.iiot.opcuaSession.name)
    logger.detailDebugLog('sessionId :' + node.bianco.iiot.opcuaSession.sessionId)
    logger.detailDebugLog('authenticationToken :' + node.bianco.iiot.opcuaSession.authenticationToken)
    logger.internalDebugLog('timeout :' + node.bianco.iiot.opcuaSession.timeout)

    if (node.bianco.iiot.opcuaSession.serverNonce) {
        logger.detailDebugLog('serverNonce :' + node.bianco.iiot.opcuaSession.serverNonce ? node.bianco.iiot.opcuaSession.serverNonce.toString('hex') : 'none')
    }

    if (node.bianco.iiot.opcuaSession.serverCertificate) {
        logger.detailDebugLog('serverCertificate :' + node.bianco.iiot.opcuaSession.serverCertificate ? node.bianco.iiot.opcuaSession.serverCertificate.toString('base64') : 'none')
    } else {
        logger.detailDebugLog('serverCertificate : None'.red)
    }

    logger.detailDebugLog('serverSignature :' + node.bianco.iiot.opcuaSession.serverSignature ? node.bianco.iiot.opcuaSession.serverSignature : 'none')

    if (node.bianco.iiot.opcuaSession.lastRequestSentTime) {
        logger.detailDebugLog('lastRequestSentTime : ' + node.bianco.iiot.opcuaSession.lastRequestSentTime)
        logger.internalDebugLog('lastRequestSentTime converted :' + node.bianco.iiot.opcuaSession.lastRequestSentTime ? new Date(node.bianco.iiot.opcuaSession.lastRequestSentTime).toISOString() : 'none')
    }

    if (node.bianco.iiot.opcuaSession.lastResponseReceivedTime) {
        logger.detailDebugLog('lastResponseReceivedTime : ' + node.bianco.iiot.opcuaSession.lastResponseReceivedTime)
        logger.internalDebugLog('lastResponseReceivedTime converted :' + node.bianco.iiot.opcuaSession.lastResponseReceivedTime ? new Date(node.bianco.iiot.opcuaSession.lastResponseReceivedTime).toISOString() : 'none')
    }
}

export function checkEndpoint(node) {
    if (node.endpoint && node.endpoint.includes('opc.tcp://')) {
        return true
    } else {
        logger.internalDebugLog('Endpoint Not Valid -> ' + node.endpoint)
        node.error(new Error('endpoint does not include opc.tcp://'), {payload: 'Client Endpoint Error'})
        return false
    }
}
