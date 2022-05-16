/**
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

/**
 * Nested namespace settings.
 *
 * @type {{biancoroyal: {opcua: {iiot: {core: {client: {}}}}}}}
 *
 * @Namesapce de.biancoroyal.opcua.iiot.core.client
 */
var de = de || { biancoroyal: { opcua: { iiot: { core: { client: {} } } } } } // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.client.core = de.biancoroyal.opcua.iiot.core.client.core || require('./opcua-iiot-core') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.client.internalDebugLog = de.biancoroyal.opcua.iiot.core.client.internalDebugLog || require('debug')('opcuaIIoT:client') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.client.detailDebugLog = de.biancoroyal.opcua.iiot.core.client.detailDebugLog || require('debug')('opcuaIIoT:client:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.client.readDebugLog = de.biancoroyal.opcua.iiot.core.client.readDebugLog || require('debug')('opcuaIIoT:client:read') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.client.readDetailsDebugLog = de.biancoroyal.opcua.iiot.core.client.readDetailsDebugLog || require('debug')('opcuaIIoT:client:read:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.client.writeDebugLog = de.biancoroyal.opcua.iiot.core.client.writeDebugLog || require('debug')('opcuaIIoT:client:write') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.client.writeDetailsDebugLog = de.biancoroyal.opcua.iiot.core.client.writeDetailsDebugLog || require('debug')('opcuaIIoT:client:write:details') // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.client.READ_TYPE = de.biancoroyal.opcua.iiot.core.client.READ_TYPE || Object.freeze({
  ALL: 0,
  NODE_ID: 1,
  NODE_CLASS: 2,
  BROWSE_NAME: 3,
  DISPLAY_NAME: 4,
  VALUE: 13,
  HISTORY: 130
}) // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.client.write = function (session, nodesToWrite, originMsg) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        let msg = Object.assign({}, originMsg)
        session.write(nodesToWrite, function (err, statusCodes) {
          if (err) {
            reject(err)
          } else {
            resolve({
              statusCodes,
              nodesToWrite,
              msg
            })
          }
        })
      } else {
        reject(new Error('Session Not Valid To Write'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.client.read = function (session, nodesToRead, maxAge, originMsg) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        let msg = Object.assign({}, originMsg)
        session.read(nodesToRead, maxAge, function (err, dataValues) {
          if (err) {
            reject(err)
          } else {
            resolve({
              results: dataValues,
              nodesToRead,
              msg
            })
          }
        })
      } else {
        reject(new Error('Session Not Valid To Read'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.client.readVariableValue = function (session, nodesToRead, originMsg) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        let msg = Object.assign({}, originMsg)
        session.readVariableValue(nodesToRead, function (err, dataValues) {
          if (err) {
            reject(err)
          } else {
            resolve({
              results: dataValues,
              nodesToRead,
              msg
            })
          }
        })
      } else {
        reject(new Error('Session Not Valid To Read Variable Value'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.client.readHistoryValue = function (session, nodesToRead, startDate, endDate, originMsg) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        let msg = Object.assign({}, originMsg)
        session.readHistoryValue(nodesToRead, startDate, endDate, function (err, dataValues) {
          if (err) {
            reject(err)
          } else {
            resolve({
              results: dataValues,
              nodesToRead,
              startDate,
              endDate,
              msg
            })
          }
        })
      } else {
        reject(new Error('Session Not Valid To Read History Value'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.client.readAllAttributes = function (session, nodesToRead, originMsg) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        let msg = Object.assign({}, originMsg)
        session.readAllAttributes(nodesToRead, function (err, dataValues) {
          if (err) {
            reject(err)
          } else {
            resolve({
              results: dataValues,
              nodesToRead,
              msg
            })
          }
        })
      } else {
        reject(new Error('Session Not Valid To Read All Attributes'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.client.stringifyFormatted = function (dataValues) {
  return JSON.stringify(dataValues, null, 2)
}

module.exports = de.biancoroyal.opcua.iiot.core.client
