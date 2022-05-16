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
import {logger} from "./core/opcua-iiot-core-connector";
import internalDebugLog = logger.internalDebugLog;
import {resetIiotNode} from "./core/opcua-iiot-core";
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

  function OPCUAIIoTCMD (this: OPCUAIIoTCMD, config: OPCUAIIoTCMDDef) {
    RED.nodes.createNode(this, config)
    this.commandtype = config.commandtype
    this.nodeId = config.nodeId
    this.name = config.name

    let node = this


    this.on('input',  (msg: NodeMessageInFlow | Todo) => {
      let returnMessage: Todo = {};

      returnMessage.nodetype = 'inject'
      returnMessage.injectType = 'CMD'
      returnMessage.commandType = node.commandtype

      if (msg.addressSpaceItems && msg.addressSpaceItems.length > 0) {
        let addressSpaceItem
        for (addressSpaceItem of msg.addressSpaceItems) {
          returnMessage.payload = {
            nodeId: addressSpaceItem.nodeId
          }
          if (msg.payload.nodeId) {
            this.send(msg)
          }
        }
      } else {
        if (node.nodeId) {
          returnMessage.payload = {
            nodeId: node.nodeId
          }
        }
        this.send(returnMessage)
      }
    })

    this.on('close', (done: () => void) => {
      internalDebugLog('Close CMD Node')
      resetIiotNode(node)
      done()
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Server-Command', OPCUAIIoTCMD)
}
