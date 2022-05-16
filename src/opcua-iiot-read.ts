/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import {Node, NodeAPI, NodeDef, NodeMessage, NodeMessageInFlow, NodeStatus} from "node-red";
import {Todo} from "./types/placeholders";
import {ClientSession} from "node-opcua";
import coreClient from "./core/opcua-iiot-core-client";
import {
  buildNodesToRead,
  checkConnectorState,
  checkSessionNotValid, deregisterToConnector,
  initCoreNode,
  isInitializedIIoTNode,
  isSessionBad, registerToConnector,
  resetIiotNode
} from "./core/opcua-iiot-core";
import {ReadValueIdOptions} from "node-opcua-service-read";
import {NodeIdLike} from "node-opcua-nodeid";

interface OPCUAIIoTRead extends Node {
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
interface OPCUAIIoTReadDef extends NodeDef {
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
module.exports = (RED: NodeAPI) => {
  // SOURCE-MAP-REQUIRED

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

    let node: Todo = {
      ...this,
      iiot: initCoreNode()
    }

    node.iiot.handleReadError = function (err: Error, msg: NodeMessage) {
      coreClient.readDebugLog(err)
      if (node.showErrors) {
        node.error(err, msg)
      }

      if (isSessionBad(err)) {
        node.emit('opcua_client_not_ready')
      }
    }

    node.iiot.readAllFromNodeId = function (session: ClientSession | Todo, itemsToRead: Todo[], msg: Todo) {
      coreClient.readAllAttributes(session, itemsToRead, msg)
        .then(function (readResult: Todo) {
          try {
            node.send(node.iiot.buildResultMessage('AllAttributes', readResult))
          } catch (err) {
            /* istanbul ignore next */
            node.iiot.handleReadError(err, readResult.msg)
          }
        }).catch(function (err: Error) {
          /* istanbul ignore next */
          (isInitializedIIoTNode(node)) ? node.iiot.handleReadError(err, msg) : coreClient.internalDebugLog(err.message)
        })
    }

    node.iiot.readValueFromNodeId = function (session: ClientSession | Todo, itemsToRead: Todo[], msg: Todo) {
      coreClient.readVariableValue(session, itemsToRead, msg)
        .then(function (readResult: Todo) {
          let message = node.iiot.buildResultMessage('VariableValue', readResult)
          node.send(message)
        }).catch(function (err: Error) {
          /* istanbul ignore next */
          (isInitializedIIoTNode(node)) ? node.iiot.handleReadError(err, msg) : coreClient.internalDebugLog(err.message)
        })
    }

    node.iiot.readHistoryDataFromNodeId = function (session: ClientSession | Todo, itemsToRead: Todo[], msg: Todo) {
      const startDate = new Date()
      node.iiot.historyStart = new Date()
      node.iiot.historyStart.setDate(startDate.getDate() - node.historyDays)
      node.iiot.historyEnd = new Date()

      coreClient.readHistoryValue(
        session,
        itemsToRead,
        msg.payload.historyStart || node.iiot.historyStart,
        msg.payload.historyEnd || node.iiot.historyEnd,
        msg)
        .then(function (readResult: Todo) {
          let message = node.iiot.buildResultMessage('HistoryValue', readResult)
          message.historyStart = readResult.startDate || node.iiot.historyStart
          message.historyEnd = readResult.endDate || node.iiot.historyEnd
          node.send(message)
        }).catch(function (err: Error) {
          /* istanbul ignore next */
          (isInitializedIIoTNode(node)) ? node.iiot.handleReadError(err, msg) : coreClient.internalDebugLog(err.message)
        })
    }

    node.iiot.readFromNodeId = function (session: ClientSession | Todo, itemsToRead: Todo[], msg: Todo) {

      const transformItem = (item: NodeIdLike): ReadValueIdOptions => {
        return {
          nodeId: item,
          attributeId: Number(node.attributeId) || undefined
        }
      }

      const transformedItemsToRead = itemsToRead.map(transformItem)


      coreClient.read(session, transformedItemsToRead, msg.payload.maxAge || node.maxAge, msg)
        .then(function (readResult: Todo) {
          let message = node.iiot.buildResultMessage('Default', readResult)
          message.maxAge = node.maxAge
          node.send(message)
        }).catch(function (err: Error) {
          /* istanbul ignore next */
          (isInitializedIIoTNode(node)) ? node.iiot.handleReadError(err, msg) : coreClient.internalDebugLog(err.message)
        })
    }

    node.iiot.readFromSession = function (session: ClientSession | Todo, itemsToRead: Todo, originMsg: Todo) {
      let msg = Object.assign({}, originMsg)
      if (checkSessionNotValid(session, 'Reader')) {
        return
      }

      coreClient.readDebugLog('Read With AttributeId ' + node.attributeId)
      switch (parseInt(node.attributeId)) {
        case coreClient.READ_TYPE.ALL:
          node.iiot.readAllFromNodeId(session, itemsToRead, msg)
          break
        case coreClient.READ_TYPE.VALUE:
          node.iiot.readValueFromNodeId(session, itemsToRead, msg)
          break
        case coreClient.READ_TYPE.HISTORY:
          node.iiot.readHistoryDataFromNodeId(session, itemsToRead, msg)
          break
        default:
          node.iiot.readFromNodeId(session, itemsToRead, msg)
      }
    }

    node.iiot.buildResultMessage = function (readType: Todo, readResult: Todo) {
      let message = Object.assign({}, readResult.msg)
      message.payload = {}
      message.nodetype = 'read'
      message.readtype = readType
      message.attributeId = node.attributeId
      message.justValue = node.justValue

      let dataValuesString = node.iiot.extractDataValueString(readResult)
      message = node.iiot.setMessageProperties(message, readResult, dataValuesString)

      if (!node.justValue) {
        message = node.iiot.enhanceMessage(message, readResult)
      }

      return message
    }

    node.iiot.extractDataValueString = function (readResult: Todo) {
      let dataValuesString = ""
      if (node.justValue) {
        dataValuesString = JSON.stringify(readResult.results, null, 2)
      } else {
        dataValuesString = JSON.stringify(readResult, null, 2)
      }
      return dataValuesString
    }

    node.iiot.setMessageProperties = function (message: Todo, readResult: Todo, stringValue: Todo) {
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

    node.iiot.enhanceMessage = function (message: Todo, readResult: Todo) {
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

    const errorHandler = (err: Error, msg: NodeMessage) => {
      this.error(err, msg)
    }

    const emitHandler = (msg: string) => {
      this.emit(msg)
    }

    const statusHandler = (status: string | NodeStatus) => {
      this.status(status)
    }

    this.on('input', function (msg: NodeMessageInFlow, send: (msg: NodeMessage | Array<NodeMessage | NodeMessage[] | null>) => void, done: () => void) {
      if (!checkConnectorState(node, msg, 'Read', errorHandler, emitHandler, statusHandler)) {
        return
      }

      try {
        node.iiot.readFromSession(node.iiot.opcuaSession, buildNodesToRead(msg), msg)
      } /* istanbul ignore next */ catch (err) {
        node.iiot.handleReadError(err, msg)
      }
    })


    const setStatus = (status: string | NodeStatus) => {
      this.status(status)
    }

    const onAlias = (event: string, callback: () => void) => {
      // @ts-ignore
      this.on(event, callback)

    }

    registerToConnector(node, setStatus, onAlias, errorHandler)

    this.on('close', (done: () => void) => {
      deregisterToConnector(node, () => {
        resetIiotNode(node)
        done()
      })
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Read', OPCUAIIoTRead)
}
