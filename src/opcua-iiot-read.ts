/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {Node} from "@node-red/registry";
import {Todo} from "./types/placeholders";
import {ClientSession} from "node-opcua";

interface OPCUAIIoTRead extends nodered.Node {
  attributeId: number
  maxAge: number
  depth: number
  name: string
  justValue: string
  showStatusActivities: string
  showErrors: string
  parseStrings: string
  historyDays: number
  connector: Node
}
interface OPCUAIIoTReadDef extends nodered.NodeDef {
  attributeId: string
  maxAge: string
  depth: string
  name: string
  justValue: string
  showStatusActivities: string
  showErrors: string
  parseStrings: string
  historyDays: string
  connector: string
}
/**
 * Read Node-RED node.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
  // SOURCE-MAP-REQUIRED
  let coreClient = require('./core/opcua-iiot-core-client')

  function OPCUAIIoTRead (this: OPCUAIIoTRead, config: OPCUAIIoTReadDef) {
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
    coreClient.core.assert(node.bianco.iiot)

    node.bianco.iiot.handleReadError = function (err: Error, msg: Todo) {
      coreClient.readDebugLog(err)
      if (node.showErrors) {
        node.error(err, msg)
      }

      if (coreClient.core.isSessionBad(err)) {
        node.emit('opcua_client_not_ready')
      }
    }

    node.bianco.iiot.readAllFromNodeId = function (session: ClientSession | Todo, itemsToRead: Todo[], msg: Todo) {
      coreClient.readAllAttributes(session, itemsToRead, msg)
        .then(function (readResult: Todo) {
          try {
            node.send(node.bianco.iiot.buildResultMessage('AllAttributes', readResult))
          } catch (err) {
            /* istanbul ignore next */
            node.bianco.iiot.handleReadError(err, readResult.msg)
          }
        }).catch(function (err: Error) {
          /* istanbul ignore next */
          (coreClient.core.isInitializedBiancoIIoTNode(node)) ? node.bianco.iiot.handleReadError(err, msg) : coreClient.internalDebugLog(err.message)
        })
    }

    node.bianco.iiot.readValueFromNodeId = function (session: ClientSession | Todo, itemsToRead: Todo[], msg: Todo) {
      coreClient.readVariableValue(session, itemsToRead, msg)
        .then(function (readResult: Todo) {
          let message = node.bianco.iiot.buildResultMessage('VariableValue', readResult)
          node.send(message)
        }).catch(function (err: Error) {
          /* istanbul ignore next */
          (coreClient.core.isInitializedBiancoIIoTNode(node)) ? node.bianco.iiot.handleReadError(err, msg) : coreClient.internalDebugLog(err.message)
        })
    }

    node.bianco.iiot.readHistoryDataFromNodeId = function (session: ClientSession | Todo, itemsToRead: Todo[], msg: Todo) {
      const startDate = new Date()
      node.bianco.iiot.historyStart = new Date()
      node.bianco.iiot.historyStart.setDate(startDate.getDate() - node.historyDays)
      node.bianco.iiot.historyEnd = new Date()

      coreClient.readHistoryValue(
        session,
        itemsToRead,
        msg.payload.historyStart || node.bianco.iiot.historyStart,
        msg.payload.historyEnd || node.bianco.iiot.historyEnd,
        msg)
        .then(function (readResult: Todo) {
          let message = node.bianco.iiot.buildResultMessage('HistoryValue', readResult)
          message.historyStart = readResult.startDate || node.bianco.iiot.historyStart
          message.historyEnd = readResult.endDate || node.bianco.iiot.historyEnd
          node.send(message)
        }).catch(function (err: Error) {
          /* istanbul ignore next */
          (coreClient.core.isInitializedBiancoIIoTNode(node)) ? node.bianco.iiot.handleReadError(err, msg) : coreClient.internalDebugLog(err.message)
        })
    }

    node.bianco.iiot.readFromNodeId = function (session: ClientSession | Todo, itemsToRead: Todo[], msg: Todo) {
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
        .then(function (readResult: Todo) {
          let message = node.bianco.iiot.buildResultMessage('Default', readResult)
          message.maxAge = node.maxAge
          node.send(message)
        }).catch(function (err: Error) {
          /* istanbul ignore next */
          (coreClient.core.isInitializedBiancoIIoTNode(node)) ? node.bianco.iiot.handleReadError(err, msg) : coreClient.internalDebugLog(err.message)
        })
    }

    node.bianco.iiot.readFromSession = function (session: ClientSession | Todo, itemsToRead: Todo, originMsg: Todo) {
      let msg = Object.assign({}, originMsg)
      if (coreClient.core.checkSessionNotValid(session, 'Reader')) {
        return
      }

      coreClient.readDebugLog('Read With AttributeId ' + node.attributeId)
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
    }

    node.bianco.iiot.buildResultMessage = function (readType: Todo, readResult: Todo) {
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

    node.bianco.iiot.extractDataValueString = function (readResult: Todo) {
      let dataValuesString = {}
      if (node.justValue) {
        dataValuesString = JSON.stringify(readResult.results, null, 2)
      } else {
        dataValuesString = JSON.stringify(readResult, null, 2)
      }
      return dataValuesString
    }

    node.bianco.iiot.setMessageProperties = function (message: Todo, readResult: Todo, stringValue: Todo) {
      try {
        RED.util.setMessageProperty(message, 'payload', JSON.parse(stringValue))
      } /* istanbul ignore next */ catch (err: any) {
        if (node.showErrors) {
          node.warn('JSON not to parse from string for dataValues type ' + JSON.stringify(readResult, null, 2))
          node.error(err, readResult.msg)
        }

        message.payload = stringValue
        message.error = err.message
      }
      return message
    }

    node.bianco.iiot.enhanceMessage = function (message: Todo, readResult: Todo) {
      try {
        message.resultsConverted = {}
        let dataValuesString = JSON.stringify(readResult.results, null, 2)
        RED.util.setMessageProperty(message, 'resultsConverted', JSON.parse(dataValuesString))
      } /* istanbul ignore next */ catch (err: any) {
        if (node.showErrors) {
          node.warn('JSON not to parse from string for dataValues type ' + readResult.results)
          node.error(err, readResult.msg)
        }

        message.resultsConverted = null
        message.error = err.message
      }
      return message
    }

    node.on('input', function (msg: Todo) {
      if (!coreClient.core.checkConnectorState(node, msg, 'Read')) {
        return
      }

      try {
        node.bianco.iiot.readFromSession(node.bianco.iiot.opcuaSession, coreClient.core.buildNodesToRead(msg), msg)
      } /* istanbul ignore next */ catch (err) {
        node.bianco.iiot.handleReadError(err, msg)
      }
    })

    coreClient.core.registerToConnector(node)

    node.on('close', (done: () => void) => {
      coreClient.core.deregisterToConnector(node, () => {
        coreClient.core.resetBiancoNode(node)
        done()
      })
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Read', OPCUAIIoTRead)
}
