/*
 The BSD 3-Clause License

 Copyright 2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * Event Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED) {
  // SOURCE-MAP-REQUIRED
  let coreConnector = require('./core/opcua-iiot-core-connector')

  function OPCUAIIoTFlexConnector (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connector = RED.nodes.getNode(config.connector)

    let node = this

    node.status({fill: 'blue', shape: 'ring', text: 'new'})

    node.statusLog = function (logMessage) {
      if (RED.settings.verbose && node.showStatusActivities) {
        node.verboseLog('Status: ' + logMessage)
      }
    }

    node.setNodeStatusTo = function (statusValue) {
      node.statusLog(statusValue)
      let statusParameter = coreConnector.core.getNodeStatus(statusValue, node.showStatusActivities)
      node.status({fill: statusParameter.fill, shape: statusParameter.shape, text: statusParameter.status})
    }

    node.on('input', function (msg) {
      coreConnector.internalDebugLog('connector change request input')

      if (node.connector && msg.payload.endpoint && msg.payload.endpoint.includes('opc.tcp:')) {
        coreConnector.internalDebugLog('connector change possible')
        coreConnector.internalDebugLog(msg.payload)
        node.connector.restartWithNewSettings(msg.payload, () => {
          coreConnector.internalDebugLog('connector change injected')
          node.send(msg)
        })
      } else {
        coreConnector.internalDebugLog('Connector Change Not Possible - Wrong Endpoint')
      }
    })

    coreConnector.core.registerToConnector(node)

    node.on('close', function (done) {
      node.connector.deregisterForOPCUA(node, done)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Flex-Connector', OPCUAIIoTFlexConnector)
}
