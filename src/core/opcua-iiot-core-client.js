/**
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
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

de.biancoroyal.opcua.iiot.core.client.readHistoryValue = function (session, items, start, end) {
  let core = de.biancoroyal.opcua.iiot.core.client.core
  return new Promise(
    function (resolve, reject) {
      if (session) {
        session.readHistoryValue(items, start, end, function (err, results, diagnostics) {
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
              nodesToRead: items,
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

de.biancoroyal.opcua.iiot.core.client.readAllAttributes = function (session, items, multipleRequest) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        let core = require('./opcua-iiot-core')

        session.readAllAttributes(items, function (err, nodesToRead, dataValues, diagnostics) {
          if (err) {
            reject(err)
          } else {
            let resultsConverted = []

            for (let i = 0; i < nodesToRead.length; i++) {
              const nodeToRead = nodesToRead[i]
              const dataValue = dataValues[i]
              if (dataValue.statusCode !== core.nodeOPCUA.StatusCodes.Good) {
                continue
              }
              resultsConverted.push(core.dataValuetoString(nodeToRead.attributeId, dataValue))
            }

            resolve({
              resultsConverted: resultsConverted,
              nodesToRead: nodesToRead,
              results: dataValues,
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
