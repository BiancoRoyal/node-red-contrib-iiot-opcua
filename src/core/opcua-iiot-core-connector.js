/**
 The BSD 3-Clause License

 Copyright 2017,2018,2019 - Klaus Landsdorf (https://bianco-royal.com/)
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
var de = de || { biancoroyal: { opcua: { iiot: { core: { connector: {} } } } } } // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.connector.core = de.biancoroyal.opcua.iiot.core.connector.core || require('./opcua-iiot-core') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.connector.internalDebugLog = de.biancoroyal.opcua.iiot.core.connector.internalDebugLog || require('debug')('opcuaIIoT:connector') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.connector.detailDebugLog = de.biancoroyal.opcua.iiot.core.connector.detailDebugLog || require('debug')('opcuaIIoT:connector:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.connector.libDebugLog = de.biancoroyal.opcua.iiot.core.connector.libDebugLog || require('debug')('opcuaIIoT:connector:nodeopcua') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.connector.Stately = de.biancoroyal.opcua.iiot.core.connector.Stately || require('stately.js') // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.connector.initConnectorNode = function (node) {
  this.core.initClientNode(node)
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

de.biancoroyal.opcua.iiot.core.connector.createStatelyMachine = function () {
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

de.biancoroyal.opcua.iiot.core.connector.setListenerToClient = function (node) {
  const connectorLib = this
  this.core.assert(node.bianco.iiot)

  if (!node.bianco.iiot.opcuaClient) {
    connectorLib.internalDebugLog('Client Not Valid On Setting Events To Client')
    if (node.showErrors) {
      node.error(new Error('Client Not Valid To Set Event Listeners'), { payload: 'No Client To Set Event Listeners' })
    }
    return
  }

  node.bianco.iiot.opcuaClient.on('close', function (err) {
    if (err) {
      connectorLib.internalDebugLog('Connection Error On Close ' + err)
    }

    if (node.bianco.iiot.isInactiveOnOPCUA()) {
      connectorLib.detailDebugLog('Connector Not Active On OPC UA Close Event')
    } else {
      node.bianco.iiot.resetOPCUAConnection('Connector To Server Close')
    }

    connectorLib.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION CLOSED !!!!!!!!!!!!!!!!!!!'.bgWhite.red)
    connectorLib.internalDebugLog('CONNECTION CLOSED: ' + node.endpoint)
    node.emit('server_connection_close')
  })

  node.bianco.iiot.opcuaClient.on('backoff', function (number, delay) {
    connectorLib.internalDebugLog('!!! CONNECTION FAILED (backoff) FOR #'.bgWhite.yellow, number, ' retrying ', delay / 1000.0, ' sec. !!!')
    connectorLib.internalDebugLog('CONNECTION FAILED: ' + node.endpoint)
    node.bianco.iiot.stateMachine.lock()
  })

  node.bianco.iiot.opcuaClient.on('abort', function () {
    connectorLib.internalDebugLog('!!! Abort backoff !!!')
    connectorLib.internalDebugLog('CONNECTION BROKEN: ' + node.endpoint)

    if (node.bianco.iiot.isInactiveOnOPCUA()) {
      connectorLib.detailDebugLog('Connector Not Active On OPC UA Backoff Abort Event')
    } else {
      node.bianco.iiot.resetOPCUAConnection('Connector To Server Backoff Abort')
    }

    node.emit('server_connection_abort')
  })

  node.bianco.iiot.opcuaClient.on('connection_lost', function () {
    connectorLib.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION LOST !!!!!!!!!!!!!!!!!!!'.bgWhite.orange)
    connectorLib.internalDebugLog('CONNECTION LOST: ' + node.endpoint)
    node.bianco.iiot.stateMachine.lock()
    node.emit('server_connection_lost')
  })

  node.bianco.iiot.opcuaClient.on('connection_reestablished', function () {
    connectorLib.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION RE-ESTABLISHED !!!!!!!!!!!!!!!!!!!'.bgWhite.orange)
    connectorLib.internalDebugLog('CONNECTION RE-ESTABLISHED: ' + node.endpoint)
    node.bianco.iiot.stateMachine.unlock()
  })

  node.bianco.iiot.opcuaClient.on('start_reconnection', function () {
    connectorLib.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT STARTING RECONNECTION !!!!!!!!!!!!!!!!!!!'.bgWhite.yellow)
    connectorLib.internalDebugLog('CONNECTION STARTING RECONNECTION: ' + node.endpoint)
    node.bianco.iiot.stateMachine.lock()
  })

  node.bianco.iiot.opcuaClient.on('timed_out_request', function () {
    connectorLib.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!! CLIENT TIMED OUT REQUEST !!!!!!!!!!!!!!!!!!!'.bgWhite.blue)
    connectorLib.internalDebugLog('CONNECTION TIMED OUT REQUEST: ' + node.endpoint)
  })

  node.bianco.iiot.opcuaClient.on('security_token_renewed', function () {
    connectorLib.detailDebugLog('!!!!!!!!!!!!!!!!!!!!!!!! CLIENT SECURITY TOKEN RENEWED !!!!!!!!!!!!!!!!!!!'.bgWhite.violet)
    connectorLib.detailDebugLog('CONNECTION SECURITY TOKEN RENEWE: ' + node.endpoint)
  })

  node.bianco.iiot.opcuaClient.on('after_reconnection', function () {
    connectorLib.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!      CLIENT RECONNECTED     !!!!!!!!!!!!!!!!!!!'.bgWhite.green)
    connectorLib.internalDebugLog('CONNECTION RECONNECTED: ' + node.endpoint)
    node.emit('after_reconnection', node.bianco.iiot.opcuaClient)
    node.bianco.iiot.stateMachine.unlock()
  })
}

de.biancoroyal.opcua.iiot.core.connector.logSessionInformation = function (node) {
  if (!node.bianco.iiot.opcuaSession) {
    this.detailDebugLog('Session Not Valid To Log Information')
    return
  }

  this.internalDebugLog('Session ' + node.bianco.iiot.opcuaSession.name + ' Id: ' + node.bianco.iiot.opcuaSession.sessionId + ' Started On ' + node.endpoint)
  this.detailDebugLog('name :' + node.bianco.iiot.opcuaSession.name)
  this.detailDebugLog('sessionId :' + node.bianco.iiot.opcuaSession.sessionId)
  this.detailDebugLog('authenticationToken :' + node.bianco.iiot.opcuaSession.authenticationToken)
  this.internalDebugLog('timeout :' + node.bianco.iiot.opcuaSession.timeout)

  if (node.bianco.iiot.opcuaSession.serverNonce) {
    this.detailDebugLog('serverNonce :' + node.bianco.iiot.opcuaSession.serverNonce ? node.bianco.iiot.opcuaSession.serverNonce.toString('hex') : 'none')
  }

  if (node.bianco.iiot.opcuaSession.serverCertificate) {
    this.detailDebugLog('serverCertificate :' + node.bianco.iiot.opcuaSession.serverCertificate ? node.bianco.iiot.opcuaSession.serverCertificate.toString('base64') : 'none')
  } else {
    this.detailDebugLog('serverCertificate : None'.red)
  }

  this.detailDebugLog('serverSignature :' + node.bianco.iiot.opcuaSession.serverSignature ? node.bianco.iiot.opcuaSession.serverSignature : 'none')

  if (node.bianco.iiot.opcuaSession.lastRequestSentTime) {
    this.detailDebugLog('lastRequestSentTime : ' + node.bianco.iiot.opcuaSession.lastRequestSentTime)
    this.internalDebugLog('lastRequestSentTime converted :' + node.bianco.iiot.opcuaSession.lastRequestSentTime ? new Date(node.bianco.iiot.opcuaSession.lastRequestSentTime).toISOString() : 'none')
  }

  if (node.bianco.iiot.opcuaSession.lastResponseReceivedTime) {
    this.detailDebugLog('lastResponseReceivedTime : ' + node.bianco.iiot.opcuaSession.lastResponseReceivedTime)
    this.internalDebugLog('lastResponseReceivedTime converted :' + node.bianco.iiot.opcuaSession.lastResponseReceivedTime ? new Date(node.bianco.iiot.opcuaSession.lastResponseReceivedTime).toISOString() : 'none')
  }
}

de.biancoroyal.opcua.iiot.core.connector.checkEndpoint = function (node) {
  if (node.endpoint && node.endpoint.includes('opc.tcp://')) {
    return true
  } else {
    this.internalDebugLog('Endpoint Not Valid -> ' + node.endpoint)
    node.error(new Error('endpoint does not include opc.tcp://'), { payload: 'Client Endpoint Error' })
    return false
  }
}

module.exports = de.biancoroyal.opcua.iiot.core.connector
