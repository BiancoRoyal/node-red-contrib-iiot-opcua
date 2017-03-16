/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-opcua-iiot
 */
'use strict'

module.exports = function (RED) {
  let opcuaIIoTCore = require('./core/opcua-iiot-core')

  function OPCUAIIoTNode (n) {
    RED.nodes.createNode(this, n)

    this.item = n.item         // OPC UA address: ns=2;i=4 OR ns=3;s=MyVariable
    this.datatype = n.datatype // String;
    this.value = n.value       // 66.6
    this.name = n.name         // browseName shall be put here

    let node = this

    function verboseWarn (logMessage) {
      if (RED.settings.verbose) {
        node.warn((node.name) ? node.name + ': ' + logMessage : 'OpcUaClientNode: ' + logMessage)
      }
    }

    function verboseLog (logMessage) {
      if (RED.settings.verbose) {
        node.log(logMessage)
      }
    }

    node.on('input', function (msg) {
      msg.topic = node.item
      msg.datatype = node.datatype
      msg.browseName = node.name

      verboseLog('node value:' + node.value)

      if (node.value) {
        msg.payload = opcuaIIoTCore.build_new_value_by_datatype(node.datatype, node.value)
        verboseWarn('setting value by Item ' + msg.payload)
      } else {
        msg.payload = opcuaIIoTCore.build_new_value_by_datatype(msg.datatype, msg.payload)
        verboseWarn('setting value by Input ' + msg.payload)
      }

      node.send(msg)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Node', OPCUAIIoTNode)
}
