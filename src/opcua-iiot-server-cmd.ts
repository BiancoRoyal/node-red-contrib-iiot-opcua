/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {Todo, TodoBianco} from "./types/placeholders";
import {NodeMessageInFlow} from "node-red";
interface OPCUAIIoTCMD extends nodered.Node {
  commandtype: string
  nodeId: string
  name: string
  bianco?: TodoBianco
}
interface OPCUAIIoTCMDDef extends nodered.NodeDef {
  commandtype: string
  nodeId: string
  name: string
}
/**
 * Address space object Node-RED node.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
  // SOURCE-MAP-REQUIRED
  let core = require('./core/opcua-iiot-core')

  function OPCUAIIoTCMD (this: OPCUAIIoTCMD, config: OPCUAIIoTCMDDef) {
    RED.nodes.createNode(this, config)
    this.commandtype = config.commandtype
    this.nodeId = config.nodeId
    this.name = config.name

    let node = this


    node.on('input', function (msg: NodeMessageInFlow | Todo) {
      let returnMessage: Todo = {};

      returnMessage.nodetype = 'inject'
      returnMessage.injectType = 'CMD'
      returnMessage.commandType = node.commandtype

      if (msg.addressSpaceItems && msg.addressSpaceItems.length > 0) {
        let addressSpaceItem
        for (addressSpaceItem of msg.addressSpaceItems) {
          msg.payload = {
            nodeId: addressSpaceItem.nodeId
          }
          if (msg.payload.nodeId) {
            node.send(msg)
          }
        }
      } else {
        if (node.nodeId) {
          returnMessage.payload = {
            nodeId: node.nodeId
          }
        }
        node.send(msg)
      }
    })

    node.on('close', (done: () => void) => {
      core.internalDebugLog('Close CMD Node')
      core.resetBiancoNode(node)
      done()
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Server-Command', OPCUAIIoTCMD)
}
