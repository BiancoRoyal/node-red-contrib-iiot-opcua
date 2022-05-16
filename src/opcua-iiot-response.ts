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
import {NodeMessageInFlow} from "@node-red/registry";

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

    const handleBrowserMsg = function (payload: Todo) {
      coreResponse.analyzeBrowserResults(node, payload)
      if (node.compressStructure) {
        coreResponse.compressBrowseMessageStructure(payload)
      }
      return payload
    }

    const handleCrawlerMsg = function (payload: Todo) {
      coreResponse.analyzeCrawlerResults(node, payload)
      if (node.compressStructure) {
        coreResponse.compressCrawlerMessageStructure(payload)
      }
      return payload
    }

    const handleReadMsg = function (payload: Todo) {
      coreResponse.analyzeReadResults(node, payload)
      if (node.compressStructure) {
        coreResponse.compressReadMessageStructure(payload)
      }
      return payload
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

    const handleNodeTypeOfMsg = function (payload: Todo) {
      switch (payload.nodetype) {
        case 'browse':
          return handleBrowserMsg(payload)
        case 'crawl':
          return handleCrawlerMsg(payload)
        case 'read':
          return handleReadMsg(payload)
        case 'write':
          return handleWriteMsg(payload)
        case 'listen':
          return handleListenerMsg(payload)
        case 'method':
          return handleMethodMsg(payload)
        default:
          return handleDefaultMsg(payload)
      }
    }

    const extractReadEntriesFromFilter = function (payload: Todo) {
      let filteredEntries: Todo[] = []
      let filteredValues: Todo[] = []

      if (payload.value.length) {
        payload.value.forEach((item: Todo, index: number) => {
          if (itemIsNotToFilter(item)) {
            filteredEntries.push(item)
            filteredValues.push(index)
          }
        })
      }

      if (payload.nodesToRead) {
        payload.nodesToRead = payload.nodesToRead.filter((item: Todo, index: number) => {
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

    const extractEntries = function (payload: Todo) {
      switch (payload.nodetype) {
        case 'read':
          return extractReadEntriesFromFilter(payload)
        case 'browse':
          return extractBrowserEntriesFromFilter(payload)
        case 'crawl':
          return extractCrawlerEntriesFromFilter(payload)
        case 'method':
          return extractMethodEntriesFromFilter(payload)
        default:
          return extractPayloadEntriesFromFilter(payload)
      }
    }

    const filterMsg = function (payload: Todo) {
      if (payload.value.length || isNodeTypeToFilterResponse(payload)) {
        let filteredEntries = extractEntries(payload)
        if (filteredEntries.length) {
          payload.value = filteredEntries
          return payload
        }
      } else {
        if (itemIsNotToFilter(payload.payload)) {
          return payload
        }
      }
      return null
    }

    /**
     * Ensure msg has the NodeMessageInFlow format
     */
    const normalizeMessage = (msg: Record<string, any>): NodeMessageInFlow => {
      if (Object.keys(msg).length <= 3 ) {
        return msg as NodeMessageInFlow;
      }
      return {
        topic: msg.topic,
        _msgid: msg._msgid,
        payload: {
          ...msg,
          value: msg.payload,
        }
      }
    }

    this.on('input', (msg: NodeMessageInFlow) => {
      try {
        if (node.activateUnsetFilter) {
          if (msg.payload === void 0 || msg.payload === null || msg.payload === {}) { return }
        }
        msg = normalizeMessage(msg as Todo)

        const inputPayload = msg.payload as Todo;
        const handledPayload = {
          ...handleNodeTypeOfMsg(inputPayload),
          compressed: node.compressStructure
        }
        if (node.activateFilters && node.filters && node.filters.length > 0) {
          const filteredPayload = filterMsg(handledPayload)
          if (filteredPayload) {
            this.send({...msg, payload: filteredPayload})
          }
        } else {
          this.send({...msg, payload: handledPayload})
        }
      } catch (err) {
        coreResponse.internalDebugLog(err)
        if (node.showErrors) {
          this.error(err, msg)
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

    if (process.env.TEST === "true")
      node.functions = {
        handleNodeTypeOfMsg,
      }
  }

  RED.nodes.registerType('OPCUA-IIoT-Response', OPCUAIIoTResponse)
}
