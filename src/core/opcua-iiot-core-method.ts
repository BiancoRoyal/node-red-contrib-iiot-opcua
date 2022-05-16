/**
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

/**
 * Nested namespace settings.
 *
 * @type {{biancoroyal: {opcua: {iiot: {core: {method: {}}}}}}}
 *
 * @Namesapce de.biancoroyal.opcua.iiot.core.method
 */
var de = de || { biancoroyal: { opcua: { iiot: { core: { method: {} } } } } } // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.method.core = de.biancoroyal.opcua.iiot.core.method.core || require('./opcua-iiot-core') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.method.internalDebugLog = de.biancoroyal.opcua.iiot.core.method.internalDebugLog || require('debug')('opcuaIIoT:method') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.method.detailDebugLog = de.biancoroyal.opcua.iiot.core.method.detailDebugLog || require('debug')('opcuaIIoT:method:details') // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.method.getArgumentDefinition = function (session, msg) {
  let coerceNodeId = this.core.nodeOPCUA.coerceNodeId

  return new Promise(
    function (resolve, reject) {
      if (!session) {
        reject(new Error('Method Argument Definition Session Not Valid'))
      } else {
        try {
          let methodId = coerceNodeId(msg.methodId)

          session.getArgumentDefinition(methodId, function (err, inputArguments, outputArguments) {
            if (err) {
              reject(err)
            } else {
              let results = {}
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

de.biancoroyal.opcua.iiot.core.method.callMethods = function (session, msg) {
  let core = this.core
  let coerceNodeId = this.core.nodeOPCUA.coerceNodeId

  return new Promise(
    function (resolve, reject) {
      if (!session) {
        reject(new Error('Methods Call Session Not Valid'))
      } else {
        try {
          msg.inputArguments.forEach(function (element, index, array) {
            element.value = core.convertDataValueByDataType({ value: element.value }, element.dataType)
          })

          let methodCalls = [{
            objectId: coerceNodeId(msg.objectId),
            methodId: coerceNodeId(msg.methodId),
            inputArguments: msg.inputArguments
          }]

          session.call(methodCalls, function (err, results) {
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

de.biancoroyal.opcua.iiot.core.method.buildMessagesFromMethodCalls = function (methodCallsResults) {
  return new Promise(
    function (resolve, reject) {
      if (!methodCallsResults) {
        reject(new Error('Methods Call Results To Messages Session Not Valid'))
      } else {
        let resultMessages = []
        resolve({ methodCallsResults: methodCallsResults, messages: resultMessages })
      }
    })
}

de.biancoroyal.opcua.iiot.core.method.invalidMessage = function (node, message) {
  let response = false

  if (!message.objectId) {
    node.bianco.iiot.handleMethodWarn('No Object-Id Found For Method Call')
    response = true
  }

  if (!message.methodId) {
    node.bianco.iiot.handleMethodWarn('No Method-Id Found For Method Call')
    response = true
  }

  if (!message.inputArguments) {
    node.bianco.iiot.handleMethodWarn('No Input Arguments Found For Method Call')
    response = true
  }

  if (!message.methodType) {
    node.bianco.iiot.handleMethodWarn('No Method Type Found For Method Call')
    response = true
  }

  return response
}

de.biancoroyal.opcua.iiot.core.method.buildCallMessage = function (node, msg) {
  let message = msg
  message.objectId = msg.payload.objectId || node.objectId
  message.methodId = msg.payload.methodId || node.methodId
  message.methodType = msg.payload.methodType || node.methodType
  message.inputArguments = msg.payload.inputArguments || node.inputArguments
  message.nodetype = 'method'
  return message
}

module.exports = de.biancoroyal.opcua.iiot.core.method
