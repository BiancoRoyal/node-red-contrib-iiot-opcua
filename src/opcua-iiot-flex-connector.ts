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
import {deregisterToConnector, registerToConnector, resetIiotNode} from "./core/opcua-iiot-core";
import {NodeMessage, NodeStatus} from "node-red";

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
          node.connector.functions.restartWithNewSettings(msg.payload, () => {
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

    const statusHandler = (status: string | NodeStatus) => {
      this.status(status)
    }

    const errorHandler = (err: Error, msg: NodeMessage) => {
      this.error(err, msg)
    }

    const onAlias = (event: string, callback: (...args: any) => void) => {
      if (event == "input") {
        this.on(event, callback)
      } else if (event === "close") {
        this.on(event, callback)
      }
      else this.error('Invalid event to listen on')
    }

    registerToConnector((node as Todo), statusHandler, onAlias, errorHandler)



    node.on('close', (done: () => void) => {
      deregisterToConnector((node as Todo), () => {
        resetIiotNode(node)
        done()
      })
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Flex-Connector', OPCUAIIoTFlexConnector)
}
