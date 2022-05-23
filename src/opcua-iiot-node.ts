/*
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {Todo} from "./types/placeholders";
import {NodeMessageInFlow} from "@node-red/registry";
import {convertDataValueByDataType} from "./core/opcua-iiot-core";
import {logger} from "./core/opcua-iiot-core-connector";

interface OPCUAIIoTNode extends nodered.Node {
  nodeId: string
  datatype: string
  value: string
  topic: string
  name: string
  injectType: string
  showErrors: string
  
}

interface OPCUAIIoTNodeDef extends nodered.NodeDef {
  nodeId: string
  datatype: string
  value: string
  topic: string
  name: string
  injectType: string
  showErrors: string
}

/**
 * OPC UA node representation for Node-RED OPC UA IIoT nodes.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTNode(this: OPCUAIIoTNode, config: OPCUAIIoTNodeDef) {
    RED.nodes.createNode(this, config)
    this.nodeId = config.nodeId
    this.datatype = config.datatype
    this.value = config.value
    this.topic = config.topic
    this.name = config.name
    this.injectType = config.injectType
    this.showErrors = config.showErrors

    let node: Todo = this
    node.iiot = {}
    node.iiot.subscribed = false
    this.status({fill: 'blue', shape: 'ring', text: 'new'})

    this.on('input', (msg: NodeMessageInFlow) => {

      node.iiot.subscribed = !node.iiot.subscribed
      const payload = msg.payload as Todo
      const value: Todo = typeof msg.payload === "string" ? msg.payload : (msg.payload as Todo).value;

      if (node.injectType === 'listen') {
        if (node.iiot.subscribed) {
          this.status({fill: 'blue', shape: 'dot', text: 'subscribed'})
        } else {
          this.status({fill: 'blue', shape: 'ring', text: 'not subscribed'})
        }
      } else {
        this.status({fill: 'blue', shape: 'dot', text: 'injected'})
      }
      const topic = msg.topic || node.topic
      const valuesToWrite = payload.valuesToWrite || []
      const addressSpaceItems = payload.addressSpaceItems || []
      if (node.injectType === 'write') {
        addressSpaceItems.push({name: node.name, nodeId: node.nodeId, datatypeName: node.datatype})
        try {
          valuesToWrite.push(convertDataValueByDataType({value: node.value === '' ? msg.payload : node.value}, node.datatype))
        } catch (err) {
          logger.internalDebugLog(err)
          if (node.showErrors) {
            this.error(err, msg)
          }
        }
      } else {
        addressSpaceItems.push({name: node.name, nodeId: node.nodeId, datatypeName: node.datatype})
      }
      const outputPayload = {
        nodetype: "node",
        injectType: node.injectType || payload.injectType,
        addressSpaceItems,
        valuesToWrite,
        value,
      }

      const outputMessage = {
        payload: outputPayload,
        topic,
        _msgid: msg._msgid
      }
      logger.internalDebugLog('node msg stringified: ' + JSON.stringify(msg))
      this.send(outputMessage)
    })

  }

  RED.nodes.registerType('OPCUA-IIoT-Node', OPCUAIIoTNode)
}
