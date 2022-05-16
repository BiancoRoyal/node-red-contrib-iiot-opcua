/*
 The BSD 3-Clause License

 Copyright 2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
import * as nodered from "node-red";
import {NodeObject, Todo, TodoBianco} from "./types/placeholders";
import coreConnector from "./core/opcua-iiot-core-connector";
import {deregisterToConnector, registerToConnector, resetBiancoNode} from "./core/opcua-iiot-core";

export interface OPCUAIIoTFlexConnector extends nodered.Node {
  showStatusActivities: boolean
  showErrors: boolean
  connector: any
  bianco?: TodoBianco
}

interface OPCUAIIoTFlexConnectorConfigurationDef extends nodered.NodeDef {
  showStatusActivities: boolean
  showErrors: boolean
  connector: any
}
/**
 * Event Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED: nodered.NodeAPI) {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTFlexConnector (this: OPCUAIIoTFlexConnector, config: OPCUAIIoTFlexConnectorConfigurationDef) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connector = RED.nodes.getNode(config.connector)

    let node = {
      ...this,
      iiot: {}
    }

    node.status({ fill: 'blue', shape: 'ring', text: 'new' })

    node.on('input', function (msg: Todo) {
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

    registerToConnector((node as Todo))

    node.on('close', (done: () => void) => {
      deregisterToConnector((node as Todo), () => {
        resetBiancoNode(node)
        done()
      })
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Flex-Connector', OPCUAIIoTFlexConnector)
}
