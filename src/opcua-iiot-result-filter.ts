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

/**
 * OPC UA node representation for Node-RED OPC UA IIoT nodes.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
  // SOURCE-MAP-REQUIRED
  const _ = require('underscore')

  function OPCUAIIoTResultFilter (this: OPCUAIIoTResultFilter, config: OPCUAIIoTResultFilterDef) {
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

    this.status({ fill: 'blue', shape: 'ring', text: 'new' })

    const nodeIdToFilter = function (msg: Todo) {
      let doFilter = true
      let nodeList = buildNodeListFromClient(msg)
      let elementNodeId = null

      if (nodeList && nodeList.length) {
        doFilter = !nodeList.some(function (element: Todo) {
          elementNodeId = element.nodeId || element
          return elementNodeId.toString() === node.nodeId.toString()
        })
      }

      return doFilter
    }

    const isNodeIdNotToFindInAddressSpaceItems = function (msg: Todo) {
      if (msg.addressSpaceItems) {
        let filteredNodeIds = _.filter(msg.addressSpaceItems, function (entry: Todo) {
          return entry.nodeId === node.nodeId
        })

        if (filteredNodeIds.length < 1) {
          return true
        }
      } else {
        if (msg.topic !== node.nodeId) { // TODO: that is very old and should be deleted
          return true
        }
      }
      return false
    }

    const messageIsToFilter = (msg: Todo) => {
      return nodeIdToFilter(msg) && isNodeIdNotToFindInAddressSpaceItems(msg)
    }

    this.on('input', (msg: Todo) => {
      if (!msg.hasOwnProperty('payload') || msg.payload === null || msg.payload === void 0) { // values with false has to be true
        coreFilter.internalDebugLog('filtering message without payload')
        return
      }

      if (messageIsToFilter(msg)) {
        coreFilter.internalDebugLog('filtering message on filter')
        return
      }

      const message = Object.assign({}, msg)

      message.topic = node.topic || message.topic
      message.nodeId = node.nodeId
      message.justValue = node.justValue
      message.filter = true
      message.filtertype = 'filter'
      message.payload = filterByType(message) || message.payload

      if (node.justValue) {
        message.payload = filterResult(message)
      }

      this.send(message)
    })

    const filterByType = (msg: Todo) => {
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
            this.error(new Error('unknown node type injected to filter for ' + msg.nodetype), msg)
          }
      }

      return result
    }

    const convertResult = (msg: Todo, result: Todo) => {
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

        if (node.withValueCheck) {
          if (convertedResult < node.minvalue || convertedResult > node.maxvalue) {
            convertedResult = node.defaultvalue
          }
        }

        return convertedResult
      } catch (err: any) {
        coreFilter.internalDebugLog('result converting error ' + err.message)
        if (node.showErrors) {
          this.error(err, msg)
        }
        return result
      }
    }

    const convertResultValue = function (msg: Todo) {
      let result = msg.payload

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
          node.error(new Error('converted by data type result null or undefined'), msg)
        }
      } else {
        result = convertResult(msg, result)
      }

      return result
    }

    const filterResult = function (msg: Todo) {
      if (msg.nodetype === 'read' || msg.nodetype === 'listen') {
        return convertResultValue(msg) || msg.payload
      }
      return msg.payload
    }

    const extractValueFromOPCUAArrayStructure = function (msg: Todo, entryIndex: number) {
      let result = null
      let payload = msg.payload[entryIndex]

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

    const extractValueFromOPCUAStructure = function (msg: Todo) {
      let result

      if (msg.payload.hasOwnProperty('value')) {
        if (msg.payload.value.hasOwnProperty('value')) {
          result = msg.payload.value.value
        } else {
          result = msg.payload.value
        }
      } else {
        result = msg.payload
      }

      return result
    }

    const filterByReadType = function (msg: Todo) {
      let result

      if (msg.payload.length >= node.entry) {
        result = extractValueFromOPCUAArrayStructure(msg, node.entry - 1)
      } else {
        result = extractValueFromOPCUAStructure(msg)
      }

      if (result.hasOwnProperty('value')) {
        result = result.value
      }

      return result
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

    const filterByBrowserType = function (msg: Todo) {
      let result = filterListByNodeId(node.nodeId, msg.payload.browserResults)

      if (msg.addressSpaceItems && msg.addressSpaceItems.length) {
        msg.addressSpaceItems = filterListByNodeId(node.nodeId, msg.addressSpaceItems)
      }

      if (msg.nodesToRead && msg.nodesToRead.length) {
        msg.nodesToRead = filterListEntryByNodeId(node.nodeId, msg.nodesToRead)
        msg.nodesToReadCount = msg.nodesToRead.length
      }

      if (msg.addressItemsToRead && msg.addressItemsToRead.length) {
        msg.addressItemsToRead = filterListByNodeId(node.nodeId, msg.addressItemsToRead)
        msg.addressItemsToReadCount = msg.addressItemsToRead.length
      }

      if (msg.addressItemsToBrowse && msg.addressItemsToBrowse.length) {
        msg.addressItemsToBrowse = filterListByNodeId(node.nodeId, msg.addressItemsToBrowse)
        msg.addressItemsToBrowseCount = msg.addressItemsToBrowse.length
      }

      return result
    }

    const filterByCrawlerType = function (msg: Todo) {
      let result = filterListByNodeId(node.nodeId, msg.payload.crawlerResults)

      if (msg.addressSpaceItems && msg.addressSpaceItems.length) {
        msg.addressItems = filterListByNodeId(node.nodeId, msg.addressSpaceItems)
      }

      return result
    }

    const convertDataType = function (result: Todo) {
      coreFilter.internalDebugLog('data type convert for ' + node.nodeId)
      return convertDataValueByDataType({ value: result, dataType: node.datatype }, node.datatype)
    }

    if (node.withValueCheck) {
      node.minvalue = convertDataType(node.minvalue)
      node.maxvalue = convertDataType(node.maxvalue)
    }

    this.status({ fill: 'green', shape: 'dot', text: 'active' })
  }

  RED.nodes.registerType('OPCUA-IIoT-Result-Filter', OPCUAIIoTResultFilter)
}
