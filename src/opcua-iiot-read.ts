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

    let node: Todo = this;
    node.iiot = initCoreNode()

    const handleReadError = (err: Error, msg: NodeMessage) => {
      coreClient.readDebugLog(err)
      if (node.showErrors) {
        this.error(err, msg)
      }

      if (isSessionBad(err)) {
        this.emit('opcua_client_not_ready')
      }
    }

    if (process.env.TEST === "true")
      node.functions = {
        handleReadError
      }

    const readAllFromNodeId = (session: ClientSession | Todo, itemsToRead: Todo[], msg: Todo) => {
      coreClient.readAllAttributes(session, itemsToRead, msg)
        .then((readResult: Todo) => {
          try {
            this.send(buildResultMessage('AllAttributes', readResult))
          } catch (err) {
            /* istanbul ignore next */
            node.iiot.handleReadError(err, readResult.msg)
          }
        }).catch(function (err: Error) {
          /* istanbul ignore next */
          (isInitializedIIoTNode(node)) ? handleReadError(err, msg) : coreClient.internalDebugLog(err.message)
        })
    }

    const readValueFromNodeId = (session: ClientSession | Todo, itemsToRead: Todo[], msg: Todo) => {
      coreClient.readVariableValue(session, itemsToRead, msg)
        .then((readResult: Todo) => {
          let message = buildResultMessage('VariableValue', readResult)
          this.send(message)
        }).catch(function (err: Error) {
          /* istanbul ignore next */
          (isInitializedIIoTNode(node)) ? handleReadError(err, msg) : coreClient.internalDebugLog(err.message)
        })
    }

    const readHistoryDataFromNodeId = (session: ClientSession | Todo, itemsToRead: Todo[], msg: Todo) => {
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
        .then((readResult: Todo) => {
          let message = buildResultMessage('HistoryValue', readResult)
          message.payload.historyStart = readResult.startDate || node.iiot.historyStart
          message.payload.historyEnd = readResult.endDate || node.iiot.historyEnd
          this.send(message)
        }).catch((err: Error) => {
          /* istanbul ignore next */
          (isInitializedIIoTNode(node)) ? handleReadError(err, msg) : coreClient.internalDebugLog(err.message)
        })
    }

    const readFromNodeId = (session: ClientSession | Todo, itemsToRead: Todo[], msg: Todo) => {

      const transformItem = (item: NodeIdLike): ReadValueIdOptions => {
        return {
          nodeId: item,
          attributeId: Number(node.attributeId) || undefined
        }
      }

      const transformedItemsToRead = itemsToRead.map(transformItem)


      coreClient.read(session, transformedItemsToRead, msg.payload.maxAge || node.maxAge, msg)
        .then((readResult: Todo) => {
          let message = buildResultMessage('Default', readResult)
          message.payload.maxAge = node.maxAge
          this.send(message)
        }).catch(function (err: Error) {
          /* istanbul ignore next */
          (isInitializedIIoTNode(node)) ? handleReadError(err, msg) : coreClient.internalDebugLog(err.message)
        })
    }

    const readFromSession = (session: ClientSession | Todo, itemsToRead: Todo, originMsg: Todo) => {
      let msg = Object.assign({}, originMsg)
      if (checkSessionNotValid(session, 'Reader')) {
        return
      }

      coreClient.readDebugLog('Read With AttributeId ' + node.attributeId)
      switch (parseInt(node.attributeId)) {
        case coreClient.READ_TYPE.ALL:
          readAllFromNodeId(session, itemsToRead, msg)
          break
        case coreClient.READ_TYPE.VALUE:
          readValueFromNodeId(session, itemsToRead, msg)
          break
        case coreClient.READ_TYPE.HISTORY:
          readHistoryDataFromNodeId(session, itemsToRead, msg)
          break
        default:
          readFromNodeId(session, itemsToRead, msg)
      }
    }

    const buildResultMessage = function (readType: Todo, readResult: Todo) {
      let payload = {
        ...readResult.msg.payload,
        nodetype: 'read',
        readtype: readType,
        attributeId: node.attributeId,
        justValue: node.justValue,
        payloadType: 'read'
      }

      let dataValuesString = extractDataValueString(readResult)

      payload = setMessageProperties(payload, readResult, dataValuesString)

      if (!node.justValue) {
        payload = enhanceMessage(payload, readResult)
      }

      let message: NodeMessage = {
        ...readResult.msg,
        payload
      }

      return message as Todo
    }

    const extractDataValueString = function (readResult: Todo) {
      let dataValuesString
      if (node.justValue) {
        dataValuesString = JSON.stringify(readResult.results, null, 2)
      } else {
        dataValuesString = JSON.stringify(readResult, null, 2)
      }
      return dataValuesString
    }

    const setMessageProperties = (payload: Todo, readResult: Todo, stringValue: Todo) => {
      try {
        RED.util.setMessageProperty(payload, 'value', JSON.parse(stringValue))
      } /* istanbul ignore next */ catch (err: any) {
        if (node.showErrors) {
          this.warn('JSON not to parse from string for dataValues type ' + JSON.stringify(readResult, null, 2))
          this.error(err, readResult.msg)
        }

        payload.value = stringValue
        payload.error = err.message
      }
      return payload
    }

    const enhanceMessage = (payload: Todo, readResult: Todo) => {
      try {
        payload.resultsConverted = {}
        let dataValuesString = JSON.stringify(readResult.results, null, 2)
        RED.util.setMessageProperty(payload, 'resultsConverted', JSON.parse(dataValuesString))
      } /* istanbul ignore next */ catch (err: any) {
        if (node.showErrors) {
          this.warn('JSON not to parse from string for dataValues type ' + readResult.results)
          this.error(err, readResult.msg)
        }

        payload.resultsConverted = null
        payload.error = err.message
      }
      return payload
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
        readFromSession(node.connector.iiot.opcuaSession, buildNodesToRead(msg.payload), msg)
      } /* istanbul ignore next */ catch (err: any) {
        handleReadError(err, msg)
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

    if (process.env.isTest === 'TRUE') {
      node.iiot = {
        ...node.iiot,
        handleReadError,
      }
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Read', OPCUAIIoTRead)
}
