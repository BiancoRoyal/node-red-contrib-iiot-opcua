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
    RED.nodes.createNode(this, config)

    this.eventRoot = config.eventRoot
    this.eventType = config.eventType
    this.name = config.name

    let node = this

    node.on('input', function (msg) {
      let basicEventFields = coreListener.getBasicEventFields()
      let eventFilter = coreListener.core.nodeOPCUA.constructEventFilter(basicEventFields)

      msg.topic = node.eventRoot
      msg.payload = {eventFilter: eventFilter, eventFields: basicEventFields, eventTypeIds: node.eventType}
      node.send(msg)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Event', OPCUAIIoTEvent)
}
