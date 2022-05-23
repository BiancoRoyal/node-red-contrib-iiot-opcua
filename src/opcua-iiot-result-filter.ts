/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {Todo} from "./types/placeholders";
import coreFilter from './core/opcua-iiot-core-filter';
import {convertDataValueByDataType, filterListByNodeId, filterListEntryByNodeId} from "./core/opcua-iiot-core";
import {NodeMessageInFlow} from "@node-red/registry";
import {BrowserPayload} from "./opcua-iiot-browser";
import {BrowseResult} from "node-opcua";
import {isArray} from "./types/assertion";
import {ReadPayload} from "./opcua-iiot-read";
import {ListenPayload} from "./opcua-iiot-listener";

interface OPCUAIIoTResultFilter extends nodered.Node {
  nodeId: string
  datatype: string
  fixedValue: string
  fixPoint: number
  withPrecision: string
  precision: number
  entry: number
  justValue: string
  withValueCheck: string
  minvalue: string
  maxvalue: string
  defaultvalue: string
  topic: string
  name: string
  showErrors: boolean
}

interface OPCUAIIoTResultFilterDef extends nodered.NodeDef {
  nodeId: string
  datatype: string
  fixedValue: string
  fixPoint: string
  withPrecision: string
  precision: string
  entry: number
  justValue: string
  withValueCheck: string
  minvalue: string
  maxvalue: string
  defaultvalue: string
  topic: string
  name: string
  showErrors: boolean
}

