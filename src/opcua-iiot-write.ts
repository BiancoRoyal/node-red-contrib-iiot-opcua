/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {Node, NodeMessageInFlow} from "@node-red/registry";
import {
  CoreNode,
  OPCUASession, recursivePrintTypes,
  ResultMessage,
  Todo,
  TodoVoidFunction,
  WriteResult,
  WriteResultMessage
} from "./types/placeholders";
import coreClient from "./core/opcua-iiot-core-client";
import {
  buildNodesToWrite, checkConnectorState,
  checkSessionNotValid, deregisterToConnector,
  initCoreNode,
  isInitializedIIoTNode,
  isSessionBad, registerToConnector, resetBiancoNode
} from "./core/opcua-iiot-core";
import {WriteValueOptions} from "node-opcua-service-write";


interface OPCUAIIoTWrite extends nodered.Node {
  name: string
  justValue: string
  showStatusActivities: boolean
  showErrors: boolean
  connector: Node
}

interface OPCUAIIoTWriteDef extends nodered.NodeDef {
  name: string
  justValue: string
  showStatusActivities: boolean
  showErrors: boolean
  connector: string
}

/**
 * Write Node-RED node.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTWrite (this: OPCUAIIoTWrite, config: OPCUAIIoTWriteDef) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.justValue = config.justValue
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connector = RED.nodes.getNode(config.connector)

    let node: CoreNode = {
      iiot: initCoreNode()
    }

    node.iiot.handleWriteError = (err: Error, msg: string) => {
      coreClient.writeDebugLog(err)
      if (node.showErrors) {
        node.error(err, msg)
      }

      /* istanbul ignore next */
      if (isSessionBad(err)) {
        node.emit('opcua_client_not_ready')
      }
    }

    node.iiot.writeToSession = (session: OPCUASession, originMsg: Todo) => {
      if (checkSessionNotValid(session, 'Writer')) {
        /* istanbul ignore next */
        return
      }

      let msg = Object.assign({}, originMsg)
      const nodesToWrite: WriteValueOptions[] = buildNodesToWrite(msg)
      coreClient.write(session, nodesToWrite, msg).then((writeResult: Promise<WriteResult>): void => {
        try {
          let message = node.iiot.buildResultMessage(writeResult)
          node.send(message)
        } catch (err: any) {
          /* istanbul ignore next */
          (isInitializedIIoTNode(node)) ? node.iiot.handleWriteError(err, msg) : coreClient.internalDebugLog(err.message)
        }
      }).catch(function (err: Error) {
        /* istanbul ignore next */
        (isInitializedIIoTNode(node)) ? node.iiot.handleWriteError(err, msg) : coreClient.internalDebugLog(err.message)
      })
    }

    node.iiot.buildResultMessage = (result: WriteResult): ResultMessage => {
      let message = Object.assign({}, result.msg)
      message.nodetype = 'write'
      message.justValue = node.justValue

      let dataValuesString = node.iiot.extractDataValueString(message, result)
      message = node.iiot.setMessageProperties(message, result, dataValuesString)
      return message
    }

    node.iiot.extractDataValueString = (message: WriteResultMessage, result: WriteResult): string => {
      let dataValuesString = ""
      if (node.justValue) {
        dataValuesString = JSON.stringify({
          statusCodes: result.statusCodes
        }, null, 2)

        if (message.valuesToWrite) {
          delete message['valuesToWrite']
        }
      } else {
        dataValuesString = JSON.stringify(result, null, 2)
      }
      return dataValuesString
    }

    node.iiot.setMessageProperties =  (message: WriteResultMessage, result: WriteResult, stringValue: string) => {
      try {
        RED.util.setMessageProperty(message, 'payload', JSON.parse(stringValue))
      } /* istanbul ignore next */ catch (err: any) {
        coreClient.writeDebugLog(err)
        if (node.showErrors) {
          node.warn('JSON not to parse from string for write statusCodes type ' + typeof result.statusCodes)
          node.error(err, result.msg)
        }
        message.resultsConverted = stringValue
        message.error = err.message
      }
      return message
    }

    node.on('input', (msg: NodeMessageInFlow) => {
      if (!checkConnectorState(node, msg, 'Write')) {
        return
      }
      // recursivePrintTypes(msg);
      if ((msg as Todo).injectType === 'write') {
        node.iiot.writeToSession(node.iiot.opcuaSession, msg)
      } else {
        coreClient.writeDebugLog('Wrong Inject Type ' + (msg as Todo).injectType + '! The Type has to be write.')
        /* istanbul ignore next */
        if (node.showErrors) {
          node.warn('Wrong Inject Type ' + (msg as Todo).injectType + '! The msg.injectType has to be write.')
        }
      }
    })

    registerToConnector(node)

    node.on('close', (done: TodoVoidFunction) => {
      deregisterToConnector(node, () => {
        resetBiancoNode(node)
        done()
      })
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Write', OPCUAIIoTWrite)
}
