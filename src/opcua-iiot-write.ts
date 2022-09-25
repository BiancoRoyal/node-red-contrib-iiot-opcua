/*
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import {
  Todo,
  TodoVoidFunction,
} from "./types/placeholders";
import coreClient from "./core/opcua-iiot-core-client";
import {
  buildNodesToWrite,
  checkConnectorState,
  checkSessionNotValid,
  deregisterToConnector,
  initCoreNode,
  isInitializedIIoTNode,
  isSessionBad,
  registerToConnector,
  resetIiotNode
} from "./core/opcua-iiot-core";
import {WriteValueOptions} from "node-opcua-service-write";
import {Node, NodeAPI, NodeDef, NodeMessage, NodeMessageInFlow, NodeStatus} from "node-red";
import {BrowserPayload} from "./opcua-iiot-browser";
import {ClientSession} from "node-opcua";


interface OPCUAIIoTWrite extends Node {
  name: string
  justValue: string
  showStatusActivities: boolean
  showErrors: boolean
  connector: Node
}

interface OPCUAIIoTWriteDef extends NodeDef {
  name: string
  justValue: string
  showStatusActivities: boolean
  showErrors: boolean
  connector: string
}

export type WriteResult = {
  statusCodes: Todo,
  nodesToWrite: Todo,
  msg: NodeMessageInFlow & Todo
}

export type WriteResultMessage = NodeMessageInFlow & {
  payload: WritePayload
}

export type WritePayload = {
  nodetype: 'write'
  justValue: Todo
  nodesToWrite: Todo[]
  value: Todo
  valuesToWrite: Todo
}

/**
 * Write Node-RED node.
 *
 * @param RED
 */
module.exports = (RED: NodeAPI) => {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTWrite(this: OPCUAIIoTWrite, config: OPCUAIIoTWriteDef) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.justValue = config.justValue
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connector = RED.nodes.getNode(config.connector)

    let self: Todo = this;
    self.iiot = initCoreNode()

    const handleWriteError = (err: Error, msg: NodeMessage) => {
      coreClient.writeDebugLog(err)
      if (self.showErrors) {
        this.error(err, msg)
      }

      /* istanbul ignore next */
      if (isSessionBad(err)) {
        this.emit('opcua_client_not_ready')
      }
    }

    const writeToSession = (session: ClientSession, originMsg: Todo) => {
      if (checkSessionNotValid(session, 'Writer')) {
        /* istanbul ignore next */
        return
      }

      let msg = Object.assign({}, originMsg)
      const nodesToWrite: WriteValueOptions[] = buildNodesToWrite(msg)
      coreClient.write(session, nodesToWrite, msg).then((writeResult: WriteResult): void => {
        try {
          let message = buildResultMessage(writeResult)
          this.send(message)
        } catch (err: any) {
          /* istanbul ignore next */
          isInitializedIIoTNode(self) ? handleWriteError(err, msg) : coreClient.internalDebugLog(err.message)
        }
      }).catch(function (err: Error) {
        /* istanbul ignore next */
        isInitializedIIoTNode(self) ? handleWriteError(err, msg) : coreClient.internalDebugLog(err.message)
      })
    }

    const buildResultMessage = (result: WriteResult): WriteResultMessage => {
      let message = Object.assign({}, result.msg)
      message.payload.nodetype = 'write'
      message.payload.justValue = self.justValue

      message.payload.value = extractDataValue(message, result)
      return message
    }

    const extractDataValue = (message: WriteResultMessage, result: WriteResult): Todo => {
      let dataValues: string
      if (self.justValue) {
        if (message.payload.valuesToWrite) {
          delete message.payload['valuesToWrite']
        }

        return {
          statusCodes: result.statusCodes
        }
      } else {
        delete result['msg']
        return result
      }
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
      if (!checkConnectorState(self, msg, 'Write', errorHandler, emitHandler, statusHandler)) {
        return
      }
      const payload = msg.payload as BrowserPayload
      // recursivePrintTypes(msg);
      if (payload.injectType === 'write') {
        writeToSession(self.connector.iiot.opcuaSession, msg)
      } else {
        coreClient.writeDebugLog('Wrong Inject Type ' + payload.injectType + '! The Type has to be write.')
        /* istanbul ignore next */
        if (self.showErrors) {
          this.warn('Wrong Inject Type ' + payload.injectType + '! The msg.payload.injectType has to be write.')
        }
      }
    })

    const onAlias = (event: string, callback: () => void) => {
      // @ts-ignore
      this.on(event, callback)
    }

    registerToConnector(self, statusHandler, onAlias, errorHandler)

    this.on('close', (done: TodoVoidFunction) => {
      deregisterToConnector(self, () => {
        resetIiotNode(self)
        done()
      })
    })
    if (process.env.TEST === "true") {
      self.functions = {
        handleWriteError
      }
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Write', OPCUAIIoTWrite)
}
