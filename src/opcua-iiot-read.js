/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018,2019 - Klaus Landsdorf (https://bianco-royal.com/)
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
    this.serverMaxItemsToRead = parseInt(config.serverMaxItemsToRead) || 1000
    this.connector = RED.nodes.getNode(config.connector)

    let node = coreClient.core.initClientNode(this)
    coreClient.core.assert(node.bianco.iiot)

    node.bianco.iiot.handleReadError = function (err, msg) {
      coreClient.readDebugLog(err)
      if (node.showErrors) {
        node.error(err, msg)
      }

      if (coreClient.core.isSessionBad(err)) {
        node.emit('opcua_client_not_ready')
      }
    }

    node.bianco.iiot.readAllFromNodeId = function (session, itemsToRead, msg) {
      let itemsRead = []
      let itemsReadDone = []
      const itemSliceValue = parseInt(node.serverMaxItemsToRead * 0.01) || 10

      while (itemsToRead.length > 0) {
        itemsRead = itemsToRead.slice(0, itemSliceValue)
        itemsReadDone.push(itemsToRead.slice(0, itemSliceValue))
        itemsToRead = itemsToRead.slice(itemSliceValue + 1)

        coreClient.readAllAttributes(session, itemsRead, msg)
          .then(function (readResult) {
            try {
              node.send(node.bianco.iiot.buildResultMessage('AllAttributes', readResult))
            } catch (err) {
              /* istanbul ignore next */
              node.bianco.iiot.handleReadError(err, readResult.msg)
            }
          }).catch(function (err) {
            /* istanbul ignore next */
            (coreClient.core.isInitializedBiancoIIoTNode(node)) ? node.bianco.iiot.handleReadError(err, msg) : coreClient.internalDebugLog(err.message)
          })
      }
    }

    node.bianco.iiot.readValueFromNodeId = function (session, itemsToRead, msg) {
      let itemsRead = []
      let itemsReadDone = []

      while (itemsToRead.length > 0) {
        itemsRead = itemsToRead.slice(0, node.serverMaxItemsToRead - 1)
        itemsReadDone.push(itemsToRead.slice(0, node.serverMaxItemsToRead - 1))
        itemsToRead = itemsToRead.slice(node.serverMaxItemsToRead)

        coreClient.readVariableValue(session, itemsRead, msg)
          .then(function (readResult) {
            let message = node.bianco.iiot.buildResultMessage('VariableValue', readResult)
            node.send(message)
          }).catch(function (err) {
            /* istanbul ignore next */
            (coreClient.core.isInitializedBiancoIIoTNode(node)) ? node.bianco.iiot.handleReadError(err, msg) : coreClient.internalDebugLog(err.message)
          })
      }
    }

    node.bianco.iiot.readHistoryDataFromNodeId = function (session, itemsToRead, msg) {
      const startDate = new Date()
      node.bianco.iiot.historyStart = new Date()
      node.bianco.iiot.historyStart.setDate(startDate.getDate() - node.historyDays)
      node.bianco.iiot.historyEnd = new Date()

      let itemsRead = []
      let itemsReadDone = []

      while (itemsToRead.length > 0) {
        itemsRead = itemsToRead.slice(0, node.serverMaxItemsToRead - 1)
        itemsReadDone.push(itemsToRead.slice(0, node.serverMaxItemsToRead - 1))
        itemsToRead = itemsToRead.slice(node.serverMaxItemsToRead)

        coreClient.readHistoryValue(
          session,
          itemsRead,
          msg.payload.historyStart || node.bianco.iiot.historyStart,
          msg.payload.historyEnd || node.bianco.iiot.historyEnd,
          msg)
          .then(function (readResult) {
            let message = node.bianco.iiot.buildResultMessage('HistoryValue', readResult)
            message.historyStart = readResult.startDate || node.bianco.iiot.historyStart
            message.historyEnd = readResult.endDate || node.bianco.iiot.historyEnd
            node.send(message)
          }).catch(function (err) {
            /* istanbul ignore next */
            (coreClient.core.isInitializedBiancoIIoTNode(node)) ? node.bianco.iiot.handleReadError(err, msg) : coreClient.internalDebugLog(err.message)
          })
      }
    }

    node.bianco.iiot.readFromNodeId = function (session, itemsToRead, msg) {
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
      itemsToRead = transformedItemsToRead

      let itemsRead = []
      let itemsReadDone = []

      while (itemsToRead.length > 0) {
        itemsRead = itemsToRead.slice(0, node.serverMaxItemsToRead - 1)
        itemsReadDone.push(itemsToRead.slice(0, node.serverMaxItemsToRead - 1))
        itemsToRead = itemsToRead.slice(node.serverMaxItemsToRead)

        coreClient.read(session, itemsRead, msg.payload.maxAge || node.maxAge, msg)
          .then(function (readResult) {
            let message = node.bianco.iiot.buildResultMessage('Default', readResult)
            message.maxAge = node.maxAge
            node.send(message)
          }).catch(function (err) {
            /* istanbul ignore next */
            (coreClient.core.isInitializedBiancoIIoTNode(node)) ? node.bianco.iiot.handleReadError(err, msg) : coreClient.internalDebugLog(err.message)
          })
      }
    }

    node.bianco.iiot.readFromSession = function (session, itemsToRead, originMsg) {
      let msg = Object.assign({}, originMsg)
      if (coreClient.core.checkSessionNotValid(session, 'Reader')) {
        return
      }

      coreClient.readDebugLog('Read With AttributeId ' + node.attributeId)

      new Promise(function (resolve) {
        switch (parseInt(node.attributeId)) {
          case coreClient.READ_TYPE.ALL:
            node.bianco.iiot.readAllFromNodeId(session, itemsToRead, msg)
            break
          case coreClient.READ_TYPE.VALUE:
            node.bianco.iiot.readValueFromNodeId(session, itemsToRead, msg)
            break
          case coreClient.READ_TYPE.HISTORY:
            node.bianco.iiot.readHistoryDataFromNodeId(session, itemsToRead, msg)
            break
          default:
            node.bianco.iiot.readFromNodeId(session, itemsToRead, msg)
        }
        resolve()
      }).then(function () {
        if (node.showStatusActivities) {
          coreClient.core.setNodeStatusTo(node, 'active')
        }
      })
    }

    node.bianco.iiot.buildResultMessage = function (readType, readResult) {
      let message = Object.assign({}, readResult.msg)
      message.payload = {}
      message.nodetype = 'read'
      message.readtype = readType
      message.attributeId = node.attributeId
      message.justValue = node.justValue

      let dataValuesString = node.bianco.iiot.extractDataValueString(readResult)
      message = node.bianco.iiot.setMessageProperties(message, readResult, dataValuesString)

      if (!node.justValue) {
        message = node.bianco.iiot.enhanceMessage(message, readResult)
      }

      return message
    }

    node.bianco.iiot.extractDataValueString = function (readResult) {
      let dataValuesString = {}
      if (node.justValue) {
        dataValuesString = JSON.stringify(readResult.results, null, 2)
      } else {
        dataValuesString = JSON.stringify(readResult, null, 2)
      }
      return dataValuesString
    }

    node.bianco.iiot.setMessageProperties = function (message, readResult, stringValue) {
      try {
        RED.util.setMessageProperty(message, 'payload', JSON.parse(stringValue))
      } /* istanbul ignore next */ catch (err) {
        if (node.showErrors) {
          node.warn('JSON not to parse from string for dataValues type ' + JSON.stringify(readResult, null, 2))
          node.error(err, readResult.msg)
        }

        message.payload = stringValue
        message.error = err.message
      }
      return message
    }

    node.bianco.iiot.enhanceMessage = function (message, readResult) {
      try {
        message.resultsConverted = {}
        let dataValuesString = JSON.stringify(readResult.results, null, 2)
        RED.util.setMessageProperty(message, 'resultsConverted', JSON.parse(dataValuesString))
      } /* istanbul ignore next */ catch (err) {
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

      if (node.showStatusActivities) {
        coreClient.core.setNodeStatusTo(node, 'reading')
      }

      try {
        node.bianco.iiot.readFromSession(node.bianco.iiot.opcuaSession, coreClient.core.buildNodesToRead(msg), msg)
      } /* istanbul ignore next */ catch (err) {
        node.bianco.iiot.handleReadError(err, msg)
      }
    })

    coreClient.core.registerToConnector(node)

    node.on('close', (done) => {
      coreClient.core.deregisterToConnector(node, () => {
        coreClient.core.resetBiancoNode(node)
        done()
      })
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Read', OPCUAIIoTRead)
}
