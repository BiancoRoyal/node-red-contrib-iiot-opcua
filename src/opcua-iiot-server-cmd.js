/*
 The BSD 3-Clause License for none commercial use and Open Source Projects
 SLA with yearly Subscription for commercial use and Closed Source Projects - incl. Support see https://bianco-royal.space/supporter.html

 Copyright 2017,2018,2019,2020,2021 - Klaus Landsdorf (https://bianco-royal.space/)
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
    node.bianco = core.createBiancoIIoT()
    core.assert(node.bianco.iiot)
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
      core.resetBiancoNode(node)
      done()
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Server-Command', OPCUAIIoTCMD)
}
