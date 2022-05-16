/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {Todo, TodoBianco} from "./types/placeholders";
import coreResponse from "./core/opcua-iiot-core-response";
import {
  checkItemForUnsetState,
  checkResponseItemIsNotToFilter,
  isNodeTypeToFilterResponse
} from "./core/opcua-iiot-core";

interface OPCUAIIoTResponse extends nodered.Node {
  name: string
  compressStructure: string
  showStatusActivities: string
  showErrors: string
  activateUnsetFilter: string
  activateFilters: string
  negateFilter: string
  filters: Todo[]
  bianco?: TodoBianco
}
interface OPCUAIIoTResponseDef extends nodered.NodeDef {
  name: string
  compressStructure: string
  showStatusActivities: string
  showErrors: string
  activateUnsetFilter: string
  activateFilters: string
  negateFilter: string
  filters: Todo[]
}
/**
 * Response analyser Node-RED node for OPC UA IIoT nodes.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTResponse (this: OPCUAIIoTResponse, config: OPCUAIIoTResponseDef) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.compressStructure = config.compressStructure
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.activateUnsetFilter = config.activateUnsetFilter
    this.activateFilters = config.activateFilters
    this.negateFilter = config.negateFilter
    this.filters = config.filters

    let node: Todo = this
    node.iiot = {}
    this.status({ fill: 'green', shape: 'ring', text: 'active' })

    const handleBrowserMsg = function (msg: Todo) {
      coreResponse.analyzeBrowserResults(node, msg)
      if (node.compressStructure) {
        coreResponse.compressBrowseMessageStructure(msg)
      }
      return msg
    }

    const handleCrawlerMsg = function (msg: Todo) {
      coreResponse.analyzeCrawlerResults(node, msg)
      if (node.compressStructure) {
        coreResponse.compressCrawlerMessageStructure(msg)
      }
      return msg
    }

    const handleReadMsg = function (msg: Todo) {
      coreResponse.analyzeReadResults(node, msg)
      if (node.compressStructure) {
        coreResponse.compressReadMessageStructure(msg)
      }
      return msg
    }

    const handleWriteMsg = function (msg: Todo) {
      coreResponse.analyzeWriteResults(node, msg)
      if (node.compressStructure) {
        coreResponse.compressWriteMessageStructure(msg)
      }
      return msg
    }

    const handleListenerMsg = function (msg: Todo) {
      coreResponse.analyzeListenerResults(node, msg)
      if (node.compressStructure) {
        coreResponse.compressListenMessageStructure(msg)
      }
      return msg
    }

    const handleMethodMsg = function (msg: Todo) {
      coreResponse.analyzeMethodResults(node, msg)
      if (node.compressStructure) {
        coreResponse.compressMethodMessageStructure(msg)
      }
      return msg
    }

    const handleDefaultMsg = function (msg: Todo) {
      if (msg && msg.payload) {
        coreResponse.handlePayloadStatusCode(node, msg)
        if (node.compressStructure) {
          coreResponse.compressDefaultMessageStructure(msg)
        }
      }
      return msg
    }

    const handleNodeTypeOfMsg = function (msg: Todo) {
      let message = Object.assign({}, msg)

      switch (msg.nodetype) {
        case 'browse':
          message = handleBrowserMsg(message)
          break
        case 'crawl':
          message = handleCrawlerMsg(message)
          break
        case 'read':
          message = handleReadMsg(message)
          break
        case 'write':
          message = handleWriteMsg(message)
          break
        case 'listen':
          message = handleListenerMsg(message)
          break
        case 'method':
          message = handleMethodMsg(message)
          break
        default:
          message = handleDefaultMsg(message)
      }

      return message
    }

    const extractReadEntriesFromFilter = function (message: Todo) {
      let filteredEntries: Todo[] = []
      let filteredValues: Todo[] = []

      if (message.payload && message.payload.length) {
        message.payload.forEach((item: Todo, index: number) => {
          if (node.iiot.itemIsNotToFilter(item)) {
            filteredEntries.push(item)
            filteredValues.push(index)
          }
        })
      }

      if (message.nodesToRead) {
        message.nodesToRead = message.nodesToRead.filter((item: Todo, index: number) => {
          return filteredValues.includes(index)
        })
      }

      return filteredEntries
    }

    const extractBrowserEntriesFromFilter = function (message: Todo) {
      let filteredEntries: Todo[] = []
      message.payload.browserResults.forEach((item: Todo) => {
        if (itemIsNotToFilter(item)) {
          filteredEntries.push(item)
        }
      })
      return filteredEntries
    }

    const extractCrawlerEntriesFromFilter = function (message: Todo) {
      let filteredEntries: Todo[] = []
      message.payload.crawlerResults.forEach((item: Todo) => {
        if (itemIsNotToFilter(item)) {
          filteredEntries.push(item)
        }
      })
      return filteredEntries
    }

    const extractPayloadEntriesFromFilter = function (message: Todo) {
      let filteredEntries: Todo[] = []
      message.payload.forEach((item: Todo) => {
        if (node.iiot.itemIsNotToFilter(item)) {
          filteredEntries.push(item)
        }
      })
      return filteredEntries
    }

    const extractMethodEntriesFromFilter = function (message: Todo) {
      let filteredEntries: Todo[] = []
      let filteredValues: Todo[] = []
      message.addressSpaceItems.forEach((item: Todo, index: number) => {
        if (itemIsNotToFilter(item)) {
          filteredEntries.push(item)
          filteredValues.push(index)
        }
      })

      let outputArguments: Todo
      if (message.payload.results) {
        outputArguments = message.payload.results.outputArguments
      } else {
        outputArguments = message.payload.outputArguments
      }

      if (outputArguments) {
        outputArguments.forEach((item: Todo, index: number) => {
          if (itemIsNotToFilter(item)) {
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

    const extractEntries = function (message: Todo) {
      switch (message.nodetype) {
        case 'read':
          return extractReadEntriesFromFilter(message)
        case 'browse':
          return extractBrowserEntriesFromFilter(message)
        case 'crawl':
          return extractCrawlerEntriesFromFilter(message)
        case 'method':
          return extractMethodEntriesFromFilter(message)
        default:
          return extractPayloadEntriesFromFilter(message)
      }
    }

    const filterMsg = function (msg: Todo) {
      if (msg.payload.length || isNodeTypeToFilterResponse(msg)) {
        let filteredEntries = extractEntries(msg)
        if (filteredEntries.length) {
          msg.payload = filteredEntries
          return msg
        }
      } else {
        if (itemIsNotToFilter(msg.payload)) {
          return msg
        }
      }
      return null
    }

    this.on('input', function (msg: Todo) {
      try {
        if (node.activateUnsetFilter) {
          if (msg.payload === void 0 || msg.payload === null || msg.payload === {}) { return }
        }

        let message = handleNodeTypeOfMsg(msg)
        message.compressed = node.compressStructure

        if (node.activateFilters && node.filters && node.filters.length > 0) {
          message = filterMsg(message)
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

    const itemIsNotToFilter = function (item: Todo) {
      let result = checkItemForUnsetState(node, item)

      node.filters.forEach((element: Todo) => {
        result = checkResponseItemIsNotToFilter(node, item, element, result)
      })

      return (node.negateFilter) ? !result : result
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Response', OPCUAIIoTResponse)
}
