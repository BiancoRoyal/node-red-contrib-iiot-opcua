/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * Write Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED) {
  // SOURCE-MAP-REQUIRED
  let coreClient = require('./core/opcua-iiot-core-client')

  function OPCUAIIoTWrite (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.justValue = config.justValue
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connector = RED.nodes.getNode(config.connector)

    let node = coreClient.core.initClientNode(this)
    coreClient.core.assert(node.bianco.iiot)

    node.bianco.iiot.handleWriteError = function (err, msg) {
      coreClient.writeDebugLog(err)
      if (node.showErrors) {
        node.error(err, msg)
      }

      if (coreClient.core.isSessionBad(err)) {
        node.emit('opcua_client_not_ready')
      }
    }

    node.bianco.iiot.writeToSession = function (session, originMsg) {
      if (coreClient.core.checkSessionNotValid(session, 'Writer')) {
        return
      }

      let msg = Object.assign({}, originMsg)
      let nodesToWrite = coreClient.core.buildNodesToWrite(msg)
      coreClient.write(session, nodesToWrite, msg).then(function (writeResult) {
        try {
          let message = node.bianco.iiot.buildResultMessage(writeResult)
          node.send(message)
        } catch (err) {
          (coreClient.core.isInitializedBiancoIIoTNode(node)) ? node.bianco.iiot.handleWriteError(err, msg) : coreClient.internalDebugLog(err.message)
        }
      }).catch(function (err) {
        (coreClient.core.isInitializedBiancoIIoTNode(node)) ? node.bianco.iiot.handleWriteError(err, msg) : coreClient.internalDebugLog(err.message)
      })
    }

    node.bianco.iiot.buildResultMessage = function (result) {
      let message = Object.assign({}, result.msg)
      message.nodetype = 'write'
      message.justValue = node.justValue

      let dataValuesString = node.bianco.iiot.extractDataValueString(message, result)
      message = node.bianco.iiot.setMessageProperties(message, result, dataValuesString)
      return message
    }

    node.bianco.iiot.extractDataValueString = function (message, result) {
      let dataValuesString = {}
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

    node.bianco.iiot.setMessageProperties = function (message, result, stringValue) {
      try {
        RED.util.setMessageProperty(message, 'payload', JSON.parse(stringValue))
      } catch (err) {
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

    node.on('input', function (msg) {
      if (!coreClient.core.checkConnectorState(node, msg, 'Write')) {
        return
      }

      if (msg.injectType === 'write') {
        node.bianco.iiot.writeToSession(node.bianco.iiot.opcuaSession, msg)
      } else {
        coreClient.writeDebugLog('Wrong Inject Type ' + msg.injectType + '! The Type has to be write.')
        if (node.showErrors) {
          node.warn('Wrong Inject Type ' + msg.injectType + '! The msg.injectType has to be write.')
        }
      }
    })

    coreClient.core.registerToConnector(node)

    node.on('close', (done) => {
      coreClient.core.deregisterToConnector(node, () => {
        coreClient.core.resetBiancoNode(node)
        done()
      })
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Write', OPCUAIIoTWrite)
}
