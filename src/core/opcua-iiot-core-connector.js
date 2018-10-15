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
    'SESSIONCLOSED': {
      'idle': 'IDLE',
      'open': 'OPEN',
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
      'close': 'CLOSED',
      'unlock': 'UNLOCKED',
      'end': 'END'
    },
    'UNLOCKED': {
      'idle': 'IDLE',
      'open': 'OPEN',
      'end': 'END'
    },
    'END': {}
  }, 'IDLE')
}

module.exports = de.biancoroyal.opcua.iiot.core.connector
