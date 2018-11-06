/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * Response analyser Node-RED node for OPC UA IIoT nodes.
 *
 * @param RED
 */
module.exports = function (RED) {
  // SOURCE-MAP-REQUIRED
  let coreResponse = require('./core/opcua-iiot-core-response')

  function OPCUAIIoTResponse (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.compressStructure = config.compressStructure
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.activateUnsetFilter = config.activateUnsetFilter
    this.activateFilters = config.activateFilters
    this.negateFilter = config.negateFilter
    this.filters = config.filters

    let node = this

    node.status({fill: 'green', shape: 'ring', text: 'active'})

    node.handleBrowserMsg = function (msg) {
      coreResponse.analyzeBrowserResults(node, msg)
      if (node.compressStructure) {
        coreResponse.compressBrowseMessageStructure(msg)
      }
      return msg
    }

    node.handleReadMsg = function (msg) {
      coreResponse.analyzeReadResults(node, msg)
      if (node.compressStructure) {
        coreResponse.compressReadMessageStructure(msg)
      }
      return msg
    }

    node.handleWriteMsg = function (msg) {
      coreResponse.analyzeWriteResults(node, msg)
      if (node.compressStructure) {
        coreResponse.compressWriteMessageStructure(msg)
      }
      return msg
    }

    node.handleListenerMsg = function (msg) {
      coreResponse.analyzeListenerResults(node, msg)
      if (node.compressStructure) {
        coreResponse.compressListenMessageStructure(msg)
      }
      return msg
    }

    node.handleMethodMsg = function (msg) {
      coreResponse.analyzeMethodResults(node, msg)
      if (node.compressStructure) {
        coreResponse.compressMethodMessageStructure(msg)
      }
      return msg
    }

    node.handleDefaultMsg = function (msg) {
      if (msg && msg.payload) {
        coreResponse.handlePayloadStatusCode(node, msg)
        if (node.compressStructure) {
          coreResponse.compressDefaultMessageStructure(msg)
        }
      }
      return msg
    }

    node.handleNodeTypeOfMsg = function (msg) {
      let message = Object.assign({}, msg)

      switch (msg.nodetype) {
        case 'browse':
          message = node.handleBrowserMsg(message)
          break
        case 'read':
          message = node.handleReadMsg(message)
          break
        case 'write':
          message = node.handleWriteMsg(message)
          break
        case 'listen':
          message = node.handleListenerMsg(message)
          break
        case 'method':
          message = node.handleMethodMsg(message)
          break
        default:
          message = node.handleDefaultMsg(message)
      }

      return message
    }

    node.extractEntries = function (msg) {
      let filteredEntries = []
      msg.payload.forEach((item) => {
        if (node.itemIsNotToFilter(item)) {
          filteredEntries.push(item)
        }
      })
      return filteredEntries
    }

    node.filterMsg = function (msg) {
      if (msg.payload.length) {
        let filteredEntries = node.extractEntries(msg)
        if (filteredEntries.length) {
          msg.payload = filteredEntries
          return msg
        }
      } else {
        if (node.itemIsNotToFilter(msg.payload)) {
          return msg
        }
      }
      return null
    }

    node.on('input', function (msg) {
      try {
        if (node.activateUnsetFilter) {
          if (msg.payload === void 0 || msg.payload === null || msg.payload === {}) { return }
        }

        let message = node.handleNodeTypeOfMsg(msg)
        message.compressed = node.compressStructure

        if (node.activateFilters && node.filters && node.filters.length > 0) {
          message = node.filterMsg(message)
          if (message) {
            node.send(message)
          }
        } else {
          node.send(message)
        }
      } catch (err) {
        coreResponse.internalDebugLog(err)
        if (node.showErrors) {
          node.error(err, msg)
        }
      }
    })

    node.itemIsNotToFilter = function (item) {
      let result = coreResponse.core.checkItemForUnsetState(node, item)

      node.filters.forEach((element) => {
        result = coreResponse.core.checkResponseItemIsNotToFilter(node, item, element, result)
      })

      return (node.negateFilter) ? !result : result
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Response', OPCUAIIoTResponse)
}
