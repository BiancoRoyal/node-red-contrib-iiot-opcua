/*
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {TodoTypeAny} from "./types/placeholders";
import coreResponse, {ResponseInputPayload} from "./core/opcua-iiot-core-response";
import {
  IotOpcUaNodeMessage,
  checkItemForUnsetState,
  checkResponseItemIsNotToFilter,
  isNodeTypeToFilterResponse
} from "./core/opcua-iiot-core";
import {NodeMessageInFlow} from "@node-red/registry";
import {Node, NodeAPI, NodeDef} from "node-red";
import {AddressSpaceItem, StatusInput} from "./types/helpers";
import {BrowseResult} from "node-opcua";
import {CrawlerPayload} from "./opcua-iiot-crawler";
import {BrowserPayload} from "./opcua-iiot-browser";
import {AnyPayload} from "./types/payloads";
import {ReadPayload} from "./opcua-iiot-read";
import _ from 'underscore';

type Filter = {
  name: string
  value: string
}

interface OPCUAIIoTResponse extends nodered.Node {
  name: string
  compressStructure: boolean
  showStatusActivities: boolean
  showErrors: boolean
  activateUnsetFilter: boolean
  activateFilters: boolean
  negateFilter: boolean
  filters: Filter[]
  iiot: TodoTypeAny
  functions?: Record<string, (...args: any) => any>
}

interface OPCUAIIoTResponseDef extends nodered.NodeDef {
  name: string
  compressStructure: boolean
  showStatusActivities: boolean
  showErrors: boolean
  activateUnsetFilter: boolean
  activateFilters: boolean
  negateFilter: boolean
  filters: Filter[]
}

/**
 * Response analyser Node-RED node for OPC UA IIoT nodes.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
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

    let self: OPCUAIIoTResponse = this
    self.iiot = {}

    // prototype functions don't seem to be copied in the above line
    // explicitly define node.status here, so it can be used by functions in core-response.ts
    self.status = this.status


    this.status({fill: 'green', shape: 'ring', text: 'active'})

    const handleBrowserMsg = function (payload: BrowserPayload) {
      coreResponse.analyzeBrowserResults(self, payload)
      if (self.compressStructure) {
        coreResponse.compressBrowseMessageStructure(payload)
      }
      return payload
    }

    const handleCrawlerMsg = function (payload: CrawlerPayload) {
      coreResponse.analyzeCrawlerResults(self, payload)
      if (self.compressStructure) {
        coreResponse.compressCrawlerMessageStructure(payload)
      }
      return payload
    }

    const handleReadMsg = function (payload: ReadPayload) {
      coreResponse.analyzeReadResults(self, payload)
      if (self.compressStructure) {
        coreResponse.compressReadMessageStructure(payload)
      }
      return payload
    }

    const handleWriteMsg = function (payload: ResponseInputPayload) {
      coreResponse.analyzeWriteResults(self, payload)
      if (self.compressStructure) {
        coreResponse.compressWriteMessageStructure(payload)
      }
      return payload
    }

    const handleListenerMsg = function (payload: ResponseInputPayload) {
      coreResponse.analyzeListenerResults(self, payload)
      if (self.compressStructure) {
        coreResponse.compressListenMessageStructure(payload)
      }
      return payload
    }

    const handleMethodMsg = function (payload: ResponseInputPayload) {
      coreResponse.analyzeMethodResults(self, payload)
      if (self.compressStructure) {
        coreResponse.compressMethodMessageStructure(payload)
      }
      return payload
    }

    const handleDefaultMsg = function (payload: ResponseInputPayload) {
      if (payload) {
        coreResponse.handlePayloadStatusCode(self, (payload.value as StatusInput | StatusInput[]), payload)
        if (self.compressStructure) {
          coreResponse.compressDefaultMessageStructure(payload)
        }
      }
      return payload
    }

    const handleNodeTypeOfMsg = function (payload: AnyPayload) {
      switch (payload.nodetype) {
        case 'browse':
          return handleBrowserMsg(payload as BrowserPayload)
        case 'crawl':
          return handleCrawlerMsg(payload as CrawlerPayload)
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
      return payload.value.filter((item: TodoTypeAny) => {
        return itemIsNotToFilter(item)
      })
    }

    const extractMethodEntriesFromFilter = function (payload: ResponseInputPayload) {
      let filteredEntries: TodoTypeAny[] = []
      let filteredValues: TodoTypeAny[] = []
      payload.addressSpaceItems.forEach((item: TodoTypeAny, index: number) => {
        if (itemIsNotToFilter(item)) {
          filteredEntries.push(item)
          filteredValues.push(index)
        }
      })

      let outputArguments: TodoTypeAny
      if (payload.results) {
        outputArguments = payload.results.outputArguments
      } else {
        outputArguments = payload.outputArguments
      }

      if (outputArguments) {
        outputArguments.forEach((item: TodoTypeAny, index: number) => {
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
          payload.payloadType = "filtered"
          return payload
        }
      } else {
        if (itemIsNotToFilter(payload)) {
          payload.payloadType = "unfiltered"
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

        const internalMsg = msg as IotOpcUaNodeMessage

        if (self.activateUnsetFilter) {
          if (msg.payload === void 0 ||
              _.isNull(msg.payload) ||
              _.isEmpty(msg.payload) ||
              _.isNull(internalMsg.payload.value) ||
              _.isEmpty(internalMsg.payload.value)) {
            return
          }
        }

        msg = normalizeMessage(msg as any)

        const inputPayload = msg.payload as AnyPayload;
        const handledPayload = {
          ... handleNodeTypeOfMsg(inputPayload),
          compressed: self.compressStructure,
          payloadType: "handled",
        }

        if (self.activateFilters && self.filters && self.filters.length > 0) {
          const filteredPayload = filterMsg(handledPayload)

          if (filteredPayload) {
            this.send({... msg, payload: filteredPayload})
          }
        } else {
          this.send({... msg, payload: handledPayload})
        }
      } catch (err) {
        coreResponse.internalDebugLog(err)
        if (self.showErrors) {
          this.error(err, msg)
        }
      }
    })

    const itemIsNotToFilter = function (item: any) {
      let result = checkItemForUnsetState(self, item)

      self.filters.forEach((element: any) => {
        result = checkResponseItemIsNotToFilter(self, item, element, result)
      })

      return (self.negateFilter) ? !result : result
    }

    if (process.env.TEST === "true")
      self.functions = {
        handleNodeTypeOfMsg,
      }
  }

  RED.nodes.registerType('OPCUA-IIoT-Response', OPCUAIIoTResponse)
}
