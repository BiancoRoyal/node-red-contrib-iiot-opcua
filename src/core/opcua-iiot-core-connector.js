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
    'INIT': {
      'open': 'OPEN',
      'close': 'CLOSED',
      'lock': 'LOCKED'
    },
    'OPEN': {
      'close': 'CLOSED',
      'lock': 'LOCKED'
    },
    'CLOSED': {
      'open': 'OPEN',
      'lock': 'LOCKED'
    },
    'LOCKED': {
      'unlock': 'UNLOCKED',
      'open': 'OPEN'
    },
    'UNLOCKED': {
      'init': 'INIT',
      'open': 'OPEN'
    }
  })
}

module.exports = de.biancoroyal.opcua.iiot.core.connector
