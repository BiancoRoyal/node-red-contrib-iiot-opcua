/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-iiot-opcua
 */
'use strict'

/**
 * Read Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED) {
  let coreClient = require('./core/opcua-iiot-core-client')

  function OPCUAIIoTRead (config) {
    RED.nodes.createNode(this, config)
    this.attributeId = config.attributeId || 0
    this.maxAge = config.maxAge || 1
    this.depth = config.depth || 1
    this.name = config.name
    this.justValue = config.justValue
    this.multipleRequest = config.multipleRequest
    this.metaDataInject = config.metaDataInject
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connector = RED.nodes.getNode(config.connector)

    let node = this
    node.reconnectTimeout = 1000
    node.sessionTimeout = null

    node.verboseLog = function (logMessage) {
      if (RED.settings.verbose) {
        coreClient.readDebugLog(logMessage)
      }
    }

    node.statusLog = function (logMessage) {
      if (RED.settings.verbose && node.showStatusActivities) {
        coreClient.readDebugLog('Status: ' + logMessage)
      }
    }

    node.setNodeStatusTo = function (statusValue) {
      node.statusLog(statusValue)
      let statusParameter = coreClient.core.getNodeStatus(statusValue, node.showStatusActivities)
      node.status({fill: statusParameter.fill, shape: statusParameter.shape, text: statusParameter.status})
    }

    node.resetSession = function () {
      if (!node.sessionTimeout && node.opcuaClient) {
        coreClient.readDebugLog('Reset Session')
        node.connector.closeSession(node.opcuaSession, function () {
          node.startOPCUASessionWithTimeout(node.opcuaClient)
        })
      }
    }

    node.handleReadError = function (err, msg) {
      node.verboseLog('Read Handle Error '.red + err)

      if (node.showErrors) {
        node.error(err, msg)
      }

      coreClient.readDebugLog(err.message)
      node.setNodeStatusTo('error')

      if (err.message && err.message.includes('BadSession')) {
        node.resetSession()
      }
    }

    node.readFromSession = function (session, itemsToRead, msg) {
      if (!itemsToRead || itemsToRead.length === 0) {
        node.handleReadError(new Error('No Items To Read'), msg)
        return
      }

      if (session) {
        if (session.sessionId === 'terminated') {
          node.handleReadError(new Error('Session Terminated While Read'), msg)
        } else {
          coreClient.readDebugLog('Read With AttributeId ' + node.attributeId)

          switch (parseInt(node.attributeId)) {
            case 0:
              coreClient.readAllAttributes(session, itemsToRead, node.multipleRequest).then(function (readResult) {
                node.setNodeStatusTo('active')

                if (readResult.results) {
                  readResult.results.forEach(function (result) {
                    coreClient.readDetailsDebugLog('Read All Attributes Result: ' + JSON.stringify(result))
                  })
                }

                if (readResult.diagnostics) {
                  readResult.diagnostics.forEach(function (diagnostic) {
                    coreClient.readDetailsDebugLog('Read All Attributes Diagnostic: ' + JSON.stringify(diagnostic))
                  })
                }

                let message

                if (node.multipleRequest) {
                  message = {
                    payload: readResult.resultsConverted,
                    nodesToRead: itemsToRead,
                    maxAge: 0, /* default by node-opcua can not be changed v0.0.64 */
                    multipleRequest: node.multipleRequest,
                    input: msg,
                    resultsConverted: readResult.resultsConverted,
                    /* results: readResult.results, */
                    diagnostics: readResult.diagnostics,
                    nodetype: 'read',
                    readtype: 'AllAttributes',
                    attributeId: node.attributeId
                  }
                } else {
                  message = {
                    payload: readResult.resultsConverted,
                    nodesToRead: itemsToRead[0],
                    maxAge: 0, /* default by node-opcua can not be changed v0.0.64 */
                    multipleRequest: node.multipleRequest,
                    input: msg,
                    resultsConverted: readResult.resultsConverted,
                    /* results: readResult.results, */
                    diagnostics: readResult.diagnostics,
                    nodetype: 'read',
                    readtype: 'AllAttributes',
                    attributeId: node.attributeId,
                    topic: itemsToRead[0]
                  }
                }

                node.send(message)
              }).catch(function (err) {
                coreClient.readDebugLog('Error Items To Read: ' + JSON.stringify(itemsToRead))
                node.handleReadError(err, msg)
              })
              break
            case 13:
              coreClient.core.specialDebugLog('requested Values ' + itemsToRead.length)

              coreClient.readVariableValue(session, itemsToRead, node.multipleRequest).then(function (readResult) {
                node.setNodeStatusTo('active')

                if (readResult.results) {
                  readResult.results.forEach(function (result) {
                    coreClient.readDetailsDebugLog('Read Variable Value Result: ' + JSON.stringify(result))
                  })
                }

                if (readResult.diagnostics) {
                  readResult.diagnostics.forEach(function (diagnostic) {
                    coreClient.readDetailsDebugLog('Read Variable Value Diagnostic: ' + JSON.stringify(diagnostic))
                  })
                }

                let message

                if (node.multipleRequest) {
                  message = {
                    payload: readResult.resultsConverted,
                    nodesToRead: itemsToRead,
                    maxAge: 0, /* default by node-opcua can not be changed v0.0.64 */
                    multipleRequest: node.multipleRequest,
                    input: msg,
                    resultsConverted: readResult.resultsConverted,
                    /* results: readResult.results, */
                    diagnostics: readResult.diagnostics,
                    nodetype: 'read',
                    readtype: 'VariableValue',
                    attributeId: node.attributeId
                  }
                } else {
                  message = {
                    payload: readResult.resultsConverted[0],
                    nodesToRead: itemsToRead[0],
                    maxAge: 0, /* default by node-opcua can not be changed v0.0.64 */
                    multipleRequest: node.multipleRequest,
                    input: msg,
                    resultsConverted: readResult.resultsConverted,
                    /* results: readResult.results, */
                    diagnostics: readResult.diagnostics,
                    nodetype: 'read',
                    readtype: 'VariableValue',
                    attributeId: node.attributeId,
                    topic: itemsToRead[0]
                  }
                }

                node.send(message)
              }).catch(function (err) {
                coreClient.core.specialDebugLog(err)
                coreClient.readDebugLog('Error Items To Read: ' + JSON.stringify(itemsToRead))
                node.handleReadError(err, msg)
              })
              break
            case 99:
              itemsToRead.forEach(function (element, index, array) {
                coreClient.readObject(session, element, {depth: node.depth}).then(function (meta) {
                  node.setNodeStatusTo('active')
                  coreClient.readDebugLog('Read Meta Information ' + index + 1 + ' of ' + array.length)

                  meta.payload.index = index + 1
                  meta.payload.requested = array.length

                  coreClient.readDetailsDebugLog('Meta Payload ' + meta.payload)

                  let message = {
                    payload: meta.payload,
                    nodesToRead: [element],
                    maxAge: node.maxAge,
                    multipleRequest: node.multipleRequest,
                    input: msg,
                    resultsConverted: meta,
                    /* results: meta, */
                    diagnostics: [],
                    nodetype: 'read',
                    readtype: 'Meta',
                    attributeId: node.attributeId,
                    topic: element
                  }

                  if (node.metaDataInject) {
                    message.resultsConverted.$components.forEach(function (element, index, array) {
                      message.nodesToRead.push(element.nodeId)
                    })
                  }

                  coreClient.core.specialDebugLog(message.nodesToRead)
                  coreClient.core.specialDebugLog('Count Of Items To Read: ' + message.nodesToRead.length)

                  node.send(message)
                }).catch(function (err) {
                  coreClient.readDebugLog('Error Read Meta Information ' + element)
                  node.handleReadError(err, msg)
                })
              })
              break
            default:
              let item = null
              let transformedItem = null
              let transformedItemsToRead = []

              for (item of itemsToRead) {
                transformedItem = {
                  nodeId: item,
                  attributeId: Number(node.attributeId)
                }
                coreClient.readDebugLog('Transformed Item: ' + JSON.stringify(transformedItem))
                transformedItemsToRead.push(transformedItem)
              }

              coreClient.read(session, transformedItemsToRead, node.maxAge, node.multipleRequest).then(function (readResult) {
                node.setNodeStatusTo('active')

                if (readResult.results) {
                  readResult.results.forEach(function (result) {
                    coreClient.readDetailsDebugLog('Read Result: ' + JSON.stringify(result))
                  })
                }

                if (readResult.diagnostics) {
                  readResult.diagnostics.forEach(function (diagnostic) {
                    coreClient.readDetailsDebugLog('Read Diagnostic: ' + JSON.stringify(diagnostic))
                  })
                }

                let message

                if (node.multipleRequest) {
                  message = {
                    payload: readResult.resultsConverted,
                    nodesToRead: readResult.nodesToRead,
                    maxAge: node.maxAge,
                    multipleRequest: node.multipleRequest,
                    input: msg,
                    resultsConverted: readResult.resultsConverted,
                    /* results: readResult.results, */
                    diagnostics: readResult.diagnostics,
                    nodetype: 'read',
                    readtype: 'Default',
                    attributeId: node.attributeId
                  }
                } else {
                  message = {
                    payload: readResult.resultsConverted[0],
                    nodesToRead: readResult.nodesToRead[0],
                    maxAge: node.maxAge,
                    multipleRequest: node.multipleRequest,
                    input: msg,
                    resultsConverted: readResult.resultsConverted,
                    /* results: readResult.results, */
                    diagnostics: readResult.diagnostics,
                    nodetype: 'read',
                    readtype: 'Default',
                    attributeId: node.attributeId,
                    topic: readResult.nodesToRead[0]
                  }
                }

                node.send(message)
              }).catch(function (err) {
                coreClient.readDebugLog('Error Read Default itemsToRead: ' + JSON.stringify(itemsToRead))
                coreClient.readDebugLog('Error Read Default transformedItemsToRead: ' + JSON.stringify(transformedItemsToRead))
                node.handleReadError(err, msg)
              })
          }
        }
      } else {
        node.handleReadError(new Error('Session Not Valid On Read'), msg)
      }
    }

    node.on('input', function (msg) {
      node.readFromSession(node.opcuaSession, coreClient.core.buildNodesToRead(msg, node.multipleRequest), msg)
    })

    node.handleSessionError = function (err) {
      coreClient.readDebugLog('Handle Session Error '.red + err)

      if (node.showErrors) {
        node.error(err, {payload: 'Read Handle Session Error'})
      }

      node.resetSession()
    }

    node.startOPCUASession = function (opcuaClient) {
      if (node.sessionTimeout) {
        clearTimeout(node.sessionTimeout)
        node.sessionTimeout = null
      }

      coreClient.readDebugLog('Read Start OPC UA Session')
      node.opcuaClient = opcuaClient
      node.connector.startSession(coreClient.core.TEN_SECONDS_TIMEOUT, 'Read Node').then(function (session) {
        node.opcuaSession = session
        coreClient.readDebugLog('Session Connected')
        node.setNodeStatusTo('connected')
      }).catch(node.handleSessionError)
    }

    node.startOPCUASessionWithTimeout = function (opcuaClient) {
      if (node.sessionTimeout !== null) {
        clearTimeout(node.sessionTimeout)
        node.sessionTimeout = null
      }

      coreClient.readDebugLog('starting OPC UA session with delay of ' + node.reconnectTimeout)
      node.sessionTimeout = setTimeout(function () {
        node.startOPCUASession(opcuaClient)
      }, node.reconnectTimeout)
    }

    if (node.connector) {
      node.connector.on('connected', node.startOPCUASessionWithTimeout)
    } else {
      throw new TypeError('Connector Not Valid')
    }

    node.on('close', function (done) {
      if (node.opcuaSession) {
        node.connector.closeSession(node.opcuaSession, function (err) {
          if (err) {
            coreClient.readDebugLog('ERROR: on close session ' + err)
          }
          node.opcuaSession = null
          coreClient.readDebugLog('Session closed')
          done()
        })
      } else {
        node.opcuaSession = null
        done()
      }
    })

    node.setNodeStatusTo(false)
  }

  RED.nodes.registerType('OPCUA-IIoT-Read', OPCUAIIoTRead)

  // AttributeId via REST
}
