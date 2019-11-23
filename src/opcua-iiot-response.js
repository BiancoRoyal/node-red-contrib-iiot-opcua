/*
 The BSD 3-Clause License

 Copyright 2017,2018,2019 - Klaus Landsdorf (https://bianco-royal.com/)
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
    node.bianco = coreResponse.core.createBiancoIIoT()
    coreResponse.core.assert(node.bianco.iiot)

    node.status({ fill: 'green', shape: 'ring', text: 'active' })

    node.bianco.iiot.handleBrowserMsg = function (msg) {
      coreResponse.analyzeBrowserResults(node, msg)
      if (node.compressStructure) {
        coreResponse.compressBrowseMessageStructure(msg)
      }
      return msg
    }

    node.bianco.iiot.handleCrawlerMsg = function (msg) {
      coreResponse.analyzeCrawlerResults(node, msg)
      if (node.compressStructure) {
        coreResponse.compressCrawlerMessageStructure(msg)
      }
      return msg
    }

    node.bianco.iiot.handleReadMsg = function (msg) {
      coreResponse.analyzeReadResults(node, msg)
      if (node.compressStructure) {
        coreResponse.compressReadMessageStructure(msg)
      }
      return msg
    }

    node.bianco.iiot.handleWriteMsg = function (msg) {
      coreResponse.analyzeWriteResults(node, msg)
      if (node.compressStructure) {
        coreResponse.compressWriteMessageStructure(msg)
      }
      return msg
    }

    node.bianco.iiot.handleListenerMsg = function (msg) {
      coreResponse.analyzeListenerResults(node, msg)
      if (node.compressStructure) {
        coreResponse.compressListenMessageStructure(msg)
      }
      return msg
    }

    node.bianco.iiot.handleMethodMsg = function (msg) {
      coreResponse.analyzeMethodResults(node, msg)
      if (node.compressStructure) {
        coreResponse.compressMethodMessageStructure(msg)
      }
      return msg
    }

    node.bianco.iiot.handleDefaultMsg = function (msg) {
      if (msg && msg.payload) {
        coreResponse.handlePayloadStatusCode(node, msg)
        if (node.compressStructure) {
          coreResponse.compressDefaultMessageStructure(msg)
        }
      }
      return msg
    }

    node.bianco.iiot.handleNodeTypeOfMsg = function (msg) {
      let message = Object.assign({}, msg)

      switch (msg.nodetype) {
        case 'browse':
          message = node.bianco.iiot.handleBrowserMsg(message)
          break
        case 'crawl':
          message = node.bianco.iiot.handleCrawlerMsg(message)
          break
        case 'read':
          message = node.bianco.iiot.handleReadMsg(message)
          break
        case 'write':
          message = node.bianco.iiot.handleWriteMsg(message)
          break
        case 'listen':
          message = node.bianco.iiot.handleListenerMsg(message)
          break
        case 'method':
          message = node.bianco.iiot.handleMethodMsg(message)
          break
        default:
          message = node.bianco.iiot.handleDefaultMsg(message)
      }

      return message
    }

    node.bianco.iiot.extractReadEntriesFromFilter = function (message) {
      let filteredEntries = []
      let filteredValues = []

      if (message.payload && message.payload.length) {
        message.payload.forEach((item, index) => {
          if (node.bianco.iiot.itemIsNotToFilter(item)) {
            filteredEntries.push(item)
            filteredValues.push(index)
          }
        })
      }

      if (message.nodesToRead) {
        message.nodesToRead = message.nodesToRead.filter((item, index) => {
          return filteredValues.includes(index)
        })
      }

      return filteredEntries
    }

    node.bianco.iiot.extractBrowserEntriesFromFilter = function (message) {
      let filteredEntries = []
      message.payload.browserResults.forEach((item) => {
        if (node.bianco.iiot.itemIsNotToFilter(item)) {
          filteredEntries.push(item)
        }
      })
      return filteredEntries
    }

    node.bianco.iiot.extractCrawlerEntriesFromFilter = function (message) {
      let filteredEntries = []
      message.payload.crawlerResults.forEach((item) => {
        if (node.bianco.iiot.itemIsNotToFilter(item)) {
          filteredEntries.push(item)
        }
      })
      return filteredEntries
    }

    node.bianco.iiot.extractPayloadEntriesFromFilter = function (message) {
      let filteredEntries = []
      message.payload.forEach((item) => {
        if (node.bianco.iiot.itemIsNotToFilter(item)) {
          filteredEntries.push(item)
        }
      })
      return filteredEntries
    }

    node.bianco.iiot.extractMethodEntriesFromFilter = function (message) {
      let filteredEntries = []
      let filteredValues = []
      message.addressSpaceItems.forEach((item, index) => {
        if (node.bianco.iiot.itemIsNotToFilter(item)) {
          filteredEntries.push(item)
          filteredValues.push(index)
        }
      })

      let outputArguments = null
      if (message.payload.results) {
        outputArguments = message.payload.results.outputArguments
      } else {
        outputArguments = message.payload.outputArguments
      }

      if (outputArguments) {
        outputArguments.forEach((item, index) => {
          if (node.bianco.iiot.itemIsNotToFilter(item)) {
            if (filteredValues.includes(index)) {
              filteredEntries[index].dataType = item.dataType
              filteredEntries[index].arrayType = item.arrayType
              filteredEntries[index].value = item.value
            }
          }
        })
      }

      return filteredEntries
    }

    node.bianco.iiot.extractEntries = function (message) {
      switch (message.nodetype) {
        case 'read':
          return node.bianco.iiot.extractReadEntriesFromFilter(message)
        case 'browse':
          return node.bianco.iiot.extractBrowserEntriesFromFilter(message)
        case 'crawl':
          return node.bianco.iiot.extractCrawlerEntriesFromFilter(message)
        case 'method':
          return node.bianco.iiot.extractMethodEntriesFromFilter(message)
        default:
          return node.bianco.iiot.extractPayloadEntriesFromFilter(message)
      }
    }

    node.bianco.iiot.filterMsg = function (msg) {
      if (msg.payload.length || coreResponse.core.isNodeTypeToFilterResponse(msg)) {
        let filteredEntries = node.bianco.iiot.extractEntries(msg)
        if (filteredEntries.length) {
          msg.payload = filteredEntries
          return msg
        }
      } else {
        if (node.bianco.iiot.itemIsNotToFilter(msg.payload)) {
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

        let message = node.bianco.iiot.handleNodeTypeOfMsg(msg)
        message.compressed = node.compressStructure

        if (node.activateFilters && node.filters && node.filters.length > 0) {
          message = node.bianco.iiot.filterMsg(message)
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

    node.bianco.iiot.itemIsNotToFilter = function (item) {
      let result = coreResponse.core.checkItemForUnsetState(node, item)

      node.filters.forEach((element) => {
        result = coreResponse.core.checkResponseItemIsNotToFilter(node, item, element, result)
      })

      return (node.negateFilter) ? !result : result
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Response', OPCUAIIoTResponse)
}
