/*
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {TodoTypeAny} from "./types/placeholders";
import {NodeMessageInFlow} from "@node-red/registry";
import {convertDataValueByDataType} from "./core/opcua-iiot-core";
import {logger} from "./core/opcua-iiot-core-connector";
import _ from "underscore";

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

    let self: TodoTypeAny = this
    self.iiot = {}

    self.iiot.subscribed = false
    self.status({fill: 'blue', shape: 'ring', text: 'new'})

    self.toggleNodeStatusSymbol = () => {
      self.iiot.subscribed = !self.iiot.subscribed

      if (self.injectType === 'listen') {
        if (self.iiot.subscribed) {
          self.status({fill: 'blue', shape: 'dot', text: 'subscribed'})
        } else {
          self.status({fill: 'blue', shape: 'ring', text: 'not subscribed'})
        }
      } else {
        self.status({fill: 'blue', shape: 'dot', text: 'injected'})
      }
    }

    this.on('input', (msg: NodeMessageInFlow) => {

      self.toggleNodeStatusSymbol();

      const topic = msg.topic || self.topic
      const payload = msg.payload as TodoTypeAny
      const value: TodoTypeAny = payload?.value ? payload.value : msg.payload;
      const valuesToWrite = payload.valuesToWrite || []
      const addressSpaceItems = payload.addressSpaceItems || []

      if (self.injectType === 'write') {
        addressSpaceItems.push({name: self.name, nodeId: self.nodeId, datatypeName: self.datatype})
        try {
          if(typeof self.value !== "string"){
            self.value = self.value.toString()
          }
          valuesToWrite.push(convertDataValueByDataType( (_.isEmpty(self.value)) ? value : self.value, self.datatype))
        } catch (err) {
          logger.internalDebugLog(err)
          if (self.showErrors) {
            this.error(err, msg)
          }
        }
      } else {
        addressSpaceItems.push({name: self.name, nodeId: self.nodeId, datatypeName: self.datatype})
      }

      const outputPayload = {
        nodetype: "node",
        injectType: self.injectType || payload.injectType,
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
