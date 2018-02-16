/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * Read Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED) {
  // SOURCE-MAP-REQUIRED
  let coreClient = require('./core/opcua-iiot-core-client')

  function OPCUAIIoTRead (config) {
    RED.nodes.createNode(this, config)
    this.attributeId = config.attributeId || 0
    this.maxAge = config.maxAge || 1
    this.depth = config.depth || 1
    this.name = config.name
    this.justValue = config.justValue
    this.multipleRequest = config.multipleRequest
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.parseStrings = config.parseStrings
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

                try {
                  node.send(node.buildResultMessage(msg, 'AllAttributes', readResult))
                } catch (err) {
                  node.handleReadError(err, msg)
                }
              }).catch(function (err) {
                coreClient.readDebugLog('Error Items To Read All Attributes: ' + JSON.stringify(itemsToRead))
                node.handleReadError(err, msg)
              })
              break
            case 13:
              coreClient.core.specialDebugLog('requested Values ' + itemsToRead.length)

              coreClient.readVariableValue(session, itemsToRead, node.multipleRequest).then(function (readResult) {
                node.setNodeStatusTo('active')

                try {
                  let message = node.buildResultMessage(msg, 'VariableValue', readResult)
                  node.send(message)
                } catch (err) {
                  node.handleReadError(err, msg)
                }
              }).catch(function (err) {
                coreClient.core.specialDebugLog(err)
                coreClient.readDebugLog('Error Items To Read Variable Value: ' + JSON.stringify(itemsToRead))
                node.handleReadError(err, msg)
              })
              break
            case 130:
              coreClient.core.specialDebugLog('requested History ' + itemsToRead.length)

              let historyDate = new Date()
              node.historyStart = new Date(historyDate.getDate() - 1)
              node.historyEnd = historyDate

              coreClient.readHistoryValue(session, itemsToRead, node.historyStart, node.historyEnd, node.multipleRequest).then(function (readResult) {
                node.setNodeStatusTo('active')

                try {
                  let message = node.buildResultMessage(msg, 'HistoryValue', readResult)
                  message.historyStart = node.historyStart
                  message.historyEnd = node.historyEnd
                  node.send(message)
                } catch (err) {
                  node.handleReadError(err, msg)
                }
              }).catch(function (err) {
                coreClient.core.specialDebugLog(err)
                coreClient.readDebugLog('Error Items To Read History Value: ' + JSON.stringify(itemsToRead))
                node.handleReadError(err, msg)
              })
              break
            default:
              let item = null
              let transformedItem = null
              let transformedItemsToRead = []

              for (item of itemsToRead) {
                transformedItem = {
                  nodeId: item,
                  attributeId: Number(node.attributeId) || null
                }
                coreClient.readDebugLog('Transformed Item: ' + JSON.stringify(transformedItem))
                transformedItemsToRead.push(transformedItem)
              }

              coreClient.read(session, transformedItemsToRead, node.maxAge, node.multipleRequest).then(function (readResult) {
                node.setNodeStatusTo('active')

                try {
                  let message = node.buildResultMessage(msg, 'Default', readResult)
                  message.maxAge = node.maxAge
                  node.send(message)
                } catch (err) {
                  node.handleReadError(err, msg)
                }
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

    node.getItemsToRead = function (itemsToRead) {
      return (node.multipleRequest) ? itemsToRead : itemsToRead[0]
    }

    node.getConvertedResult = function (msg, dataValues) {
      let convertedDataValues = {}

      if (dataValues) {
        if (node.parseStrings) {
          if (typeof dataValues === 'string') {
            try {
              convertedDataValues = JSON.parse(dataValues)
            } catch (e) {
              if (node.showErrors) {
                node.warn('JSON not to parse for dataValues type ' + typeof dataValues)
                node.error(e.message, msg)
              }

              try {
                convertedDataValues = JSON.parse(JSON.stringify(dataValues, null, 2))
              } catch (e) {
                if (node.showErrors) {
                  node.warn('JSON not to parse from string for dataValues type ' + typeof dataValues)
                  node.error(e.message, msg)
                }
                convertedDataValues = coreClient.stringifyFormatted(dataValues)
              }
            }
          } else if (typeof dataValues === 'object') {
            convertedDataValues = dataValues
          } else {
            if (node.showErrors) {
              node.warn('unknown dataValues type ' + typeof dataValues)
            }
            convertedDataValues = dataValues
          }
        } else {
          convertedDataValues = coreClient.stringifyFormatted(dataValues)
        }
      } else {
        if (node.showErrors) {
          node.warn('dataValues are undefined')
        }
      }

      return convertedDataValues
    }

    node.buildResultMessage = function (msg, readType, readResult) {
      let message = {
        payload: {},
        topic: msg.topic,
        multipleRequest: node.multipleRequest,
        input: msg,
        nodetype: 'read',
        readtype: readType,
        attributeId: node.attributeId,
        resultsConverted: {}
      }

      try {
        let dataValuesString = JSON.stringify(readResult, null, 2)
        RED.util.setMessageProperty(message, 'payload', JSON.parse(dataValuesString))
      } catch (e) {
        if (node.showErrors) {
          node.warn('JSON not to parse from string for dataValues type ' + typeof readResult)
          node.error(e.message, msg)
          message.payload = JSON.stringify(readResult.results, null, 2)
          message.error = e.message
        }
      }

      try {
        let dataValuesString = JSON.stringify(readResult.results, null, 2)
        RED.util.setMessageProperty(message, 'resultsConverted', JSON.parse(dataValuesString))
      } catch (e) {
        if (node.showErrors) {
          node.warn('JSON not to parse from string for dataValues type ' + typeof readResult.results)
          node.error(e.message, msg)
          message.resultsConverted = null
          message.error = e.message
        }
      }

      return message
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

    node.connectorShutdown = function (opcuaClient) {
      coreClient.readDebugLog('Connector Shutdown')
      if (opcuaClient) {
        node.opcuaClient = opcuaClient
      }
      // node.startOPCUASessionWithTimeout(node.opcuaClient)
    }

    if (node.connector) {
      node.connector.on('connected', node.startOPCUASessionWithTimeout)
      node.connector.on('after_reconnection', node.connectorShutdown)
    } else {
      throw new TypeError('Connector Not Valid')
    }

    node.on('close', function (done) {
      if (node.opcuaSession && node.connector.opcuaClient) {
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
