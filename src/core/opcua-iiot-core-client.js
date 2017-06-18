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

            resolve({resultsConverted: resultsConverted, statusCodes: statusCodes, diagnostics: diagnostics})
          }
        })
      } else {
        reject(new Error('Session Not Valid To Write'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.client.read = function (session, items, maxAge, multipleRequest) {
  let core = de.biancoroyal.opcua.iiot.core.client.core
  return new Promise(
    function (resolve, reject) {
      if (session) {
        session.read(items, maxAge, function (err, nodesToRead, results, diagnostics) {
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

            resolve({
              resultsConverted: resultsConverted,
              nodesToRead: nodesToRead,
              results: results,
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

de.biancoroyal.opcua.iiot.core.client.readVariableValue = function (session, items, multipleRequest) {
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

            core.specialDebugLog('requested ' + items.length + ' results ' + results.length)

            if (results.length) {
              for (dataValue of results) {
                if (dataValue) {
                  resultsConverted.push(core.buildMsgPayloadByDataValue(dataValue))
                }
              }
            } else {
              resultsConverted.push(core.buildMsgPayloadByDataValue(results))
            }

            resolve({resultsConverted: resultsConverted, results: results, diagnostic: diagnostics})
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
  let coreClient = de.biancoroyal.opcua.iiot.core.client

  return new Promise(
    function (resolve, reject) {
      if (session) {
        let UAProxyManager = require('node-opcua/lib/client/proxy').UAProxyManager
        let coerceNodeId = require('node-opcua/lib/datamodel/nodeid').coerceNodeId
        let nodeId
        let proxyManager = new UAProxyManager(session)

        try {
          nodeId = coerceNodeId(element)
          let dataTypeName

          session.readVariableValue(nodeId, function (err, dataValue) {
            coreClient.internalDebugLog('Read VariableValue For Proxy ' + dataValue)

            if (err) {
              reject(err)
            } else {
              if (dataValue.value) {
                dataTypeName = dataValue.value.dataType.toString()
              }

              proxyManager.getObject(nodeId, function (err, data) {
                if (err) {
                  reject(err)
                } else {
                  let msgObject = {payload: {}}
                  coreClient.internalDebugLog('Proxy Get Object ' + data)

                  if (options.depth && parseInt(options.depth) > 1) {
                    msgObject.$components = coreClient.fillMessageObjectList(data.$components) // array of ObjectExplorer
                    msgObject.$organizes = coreClient.fillMessageObjectList(data.$organizes) // array of ObjectExplorer
                    // msgObject.$properties = coreClient.fillMessageObjectList(data.$properties) // map key = name
                    // msgObject.$methods = coreClient.fillMessageObjectList(data.$methods) // array of method objects
                  }

                  msgObject.payload.dataType = coreClient.fillMessageObjectPayloadEntry(dataTypeName)
                  msgObject.payload.nodeId = coreClient.fillMessageObjectPayloadEntry(data.nodeId)
                  msgObject.payload.attributeId = coreClient.fillMessageObjectPayloadEntry(data.attributeId)
                  msgObject.payload.browseName = coreClient.fillMessageObjectPayloadEntry(data.browseName.name)
                  msgObject.payload.nodeClass = coreClient.fillMessageObjectPayloadEntry(data.nodeClass)
                  msgObject.payload.description = coreClient.fillMessageObjectPayloadEntry(data.description)
                  msgObject.payload.userAccessLevel = coreClient.fillMessageObjectPayloadEntry(data.userAccessLevel)
                  msgObject.payload.accessLevel = coreClient.fillMessageObjectPayloadEntry(data.accessLevel)
                  msgObject.payload.typeDefinition = coreClient.fillMessageObjectPayloadEntry(data.typeDefinition)
                  msgObject.payload.requestedDepth = parseInt(options.depth)

                  resolve(msgObject)
                }
              }, options)
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

de.biancoroyal.opcua.iiot.core.client.readAllAttributes = function (session, items, multipleRequest) {
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

            resolve({
              resultsConverted: resultsConverted,
              nodesToRead: nodesToRead,
              results: results,
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

module.exports = de.biancoroyal.opcua.iiot.core.client
