/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
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
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.parseStrings = config.parseStrings
    this.connector = RED.nodes.getNode(config.connector)

    let node = this
    node.reconnectTimeout = 1000
    node.sessionTimeout = null
    node.opcuaClient = null
    node.opcuaSession = null

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
      coreClient.readDebugLog(err)
      if (node.showErrors) {
        node.error(err, msg)
      }

      if (err && err.message) {
        if (coreClient.core.isSessionBad(err)) {
          node.connector.resetBadSession()
        }
      }
    }

    node.readFromSession = function (session, itemsToRead, msg) {
      coreClient.readDebugLog('Read With AttributeId ' + node.attributeId)

      switch (parseInt(node.attributeId)) {
        case 0:
          coreClient.readAllAttributes(session, itemsToRead).then(function (readResult) {
            try {
              node.send(node.buildResultMessage(msg, 'AllAttributes', readResult))
            } catch (err) {
              node.handleReadError(err, msg)
            }
          }).catch(function (err) {
            node.handleReadError(err, msg)
          })
          break
        case 13:
          coreClient.readVariableValue(session, itemsToRead).then(function (readResult) {
            try {
              let message = node.buildResultMessage(msg, 'VariableValue', readResult)
              node.send(message)
            } catch (err) {
              node.handleReadError(err, msg)
            }
          }).catch(function (err) {
            node.handleReadError(err, msg)
          })
          break
        case 130:
          let historyDate = new Date()
          node.historyStart = new Date(historyDate.getDate() - 1)
          node.historyEnd = historyDate

          coreClient.readHistoryValue(session, itemsToRead, node.historyStart, node.historyEnd).then(function (readResult) {
            try {
              let message = node.buildResultMessage(msg, 'HistoryValue', readResult)
              message.historyStart = node.historyStart
              message.historyEnd = node.historyEnd
              node.send(message)
            } catch (err) {
              node.handleReadError(err, msg)
            }
          }).catch(function (err) {
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
            transformedItemsToRead.push(transformedItem)
          }

          coreClient.read(session, transformedItemsToRead, node.maxAge).then(function (readResult) {
            try {
              let message = node.buildResultMessage(msg, 'Default', readResult)
              message.maxAge = node.maxAge
              node.send(message)
            } catch (err) {
              node.handleReadError(err, msg)
            }
          }).catch(function (err) {
            node.handleReadError(err, msg)
          })
      }
    }

    node.buildResultMessage = function (msg, readType, readResult) {
      let message = msg
      message.payload = {}
      message.nodetype = 'read'
      message.readtype = readType
      message.attributeId = node.attributeId

      let dataValuesString = {}
      if (node.justValue) {
        dataValuesString = JSON.stringify(readResult.results, null, 2)
      } else {
        dataValuesString = JSON.stringify(readResult, null, 2)
      }

      try {
        RED.util.setMessageProperty(message, 'payload', JSON.parse(dataValuesString))
      } catch (err) {
        if (node.showErrors) {
          node.warn('JSON not to parse from string for dataValues type ' + JSON.stringify(readResult, null, 2))
          node.error(err, msg)
        }

        message.payload = dataValuesString
        message.error = err.message
      }

      if (!node.justValue) {
        try {
          message.resultsConverted = {}
          let dataValuesString = JSON.stringify(readResult.results, null, 2)
          RED.util.setMessageProperty(message, 'resultsConverted', JSON.parse(dataValuesString))
        } catch (err) {
          if (node.showErrors) {
            node.warn('JSON not to parse from string for dataValues type ' + readResult.results)
            node.error(err, msg)
          }

          message.resultsConverted = null
          message.error = err.message
        }
      }

      return message
    }

    node.on('input', function (msg) {
      if (!node.opcuaSession) {
        node.error(new Error('Session Not Ready To Read'), msg)
        return
      }

      node.readFromSession(node.opcuaSession, coreClient.core.buildNodesToRead(msg), msg)
    })

    node.setOPCUAConnected = function (opcuaClient) {
      node.opcuaClient = opcuaClient
      node.setNodeStatusTo('connected')
    }

    node.opcuaSessionStarted = function (opcuaSession) {
      node.opcuaSession = opcuaSession
      node.setNodeStatusTo('active')
    }

    node.connectorShutdown = function (opcuaClient) {
      coreClient.readDebugLog('Connector Shutdown')
      if (opcuaClient) {
        node.opcuaClient = opcuaClient
      }
    }

    if (node.connector) {
      node.connector.on('connected', node.setOPCUAConnected)
      node.connector.on('session_started', node.opcuaSessionStarted)
      node.connector.on('after_reconnection', node.connectorShutdown)
    } else {
      throw new TypeError('Connector Not Valid')
    }

    node.setNodeStatusTo('waiting')
  }

  RED.nodes.registerType('OPCUA-IIoT-Read', OPCUAIIoTRead)
}
