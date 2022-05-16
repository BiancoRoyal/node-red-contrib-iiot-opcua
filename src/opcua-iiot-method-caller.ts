/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
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
  registerToConnector, resetBiancoNode
} from "./core/opcua-iiot-core";

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
/**
 * OPC UA node representation for Node-RED OPC UA IIoT method call.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTMethodCaller (this: OPCUAIIoTMethodCaller, config: OPCUAIIoTMethodCallerDef) {
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

    let node = {
      ...this,
      iiot: initCoreNode()
    }

    const handleMethodError = function (err: Error, msg: Todo) {
      coreMethod.internalDebugLog(err)
      if (node.showErrors) {
        node.error(err, msg)
      }

      if (isSessionBad(err)) {
        node.emit('opcua_client_not_ready')
      }
    }

    node.iiot.handleMethodWarn = function (message: Todo) {
      if (node.showErrors) {
        node.warn(message)
      }

      coreMethod.internalDebugLog(message)
    }

    node.iiot.callMethodOnSession = function (session: Todo, msg: Todo) {
      if (checkSessionNotValid(session, 'MethodCaller')) {
        return
      }

      if (msg.methodId && msg.inputArguments) {
        coreMethod.getArgumentDefinition(node.iiot.opcuaSession, msg).then(function (results: Todo) {
          coreMethod.detailDebugLog('Call Argument Definition Results: ' + JSON.stringify(results))
          node.iiot.callMethod(msg, results)
        }).catch((err: Error) => {
          (isInitializedIIoTNode(node)) ? handleMethodError(err, msg) : coreMethod.internalDebugLog(err.message)
        })
      } else {
        coreMethod.internalDebugLog(new Error('No Method Id And/Or Parameters'))
      }
    }

    node.iiot.callMethod = function (msg: Todo, definitionResults: Todo) {
      coreMethod.callMethods(node.iiot.opcuaSession, msg).then(function (data: Todo) {
        coreMethod.detailDebugLog('Methods Call Results: ' + JSON.stringify(data))

        let result = null
        let outputArguments = []
        let message = Object.assign({}, data.msg)
        message.nodetype = 'method'
        message.methodType = data.msg.methodType

        for (result of data.results) {
          outputArguments.push({ statusCode: result.statusCode, outputArguments: result.outputArguments })
        }

        let dataValuesString: string
        if (node.justValue) {
          if (message.inputArguments) {
            delete message['inputArguments']
          }
          dataValuesString = JSON.stringify(outputArguments, null, 2)
        } else {
          dataValuesString = JSON.stringify({
            results: data.results,
            definition: definitionResults
          }, null, 2)
        }

        try {
          RED.util.setMessageProperty(message, 'payload', JSON.parse(dataValuesString))
        } catch (err: any) {
          if (node.showErrors) {
            node.warn('JSON not to parse from string for dataValues type ' )
            node.error(err, msg)
          }
          message.payload = dataValuesString
          message.error = err.message
        }

        node.send(message)
      }).catch(function (err: Error) {
        coreMethod.internalDebugLog(err)
        if (node.showErrors) {
          node.error(err, msg)
        }
      })
    }

    node.on('input', function (msg: Todo) {
      if (!checkConnectorState(node, msg, 'MethodCaller')) {
        return
      }

      const message = coreMethod.buildCallMessage(node, msg)
      if (coreMethod.invalidMessage(node, message)) {
        return
      }
      node.iiot.callMethodOnSession(node.iiot.opcuaSession, message)
    })

    registerToConnector(node as Todo)

    node.on('close', (done: () => void) => {
      deregisterToConnector(node as Todo, () => {
        resetBiancoNode(node)
        done()
      })
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Method-Caller', OPCUAIIoTMethodCaller)
}
