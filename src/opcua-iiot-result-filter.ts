/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {Todo} from "./types/placeholders";

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

import coreFilter from './core/opcua-iiot-core-filter';
import {
  buildNodeListFromClient,
  convertDataValueByDataType,
  filterListByNodeId,
  filterListEntryByNodeId
} from "./core/opcua-iiot-core";
import {NodeMessageInFlow} from "@node-red/registry";
import {BrowsePayload} from "./opcua-iiot-browser";

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
      browserResults?: Todo[]
      msg: Todo
    }

    this.on('input', (msg: NodeMessageInFlow) => {
      if (!msg.hasOwnProperty('payload') || msg.payload === null || msg.payload === void 0) { // values with false has to be true
        coreFilter.internalDebugLog('filtering message without payload')
        return
      }

      const payload = msg.payload as FilterInputPayload & BrowsePayload
      const filtered = filterByType(payload)
      const value =
        node.justValue ?
          // if justValue, return the filtered value of the input message
          filterResult(payload) :
          // otherwise return the value field of the payload
          // The field considered 'value' is different for crawler and browsers
          (filtered.value || filtered.crawlerResults || filtered.browserResults)


      const {msg: msgKey, ...restPayload} = payload;

      const outputPayload = {
        ...restPayload,
        filtertype: "filter",
        justValue: node.justValue,
        nodeId: node.nodeId,
        value,
        ...filtered,
        filter: true,
      }

      const outputMessage = {
        payload: outputPayload,
        _msgid: msg._msgid,
        topic: node.topic || msg.topic
      }


      this.send(outputMessage)
    })

    const filterByType = (msg: FilterInputPayload) => {
      let result = null
      switch (msg.nodetype) {
        case 'read':
          result = filterByReadType(msg)
          break
        case 'write':
          result = filterByWriteType(msg)
          break
        case 'listen':
          result = filterByListenType(msg)
          break
        case 'browse':
          result = filterByBrowserType(msg)
          break
        case 'crawl':
          result = filterByCrawlerType(msg)
          break
        default:
          coreFilter.internalDebugLog('unknown node type injected to filter for ' + msg.nodetype)
          if (node.showErrors) {
            this.error(new Error('unknown node type injected to filter for ' + msg.nodetype), {payload: msg})
          }
      }

      return omitFalseyAndEmpty(result)
    }

    /**
     * Removes empty arrays and falsey values from the object
     */
    const omitFalseyAndEmpty = <T>(object: Record<string, T[]>) => {
      // return if null
      if (!object) {
        return object
      }

      Object.keys(object).forEach((key) => {
        if (!object[key] || object[key].length === 0) {
          delete object[key]
        }
      })
      return object
    }

    const convertResult = (msg: FilterInputPayload, result: Todo) => {
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
          this.error(err, {payload: msg})
        }
        return result
      }
    }

    const convertResultValue = (msg: FilterInputPayload) => {
      let result = msg.value
      if (result === null || result === void 0) {
        coreFilter.internalDebugLog('result null or undefined')
        if (node.showErrors) {
          node.error(new Error('converted result null or undefined'), msg)
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
          this.error(new Error('converted by data type result null or undefined'), {payload: msg})
        }
      } else {
        result = convertResult(msg, result)
      }
      return result
    }

    const filterResult = function (msg: FilterInputPayload) {
      if (msg.nodetype === 'read' || msg.nodetype === 'listen') {
        return convertResultValue(msg)
      }
      return msg.value
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
      } else {
        result = payload
      }

      return result
    }

    const filterByReadType = function (msg: Todo) {
      let result


      if (msg.length >= node.entry) {
        result = extractValueFromOPCUAArrayStructure(msg, node.entry - 1)
      } else {
        result = extractValueFromOPCUAStructure(msg)
      }
      if (result.hasOwnProperty('value')) {
        result = result.value
      }

      return {
        value: result
      }
    }

    // Todo: This feels wrong
    const filterByWriteType = function (msg: Todo): null {
      return null // has no value
    }

    const filterByListenType = function (msg: Todo) {
      let result

      if (msg.payload && msg.payload.hasOwnProperty('value')) {
        result = msg.payload.value
      } else {
        result = msg.payload
      }

      if (result && result.hasOwnProperty('value')) {
        result = result.value
      }

      return result
    }

    const filterByBrowserType = function (msg: BrowsePayload & Todo) {
      const browserResults = filterListByNodeId(node.nodeId, msg.browserResults)

      const addressSpaceItems = (msg.addressSpaceItems && msg.addressSpaceItems.length) ?
        filterListByNodeId(node.nodeId, msg.addressSpaceItems) : [];

      const nodesToRead = (msg.nodesToRead && msg.nodesToRead.length) ?
        filterListEntryByNodeId(node.nodeId, msg.nodesToRead) : [];
      const nodesToReadCount = (msg.nodesToRead && msg.nodesToRead.length) ?
        nodesToRead.length : 0;

      const addressItemsToRead = (msg.addressItemsToRead && msg.addressItemsToRead.length) ?
        filterListByNodeId(node.nodeId, msg.addressItemsToRead) : []
      const addressItemsToReadCount = (msg.addressItemsToRead && msg.addressItemsToRead.length) ?
        addressItemsToRead.length : 0

      const addressItemsToBrowse = (msg.addressItemsToBrowse && msg.addressItemsToBrowse.length) ?
        filterListByNodeId(node.nodeId, msg.addressItemsToBrowse) : []
      const addressItemsToBrowseCount = (msg.addressItemsToBrowse && msg.addressItemsToBrowse.length) ?
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
