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
  let coreMethod = require('./core/opcua-iiot-core-method')

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

    let node = coreMethod.core.initClientNode(this)
    coreMethod.core.assert(node.bianco.iiot)

    node.bianco.iiot.handleMethodError = function (err: Error, msg: Todo) {
      coreMethod.internalDebugLog(err)
      if (node.showErrors) {
        node.error(err, msg)
      }

      if (coreMethod.core.isSessionBad(err)) {
        node.emit('opcua_client_not_ready')
      }
    }

    node.bianco.iiot.handleMethodWarn = function (message: Todo) {
      if (node.showErrors) {
        node.warn(message)
      }

      coreMethod.internalDebugLog(message)
    }

    node.bianco.iiot.callMethodOnSession = function (session: Todo, msg: Todo) {
      if (coreMethod.core.checkSessionNotValid(session, 'MethodCaller')) {
        return
      }

      if (msg.methodId && msg.inputArguments) {
        coreMethod.getArgumentDefinition(node.bianco.iiot.opcuaSession, msg).then(function (results: Todo) {
          coreMethod.detailDebugLog('Call Argument Definition Results: ' + JSON.stringify(results))
          node.bianco.iiot.callMethod(msg, results)
        }).catch((err: Error) => {
          (coreMethod.core.isInitializedBiancoIIoTNode(node)) ? node.bianco.iiot.handleMethodError(err, msg) : coreMethod.internalDebugLog(err.message)
        })
      } else {
        coreMethod.internalDebugLog(new Error('No Method Id And/Or Parameters'))
      }
    }

    node.bianco.iiot.callMethod = function (msg: Todo, definitionResults: Todo) {
      coreMethod.callMethods(node.bianco.iiot.opcuaSession, msg).then(function (data: Todo) {
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
      if (!coreMethod.core.checkConnectorState(node, msg, 'MethodCaller')) {
        return
      }

      const message = coreMethod.buildCallMessage(node, msg)
      if (coreMethod.invalidMessage(node, message)) {
        return
      }
      node.bianco.iiot.callMethodOnSession(node.bianco.iiot.opcuaSession, message)
    })

    coreMethod.core.registerToConnector(node)

    node.on('close', (done: () => void) => {
      coreMethod.core.deregisterToConnector(node, () => {
        coreMethod.core.resetBiancoNode(node)
        done()
      })
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Method-Caller', OPCUAIIoTMethodCaller)
}
