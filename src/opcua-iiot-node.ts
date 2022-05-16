/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {Todo, TodoBianco} from "./types/placeholders";

interface OPCUAIIoTNode extends nodered.Node {
  nodeId: string
  datatype: string
  value: string
  topic: string
  name: string
  injectType: string
  showErrors: string
  bianco?: TodoBianco
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
  let core = require('./core/opcua-iiot-core')

  function OPCUAIIoTNode (this: OPCUAIIoTNode, config: OPCUAIIoTNodeDef) {
    RED.nodes.createNode(this, config)
    this.nodeId = config.nodeId
    this.datatype = config.datatype
    this.value = config.value
    this.topic = config.topic
    this.name = config.name
    this.injectType = config.injectType
    this.showErrors = config.showErrors

    let node: Todo = this
    node.iiot.subscribed = false

    this.status({ fill: 'blue', shape: 'ring', text: 'new' })

    this.on('input', (msg: Todo) => {
      msg.nodetype = 'node'
      msg.injectType = msg.injectType || node.injectType
      node.iiot.subscribed = !node.iiot.subscribed

      if (node.injectType === 'listen') {
        if (node.iiot.subscribed) {
          this.status({ fill: 'blue', shape: 'dot', text: 'subscribed' })
        } else {
          this.status({ fill: 'blue', shape: 'ring', text: 'not subscribed' })
        }
      } else {
        this.status({ fill: 'blue', shape: 'dot', text: 'injected' })
      }

      msg.topic = msg.topic || node.topic
      msg.addressSpaceItems = msg.addressSpaceItems || [] // eslint-disable-line

      if (node.injectType === 'write') {
        msg.valuesToWrite = msg.valuesToWrite || [] // eslint-disable-line
        msg.addressSpaceItems.push({ name: node.name, nodeId: node.nodeId, datatypeName: node.datatype })

        try {
          msg.valuesToWrite.push(core.convertDataValueByDataType({ value: node.value === '' ? msg.payload : node.value }, node.datatype))
        } catch (err) {
          core.internalDebugLog(err)
          if (node.showErrors) {
            this.error(err, msg)
          }
        }
      } else {
        msg.addressSpaceItems.push({ name: node.name, nodeId: node.nodeId, datatypeName: node.datatype })
      }

      core.internalDebugLog('node msg stringified: ' + JSON.stringify(msg))
      this.send(msg)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Node', OPCUAIIoTNode)
}
