/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-iiot-opcua
 */
'use strict'

module.exports = function (RED) {
  let core = require('./core/opcua-iiot-core')

  function OPCUAIIoTNode (config) {
    RED.nodes.createNode(this, config)
    this.nodeId = config.nodeId
    this.datatype = config.datatype
    this.value = config.value
    this.name = config.name

    let node = this

    node.on('input', function (msg) {
      msg.topic = node.nodeId
      msg.datatype = node.datatype
      msg.nodetype = 'node'

      if (node.value) {
        msg.payload = node.value
      }

      core.internalDebugLog('node msg stringified: ' + JSON.stringify(msg))
      node.send(msg)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Node', OPCUAIIoTNode)

  // DataType_Schema via REST
}
