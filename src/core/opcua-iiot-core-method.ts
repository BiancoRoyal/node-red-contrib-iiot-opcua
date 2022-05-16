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
import {ClientSession, coerceNodeId} from "node-opcua";
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
          let methodId = coerceNodeId(msg.payload.methodId)

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

const callMethods = function (session: ClientSession, msg: Todo) {
  return new Promise(
    function (resolve, reject) {
      if (!session) {
        reject(new Error('Methods Call Session Not Valid'))
      } else {
        try {
          msg.payload.inputArguments.forEach(function (element: Todo) {
            element.value = convertDataValueByDataType(element.value, element.dataType)
          })
          let methodCalls = [{
            objectId: coerceNodeId(msg.payload.objectId),
            methodId: coerceNodeId(msg.payload.methodId),
            inputArguments: msg.payload.inputArguments
          }]

          session.call(methodCalls, function (err: Todo, results: Todo) {
            if (err) {
              reject(err)
            } else {
              resolve({results, msg})
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
        resolve({methodCallsResults: methodCallsResults, messages: resultMessages})
      }
    })
}

const invalidMessage = function (node: Todo, message: Todo, handleMethodWarn: (message: Todo) => void) {
  let response = false

  if (!message.payload.objectId) {
    handleMethodWarn('No Object-Id Found For Method Call')
    response = true
  }

  if (!message.payload.methodId) {
    handleMethodWarn('No Method-Id Found For Method Call')
    response = true
  }

  if (!message.payload.inputArguments) {
    handleMethodWarn('No Input Arguments Found For Method Call')
    response = true
  }

  if (!message.payload.methodType) {
    handleMethodWarn('No Method Type Found For Method Call')
    response = true
  }

  return response
}

const buildCallMessage = function (node: Todo, msg: Todo) {
  let message = msg
  message.payload.objectId = msg.payload.objectId || node.objectId
  message.payload.methodId = msg.payload.methodId || node.methodId
  message.payload.methodType = msg.payload.methodType || node.methodType
  message.payload.inputArguments = msg.payload.inputArguments || node.inputArguments
  message.payload.nodetype = 'method'
  return message
}

const coreMethod = {
  internalDebugLog,
  detailDebugLog,

  getArgumentDefinition,
  callMethods,
  buildMessagesFromMethodCalls,
  invalidMessage,
  buildCallMessage,
}

export default coreMethod
