/**
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-iiot-opcua
 */
'use strict'

/**
 * Nested namespace settings.
 *
 * @type {{biancoroyal: {opcua: {iiot: {core: {client: {}}}}}}}
 *
 * @Namesapce de.biancoroyal.opcua.iiot.core.client
 */
var de = de || {biancoroyal: {opcua: {iiot: {core: {client: {}}}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.client.core = de.biancoroyal.opcua.iiot.core.client.core || require('./opcua-iiot-core') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.client.internalDebugLog = de.biancoroyal.opcua.iiot.core.client.internalDebugLog || require('debug')('opcuaIIoT:client') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.client.readDebugLog = de.biancoroyal.opcua.iiot.core.client.readDebugLog || require('debug')('opcuaIIoT:client:read') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.client.writeDebugLog = de.biancoroyal.opcua.iiot.core.client.writeDebugLog || require('debug')('opcuaIIoT:client:write') // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.client.write = function (session, nodesToWrite) {
  let core = de.biancoroyal.opcua.iiot.core.client.core
  return new Promise(
    function (resolve, reject) {
      if (session) {
        session.write(nodesToWrite, function (err, statusCodes, diagnostics) {
          if (err) {
            reject(err)
          } else {
            let resultsConverted = []
            let statusCode = null

            for (statusCode of statusCodes) {
              if (statusCode) {
                resultsConverted.push(core.buildMsgPayloadByStatusCode(statusCode))
              }
            }

            resolve(resultsConverted, statusCodes, diagnostics)
          }
        })
      } else {
        reject(new Error('Session Not Valid To Write'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.client.read = function (session, items, maxAge) {
  let core = de.biancoroyal.opcua.iiot.core.client.core
  return new Promise(
    function (resolve, reject) {
      if (session) {
        session.read(items, maxAge, function (err, results, diagnostics) {
          if (err) {
            reject(err)
          } else {
            let resultsConverted = []
            let dataValue = null

            for (dataValue of results) {
              if (dataValue) {
                resultsConverted.push(core.buildMsgPayloadByDataValue(dataValue))
              }
            }

            resolve(resultsConverted, results, diagnostics)
          }
        })
      } else {
        reject(new Error('Session Not Valid To Read'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.client.readVariableValue = function (session, items) {
  let core = de.biancoroyal.opcua.iiot.core.client.core
  return new Promise(
    function (resolve, reject) {
      if (session) {
        session.readVariableValue(items, function (err, results, diagnostics) {
          if (err) {
            reject(err)
          } else {
            let resultsConverted = []
            let dataValue = null

            if (results.length) {
              for (dataValue of results) {
                if (dataValue) {
                  resultsConverted.push(core.buildMsgPayloadByDataValue(dataValue))
                }
              }
            } else {
              resultsConverted.push(core.buildMsgPayloadByDataValue(results))
            }

            resolve(resultsConverted, results, diagnostics)
          }
        })
      } else {
        reject(new Error('Session Not Valid To Read Variable Value'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.client.readAllAttributes = function (session, items) {
  let core = de.biancoroyal.opcua.iiot.core.client.core
  return new Promise(
    function (resolve, reject) {
      if (session) {
        session.readAllAttributes(items, function (err, nodesToRead, results, diagnostics) {
          if (err) {
            reject(err)
          } else {
            let resultsConverted = []
            let dataValue = null

            for (dataValue of results) {
              if (dataValue) {
                resultsConverted.push(core.buildMsgPayloadByDataValue(dataValue))
              }
            }

            resolve(resultsConverted, nodesToRead, results, diagnostics)
          }
        })
      } else {
        reject(new Error('Session Not Valid To Read All Attributes'))
      }
    }
  )
}

module.exports = de.biancoroyal.opcua.iiot.core.client
