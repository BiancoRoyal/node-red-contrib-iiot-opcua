/*
 The BSD 3-Clause License

 Copyright 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-iiot-opcua
 */
'use strict'

/**
 * Response analyser Node-RED node for OPC UA IIoT nodes.
 *
 * @param RED
 */
module.exports = function (RED) {
  let coreResponse = require('./core/opcua-iiot-core-response')
  const EMPTY_LIST = 0

  function OPCUAIIoTResponse (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors

    let node = this

    node.on('input', function (msg) {
      coreResponse.internalDebugLog(msg)
      coreResponse.internalDebugLog(JSON.stringify(msg))

      try {
        if (msg.nodetype) {
          switch (msg.nodetype) {
            case 'read':
              node.analyzeReadResults(msg)
              break

            case 'write':
              node.analyzeWriteResults(msg)
              break

            default:
              node.analyzeResultListStatus(msg)
              break
          }
        }
      } catch (err) {
        coreResponse.internalDebugLog(err)
        if (node.showErrors) {
          node.error(err, msg)
        }
      }

      node.send(msg)
    })

    node.analyzeReadResults = function (msg) {
      switch (msg.readtype) {
        case 'AllAttributes':
          node.analyzeResultListStatus(msg) // TODO: do more
          break

        case 'VariableValue':
          node.analyzeResultListStatus(msg) // TODO: do less
          break

        default:
          node.analyzeResultListStatus(msg) // TODO: do default
          break
      }
    }

    node.analyzeResultListStatus = function (msg) {
      let entry = null
      let entryStatus = [0, 0, 0]
      let informationText = 'unknown'

      if (msg.payload.length) {
        for (entry of msg.payload) {
          if (entry.statusCode) {
            switch (entry.statusCode.name) {
              case 'Good':
                entryStatus[0] += 1
                break
              case 'Bad':
                entryStatus[1] += 1
                break
              default:
                coreResponse.internalDebugLog('unknown status name: ' + JSON.stringify(entry.statusCode.name))
                entryStatus[2] += 1
            }
          }
        }

        informationText = 'Good:' + entryStatus[0] + ' Bad:' + entryStatus[1] + ' Other:' + entryStatus[2]
      }

      node.setNodeStatus(entryStatus, informationText)
    }

    node.setNodeStatus = function (entryStatus, informationText) {
      let fillColor = 'green'

      if (entryStatus[2] > EMPTY_LIST) {
        fillColor = 'yellow'
      }

      if (entryStatus[1] > EMPTY_LIST) {
        fillColor = 'red'
      }

      node.status({
        fill: fillColor,
        shape: 'dot',
        text: informationText
      })
    }

    node.analyzeWriteResults = function (msg) {
      let entry = null
      let entryStatus = [0, 0, 0]
      let informationText = 'unknown'

      if (msg.payload.length) {
        for (entry of msg.payload) {
          if (entry.name) {
            switch (entry.name) {
              case 'Good':
                entryStatus[0] += 1
                break
              case 'Bad':
                entryStatus[1] += 1
                break
              default:
                coreResponse.internalDebugLog('unknown status name: ' + JSON.stringify(entry.name))
                entryStatus[2] += 1
            }
          }
        }

        informationText = 'Good:' + entryStatus[0] + ' Bad:' + entryStatus[1] + ' Other:' + entryStatus[2]
      }

      node.setNodeStatus(entryStatus, informationText)
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Response', OPCUAIIoTResponse)

// StatusCodes via REST anbieten
}
