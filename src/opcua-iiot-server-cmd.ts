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
import {TodoTypeAny} from "./types/placeholders";
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

    let self = this

    this.on('input', (msg: NodeMessageInFlow | TodoTypeAny) => {
      let returnPayload: TodoTypeAny = {};

      returnPayload.nodetype = 'inject'
      returnPayload.injectType = 'CMD'
      returnPayload.commandType = self.commandtype

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
        if (self.nodeId) {
          returnPayload.nodeId = self.nodeId
        }
        this.send({...msg, payload: returnPayload})
      }
    })

    this.on('close', (done: () => void) => {
      internalDebugLog('Close CMD Node')
      resetIiotNode(self)
      done()
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Server-Command', OPCUAIIoTCMD)
}
