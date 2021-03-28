/*
 The BSD 3-Clause License for none commercial use and Open Source Projects
 SLA with yearly Subscription for commercial use and Closed Source Projects - incl. Support see https://bianco-royal.space/supporter.html

 Copyright 2018,2019 - Klaus Landsdorf (https://bianco-royal.space/)
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
    node.bianco = coreConnector.core.createBiancoIIoT()
    coreConnector.core.assert(node.bianco.iiot)

    node.status({ fill: 'blue', shape: 'ring', text: 'new' })

    node.on('input', function (msg) {
      coreConnector.internalDebugLog('connector change request input')

      if (node.connector) {
        if (msg.payload.endpoint && msg.payload.endpoint.includes('opc.tcp:')) {
          coreConnector.internalDebugLog('connector change possible')
          coreConnector.internalDebugLog(msg.payload)
          node.connector.bianco.iiot.restartWithNewSettings(msg.payload, () => {
            coreConnector.internalDebugLog('connector change injected')
            node.send(msg)
          })
        } else {
          coreConnector.internalDebugLog('Connector Change Not Possible - Wrong Endpoint')
          node.error(new Error('Connector Change Not Possible - Wrong Endpoint'), msg)
        }
      } else {
        coreConnector.internalDebugLog('Connector Change Not Possible - No Connector')
        node.error(new Error('Connector Change Not Possible - No Connector'), msg)
      }
    })

    coreConnector.core.registerToConnector(node)

    node.on('close', (done) => {
      if (coreConnector.core.isInitializedBiancoIIoTNode(node)) {
        coreConnector.core.deregisterToConnector(node, () => {
          coreConnector.core.resetBiancoNode(node)
          done()
        })
      } else {
        done()
      }
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Flex-Connector', OPCUAIIoTFlexConnector)
}
