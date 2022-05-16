/**
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

import {Todo} from "../types/placeholders";

import debug from 'debug';
import {coerceNodeId} from "node-opcua";
import {convertDataValueByDataType} from "./opcua-iiot-core";

const internalDebugLog = debug('opcuaIIoT:method') // eslint-disable-line no-use-before-define
const detailDebugLog = debug('opcuaIIoT:method:details') // eslint-disable-line no-use-before-define

const getArgumentDefinition = function (session: Todo, msg: Todo) {
  return new Promise(
    function (resolve, reject) {
      if (!session) {
        reject(new Error('Method Argument Definition Session Not Valid'))
      } else {
        try {
          let methodId = coerceNodeId(msg.methodId)

          session.getArgumentDefinition(methodId, function (err: Error, inputArguments: Todo, outputArguments: Todo) {
            if (err) {
              reject(err)
            } else {
              let results: Todo = {}
              results.methodId = methodId
              results.methodDefinition = {}
              results.methodDefinition.inputArguments = inputArguments
              results.methodDefinition.outputArguments = outputArguments
              resolve(results)
            }
          })
        } catch (err) {
          reject(err)
        }
      }
    })
}

const callMethods = function (session: Todo, msg: Todo) {
  return new Promise(
    function (resolve, reject) {
      if (!session) {
        reject(new Error('Methods Call Session Not Valid'))
      } else {
        try {
          msg.inputArguments.forEach(function (element: Todo) {
            element.value = convertDataValueByDataType({ value: element.value, dataType: element.dataType }, element.dataType)
          })

          let methodCalls = [{
            objectId: coerceNodeId(msg.objectId),
            methodId: coerceNodeId(msg.methodId),
            inputArguments: msg.inputArguments
          }]

          session.call(methodCalls, function (err: Todo, results: Todo) {
            if (err) {
              reject(err)
            } else {
              resolve({ results, msg })
            }
          })
        } catch (err) {
          reject(err)
        }
      }
    })
}

const buildMessagesFromMethodCalls = function (methodCallsResults: Todo) {
  return new Promise(
    function (resolve, reject) {
      if (!methodCallsResults) {
        reject(new Error('Methods Call Results To Messages Session Not Valid'))
      } else {
        let resultMessages: Todo[] = []
        resolve({ methodCallsResults: methodCallsResults, messages: resultMessages })
      }
    })
}

const invalidMessage = function (node: Todo, message: Todo) {
  let response = false

  if (!message.objectId) {
    node.iiot.handleMethodWarn('No Object-Id Found For Method Call')
    response = true
  }

  if (!message.methodId) {
    node.iiot.handleMethodWarn('No Method-Id Found For Method Call')
    response = true
  }

  if (!message.inputArguments) {
    node.iiot.handleMethodWarn('No Input Arguments Found For Method Call')
    response = true
  }

  if (!message.methodType) {
    node.iiot.handleMethodWarn('No Method Type Found For Method Call')
    response = true
  }

  return response
}

const buildCallMessage = function (node: Todo, msg: Todo) {
  let message = msg
  message.objectId = msg.payload.objectId || node.objectId
  message.methodId = msg.payload.methodId || node.methodId
  message.methodType = msg.payload.methodType || node.methodType
  message.inputArguments = msg.payload.inputArguments || node.inputArguments
  message.nodetype = 'method'
  return message
}

const coreMethod = {
  getArgumentDefinition,
  callMethods,
  buildMessagesFromMethodCalls,
  invalidMessage,
  buildCallMessage,
}

export default coreMethod
