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
    this.attributeId = parseInt(config.attributeId) || 0
    this.maxAge = parseInt(config.maxAge) || 1
    this.depth = parseInt(config.depth) || 1
    this.name = config.name
    this.justValue = config.justValue
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.parseStrings = config.parseStrings
    this.historyDays = parseInt(config.historyDays) || 1
    this.connector = RED.nodes.getNode(config.connector)

    let node = coreClient.core.initClientNode(this)

    node.handleReadError = function (err, msg) {
      coreClient.readDebugLog(err)
      if (node.showErrors) {
        node.error(err, msg)
      }

      if (node.connector && coreClient.core.isSessionBad(err)) {
        node.connector.resetBadSession()
      }
    }

    node.readAllFromNodeId = function (session, itemsToRead, msg) {
      coreClient.readAllAttributes(session, itemsToRead, msg)
        .then(function (readResult) {
          try {
            node.send(node.buildResultMessage('AllAttributes', readResult))
          } catch (err) {
            node.handleReadError(err, readResult.msg)
          }
        }).catch(function (err) {
          node.handleReadError(err, msg)
        })
    }

    node.readValueFromNodeId = function (session, itemsToRead, msg) {
      coreClient.readVariableValue(session, itemsToRead, msg)
        .then(function (readResult) {
          let message = node.buildResultMessage('VariableValue', readResult)
          node.send(message)
        }).catch(function (err) {
          node.handleReadError(err, msg)
        })
    }

    node.readHistoryDataFromNodeId = function (session, itemsToRead, msg) {
      const startDate = new Date()
      node.historyStart = new Date()
      node.historyStart.setDate(startDate.getDate() - node.historyDays)
      node.historyEnd = new Date()

      coreClient.readHistoryValue(
        session,
        itemsToRead,
        msg.payload.historyStart || node.historyStart,
        msg.payload.historyEnd || node.historyEnd,
        msg)
        .then(function (readResult) {
          let message = node.buildResultMessage('HistoryValue', readResult)
          message.historyStart = readResult.startDate || node.historyStart
          message.historyEnd = readResult.endDate || node.historyEnd
          node.send(message)
        }).catch(function (err) {
          node.handleReadError(err, msg)
        })
    }

    node.readFromNodeId = function (session, itemsToRead, msg) {
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

      coreClient.read(session, transformedItemsToRead, msg.payload.maxAge || node.maxAge, msg)
        .then(function (readResult) {
          let message = node.buildResultMessage('Default', readResult)
          message.maxAge = node.maxAge
          node.send(message)
        }).catch(function (err) {
          node.handleReadError(err, msg)
        })
    }

    node.readFromSession = function (session, itemsToRead, originMsg) {
      let msg = Object.assign({}, originMsg)
      if (coreClient.core.checkSessionNotValid(session, 'Reader')) {
        return
      }

      coreClient.readDebugLog('Read With AttributeId ' + node.attributeId)
      switch (parseInt(node.attributeId)) {
        case coreClient.READ_TYPE.ALL:
          node.readAllFromNodeId(session, itemsToRead, msg)
          break
        case coreClient.READ_TYPE.VALUE:
          node.readValueFromNodeId(session, itemsToRead, msg)
          break
        case coreClient.READ_TYPE.HISTORY:
          node.readHistoryDataFromNodeId(session, itemsToRead, msg)
          break
        default:
          node.readFromNodeId(session, itemsToRead, msg)
      }
    }

    node.buildResultMessage = function (readType, readResult) {
      let message = Object.assign({}, readResult.msg)
      message.payload = {}
      message.nodetype = 'read'
      message.readtype = readType
      message.attributeId = node.attributeId
      message.justValue = node.justValue

      let dataValuesString = node.extractDataValueString(readResult)
      message = node.setMessageProperties(message, readResult, dataValuesString)

      if (!node.justValue) {
        message = node.enhanceMessage(message, readResult)
      }

      return message
    }

    node.extractDataValueString = function (readResult) {
      let dataValuesString = {}
      if (node.justValue) {
        dataValuesString = JSON.stringify(readResult.results, null, 2)
      } else {
        dataValuesString = JSON.stringify(readResult, null, 2)
      }
      return dataValuesString
    }

    node.setMessageProperties = function (message, readResult, stringValue) {
      try {
        RED.util.setMessageProperty(message, 'payload', JSON.parse(stringValue))
      } catch (err) {
        if (node.showErrors) {
          node.warn('JSON not to parse from string for dataValues type ' + JSON.stringify(readResult, null, 2))
          node.error(err, readResult.msg)
        }

        message.payload = stringValue
        message.error = err.message
      }
      return message
    }

    node.enhanceMessage = function (message, readResult) {
      try {
        message.resultsConverted = {}
        let dataValuesString = JSON.stringify(readResult.results, null, 2)
        RED.util.setMessageProperty(message, 'resultsConverted', JSON.parse(dataValuesString))
      } catch (err) {
        if (node.showErrors) {
          node.warn('JSON not to parse from string for dataValues type ' + readResult.results)
          node.error(err, readResult.msg)
        }

        message.resultsConverted = null
        message.error = err.message
      }
      return message
    }

    node.on('input', function (msg) {
      if (!coreClient.core.checkConnectorState(node, msg, 'Read')) {
        return
      }

      try {
        node.readFromSession(node.opcuaSession, coreClient.core.buildNodesToRead(msg), msg)
      } catch (err) {
        node.handleReadError(err, msg)
      }
    })

    coreClient.core.registerToConnector(node)

    node.on('close', (done) => {
      coreClient.core.deregisterToConnector(node, done)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Read', OPCUAIIoTRead)
}
