/**
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

import {TodoTypeAny} from "../types/placeholders";

import debug from 'debug';
import {ArgumentDefinition, ClientSession, ClientSessionCallService, coerceNodeId} from "node-opcua";
import {convertDataValueByDataType} from "./opcua-iiot-core";
import {CallMethodResult} from "node-opcua-service-call";

const internalDebugLog = debug('opcuaIIoT:method') // eslint-disable-line no-use-before-define
const detailDebugLog = debug('opcuaIIoT:method:details') // eslint-disable-line no-use-before-define

const getArgumentDefinition = function (session: ClientSessionCallService, msg: TodoTypeAny) {
  return new Promise(
    function (resolve, reject) {
      if (!session) {
        reject(new Error('Method Argument Definition Session Not Valid'))
      } else {
        try {
          let methodId = coerceNodeId(msg.payload.methodId)

          session.getArgumentDefinition(methodId, function (err: Error | null, args?: ArgumentDefinition) {
            if (err) {
              reject(err)
            } else {
              let results: TodoTypeAny = {}
              results.methodId = methodId
              results.methodDefinition = {}
              results.methodDefinition.inputArguments = args?.inputArguments
              results.methodDefinition.outputArguments = args?.outputArguments
              resolve(results)
            }
          })
        } catch (err) {
          reject(err)
        }
      }
    })
}

const callMethods = function (session: ClientSessionCallService, msg: TodoTypeAny) {
  return new Promise(
    function (resolve, reject) {
      if (!session) {
        reject(new Error('Methods Call Session Not Valid'))
      } else {
        try {
          msg.payload.inputArguments.forEach(function (element: TodoTypeAny) {
            element.value = convertDataValueByDataType(element.value, element.dataType)
          })
          let methodCalls = [{
            objectId: coerceNodeId(msg.payload.objectId),
            methodId: coerceNodeId(msg.payload.methodId),
            inputArguments: msg.payload.inputArguments
          }]

          session.call(methodCalls, function (err: Error | null, results?: CallMethodResult[]) {
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

const buildMessagesFromMethodCalls = function (methodCallsResults: CallMethodResult[]) {
  return new Promise(
    function (resolve, reject) {
      if (!methodCallsResults) {
        reject(new Error('Methods Call Results To Messages Session Not Valid'))
      } else {
        let resultMessages: TodoTypeAny[] = []
        resolve({methodCallsResults: methodCallsResults, messages: resultMessages})
      }
    })
}

const invalidMessage = function (node: TodoTypeAny, message: TodoTypeAny, handleMethodWarn: (message: TodoTypeAny) => void) {
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

const buildCallMessage = function (node: TodoTypeAny, msg: TodoTypeAny) {
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
