/*
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2017,2018,2019,2020,2021,2022 Klaus Landsdorf (https://bianco-royal.space/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {Node} from "@node-red/registry";
import {Todo} from "./types/placeholders";
import coreMethod from "./core/opcua-iiot-core-method";
import {
  checkConnectorState, checkSessionNotValid,
  deregisterToConnector,
  initCoreNode, isInitializedIIoTNode,
  isSessionBad,
  registerToConnector, resetIiotNode
} from "./core/opcua-iiot-core";
import {NodeMessage, NodeStatus} from "node-red";

interface OPCUAIIoTMethodCaller extends nodered.Node {
  objectId: string
  methodId: string
  methodType: string
  value: string
  justValue: string
  name: string
  showStatusActivities: string
  showErrors: string
  inputArguments: string
  connector: Node
}

interface OPCUAIIoTMethodCallerDef extends nodered.NodeDef {
  objectId: string
  methodId: string
  methodType: string
  value: string
  justValue: string
  name: string
  showStatusActivities: string
  showErrors: string
  inputArguments: string
  connector: string
}

export type MethodPayload = Todo & {
  nodetype: 'method'
}

/**
 * OPC UA node representation for Node-RED OPC UA IIoT method call.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTMethodCaller(this: OPCUAIIoTMethodCaller, config: OPCUAIIoTMethodCallerDef) {
    RED.nodes.createNode(this, config)
    this.objectId = config.objectId
    this.methodId = config.methodId
    this.methodType = config.methodType
    this.value = config.value
    this.justValue = config.justValue
    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.inputArguments = config.inputArguments
    this.connector = RED.nodes.getNode(config.connector)

    let node: Todo = this
    node.iiot = initCoreNode()

    const handleMethodError = (err: Error, msg: Todo) => {
      coreMethod.internalDebugLog(err)
      if (node.showErrors) {
        this.error(err, msg)
      }

      if (isSessionBad(err)) {
        this.emit('opcua_client_not_ready')
      }
    }

    const handleMethodWarn = (message: Todo) => {
      if (node.showErrors) {
        this.warn(message)
      }

      coreMethod.internalDebugLog(message)
    }

    const callMethodOnSession = (session: Todo, msg: Todo) => {
      if (checkSessionNotValid(session, 'MethodCaller')) {
        return
      }

      if (msg.payload.methodId && msg.payload.inputArguments) {
        coreMethod.getArgumentDefinition(node.connector.iiot.opcuaSession, msg).then(function (results: Todo) {
          coreMethod.detailDebugLog('Call Argument Definition Results: ' + JSON.stringify(results))
          callMethod(msg, results)
        }).catch((err: Error) => {
          isInitializedIIoTNode(node) ? handleMethodError(err, msg) : coreMethod.internalDebugLog(err.message)
        })
      } else {
        coreMethod.internalDebugLog(new Error('No Method Id And/Or Parameters'))
      }
    }

    const getDataValue = (message: Todo, result: Todo, definitionResults: Todo) => {
      if (node.justValue) {
        if (message.payload.inputArguments) {
          delete message.payload['inputArguments']
        }
        return null
      } else {
        return {
          result,
          definition: definitionResults
        }
      }
    }

    const callMethod = (msg: Todo, definitionResults: Todo) => {
      coreMethod.callMethods(node.connector.iiot.opcuaSession, msg).then((data: Todo) => {
        coreMethod.detailDebugLog('Methods Call Results: ' + JSON.stringify(data))

        let result = null
        let outputArguments = []
        let message = Object.assign({}, data.msg)
        message.payload.nodetype = 'method'
        message.payload.methodType = data.msg.payload.methodType

        for (result of data.results) {
          outputArguments.push({statusCode: result.statusCode, outputArguments: result.outputArguments})
        }

        message.payload.value = getDataValue(message, data.results, definitionResults) || outputArguments
        message.payload.definition = definitionResults
        message.payload.value = message.payload.value.result.map((item: Todo) => {
          if (item.statusCode) {
            return {
              ...item,
              statusCode: {
                value: item.statusCode._value,
                description: item.statusCode._description,
                name: item.statusCode._name,
              }
            }
          }
          return item
        })
        message.payload.outputArguments = outputArguments;

        this.send(message)
      }).catch((err: Error) => {
        coreMethod.internalDebugLog(err)
        if (node.showErrors) {
          this.error(err, msg)
        }
      })
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

    this.on('input', function (msg: Todo) {
      if (!checkConnectorState(node, msg, 'MethodCaller', errorHandler, emitHandler, statusHandler)) {
        return
      }

      const message = coreMethod.buildCallMessage(node, msg)
      if (coreMethod.invalidMessage(node, message, handleMethodWarn)) {
        return
      }
      callMethodOnSession(node.connector.iiot.opcuaSession, message)
    })

    const onAlias = (event: string, callback: (...args: any) => void) => {
      // @ts-ignore
      this.on(event, callback)
    }

    registerToConnector(node as Todo, statusHandler, onAlias, errorHandler)

    this.on('close', (done: () => void) => {
      deregisterToConnector(node as Todo, () => {
        resetIiotNode(node)
        done()
      })
    })

    if (process.env.TEST === "true")
      node.functions = {
        handleMethodError,
        handleMethodWarn,
        callMethodOnSession
      }
  }

  RED.nodes.registerType('OPCUA-IIoT-Method-Caller', OPCUAIIoTMethodCaller)
}
