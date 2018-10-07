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

    let node = this
    node.reconnectTimeout = 1000
    node.sessionTimeout = null
    node.opcuaClient = null
    node.opcuaSession = null

    node.verboseLog = function (logMessage) {
      if (RED.settings.verbose) {
        coreClient.writeDebugLog(logMessage)
      }
    }

    node.statusLog = function (logMessage) {
      if (RED.settings.verbose && node.showStatusActivities) {
        node.verboseLog('Status: ' + logMessage)
      }
    }

    node.setNodeStatusTo = function (statusValue) {
      node.statusLog(statusValue)
      let statusParameter = coreClient.core.getNodeStatus(statusValue, node.showStatusActivities)
      node.status({fill: statusParameter.fill, shape: statusParameter.shape, text: statusParameter.status})
    }

    node.handleWriteError = function (err, msg) {
      coreClient.writeDebugLog(err)
      if (node.showErrors) {
        node.error(err, msg)
      }

      if (node.connector && coreClient.core.isSessionBad(err)) {
        node.connector.resetBadSession()
      }
    }

    node.writeToSession = function (session, msg) {
      if (coreClient.core.checkSessionNotValid(session, 'Writer')) {
        return
      }

      let nodesToWrite = coreClient.core.buildNodesToWrite(msg)

      coreClient.write(session, nodesToWrite).then(function (writeResult) {
        try {
          let message = node.buildResultMessage(msg, writeResult)
          node.send(message)
        } catch (err) {
          node.handleWriteError(err, msg)
        }
      }).catch(function (err) {
        node.handleWriteError(err, msg)
      })
    }

    node.buildResultMessage = function (msg, result) {
      let message = msg
      msg.nodetype = 'write'

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

      try {
        RED.util.setMessageProperty(message, 'payload', JSON.parse(dataValuesString))
      } catch (err) {
        coreClient.writeDebugLog(err)
        if (node.showErrors) {
          node.warn('JSON not to parse from string for write statusCodes type ' + typeof result.statusCodes)
          node.error(err, msg)
        }
        message.resultsConverted = dataValuesString
        message.error = err.message
      }

      return message
    }

    node.on('input', function (msg) {
      if (!coreClient.core.checkConnectorState(node, msg, 'Write')) {
        return
      }

      if (msg.injectType === 'write') {
        node.writeToSession(node.opcuaSession, msg)
      } else {
        coreClient.writeDebugLog('Wrong Inject Type ' + msg.injectType + '! The Type has to be write.')
        if (node.showErrors) {
          node.warn('Wrong Inject Type ' + msg.injectType + '! The msg.injectType has to be write.')
        }
      }
    })

    coreClient.core.registerToConnector(node)

    node.on('close', done => {
      node.connector.deregisterForOPCUA(node, done)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Write', OPCUAIIoTWrite)
}
