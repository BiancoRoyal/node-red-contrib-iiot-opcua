/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-opcua-iiot
 */
'use strict'

module.exports = function (RED) {
  let opcua = require('node-opcua')
  let opcuaBasic = require('./core/opcua-iiot-core')

  function OPCUAIIoTEvent (n) {
    RED.nodes.createNode(this, n)

    this.root = n.root // OPC UA item nodeID root
    this.eventtype = n.eventtype
    this.name = n.name

    let node = this

    node.on('input', function (msg) {
      // let baseEventTypeId = "i=2041";
      // let serverObjectId = "i=2253";
      // All event field, perhaps selectable in UI

      let basicEventFields = opcuaBasic.getBasicEventFields()
      let eventFilter = opcua.constructEventFilter(basicEventFields)

      msg.topic = node.root // example: ns=0;i=85;
      msg.eventFilter = eventFilter
      msg.eventFields = basicEventFields
      msg.eventTypeIds = node.eventtype // example: ns=0;i=10751;

      node.send(msg)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Event', OPCUAIIoTEvent)
}
