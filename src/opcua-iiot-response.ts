/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'


import {Todo} from "./types/placeholders";
import coreResponse, {ResponseInputPayload} from "./core/opcua-iiot-core-response";
import {
  checkItemForUnsetState,
  checkResponseItemIsNotToFilter,
  isNodeTypeToFilterResponse
} from "./core/opcua-iiot-core";
import {NodeMessageInFlow} from "@node-red/registry";
import {Node, NodeAPI, NodeDef} from "node-red";
import {AddressSpaceItem} from "./types/helpers";
import {BrowseResult} from "node-opcua";

type Filter = {
  name: string
  value: string
}

interface OPCUAIIoTResponse extends Node {
  name: string
  compressStructure: string
  showStatusActivities: string
  showErrors: string
  activateUnsetFilter: string
  activateFilters: string
  negateFilter: string
  filters: Filter[]
  iiot: Todo
  functions?: Record<string, (...args: any) => any>
}

interface OPCUAIIoTResponseDef extends NodeDef {
  name: string
  compressStructure: string
  showStatusActivities: string
  showErrors: string
  activateUnsetFilter: string
  activateFilters: string
  negateFilter: string
  filters: Filter[]
}

/**
 * Response analyser Node-RED node for OPC UA IIoT nodes.
 *
 * @param RED
 */
module.exports = (RED: NodeAPI) => {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTResponse(this: OPCUAIIoTResponse, config: OPCUAIIoTResponseDef) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.compressStructure = config.compressStructure
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.activateUnsetFilter = config.activateUnsetFilter
    this.activateFilters = config.activateFilters
    this.negateFilter = config.negateFilter
    this.filters = config.filters

    let node: OPCUAIIoTResponse = this
    node.iiot = {}
    this.status({fill: 'green', shape: 'ring', text: 'active'})

    const handleBrowserMsg = function (payload: ResponseInputPayload) {
      coreResponse.analyzeBrowserResults(node, payload)
      if (node.compressStructure) {
        coreResponse.compressBrowseMessageStructure(payload)
      }
      return payload
    }

    const handleCrawlerMsg = function (payload: ResponseInputPayload) {
      coreResponse.analyzeCrawlerResults(node, payload)
      if (node.compressStructure) {
        coreResponse.compressCrawlerMessageStructure(payload)
      }
      return payload
    }

    const handleReadMsg = function (payload: ResponseInputPayload) {
      coreResponse.analyzeReadResults(node, payload)
      if (node.compressStructure) {
        coreResponse.compressReadMessageStructure(payload)
      }
      return payload
    }

    const handleWriteMsg = function (payload: ResponseInputPayload) {
      coreResponse.analyzeWriteResults(node, payload)
      if (node.compressStructure) {
        coreResponse.compressWriteMessageStructure(payload)
      }
      return payload
    }

    const handleListenerMsg = function (payload: ResponseInputPayload) {
      coreResponse.analyzeListenerResults(node, payload)
      if (node.compressStructure) {
        coreResponse.compressListenMessageStructure(payload)
      }
      return payload
    }

    const handleMethodMsg = function (payload: ResponseInputPayload) {
      coreResponse.analyzeMethodResults(node, payload)
      if (node.compressStructure) {
        coreResponse.compressMethodMessageStructure(payload)
      }
      return payload
    }

    const handleDefaultMsg = function (payload: ResponseInputPayload) {
      if (payload) {
        coreResponse.handlePayloadStatusCode(node, payload)
        if (node.compressStructure) {
          coreResponse.compressDefaultMessageStructure(payload)
        }
      }
      return payload
    }

    const handleNodeTypeOfMsg = function (payload: ResponseInputPayload) {
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

    const extractReadEntriesFromFilter = function (payload: ResponseInputPayload) {
      let filteredEntries: AddressSpaceItem[] = []
      let filteredValues: number[] = []

      if (payload.value.length) {
        payload.value.forEach((item: AddressSpaceItem, index: number) => {
          if (itemIsNotToFilter(item)) {
            filteredEntries.push(item)
            filteredValues.push(index)
          }
        })
      }

      if (payload.nodesToRead) {
        payload.nodesToRead = payload.nodesToRead.filter((item: AddressSpaceItem, index: number) => {
          return filteredValues.includes(index)
        })
      }

      return filteredEntries
    }

    const extractBrowserEntriesFromFilter = function (payload: ResponseInputPayload) {
      return payload.browserResults?.filter((item: BrowseResult) => {
        return itemIsNotToFilter(item)
      })
    }

    const extractCrawlerEntriesFromFilter = function (payload: ResponseInputPayload) {
      const filter = payload.crawlerResults?.length === payload.addressSpaceItems?.length
        ? payload.value
        : payload.crawlerResults;

      return filter.filter((item: BrowseResult) => {
        return itemIsNotToFilter(item)
      })
    }

    const extractPayloadEntriesFromFilter = function (payload: ResponseInputPayload) {
      return payload.value.filter((item: Todo) => {
        return itemIsNotToFilter(item)
      })
    }

    const extractMethodEntriesFromFilter = function (payload: ResponseInputPayload) {
      let filteredEntries: Todo[] = []
      let filteredValues: Todo[] = []
      payload.addressSpaceItems.forEach((item: Todo, index: number) => {
        if (itemIsNotToFilter(item)) {
          filteredEntries.push(item)
          filteredValues.push(index)
        }
      })

      let outputArguments: Todo
      if (payload.results) {
        outputArguments = payload.results.outputArguments
      } else {
        outputArguments = payload.outputArguments
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

    const extractEntries = function (payload: ResponseInputPayload) {
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

    const filterMsg = function (payload: ResponseInputPayload) {
      if (payload.value.length || isNodeTypeToFilterResponse(payload)) {
        let filteredEntries = extractEntries(payload)
        if (filteredEntries?.length) {
          payload.value = filteredEntries
          return payload
        }
      } else {
        if (itemIsNotToFilter(payload)) {
          return payload
        }
      }
      return null
    }

    /**
     * Ensure msg has the NodeMessageInFlow format
     */
    const normalizeMessage = (msg: Record<string, any>): NodeMessageInFlow => {
      if (Object.keys(msg).length <= 3) {
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
          if (msg.payload === void 0 || msg.payload === null || msg.payload === {}) {
            return
          }
        }
        msg = normalizeMessage(msg as any)

        const inputPayload = msg.payload as ResponseInputPayload;
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

    const itemIsNotToFilter = function (item: any) {
      let result = checkItemForUnsetState(node, item)

      node.filters.forEach((element: any) => {
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
