/*
 The BSD 3-Clause License

 Copyright 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-opcua-iiot
 */
'use strict'

module.exports = function (RED) {
  let core = require('./core/opcua-iiot-core')

  function OPCUAIIoTResponse (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name

    let node = this

    node.on('input', function (msg) {
      core.internalDebugLog(msg)
      core.internalDebugLog(JSON.stringify(msg))

      if (msg.payload && msg.payload.statusCode) {
        switch (msg.payload.statusCode.name) {
          case 'Good':
            node.status({
              fill: 'green',
              shape: 'dot',
              text: msg.payload.statusCode.name
            })
            break

          case 'Bad':
            node.status({
              fill: 'red',
              shape: 'dot',
              text: msg.payload.statusCode.name + ': ' + msg.payload.statusCode.description
            })
            break
          default:
            node.status({
              fill: 'yellow',
              shape: 'dot',
              text: msg.payload.statusCode.name + ': ' + msg.payload.statusCode.description
            })
        }
      } else {
        node.status({
          fill: 'yellow',
          shape: 'dot',
          text: 'unknown'
        })
      }

      node.send(msg)
    }
    )
  }

  RED.nodes.registerType('OPCUA-IIoT-Response', OPCUAIIoTResponse)
}
