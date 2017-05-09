/**
 The BSD 3-Clause License

 Copyright 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-iiot-opcua
 */
'use strict'

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

de.biancoroyal.opcua.iiot.core.connector.connect = function (url, options) {
  return new Promise(
    function (resolve, reject) {
      let core = require('./opcua-iiot-core')
      let opcuaClient = new core.nodeOPCUA.OPCUAClient(options)
      if (url) {
        opcuaClient.connect(url, function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(opcuaClient)
          }
        })
      } else {
        reject(new Error('URL Endpoint Is Not Valid'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.connector.createSession = function (opcuaClient, userIdentity) {
  return new Promise(
    function (resolve, reject) {
      if (opcuaClient) {
        opcuaClient.createSession(userIdentity, function (err, session) {
          if (err) {
            reject(err)
          } else {
            resolve(session)
          }
        })
      } else {
        reject(new Error('OPC UA Client Is Not Valid'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.connector.closeSession = function (session) {
  return new Promise(
    function (resolve, reject) {
      if (session && session.sessionId !== 'terminated') {
        session.close(function (err) {
          if (err) {
            reject(err)
          }
          resolve()
        })
      } else {
        reject(new Error('Session Is Not Valid'))
      }
    }
  )
}

module.exports = de.biancoroyal.opcua.iiot.core.connector
