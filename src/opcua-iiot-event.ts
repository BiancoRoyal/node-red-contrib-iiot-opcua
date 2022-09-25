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
import {NodeStatus} from "node-red";
import {Todo} from "./types/placeholders";
import {constructEventFilter, EventFilter} from "node-opcua";
import {NodeMessageInFlow} from "@node-red/registry";
import coreListener from "./core/opcua-iiot-core-listener";
import {InjectPayload} from "./opcua-iiot-inject";
import {BrowserPayload} from "./opcua-iiot-browser";
import {Like} from "./types/helpers";

interface OPCUAIIoTEvent extends nodered.Node {
  eventType: string
  eventTypeLabel: string
  resultType: string
  queueSize: string
  usingListener: string
  name: string
  showStatusActivities: boolean
  showErrors: boolean
}

interface OPCUAIIoTEventDef extends nodered.NodeDef {
  eventType: string
  eventTypeLabel: string
  resultType: string
  queueSize: string
  usingListener: string
  name: string
  showStatusActivities: boolean
  showErrors: boolean
}


export type EventMessage = NodeMessageInFlow & {
  payload: EventPayload
}
export type EventPayload = (InjectPayload | BrowserPayload) & {
  eventType?: string,
  uaEventFilter?: EventFilter,
  uaEventFields?: string[],
  queueSize?: number,
  interval?: number,
}

export type  EventPayloadLike = Like<EventPayload>

/**
 * Event Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED: nodered.NodeAPI) {
  // SOURCE-MAP-REQUIRED
  function OPCUAIIoTEvent(this: OPCUAIIoTEvent, config: OPCUAIIoTEventDef) {
    RED.nodes.createNode(this, config)
    this.eventType = config.eventType
    this.eventTypeLabel = config.eventTypeLabel
    this.resultType = config.resultType || 'basic'
    this.queueSize = config.queueSize
    this.usingListener = config.usingListener
    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors

    let self: OPCUAIIoTEvent & Todo = this
    self.iiot = {}

    const statusCall = (status: NodeStatus | string) => {
      this.status(status)
    }
    self.iiot.subscribed = false

    statusCall({fill: 'blue', shape: 'ring', text: 'new'})
    this.on('input', (msg: NodeMessageInFlow) => {
      self.iiot.subscribed = !self.iiot.subscribed

      if (self.usingListener) {
        if (self.iiot.subscribed) {
          statusCall({fill: 'blue', shape: 'dot', text: 'subscribed'})
        } else {
          statusCall({fill: 'blue', shape: 'ring', text: 'not subscribed'})
        }
      } else {
        statusCall({fill: 'blue', shape: 'dot', text: 'injected'})
      }

      const uaEventFields = [
        ...coreListener.getBasicEventFields(),
        ...getAdditionalEventFields()
      ]

      const interval = (msg.payload as InjectPayload).value;

      const uaEventFilter: EventFilter = constructEventFilter(uaEventFields)
      const responsePayload: EventPayload = {
        ...msg.payload as InjectPayload | BrowserPayload,
        eventType: self.eventType,
        uaEventFilter: uaEventFilter,
        uaEventFields: uaEventFields,
        queueSize: self.queueSize,
        interval: typeof interval === 'number' ? interval : 1000
      }

      const responseMessage: EventMessage = {
        _msgid: msg._msgid,
        payload: responsePayload,
        topic: msg.topic,
      }

      // TODO: send works but it has a problem with debug node and ByteString
      // I'm not sure what this comment refers to, but I'm leaving it just in case.
      this.send(responseMessage)
    })

    const getAdditionalEventFields = () => {
      switch (self.resultType) {
        case 'condition':
          return (coreListener.getConditionFields())
        case 'state':
          return (coreListener.getStateFields())
        case 'all':
          return (coreListener.getAllEventFields())
        default:
          return []
      }
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Event', OPCUAIIoTEvent)
}
