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

      // TODO: working with the msg.nodetype

      if (msg.payload && msg.payload.statusCode) {
        switch (msg.payload.statusCode) {
          case core.nodeOPCUA.StatusCodes.Good:
            node.status({
              fill: 'green',
              shape: 'dot',
              text: msg.payload.statusCode.name
            })
            break
          case core.nodeOPCUA.StatusCodes.Bad:
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
        let entry = null
        let statusName = null
        let entryStatus = [0, 0, 0]
        let informationText = 'unknown'

        if (msg.payload.length) {
          for (entry of msg.payload) {
            if (msg.nodetype === 'write') {
              statusName = entry.name
            } else {
              statusName = entry.statusCode.name
            }

            if (statusName) {
              switch (statusName) {
                case 'Good':
                  entryStatus[0] += 1
                  break
                case 'Bad':
                  entryStatus[1] += 1
                  break
                default:
                  entryStatus[2] += 1
              }
            }
          }

          informationText = 'Good:' + entryStatus[0] + ' Bad:' + entryStatus[1] + ' Other:' + entryStatus[2]
        }
        node.status({
          fill: 'yellow',
          shape: 'dot',
          text: informationText
        })
        node.send(msg)
      }
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Response', OPCUAIIoTResponse)

  // StatusCodes via REST anbieten
}
