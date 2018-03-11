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
var de = de || {biancoroyal: {opcua: {iiot: {core: {client: {}}}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.client.core = de.biancoroyal.opcua.iiot.core.client.core || require('./opcua-iiot-core') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.client.internalDebugLog = de.biancoroyal.opcua.iiot.core.client.internalDebugLog || require('debug')('opcuaIIoT:client') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.client.detailDebugLog = de.biancoroyal.opcua.iiot.core.client.detailDebugLog || require('debug')('opcuaIIoT:client:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.client.readDebugLog = de.biancoroyal.opcua.iiot.core.client.readDebugLog || require('debug')('opcuaIIoT:client:read') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.client.readDetailsDebugLog = de.biancoroyal.opcua.iiot.core.client.readDetailsDebugLog || require('debug')('opcuaIIoT:client:read:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.client.writeDebugLog = de.biancoroyal.opcua.iiot.core.client.writeDebugLog || require('debug')('opcuaIIoT:client:write') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.client.writeDetailsDebugLog = de.biancoroyal.opcua.iiot.core.client.writeDetailsDebugLog || require('debug')('opcuaIIoT:client:write:details') // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.client.write = function (session, nodesToWrite) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        session.write(nodesToWrite, function (err, statusCodes) {
          if (err) {
            reject(err)
          } else {
            resolve({
              statusCodes: statusCodes,
              nodesToWrite: nodesToWrite
            })
          }
        })
      } else {
        reject(new Error('Session Not Valid To Write'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.client.read = function (session, items, maxAge) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        session.read(items, maxAge, function (err, nodesToRead, dataValues, diagnostics) {
          if (err) {
            reject(err)
          } else {
            resolve({
              results: dataValues,
              nodesToRead: nodesToRead,
              diagnostics: diagnostics
            })
          }
        })
      } else {
        reject(new Error('Session Not Valid To Read'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.client.readVariableValue = function (session, nodesToRead) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        session.readVariableValue(nodesToRead, function (err, dataValues, diagnostics) {
          if (err) {
            reject(err)
          } else {
            resolve({
              results: dataValues,
              nodesToRead: nodesToRead,
              diagnostic: diagnostics
            })
          }
        })
      } else {
        reject(new Error('Session Not Valid To Read Variable Value'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.client.fillMessageObjectPayloadEntry = function (variant) {
  let msgObjectPayloadEntry = variant || 'Unknown'

  if (msgObjectPayloadEntry) {
    msgObjectPayloadEntry = msgObjectPayloadEntry.toString()
  }

  return msgObjectPayloadEntry
}

de.biancoroyal.opcua.iiot.core.client.fillMessageObjectList = function (variantList) {
  let coreClient = de.biancoroyal.opcua.iiot.core.client
  let msgObjectList = []

  variantList.forEach(function (element, index, array) {
    coreClient.internalDebugLog('Variant List Entry ' + (index + 1) + ' Length ' + array.length)
    msgObjectList.push({nodeId: element.nodeId.toString(), parent: element.name})
  })

  return msgObjectList
}

de.biancoroyal.opcua.iiot.core.client.readObject = function (session, element, options) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        let core = require('./opcua-iiot-core')
        try {
          const structure = [
            {
              nodeId: element.nodeId,
              referenceTypeId: 'Organizes',
              includeSubtypes: true,
              browseDirection: core.nodeOPCUA.browse_service.BrowseDirection.Forward,
              resultMask: 0x3f
            },
            {
              nodeId: element.nodeId,
              referenceTypeId: 'Aggregates',
              includeSubtypes: true,
              browseDirection: core.nodeOPCUA.browse_service.BrowseDirection.Forward,
              resultMask: 0x3f
            }
          ]

          session.browse(structure, function (err, results) {
            if (err) {
              reject(err)
            } else {
              resolve(results)
            }
          })
        } catch (err) {
          reject(err)
        }
      } else {
        reject(new Error('Session Not Valid To Read Meta Information'))
      }
    })
}

de.biancoroyal.opcua.iiot.core.client.readHistoryValue = function (session, nodesToRead, start, end) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        session.readHistoryValue(nodesToRead, start, end, function (err, dataValues, diagnostics) {
          if (err) {
            reject(err)
          } else {
            resolve({
              results: dataValues,
              nodesToRead: nodesToRead,
              diagnostics: diagnostics
            })
          }
        })
      } else {
        reject(new Error('Session Not Valid To Read All Attributes'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.client.readAllAttributes = function (session, nodesToRead) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        session.readAllAttributes(nodesToRead, function (err, dataValues) {
          if (err) {
            reject(err)
          } else {
            resolve({
              results: dataValues,
              nodesToRead: nodesToRead
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
