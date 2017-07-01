/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * OPC UA node representation for Node-RED OPC UA IIoT nodes.
 *
 * @param RED
 */
module.exports = function (RED) {
  let core = require('./core/opcua-iiot-core')

  function OPCUAIIoTNode (config) {
    RED.nodes.createNode(this, config)
    this.nodeId = config.nodeId
    this.datatype = config.datatype
    this.value = config.value
    this.name = config.name
    this.usingListener = config.usingListener

    let node = this
    node.subscribed = false

    node.status({fill: 'blue', shape: 'ring', text: 'new'})

    node.on('input', function (msg) {
      msg.topic = node.nodeId
      msg.datatype = node.datatype
      msg.nodetype = 'node'
      node.subscribed = !node.subscribed

      if (node.usingListener) {
        if (node.subscribed) {
          node.status({fill: 'blue', shape: 'dot', text: 'subscribed'})
        } else {
          node.status({fill: 'blue', shape: 'ring', text: 'not subscribed'})
        }
      } else {
        node.status({fill: 'blue', shape: 'dot', text: 'injected'})
      }

      if (node.value !== '') {
        if (node.datatype) {
          msg.payload = core.convertDataValueByDataType({value: node.value}, node.datatype)
        } else {
          msg.payload = node.value
        }
      }

      core.internalDebugLog('node msg stringified: ' + JSON.stringify(msg))
      node.send(msg)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Node', OPCUAIIoTNode)

  // DataType_Schema via REST
}
