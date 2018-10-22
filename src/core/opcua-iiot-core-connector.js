/**
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

/**
 * Nested namespace settings.
 *
 * @type {{biancoroyal: {opcua: {iiot: {core: {connector: {}}}}}}}
 *
 * @Namesapce de.biancoroyal.opcua.iiot.core.connector
 */
var de = de || {biancoroyal: {opcua: {iiot: {core: {connector: {}}}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.connector.core = de.biancoroyal.opcua.iiot.core.connector.core || require('./opcua-iiot-core') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.connector.internalDebugLog = de.biancoroyal.opcua.iiot.core.connector.internalDebugLog || require('debug')('opcuaIIoT:connector') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.connector.detailDebugLog = de.biancoroyal.opcua.iiot.core.connector.detailDebugLog || require('debug')('opcuaIIoT:connector:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.connector.libDebugLog = de.biancoroyal.opcua.iiot.core.connector.libDebugLog || require('debug')('opcuaIIoT:connector:nodeopcua') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.connector.Stately = de.biancoroyal.opcua.iiot.core.connector.Stately || require('stately.js') // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.connector.createStatelyMachine = function () {
  return de.biancoroyal.opcua.iiot.core.connector.Stately.machine({
    'IDLE': {
      'init': 'INIT',
      'lock': 'LOCKED',
      'end': 'END'
    },
    'INIT': {
      'open': 'OPEN',
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
      'sessionrestart': 'SESSIONRESTART',
      'end': 'END'
    },
    'UNLOCKED': {
      'idle': 'IDLE',
      'lock': 'LOCKED',
      'open': 'OPEN',
      'end': 'END'
    },
    'END': {}
  }, 'IDLE')
}

de.biancoroyal.opcua.iiot.core.connector.setListenerToClient = function (node) {
  const connector = de.biancoroyal.opcua.iiot.core.connector

  if (!node.opcuaClient) {
    connector.internalDebugLog('Client Not Valid On Setting Events To Client')
    if (node.showErrors) {
      node.error(new Error('Client Not Valid To Set Event Listeners'), {payload: 'No Client To Set Event Listeners'})
    }
    return
  }

  node.opcuaClient.on('close', function (err) {
    if (err) {
      connector.internalDebugLog('Connection Error On Close ' + err)
    }
    node.stateMachine.lock().close().idle()
    connector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION CLOSED !!!!!!!!!!!!!!!!!!!'.bgWhite.red)
    connector.internalDebugLog('CONNECTION CLOSED: ' + node.endpoint)
    node.emit('server_connection_close')
  })

  node.opcuaClient.on('backoff', function (number, delay) {
    connector.internalDebugLog('!!! CONNECTION FAILED (backoff) FOR #'.bgWhite.yellow, number, ' retrying ', delay / 1000.0, ' sec. !!!')
    connector.internalDebugLog('CONNECTION FAILED: ' + node.endpoint)
    node.stateMachine.lock()
  })

  node.opcuaClient.on('connection_reestablished', function () {
    connector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION RE-ESTABLISHED !!!!!!!!!!!!!!!!!!!'.bgWhite.orange)
    connector.internalDebugLog('CONNECTION RE-ESTABLISHED: ' + node.endpoint)
    node.stateMachine.unlock()
  })

  node.opcuaClient.on('start_reconnection', function () {
    connector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT STARTING RECONNECTION !!!!!!!!!!!!!!!!!!!'.bgWhite.yellow)
    connector.internalDebugLog('CONNECTION STARTING RECONNECTION: ' + node.endpoint)
    node.stateMachine.lock()
  })

  node.opcuaClient.on('timed_out_request', function () {
    connector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!! CLIENT TIMED OUT REQUEST !!!!!!!!!!!!!!!!!!!'.bgWhite.blue)
    connector.internalDebugLog('CONNECTION TIMED OUT REQUEST: ' + node.endpoint)
  })

  node.opcuaClient.on('security_token_renewed', function () {
    connector.detailDebugLog('!!!!!!!!!!!!!!!!!!!!!!!! CLIENT SECURITY TOKEN RENEWED !!!!!!!!!!!!!!!!!!!'.bgWhite.violet)
    connector.detailDebugLog('CONNECTION SECURITY TOKEN RENEWE: ' + node.endpoint)
  })

  node.opcuaClient.on('after_reconnection', function () {
    connector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!      CLIENT RECONNECTED     !!!!!!!!!!!!!!!!!!!'.bgWhite.green)
    connector.internalDebugLog('CONNECTION RECONNECTED: ' + node.endpoint)
    node.emit('after_reconnection', node.opcuaClient)
    node.stateMachine.unlock()
  })
}

de.biancoroyal.opcua.iiot.core.connector.logSessionInformation = function (node) {
  if (!node.opcuaSession) {
    this.detailDebugLog('Session Not Valid To Log Information')
    return
  }

  this.internalDebugLog('Session ' + node.opcuaSession.name + ' Id: ' + node.opcuaSession.sessionId + ' Started On ' + node.endpoint)
  this.detailDebugLog('name :' + node.opcuaSession.name)
  this.detailDebugLog('sessionId :' + node.opcuaSession.sessionId)
  this.detailDebugLog('authenticationToken :' + node.opcuaSession.authenticationToken)
  this.internalDebugLog('timeout :' + node.opcuaSession.timeout)

  if (node.opcuaSession.serverNonce) {
    this.detailDebugLog('serverNonce :' + node.opcuaSession.serverNonce ? node.opcuaSession.serverNonce.toString('hex') : 'none')
  }

  if (node.opcuaSession.serverCertificate) {
    this.detailDebugLog('serverCertificate :' + node.opcuaSession.serverCertificate ? node.opcuaSession.serverCertificate.toString('base64') : 'none')
  } else {
    this.detailDebugLog('serverCertificate : None'.red)
  }

  this.detailDebugLog('serverSignature :' + node.opcuaSession.serverSignature ? node.opcuaSession.serverSignature : 'none')

  if (node.opcuaSession.lastRequestSentTime) {
    this.detailDebugLog('lastRequestSentTime : ' + node.opcuaSession.lastRequestSentTime)
    this.internalDebugLog('lastRequestSentTime converted :' + node.opcuaSession.lastRequestSentTime ? new Date(node.opcuaSession.lastRequestSentTime).toISOString() : 'none')
  }

  if (node.opcuaSession.lastResponseReceivedTime) {
    this.detailDebugLog('lastResponseReceivedTime : ' + node.opcuaSession.lastResponseReceivedTime)
    this.internalDebugLog('lastResponseReceivedTime converted :' + node.opcuaSession.lastResponseReceivedTime ? new Date(node.opcuaSession.lastResponseReceivedTime).toISOString() : 'none')
  }
}

module.exports = de.biancoroyal.opcua.iiot.core.connector
