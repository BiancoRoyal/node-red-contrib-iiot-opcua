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
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connector = RED.nodes.getNode(config.connector)

    let node = this
    node.reconnectTimeout = 1000

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

    node.handleReadError = function (err, msg) {
      node.verboseLog('ERROR: ' + err)

      if (node.showErrors) {
        node.error(err, msg)
      }

      node.setNodeStatusTo('error')
    }

    node.readFromSession = function (session, itemsToRead, msg) {
      if (!itemsToRead || itemsToRead.length === 0) {
        node.handleReadError(new Error('No Items To Read'), msg)
        return
      }

      if (session) {
        if (session.sessionId === 'terminated') {
          node.verboseLog('ERROR: Session Terminated')
          if (node.showErrors) {
            node.error(new Error('Session Terminated'), msg)
          }
        } else {
          node.verboseLog('Read with AttributeId ' + node.attributeId)

          switch (parseInt(node.attributeId)) {
            case 0:
              coreClient.readAllAttributes(session, itemsToRead).then(function (resultsConverted, nodesToRead, results, diagnostics) {
                node.setNodeStatusTo('active')

                if (results) {
                  results.forEach(function (result) {
                    node.verboseLog('read All Attributes result: ' + JSON.stringify(result))
                  })
                }

                if (diagnostics) {
                  diagnostics.forEach(function (diagnostic) {
                    node.verboseLog('read All Attributes diagnostic: ' + JSON.stringify(diagnostic))
                  })
                }

                let message = {
                  payload: resultsConverted,
                  nodesToRead: nodesToRead,
                  input: msg,
                  resultsConverted: resultsConverted,
                  results: results,
                  diagnostics: diagnostics,
                  nodetype: 'read',
                  readtype: 'AllAttributes',
                  attributeId: node.attributeId
                }
                node.verboseLog('read All Attributes:' + JSON.stringify(message))
                node.send(message)
              }).catch(function (err) {
                node.verboseLog('itemsToRead: ' + JSON.stringify(itemsToRead))
                node.handleReadError(err, msg)
              })
              break
            case 13:
              coreClient.readVariableValue(session, itemsToRead).then(function (resultsConverted, results, diagnostics) {
                node.setNodeStatusTo('active')

                if (results) {
                  results.forEach(function (result) {
                    node.verboseLog('read Variable Value result: ' + JSON.stringify(result))
                  })
                }

                if (diagnostics) {
                  diagnostics.forEach(function (diagnostic) {
                    node.verboseLog('read Variable Value diagnostic: ' + JSON.stringify(diagnostic))
                  })
                }

                let message = {
                  payload: resultsConverted,
                  nodesToRead: itemsToRead,
                  input: msg,
                  resultsConverted: resultsConverted,
                  results: results,
                  diagnostics: diagnostics,
                  nodetype: 'read',
                  readtype: 'VariableValue',
                  attributeId: node.attributeId
                }
                node.verboseLog('read Variable Value:' + JSON.stringify(message))
                node.send(message)
              }).catch(function (err) {
                node.verboseLog('itemsToRead: ' + JSON.stringify(itemsToRead))
                node.handleReadError(err, msg)
              })
              break
            case 99:
              itemsToRead.forEach(function (element, index, array) {
                coreClient.readObject(session, element, {depth: node.depth}).then(function (meta) {
                  node.setNodeStatusTo('active')
                  coreClient.internalDebugLog('Read Meta Information ' + index + 1 + ' of ' + array.length)

                  meta.payload.index = index + 1
                  meta.payload.requested = array.length

                  coreClient.internalDebugLog('Meta Payload ' + meta.payload)

                  let message = {
                    payload: meta.payload,
                    nodesToRead: element,
                    input: msg,
                    resultsConverted: meta,
                    results: meta,
                    diagnostics: [],
                    nodetype: 'read',
                    readtype: 'Meta',
                    attributeId: node.attributeId
                  }
                  node.send(message)
                }).catch(function (err) {
                  coreClient.internalDebugLog('Read Meta Information ' + element)
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
                node.verboseLog('transformed item: ' + JSON.stringify(transformedItem))
                transformedItemsToRead.push(transformedItem)
              }

              coreClient.read(session, transformedItemsToRead, node.maxAge).then(function (resultsConverted, nodesToRead, results, diagnostics) {
                node.setNodeStatusTo('active')

                if (results) {
                  results.forEach(function (result) {
                    node.verboseLog('read result: ' + JSON.stringify(result))
                  })
                }

                if (diagnostics) {
                  diagnostics.forEach(function (diagnostic) {
                    node.verboseLog('read diagnostic: ' + JSON.stringify(diagnostic))
                  })
                }

                let message = {
                  payload: resultsConverted,
                  nodesToRead: nodesToRead,
                  maxAge: node.maxAge,
                  input: msg,
                  resultsConverted: resultsConverted,
                  results: results,
                  diagnostics: diagnostics,
                  nodetype: 'read',
                  readtype: 'Default',
                  attributeId: node.attributeId
                }
                node.verboseLog('read:' + JSON.stringify(message))
                node.send(message)
              }).catch(function (err) {
                node.verboseLog('itemsToRead: ' + JSON.stringify(itemsToRead))
                node.verboseLog('transformedItemsToRead: ' + JSON.stringify(transformedItemsToRead))
                node.handleReadError(err, msg)
              })
          }
        }
      } else {
        node.handleReadError(new Error('Session Not Valid On Read'), msg)
      }
    }

    node.on('input', function (msg) {
      node.readFromSession(node.opcuaSession, coreClient.core.buildNodesToRead(msg), msg)
    })

    node.handleSessionError = function (err) {
      if (node.showErrors) {
        node.error(err, {payload: 'Read Session Error'})
      }

      coreClient.internalDebugLog('Reconnect in ' + node.reconnectTimeout + ' msec.')
      node.connector.closeSession(node.opcuaSession, function () {
        setTimeout(function () {
          node.startOPCUASession(node.opcuaClient)
        }, node.reconnectTimeout)
      })
    }

    node.startOPCUASession = function (opcuaClient) {
      node.verboseLog('Read Start OPC UA Session')
      node.opcuaClient = opcuaClient
      node.connector.startSession(coreClient.core.TEN_SECONDS_TIMEOUT, 'Read Node').then(function (session) {
        node.opcuaSession = session
        node.verboseLog('Session Connected')
        node.setNodeStatusTo('connected')
      }).catch(node.handleSessionError)
    }

    if (node.connector) {
      node.connector.on('connected', node.startOPCUASession)
    } else {
      throw new TypeError('Connector Not Valid')
    }

    node.on('close', function (done) {
      if (node.opcuaSession) {
        node.connector.closeSession(node.opcuaSession, function (err) {
          if (err) {
            node.verboseLog('ERROR: on close session ' + err)
          }
          node.opcuaSession = null
          node.verboseLog('Session closed')
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
