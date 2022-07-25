/*
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {NodeMessageInFlow} from "node-red";
import {Todo} from "./types/placeholders";
import {logger} from "./core/opcua-iiot-core-connector";
import {resetIiotNode} from "./core/opcua-iiot-core";
import internalDebugLog = logger.internalDebugLog;

interface OPCUAIIoTCMD extends nodered.Node {
  commandtype: string
  nodeId: string
  name: string

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

  function OPCUAIIoTCMD(this: OPCUAIIoTCMD, config: OPCUAIIoTCMDDef) {
    RED.nodes.createNode(this, config)
    this.commandtype = config.commandtype
    this.nodeId = config.nodeId
    this.name = config.name

    let node = this


    this.on('input', (msg: NodeMessageInFlow | Todo) => {
      let returnPayload: Todo = {};

      returnPayload.nodetype = 'inject'
      returnPayload.injectType = 'CMD'
      returnPayload.commandType = node.commandtype

      if (msg.payload.addressSpaceItems && msg.payload.addressSpaceItems.length > 0) {
        let addressSpaceItem
        for (addressSpaceItem of msg.payload.addressSpaceItems) {
          returnPayload.nodeId = addressSpaceItem.nodeId
        }
        if (returnPayload.nodeId) {
          this.send({
            ...msg,
            payload: returnPayload
          })
        }
      } else {
        if (node.nodeId) {
          returnPayload.nodeId = node.nodeId
        }
        this.send({...msg, payload: returnPayload})
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