/**
 * OPC UA node representation for Node-RED OPC UA IIoT nodes.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
  // SOURCE-MAP-REQUIRED
  const _ = require('underscore')

  function OPCUAIIoTResultFilter(this: OPCUAIIoTResultFilter, config: OPCUAIIoTResultFilterDef) {
    RED.nodes.createNode(this, config)
    this.nodeId = config.nodeId
    this.datatype = config.datatype
    this.fixedValue = config.fixedValue
    this.fixPoint = parseInt(config.fixPoint) | 2
    this.withPrecision = config.withPrecision
    this.precision = parseInt(config.precision) | 2
    this.entry = config.entry || 1
    this.justValue = config.justValue
    this.withValueCheck = config.withValueCheck
    this.minvalue = config.minvalue
    this.maxvalue = config.maxvalue
    this.defaultvalue = config.defaultvalue
    this.topic = config.topic
    this.name = config.name
    this.showErrors = config.showErrors

    let node: Todo = this
    node.iiot = {};

    this.status({fill: 'blue', shape: 'ring', text: 'new'})

    type FilterInputPayload = {
      statusCodes: Todo[]
      nodesToWrite: Todo[]
      nodetype: string
      value: any
      browserResults?: BrowseResult[]
      crawlerResults?: BrowseResult[]
      msg: Todo
    }

    this.on('input', (msg: NodeMessageInFlow) => {
      if (!msg.hasOwnProperty('payload') || msg.payload === null || msg.payload === void 0) { // values with false has to be true
        coreFilter.internalDebugLog('filtering message without payload')
        return
      }

      const payload = msg.payload as FilterInputPayload & BrowserPayload
      const filtered = filterByType(payload)
      const value =
        node.justValue
          // if justValue, return the filtered value of the input message
          // Spread operator placement should handle all formats of filtered objects
          ? filterResult({value: filtered, ...filtered, nodetype: payload.nodetype})
          // otherwise return the value field of the payload
          // The field considered 'value' is different for crawler and browsers
          : (filtered.value || filtered.crawlerResults || filtered.browserResults)

      const convertedValue = (this.fixedValue || this.withPrecision) ? convertAllResults(payload, value) : value;

      const {msg: msgKey, ...restPayload} = payload;
      const outputPayload = {
        ...restPayload,
        filtertype: "filter",
        justValue: node.justValue,
        nodeId: node.nodeId,
        ...filtered,
        value: convertedValue.length === 1 ? convertedValue[0] : convertedValue,
        filter: true,
      }

      const outputMessage = {
        payload: outputPayload,
        _msgid: msg._msgid,
        topic: node.topic || msg.topic
      }


      this.send(outputMessage)
    })

    const filterByType = (payload: FilterInputPayload) => {
      let result = null
      switch (payload.nodetype) {
        case 'read':
          result = filterByReadType(payload)
          break
        case 'write':
          result = filterByWriteType(payload)
          break
        case 'listen':
          result = filterByListenType(payload)
          break
        case 'browse':
          result = filterByBrowserType(payload)
          break
        case 'crawl':
          result = filterByCrawlerType(payload)
          break
        default:
          coreFilter.internalDebugLog('unknown node type injected to filter for ' + payload.nodetype)
          if (node.showErrors) {
            this.error(new Error('unknown node type injected to filter for ' + payload.nodetype), {payload: payload})
          }
      }
      return result
    }

    const convertAllResults = (payload: FilterInputPayload, result: Todo | Todo[]) => {
      if (!isArray(result)) {
        return convertResult(payload, result)
      } else {
        return result.map((item: Todo) => {
          if ('value' in item) {
            return convertResult(payload, item.value || item)
          } else {
            return item
          }
        })
      }
    }

    const convertResult = (payload: FilterInputPayload, result: Todo) => {
      if (result.value) result = result.value
      try {
        let convertedResult = null
        if (node.fixPoint >= 0 && node.fixedValue) {
          convertedResult = Number.parseFloat(result).toFixed(node.fixPoint)
          convertedResult = parseFloat(convertedResult)
        }

        if (node.precision >= 0 && node.withPrecision) {
          convertedResult = Number.parseFloat(result).toPrecision(node.precision)
          convertedResult = parseFloat(convertedResult)
        }

        if (convertedResult === null) {
          convertedResult = result
        }
        if (node.withValueCheck && typeof convertedResult === "number") {
          if (convertedResult < node.minvalue || convertedResult > node.maxvalue) {
            convertedResult = node.defaultvalue
          }
        }
        return convertedResult
      } catch (err: any) {
        coreFilter.internalDebugLog('result converting error ' + err.message)
        if (node.showErrors) {
          this.error(err, {payload})
        }
        return result
      }
    }

    const convertResultValue = (payload: FilterInputPayload) => {
      let result = payload.value
      if (result === null || result === void 0) {
        coreFilter.internalDebugLog('result null or undefined')
        if (node.showErrors) {
          this.error(new Error('converted result null or undefined'), {payload})
        }
        return result
      }

      if (result.hasOwnProperty('value')) {
        result = result.value
      }

      if (!node.datatype) {
        coreFilter.internalDebugLog('data type unknown - set the data type inside the result filter node')
        return result
      }

      result = convertDataType(result)
      if (result === null || result === void 0) {
        coreFilter.internalDebugLog('data type result null or undefined')
        if (node.showErrors) {
          this.error(new Error('converted by data type result null or undefined'), {payload})
        }
      } else {
        result = convertResult(payload, result)
      }
      return result
    }

    const filterResult = function (payload: FilterInputPayload) {
      if (payload.nodetype === 'read' || payload.nodetype === 'listen') {
        return convertResultValue(payload)
      } else if (payload.nodetype === 'browse' || payload.nodetype === 'crawl') {
        return (payload as Todo).crawlerResults || payload.browserResults
      }
      return payload.value
    }

    const extractValueFromOPCUAArrayStructure = function (payloadInput: Todo, entryIndex: number) {
      let result = null
      let payload = payloadInput[entryIndex]

      if (!payload) {
        return result
      }

      if (payload.hasOwnProperty('value')) {
        if (payload.value.hasOwnProperty('value')) {
          result = payload.value.value
        } else {
          result = payload.value
        }
      } else {
        result = payload
      }

      return result
    }

    const extractValueFromOPCUAStructure = function (payload: Todo) {
      let result

      if (payload.hasOwnProperty('value')) {
        if (payload.value.hasOwnProperty('value')) {
          result = payload.value.value
        } else {
          result = payload.value
        }
      }

      return result
    }

    const filterByReadType = (payload: ReadPayload) => {
      if (isArray(payload.value))
        return {
          value: payload.value.filter((item: Todo) => {
            return item.nodeId.toString().includes(this.nodeId)
          })
        }
      else {
        this.error('wrong payload type');
        return payload
      }
    }

    const filterByWriteType = function (payload: Todo) {
      return {
        value: payload.nodesToWrite.map((item: Todo) => {
          while (item.value) {
            item = item.value
          }
          return item;
        })
      }
    }

    const filterByListenType = function (payload: ListenPayload) {
      let result

      if (payload && payload.hasOwnProperty('value')) {
        result = payload.value
      } else {
        result = payload
      }

      if (result && result.hasOwnProperty('value')) {
        result = result.value
      }

      return result
    }

    const filterByBrowserType = (payload: BrowserPayload & Todo) => {
      const browserResults = filterListByNodeId(node.nodeId, payload.browserResults)

      const addressSpaceItems = (payload.addressSpaceItems && payload.addressSpaceItems.length) ?
        filterListByNodeId(node.nodeId, payload.addressSpaceItems) : [];

      const nodesToRead = (payload.nodesToRead && payload.nodesToRead.length) ?
        filterListEntryByNodeId(node.nodeId, payload.nodesToRead) : [];
      const nodesToReadCount = (payload.nodesToRead && payload.nodesToRead.length) ?
        nodesToRead.length : 0;

      const addressItemsToRead = (payload.addressItemsToRead && payload.addressItemsToRead.length) ?
        filterListByNodeId(node.nodeId, payload.addressItemsToRead) : []
      const addressItemsToReadCount = (payload.addressItemsToRead && payload.addressItemsToRead.length) ?
        addressItemsToRead.length : 0

      const addressItemsToBrowse = (payload.addressItemsToBrowse && payload.addressItemsToBrowse.length) ?
        filterListByNodeId(node.nodeId, payload.addressItemsToBrowse) : []
      const addressItemsToBrowseCount = (payload.addressItemsToBrowse && payload.addressItemsToBrowse.length) ?
        addressItemsToBrowse.length : 0

      return {
        browserResults,
        addressSpaceItems,
        nodesToRead,
        nodesToReadCount,
        addressItemsToRead,
        addressItemsToReadCount,
        addressItemsToBrowse,
        addressItemsToBrowseCount,
      }
    }

    const filterByCrawlerType = function (msg: Todo) {
      const crawlerResults = filterListByNodeId(node.nodeId, msg.crawlerResults)

      const addressItems = (msg.addressSpaceItems && msg.addressSpaceItems.length) ?
        filterListByNodeId(node.nodeId, msg.addressSpaceItems) : []

      return {
        crawlerResults,
        addressItems,
      }
    }

    const convertDataType = function (result: Todo) {
      coreFilter.internalDebugLog('data type convert for ' + node.nodeId)
      return convertDataValueByDataType(result, node.datatype)
    }

    if (node.withValueCheck) {
      node.minvalue = convertDataType(node.minvalue)
      node.maxvalue = convertDataType(node.maxvalue)
    }

    this.status({fill: 'green', shape: 'dot', text: 'active'})

    if (process.env.TEST === "true")
      node.functions = {
        convertResultValue
      }
  }

  RED.nodes.registerType('OPCUA-IIoT-Result-Filter', OPCUAIIoTResultFilter)
}
