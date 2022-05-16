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
import {NodeMessage} from "node-red";
import {EventFilter} from "node-opcua";

interface OPCUAIIoTEvent extends nodered.Node {
  eventType: string
  eventTypeLabel: string
  resultType: string
  queueSize: string
  usingListener: string
  name: string
  showStatusActivities: boolean
  showErrors: boolean
  bianco?: TodoBianco
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

/**
 * Event Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED: nodered.NodeAPI) {
  // SOURCE-MAP-REQUIRED
  let coreListener = require('./core/opcua-iiot-core-listener')

  function OPCUAIIoTEvent (this: OPCUAIIoTEvent, config: OPCUAIIoTEventDef) {
    RED.nodes.createNode(this, config)
    this.eventType = config.eventType
    this.eventTypeLabel = config.eventTypeLabel
    this.resultType = config.resultType || 'basic'
    this.queueSize = config.queueSize
    this.usingListener = config.usingListener
    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors

    let node: OPCUAIIoTEvent = this
    node.bianco = coreListener.core.createBiancoIIoT()
    coreListener.core.assert(node.bianco.iiot)
    node.bianco.iiot.subscribed = false

    node.status({ fill: 'blue', shape: 'ring', text: 'new' })

    node.on('input', function (msg) {
      node.bianco.iiot.subscribed = !node.bianco.iiot.subscribed

      if (node.usingListener) {
        if (node.bianco.iiot.subscribed) {
          node.status({ fill: 'blue', shape: 'dot', text: 'subscribed' })
        } else {
          node.status({ fill: 'blue', shape: 'ring', text: 'not subscribed' })
        }
      } else {
        node.status({ fill: 'blue', shape: 'dot', text: 'injected' })
      }

      let uaEventFields = coreListener.getBasicEventFields()

      switch (node.resultType) {
        case 'condition':
          uaEventFields.push(coreListener.getConditionFields())
          break
        case 'state':
          uaEventFields.push(coreListener.getStateFields())
          break
        case 'all':
          uaEventFields.push(coreListener.getAllEventFields())
          break
        default:
          break
      }

      let uaEventFilter: EventFilter = coreListener.core.nodeOPCUA.constructEventFilter(uaEventFields)
      let interval = 1000

      if (typeof msg.payload === 'number') {
        interval = msg.payload // msec.
      }
      else {

      }

      type msgPayload = {
        eventType?: string,
        uaEventFilter?: EventFilter,
        uaEventFields?: Todo,
        queueSize?: Todo,
        interval?: number,
      }

      const payload = msg.payload as msgPayload

      const responseMessage: NodeMessage = {
        _msgid: msg._msgid,
        payload: {
          eventType: payload.eventType || node.eventType,
          eventFilter: payload.uaEventFilter || uaEventFilter,
          eventFields: payload.uaEventFields || uaEventFields,
          queueSize: payload.queueSize || node.queueSize,
          interval: payload.interval || interval,
        },
        topic: msg.topic,
      }
      // msg.nodetype = 'events'


      // TODO: send works but it has a problem with debug node and ByteString
      // msg.payload = {
      //   eventType: msg.payload.eventType || node.eventType,
      //   eventFilter: msg.payload.uaEventFilter || uaEventFilter,
      //   eventFields: msg.payload.uaEventFields || uaEventFields,
      //   queueSize: msg.payload.queueSize || node.queueSize,
      //   interval: msg.payload.interval || interval
      // }

      node.send(responseMessage)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Event', OPCUAIIoTEvent)
}
