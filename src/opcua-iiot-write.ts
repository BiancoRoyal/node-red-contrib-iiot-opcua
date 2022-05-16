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
  OPCUASession,
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
  isSessionBad, registerToConnector, resetIiotNode
} from "./core/opcua-iiot-core";
import {WriteValueOptions} from "node-opcua-service-write";
import {NodeMessage, NodeStatus} from "node-red";


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

    let node: CoreNode = this;
    node.iiot = initCoreNode()

    const handleWriteError = (err: Error, msg: NodeMessage) => {
      coreClient.writeDebugLog(err)
      if (node.showErrors) {
        this.error(err, msg)
      }

      /* istanbul ignore next */
      if (isSessionBad(err)) {
        this.emit('opcua_client_not_ready')
      }
    }

    const writeToSession = (session: OPCUASession, originMsg: Todo) => {
      if (checkSessionNotValid(session, 'Writer')) {
        /* istanbul ignore next */
        return
      }

      let msg = Object.assign({}, originMsg)
      const nodesToWrite: WriteValueOptions[] = buildNodesToWrite(msg)
      coreClient.write(session, nodesToWrite, msg).then((writeResult: Promise<WriteResult>): void => {
        try {
          let message = buildResultMessage(writeResult)
          this.send(message)
        } catch (err: any) {
          /* istanbul ignore next */
          (isInitializedIIoTNode(node)) ? handleWriteError(err, msg) : coreClient.internalDebugLog(err.message)
        }
      }).catch(function (err: Error) {
        /* istanbul ignore next */
        (isInitializedIIoTNode(node)) ? handleWriteError(err, msg) : coreClient.internalDebugLog(err.message)
      })
    }

    const buildResultMessage = (result: WriteResult): ResultMessage => {
      let message = Object.assign({}, result.msg)
      message.nodetype = 'write'
      message.justValue = node.justValue

      let dataValuesString = extractDataValueString(message, result)
      message = setMessageProperties(message, result, dataValuesString)
      return message
    }

    const extractDataValueString = (message: WriteResultMessage, result: WriteResult): string => {
      let dataValuesString: string
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

    const setMessageProperties =  (message: WriteResultMessage, result: WriteResult, stringValue: string) => {
      try {
        RED.util.setMessageProperty(message, 'payload', JSON.parse(stringValue))
      } /* istanbul ignore next */ catch (err: any) {
        coreClient.writeDebugLog(err)
        if (node.showErrors) {
          this.warn('JSON not to parse from string for write statusCodes type ' + typeof result.statusCodes)
          this.error(err, result.msg)
        }
        message.resultsConverted = stringValue
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

    const statusHandler = (status: string | NodeStatus): void => {
      this.status(status)
    }

    this.on('input', (msg: NodeMessageInFlow) => {
      if (!checkConnectorState(node, msg, 'Write', errorHandler, emitHandler, statusHandler)) {
        return
      }
      // recursivePrintTypes(msg);
      if ((msg as Todo).injectType === 'write') {
        writeToSession(node.iiot.opcuaSession, msg)
      } else {
        coreClient.writeDebugLog('Wrong Inject Type ' + (msg as Todo).injectType + '! The Type has to be write.')
        /* istanbul ignore next */
        if (node.showErrors) {
          this.warn('Wrong Inject Type ' + (msg as Todo).injectType + '! The msg.injectType has to be write.')
        }
      }
    })

    const onAlias = (event: string, callback: () => void) => {
      // @ts-ignore
      this.on(event, callback)
    }

    registerToConnector(node, statusHandler, onAlias, errorHandler)

    this.on('close', (done: TodoVoidFunction) => {
      deregisterToConnector(node, () => {
        resetIiotNode(node)
        done()
      })
    })
    if (process.env.TEST === "true"){
      node.functions = {
        handleWriteError
      }
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Write', OPCUAIIoTWrite)
}
