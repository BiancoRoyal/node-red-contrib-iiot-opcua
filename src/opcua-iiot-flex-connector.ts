/*
 The BSD 3-Clause License

 Copyright 2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
import * as nodered from "node-red";
import {NodeMessage, NodeStatus} from "node-red";
import {Todo} from "./types/placeholders";
import coreConnector from "./core/opcua-iiot-core-connector";
import {deregisterToConnector, registerToConnector, resetIiotNode} from "./core/opcua-iiot-core";
import {NodeMessageInFlow} from "@node-red/registry";

export interface OPCUAIIoTFlexConnector extends nodered.Node {
  showStatusActivities: boolean
  showErrors: boolean
  connector: any
  iiot?: Todo
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

  function OPCUAIIoTFlexConnector(this: OPCUAIIoTFlexConnector, config: OPCUAIIoTFlexConnectorConfigurationDef) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connector = RED.nodes.getNode(config.connector)

    let nodeConfig = this;
    nodeConfig.iiot = {}

    this.status({fill: 'blue', shape: 'ring', text: 'new'})

    this.on('input', (msg: NodeMessageInFlow) => {
      coreConnector.internalDebugLog('connector change request input')

      const payload: Todo = msg.payload

      if (nodeConfig.connector) {
        if (payload.endpoint && payload.endpoint.includes('opc.tcp:')) {
          coreConnector.internalDebugLog('connector change possible')
          coreConnector.internalDebugLog(payload)
          nodeConfig.connector.functions.restartWithNewSettings(payload, () => {
            coreConnector.internalDebugLog('connector change injected')
            this.send(msg)
          })
        } else {
          coreConnector.internalDebugLog('Connector Change Not Possible - Wrong Endpoint')
          this.error(new Error('Connector Change Not Possible - Wrong Endpoint'), msg)
        }
      } else {
        coreConnector.internalDebugLog('Connector Change Not Possible - No Connector')
        this.error(new Error('Connector Change Not Possible - No Connector'), msg)
      }
    })

    const statusHandler = (status: string | NodeStatus) => {
      this.status(status)
    }

    const errorHandler = (err: Error, msg: NodeMessage) => {
      this.error(err, msg)
    }

    const onAlias = (event: string, callback: () => void) => {
      // @ts-ignore
      this.on(event, callback)
    }

    registerToConnector(this, statusHandler, onAlias, errorHandler)

    this.on('close', (done: () => void) => {
      deregisterToConnector(this as Todo, () => {
        resetIiotNode(this)
        done()
      })
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Flex-Connector', OPCUAIIoTFlexConnector)
}
