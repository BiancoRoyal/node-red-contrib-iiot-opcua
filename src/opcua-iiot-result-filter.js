/*
 The BSD 3-Clause License

 Copyright 2017 - Klaus Landsdorf (http://bianco-royal.de/)
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
  let coreFilter = require('./core/opcua-iiot-core-filter')

  function OPCUAIIoTResultFilter (config) {
    RED.nodes.createNode(this, config)
    this.nodeId = config.nodeId
    this.datatype = config.datatype
    this.withPrecision = config.withPrecision
    this.precision = parseInt(config.precision) | 2
    this.entry = config.entry
    this.justValue = config.justValue
    this.withValueCheck = config.withValueCheck
    this.minvalue = config.minvalue
    this.maxvalue = config.maxvalue
    this.defaultvalue = config.defaultvalue
    this.name = config.name
    this.usingListener = config.usingListener

    let node = this
    node.subscribed = false

    if (node.withValueCheck) {
      node.minvalue = node.convertDataType(node.minvalue)
      node.maxvalue = node.convertDataType(node.minvalue)
    }

    node.status({fill: 'blue', shape: 'ring', text: 'new'})

    node.nodeIdToFilter = function (msg) {
      let doFilter = true

      if (msg.nodesToRead && msg.nodesToRead.length) {
        doFilter = !msg.nodesToRead.some(function (element, index, array) {
          return element.toString() === node.nodeId.toString()
        })
      }

      return doFilter
    }

    node.on('input', function (msg) {
      if (!msg.hasOwnProperty('payload')) {
        coreFilter.internalDebugLog('filtering message without payload ' + JSON.stringify(msg))
        return
      }

      if (msg.multipleRequest) {
        if (node.nodeIdToFilter(msg)) {
          return
        }
      } else {
        // just if not multiple request!
        if (msg.topic !== node.nodeId) {
          return
        }
      }

      msg.filtertype = 'filter'
      let result = msg.payload

      node.status({fill: 'green', shape: 'dot', text: 'active'})

      switch (msg.nodetype) {
        case 'read':
          result = node.filterByReadType(msg)
          break
        case 'listen':
          result = node.filterByListenType(msg)
          break
        default:
          coreFilter.internalDebugLog('unknown node type inject to filter for ' + msg.nodetype)
      }

      let resultDataType = typeof result

      if (resultDataType && resultDataType.toString() !== node.datatype.toString()) {
        result = node.convertDataType(result)
      }

      if (result.hasOwnProperty('value')) {
        result = result.value
      }

      if (!isNaN(result) && node.precision >= 0 && node.withPrecision) {
        result = Number(result.toPrecision(node.precision))
      }

      if (node.withValueCheck) {
        if (result < node.minvalue || result > node.maxvalue) {
          result = node.defaultvalue
        }
      }

      coreFilter.internalDebugLog('node msg stringified: ' + JSON.stringify(msg))
      coreFilter.internalDebugLog('sending result ' + result)

      if (node.justValue) {
        node.send([{payload: result}, {payload: 'just value option active'}])
      } else {
        msg.filteredResult = result
        node.send([{payload: result}, msg])
      }
    })

    node.filterByReadType = function (msg) {
      let result = null

      let minArraySize = node.entry
      coreFilter.internalDebugLog('filter by read type ' + msg.readtype)

      switch (msg.readtype) {
        case 'Meta':
          result = msg.payload // TODO: build an array structure for output
          break
        case 'read':
          if (msg.multipleRequest && msg.payload.length >= minArraySize) {
            result = node.extractValueFromOPCUAArrayStructure(msg, node.entry - 1)
          } else {
            result = node.extractValueFromOPCUAStructure(msg)
          }
          break
        case 'VariableValue':
          if (msg.multipleRequest && msg.payload.length >= minArraySize) {
            result = node.extractValueFromOPCUAArrayStructure(msg, node.entry - 1)
          } else {
            result = node.extractValueFromOPCUAStructure(msg)
          }
          break
        case 'AllAttributes':
          result = msg.payload // TODO: build an array structure for output
          break
        default:
          result = node.extractValueFromOPCUAStructure(msg)
          break
      }

      if (result.hasOwnProperty('value')) {
        result = result.value
      }

      coreFilter.internalDebugLog('filter by read type result ' + JSON.stringify(result))

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

    node.filterByListenType = function (msg) {
      let result = null

      switch (msg.readtype) {
        case 'subscribe':
          if (msg.payload.hasOwnProperty('value')) {
            result = msg.payload.value
          } else {
            result = msg.payload
          }
          break
        case 'event':
          result = msg.payload
          break
        default:
          break
      }

      if (result.hasOwnProperty('value')) {
        result = result.value
      }

      return result
    }

    node.convertDataType = function (result) {
      coreFilter.internalDebugLog('data type convert for ' + node.nodeId)
      return coreFilter.core.convertDataValueByDataType({value: result}, node.datatype)
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Result-Filter', OPCUAIIoTResultFilter)

  RED.httpAdmin.get('/opcuaIIoT/object/DataTypeIds', RED.auth.needsPermission('opcuaIIoT.node.read'), function (req, res) {
    let typeList = require('node-opcua').DataTypeIds
    let invertedTypeList = _.toArray(_.invert(typeList))
    let resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ nodeId: 'i=' + typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })
}
