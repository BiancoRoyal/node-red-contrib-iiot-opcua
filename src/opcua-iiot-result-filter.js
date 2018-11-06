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
    node.subscribed = false

    if (node.withValueCheck) {
      node.minvalue = node.convertDataType(node.minvalue)
      node.maxvalue = node.convertDataType(node.maxvalue)
    }

    node.status({fill: 'blue', shape: 'ring', text: 'new'})

    node.nodeIdToFilter = function (msg) {
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

    node.isNodeIdNotToFindInAddressSpaceItems = function (msg) {
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

    node.messageIsToFilter = function (msg) {
      return node.nodeIdToFilter(msg) && node.isNodeIdNotToFindInAddressSpaceItems(msg)
    }

    node.on('input', function (msg) {
      if (!msg.hasOwnProperty('payload') || msg.payload === null || msg.payload === void 0) { // values with false has to be true
        coreFilter.internalDebugLog('filtering message without payload')
        return
      }

      if (node.messageIsToFilter(msg)) {
        coreFilter.internalDebugLog('filtering message on filter')
        return
      }

      const message = Object.assign({}, msg)

      message.topic = node.topic || message.topic
      message.nodeId = node.nodeId
      message.justValue = node.justValue
      message.filter = true
      message.filtertype = 'filter'
      message.payload = node.filterByType(msg) || msg.payload

      if (node.justValue) {
        message.payload = node.filterResult(message)
      }

      node.send(message)
    })

    node.filterByType = function (msg) {
      let result = null
      switch (msg.nodetype) {
        case 'read':
          result = node.filterByReadType(msg)
          break
        case 'write':
          result = node.filterByWriteType(msg)
          break
        case 'listen':
          result = node.filterByListenType(msg)
          break
        case 'browse':
          result = node.filterByBrowserType(msg)
          break
        case 'crawl':
          result = node.filterByCrawlerType(msg)
          break
        default:
          coreFilter.internalDebugLog('unknown node type injected to filter for ' + msg.nodetype)
          if (node.showErrors) {
            node.error(new Error('unknown node type injected to filter for ' + msg.nodetype), msg)
          }
      }

      return result
    }

    node.convertResult = function (msg, result) {
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

    node.convertResultValue = function (msg) {
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

      result = node.convertDataType(result)

      if (result === null || result === void 0) {
        coreFilter.internalDebugLog('data type result null or undefined')
        if (node.showErrors) {
          node.error(new Error('converted by data type result null or undefined'), msg)
        }
      } else {
        result = node.convertResult(msg, result)
      }

      return result
    }

    node.filterResult = function (msg, result) {
      if (msg.nodetype === 'read' || msg.nodetype === 'listen') {
        result = node.convertResultValue(msg) || msg.payload
      }
      return result
    }

    node.extractValueFromOPCUAArrayStructure = function (msg, entryIndex) {
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

    node.extractValueFromOPCUAStructure = function (msg) {
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

    node.filterByReadType = function (msg) {
      let result = null

      if (msg.payload.length >= node.entry) {
        result = node.extractValueFromOPCUAArrayStructure(msg, node.entry - 1)
      } else {
        result = node.extractValueFromOPCUAStructure(msg)
      }

      if (result.hasOwnProperty('value')) {
        result = result.value
      }

      return result
    }

    node.filterByWriteType = function (msg) {
      return null // has no value
    }

    node.filterByListenType = function (msg) {
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

    node.filterByBrowserType = function (msg) {
      let result = []

      if (msg.nodetype === 'browse' && msg.payload.browserResults && msg.payload.browserResults.length) {
        msg.payload.browserResults.forEach((item) => {
          if (item.nodeId === node.nodeId) {
            result.push(item)
          }
        })
      }

      return result
    }

    node.filterByCrawlerType = function (msg) {
      let result = []

      if (msg.nodetype === 'crawl' && msg.payload.crawlerResults && msg.payload.crawlerResults.length) {
        msg.payload.crawlerResults.forEach((item) => {
          if (item.nodeId === node.nodeId) {
            result.push(item)
          }
        })
      }

      return result
    }

    node.convertDataType = function (result) {
      coreFilter.internalDebugLog('data type convert for ' + node.nodeId)
      return coreFilter.core.convertDataValueByDataType({value: result}, node.datatype)
    }

    node.status({fill: 'green', shape: 'dot', text: 'active'})
  }

  RED.nodes.registerType('OPCUA-IIoT-Result-Filter', OPCUAIIoTResultFilter)
}
