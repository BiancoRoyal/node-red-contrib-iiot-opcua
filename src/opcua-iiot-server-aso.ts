/*
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {Todo} from "./types/placeholders";
import {NodeMessageInFlow} from "node-red";
import {OBJECTS_ROOT, resetIiotNode} from "./core/opcua-iiot-core";
import {ReferenceTypeIds} from "node-opcua";
import {logger} from "./core/opcua-iiot-core-connector";
import internalDebugLog = logger.internalDebugLog;

interface OPCUAIIoTASO extends nodered.Node {
  nodeId: string
  browsename: string
  displayname: string
  objecttype: string
  referencetype: string
  referenceNodeId: string
  datatype: string
  value: string
  name: string
  
}

interface OPCUAIIoTCMDASO extends nodered.NodeDef {
  nodeId: string
  browsename: string
  displayname: string
  objecttype: string
  referencetype: string
  referenceNodeId: string
  datatype: string
  value: string
  name: string
}

/**
 * Address space object Node-RED node.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTASO(this: OPCUAIIoTASO, config: OPCUAIIoTCMDASO) {
    RED.nodes.createNode(this, config)
    this.nodeId = config.nodeId
    this.browsename = config.browsename
    this.displayname = config.displayname
    this.objecttype = config.objecttype
    this.referencetype = config.referencetype
    this.referenceNodeId = config.referenceNodeId
    this.datatype = config.datatype
    this.value = config.value
    this.name = config.name

    let node = this
    internalDebugLog('Open ASO Node')

    this.on('input', (msg: NodeMessageInFlow | Todo) => {
      if (msg.payload.nodetype === 'inject') {
        node.nodeId = msg.payload.topic || node.nodeId
        node.datatype = msg.payload.datatype || node.datatype
        node.value = msg.payload.payload || node.value
      }
      const value = node.value || msg.payload.value;
      msg = {payload: {}} // clean message
      msg.topic = 'ServerAddressSpaceObject'
      msg.payload.nodetype = 'inject'
      msg.payload.injectType = 'ASO'

      if (node.nodeId.includes('i=') || node.nodeId.includes('s=') || node.nodeId.includes('b=')) {
        msg.payload.nodeId = node.nodeId
        msg.payload.browsename = node.browsename
        msg.payload.displayname = node.displayname
        msg.payload.objecttype = node.objecttype
        msg.payload.datatype = node.datatype
        msg.payload.value = value

        msg.payload.referenceNodeId = node.referenceNodeId || OBJECTS_ROOT
        msg.payload.referencetype = node.referencetype || ReferenceTypeIds.Organizes

        internalDebugLog('node msg stringified: ' + JSON.stringify(msg))
        this.send(msg)
      } else {
        /* istanbul ignore next */
        this.error(new Error('ASO NodeId Is Not Valid'), msg)
      }
    })

    this.on('close', (done: () => void) => {
      internalDebugLog('Close ASO Node')
      resetIiotNode(node)
      done()
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Server-ASO', OPCUAIIoTASO)
}
