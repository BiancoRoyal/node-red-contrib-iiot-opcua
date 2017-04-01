/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-opcua-iiot
 */
'use strict'

module.exports = function (RED) {
  let coreListener = require('./core/opcua-iiot-core-listener')

  function OPCUAIIoTEvent (config) {
    let node

    RED.nodes.createNode(this, config)
    this.eventRoot = config.eventRoot
    this.eventType = config.eventType
    this.name = config.name

    node = this

    node.on('input', function (msg) {
      let basicEventFields = coreListener.getBasicEventFields()
      let eventFilter = coreListener.core.nodeOPCUA.constructEventFilter(basicEventFields)

      msg.topic = node.eventRoot
      msg.nodetype = 'events'

      msg.payload = {
        eventRoot: node.eventRoot,
        eventType: node.eventType,
        eventFilter: eventFilter,
        eventFields: basicEventFields,
        eventTypeIds: node.eventType // TODO: replace eventTypeIds with eventType in following nodes
      }
      node.send(msg)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Event', OPCUAIIoTEvent)

  // ObjectTypeIds via REST with Filter *EventType
}
