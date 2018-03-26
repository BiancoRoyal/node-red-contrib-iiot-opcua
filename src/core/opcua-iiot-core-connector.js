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
      'close': 'CLOSED'
    },
    'OPEN': {
      'close': 'CLOSED'
    },
    'CLOSED': {
      'open': 'OPEN',
      'lock': 'LOCKED'
    },
    'LOCKED': {
      'unlock': 'UNLOCKED'
    },
    'UNLOCKED': {
      'init': 'INIT'
    }
  })
}

de.biancoroyal.opcua.iiot.core.connector.createSubscription = function (session, options) {
  return new this.core.nodeOPCUA.ClientSubscription(session, options)
}

de.biancoroyal.opcua.iiot.core.connector.closeSession = function (session) {
  return new Promise(
    function (resolve, reject) {
      if (session && session.sessionId !== 'terminated') {
        session.close(function (err) {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      } else {
        resolve()
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.connector.removeFromList = function (array, element) {
  if (array && array.length) {
    const index = array.indexOf(element)

    if (index !== -1) {
      array.splice(index, 1)
    }
  }
}

module.exports = de.biancoroyal.opcua.iiot.core.connector
