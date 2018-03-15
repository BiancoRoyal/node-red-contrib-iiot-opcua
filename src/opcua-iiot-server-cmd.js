/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * Address space object Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED) {
  // SOURCE-MAP-REQUIRED
  let core = require('./core/opcua-iiot-core')

  function OPCUAIIoTCMD (config) {
    RED.nodes.createNode(this, config)
    this.commandtype = config.commandtype
    this.nodeId = config.nodeId
    this.name = config.name

    let node = this

    node.on('input', function (msg) {
      if (msg.nodetype === 'inject') {
        let addressSpaceItem
        for (addressSpaceItem of msg.addressSpaceItems) {
          msg = {payload: {}} // clean message
          msg.topic = 'ServerCommand'
          msg.nodetype = 'CMD'
          msg.payload.commandtype = node.commandtype
          msg.payload.nodeId = addressSpaceItem.nodeId

          if (msg.payload.nodeId) {
            core.internalDebugLog('node msg stringified: ' + JSON.stringify(msg))
            node.send(msg)
          }
        }
      } else {
        msg = {payload: {}} // clean message
        msg.topic = 'ServerCommand'
        msg.nodetype = 'CMD'
        msg.payload.commandtype = node.commandtype
        msg.payload.nodeId = node.nodeId

        core.internalDebugLog('node msg stringified: ' + JSON.stringify(msg))
        node.send(msg)
      }
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Server-Command', OPCUAIIoTCMD)
}
