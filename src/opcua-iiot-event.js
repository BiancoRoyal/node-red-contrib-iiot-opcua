/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018,2019 - Klaus Landsdorf (https://bianco-royal.com/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * Event Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED) {
  // SOURCE-MAP-REQUIRED
  let coreListener = require('./core/opcua-iiot-core-listener')

  function OPCUAIIoTEvent (config) {
    RED.nodes.createNode(this, config)
    this.eventType = config.eventType
    this.eventTypeLabel = config.eventTypeLabel
    this.resultType = config.resultType || 'basic'
    this.queueSize = config.queueSize
    this.usingListener = config.usingListener
    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors

    let node = this
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

      let uaEventFilter = coreListener.core.nodeOPCUA.constructEventFilter(uaEventFields)
      let interval = 1000

      if (typeof msg.payload === 'number') {
        interval = msg.payload // msec.
      }

      msg.nodetype = 'events'

      let eventSubscriptionPayload = {
        eventType: msg.payload.eventType || node.eventType,
        eventFilter: msg.payload.uaEventFilter || uaEventFilter,
        eventFields: msg.payload.uaEventFields || uaEventFields,
        queueSize: msg.payload.queueSize || node.queueSize,
        interval: msg.payload.interval || interval
      }

      // TODO: send works but it has a problem with debug node and ByteString
      msg.payload = eventSubscriptionPayload

      node.send(msg)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Event', OPCUAIIoTEvent)
}
