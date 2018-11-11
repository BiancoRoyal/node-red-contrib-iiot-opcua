/*
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * OPC UA node representation for Node-RED OPC UA IIoT nodes.
 *
 * @param RED
 */
module.exports = function (RED) {
  // SOURCE-MAP-REQUIRED
  let coreFilter = require('./core/opcua-iiot-core-filter')
  const _ = require('underscore')

  function OPCUAIIoTResultFilter (config) {
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

    let node = this
    node.bianco = coreFilter.core.createBiancoIIoT()
    coreFilter.core.assert(node.bianco.iiot)

    if (node.withValueCheck) {
      node.minvalue = node.convertDataType(node.minvalue)
      node.maxvalue = node.convertDataType(node.maxvalue)
    }

    node.status({fill: 'blue', shape: 'ring', text: 'new'})

    node.bianco.iiot.nodeIdToFilter = function (msg) {
      let doFilter = true
      let nodeList = coreFilter.core.buildNodeListFromClient(msg)
      let elementNodeId = null

      if (nodeList && nodeList.length) {
        doFilter = !nodeList.some(function (element, index, array) {
          elementNodeId = element.nodeId || element
          return elementNodeId.toString() === node.nodeId.toString()
        })
      }

      return doFilter
    }

    node.bianco.iiot.isNodeIdNotToFindInAddressSpaceItems = function (msg) {
      if (msg.addressSpaceItems) {
        let filteredNodeIds = _.filter(msg.addressSpaceItems, function (entry) {
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
    }

    node.bianco.iiot.messageIsToFilter = function (msg) {
      return node.bianco.iiot.nodeIdToFilter(msg) && node.bianco.iiot.isNodeIdNotToFindInAddressSpaceItems(msg)
    }

    node.on('input', function (msg) {
      if (!msg.hasOwnProperty('payload') || msg.payload === null || msg.payload === void 0) { // values with false has to be true
        coreFilter.internalDebugLog('filtering message without payload')
        return
      }

      if (node.bianco.iiot.messageIsToFilter(msg)) {
        coreFilter.internalDebugLog('filtering message on filter')
        return
      }

      const message = Object.assign({}, msg)

      message.topic = node.topic || message.topic
      message.nodeId = node.nodeId
      message.justValue = node.justValue
      message.filter = true
      message.filtertype = 'filter'
      message.payload = node.bianco.iiot.filterByType(message) || message.payload

      if (node.justValue) {
        message.payload = node.bianco.iiot.filterResult(message)
      }

      coreFilter.core.assert(message.payload)
      node.send(message)
    })

    node.bianco.iiot.filterByType = function (msg) {
      let result = null
      switch (msg.nodetype) {
        case 'read':
          result = node.bianco.iiot.filterByReadType(msg)
          break
        case 'write':
          result = node.bianco.iiot.filterByWriteType(msg)
          break
        case 'listen':
          result = node.bianco.iiot.filterByListenType(msg)
          break
        case 'browse':
          result = node.bianco.iiot.filterByBrowserType(msg)
          break
        case 'crawl':
          result = node.bianco.iiot.filterByCrawlerType(msg)
          break
        default:
          coreFilter.internalDebugLog('unknown node type injected to filter for ' + msg.nodetype)
          if (node.showErrors) {
            node.error(new Error('unknown node type injected to filter for ' + msg.nodetype), msg)
          }
      }

      return result
    }

    node.bianco.iiot.convertResult = function (msg, result) {
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

        if (node.withValueCheck) {
          if (convertedResult < node.minvalue || convertedResult > node.maxvalue) {
            convertedResult = node.defaultvalue
          }
        }

        return convertedResult
      } catch (err) {
        coreFilter.internalDebugLog('result converting error ' + err.message)
        if (node.showErrors) {
          node.error(err, msg)
        }
        return result
      }
    }

    node.bianco.iiot.convertResultValue = function (msg) {
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

      result = node.bianco.iiot.convertDataType(result)

      if (result === null || result === void 0) {
        coreFilter.internalDebugLog('data type result null or undefined')
        if (node.showErrors) {
          node.error(new Error('converted by data type result null or undefined'), msg)
        }
      } else {
        result = node.bianco.iiot.convertResult(msg, result)
      }

      return result
    }

    node.bianco.iiot.filterResult = function (msg) {
      if (msg.nodetype === 'read' || msg.nodetype === 'listen') {
        return node.bianco.iiot.convertResultValue(msg) || msg.payload
      }
      return msg.payload
    }

    node.bianco.iiot.extractValueFromOPCUAArrayStructure = function (msg, entryIndex) {
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

    node.bianco.iiot.extractValueFromOPCUAStructure = function (msg) {
      let result = null

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

    node.bianco.iiot.filterByReadType = function (msg) {
      let result = null

      if (msg.payload.length >= node.entry) {
        result = node.bianco.iiot.extractValueFromOPCUAArrayStructure(msg, node.entry - 1)
      } else {
        result = node.bianco.iiot.extractValueFromOPCUAStructure(msg)
      }

      if (result.hasOwnProperty('value')) {
        result = result.value
      }

      return result
    }

    node.bianco.iiot.filterByWriteType = function (msg) {
      return null // has no value
    }

    node.bianco.iiot.filterByListenType = function (msg) {
      let result = null

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

    node.bianco.iiot.filterByBrowserType = function (msg) {
      let result = coreFilter.core.filterListByNodeId(node.nodeId, msg.payload.browserResults)

      if (msg.addressSpaceItems && msg.addressSpaceItems.length) {
        msg.addressSpaceItems = coreFilter.core.filterListByNodeId(node.nodeId, msg.addressSpaceItems)
      }

      if (msg.nodesToRead && msg.nodesToRead.length) {
        msg.nodesToRead = coreFilter.core.filterListEntryByNodeId(node.nodeId, msg.nodesToRead)
        msg.nodesToReadCount = msg.nodesToRead.length
      }

      if (msg.addressItemsToRead && msg.addressItemsToRead.length) {
        msg.addressItemsToRead = coreFilter.core.filterListByNodeId(node.nodeId, msg.addressItemsToRead)
        msg.addressItemsToReadCount = msg.addressItemsToRead.length
      }

      if (msg.addressItemsToBrowse && msg.addressItemsToBrowse.length) {
        msg.addressItemsToBrowse = coreFilter.core.filterListByNodeId(node.nodeId, msg.addressItemsToBrowse)
        msg.addressItemsToBrowseCount = msg.addressItemsToBrowse.length
      }

      return result
    }

    node.bianco.iiot.filterByCrawlerType = function (msg) {
      let result = coreFilter.core.filterListByNodeId(node.nodeId, msg.payload.crawlerResults)

      if (msg.addressSpaceItems && msg.addressSpaceItems.length) {
        msg.addressItems = coreFilter.core.filterListByNodeId(node.nodeId, msg.addressSpaceItems)
      }

      return result
    }

    node.bianco.iiot.convertDataType = function (result) {
      coreFilter.internalDebugLog('data type convert for ' + node.nodeId)
      return coreFilter.core.convertDataValueByDataType({value: result}, node.datatype)
    }

    node.status({fill: 'green', shape: 'dot', text: 'active'})
  }

  RED.nodes.registerType('OPCUA-IIoT-Result-Filter', OPCUAIIoTResultFilter)
}
