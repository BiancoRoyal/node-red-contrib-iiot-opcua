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
    core.internalDebugLog('Open CMD Node')

    node.on('input', function (msg) {
      msg.nodetype = 'inject'
      msg.injectType = 'CMD'
      msg.commandType = node.commandtype

      if (msg.addressSpaceItems && msg.addressSpaceItems.length > 0) {
        let addressSpaceItem
        for (addressSpaceItem of msg.addressSpaceItems) {
          msg.payload = {
            nodeId: addressSpaceItem.nodeId
          }
          if (msg.payload.nodeId) {
            node.send(msg)
          }
        }
      } else {
        if (node.nodeId) {
          msg.payload = {
            nodeId: node.nodeId
          }
        }
        node.send(msg)
      }
    })

    node.on('close', (done) => {
      core.internalDebugLog('Close CMD Node')
      done()
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Server-Command', OPCUAIIoTCMD)
}
