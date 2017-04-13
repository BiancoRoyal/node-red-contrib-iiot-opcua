/**
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-iiot-opcua
 */
'use strict'

/**
 * Nested namespace settings.
 *
 * @type {{biancoroyal: {opcua: {iiot: {core: {}}}}}}
 *
 * @Namesapce de.biancoroyal.opcua.iiot.core
 */
var de = de || {biancoroyal: {opcua: {iiot: {core: {}}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.nodeOPCUA = de.biancoroyal.opcua.iiot.core.nodeOPCUA || require('node-opcua') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.nodeOPCUAId = de.biancoroyal.opcua.iiot.core.nodeOPCUAId || require('node-opcua/lib/datamodel/nodeid') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.internalDebugLog = de.biancoroyal.opcua.iiot.core.internalDebugLog || require('debug')('opcuaIIoT:core') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.OBJECTS_ROOT = de.biancoroyal.opcua.iiot.core.OBJECTS_ROOT || 'ns=0;i=84' // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.TEN_SECONDS_TIMEOUT = de.biancoroyal.opcua.iiot.core.TEN_SECONDS_TIMEOUT || 10 // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.getTimeUnitName = function (unit) {
  let unitAbbreviation = ''

  switch (unit) {
    case 'ms':
      unitAbbreviation = 'msec.'
      break
    case 's':
      unitAbbreviation = 'sec.'
      break
    case 'm':
      unitAbbreviation = 'min.'
      break
    case 'h':
      unitAbbreviation = 'h.'
      break
    default:
      break
  }

  return unitAbbreviation
}

de.biancoroyal.opcua.iiot.core.calcMillisecondsByTimeAndUnit = function (time, unit) {
  let convertedTime

  switch (unit) {
    case 'ms':
      convertedTime = time
      break
    case 's':
      convertedTime = time * 1000 // seconds
      break
    case 'm':
      convertedTime = time * 60000 // minutes
      break
    case 'h':
      convertedTime = time * 3600000 // hours
      break
    default:
      convertedTime = 10000 // 10 sec.
      break
  }

  return convertedTime
}

de.biancoroyal.opcua.iiot.core.buildBrowseMessage = function (topic) {
  return {
    'topic': topic,
    'nodeId': '',
    'browseName': '',
    'nodeClassType': '',
    'typeDefinition': '',
    'payload': ''
  }
}

de.biancoroyal.opcua.iiot.core.toInt32 = function (x) {
  let uintSixteen = x

  if (uintSixteen >= Math.pow(2, 15)) {
    uintSixteen = x - Math.pow(2, 16)
    return uintSixteen
  } else {
    return uintSixteen
  }
}

de.biancoroyal.opcua.iiot.core.getNodeStatus = function (statusValue, statusLog) {
  let fillValue = 'yellow'
  let shapeValue = 'ring'

  switch (statusValue) {
    case 'initialize':
    case 'connecting':
      fillValue = 'yellow'
      break
    case 'connected':
    case 'keepalive':
    case 'subscribe':
    case 'started':
      if (!statusLog) {
        statusValue = 'active'
        shapeValue = 'dot'
      }
      fillValue = 'green'
      break
    case 'active':
    case 'subscribed':
    case 'listening':
      fillValue = 'green'
      shapeValue = 'dot'
      break
    case 'disconnected':
    case 'terminated':
      fillValue = 'red'
      break
    case 'waiting':
      fillValue = 'blue'
      shapeValue = 'dot'
      statusValue = 'waiting ...'
      break
    case 'error':
      fillValue = 'red'
      shapeValue = 'dot'
      break
    default:
      if (!statusValue) {
        fillValue = 'blue'
        statusValue = 'waiting ...'
      }
  }

  return {fill: fillValue, shape: shapeValue, status: statusValue}
}

de.biancoroyal.opcua.iiot.core.buildNewVariant = function (datatype, value) {
  let opcua = de.biancoroyal.opcua.iiot.core.nodeOPCUA
  let variantValue = null

  this.internalDebugLog('buildNewVariant datatype: ' + datatype + ' value:' + value)

  switch (datatype) {
    case 'Float':
    case opcua.DataType.Float:
      variantValue = {
        dataType: opcua.DataType.Float,
        value: parseFloat(value)
      }
      break
    case 'Double':
    case opcua.DataType.Double:
      variantValue = {
        dataType: opcua.DataType.Double,
        value: parseFloat(value)
      }
      break
    case 'UInt16':
    case opcua.DataType.UInt16:
      let uint16 = new Uint16Array([value])
      variantValue = {
        dataType: opcua.DataType.UInt16,
        value: uint16[0]
      }
      break
    case 'UInt32':
    case opcua.DataType.UInt32:
      let uint32 = new Uint32Array([value])
      variantValue = {
        dataType: opcua.DataType.UInt32,
        value: uint32[0]
      }
      break
    case 'Integer':
    case opcua.DataType.Integer:
      variantValue = {
        dataType: opcua.DataType.Integer,
        value: parseInt(value)
      }
      break
    case 'Int32':
    case opcua.DataType.Int32:
      variantValue = {
        dataType: opcua.DataType.Int32,
        value: parseInt(value)
      }
      break
    case 'Int16':
    case opcua.DataType.Int16:
      variantValue = {
        dataType: opcua.DataType.Int16,
        value: parseInt(value)
      }
      break
    case 'Boolean':
    case opcua.DataType.Boolean:
      if (value && value !== 'false') {
        variantValue = {
          dataType: opcua.DataType.Boolean,
          value: true
        }
      } else {
        variantValue = {
          dataType: opcua.DataType.Boolean,
          value: false
        }
      }
      break
    default:
      variantValue = {
        dataType: opcua.DataType.String,
        value: value
      }
      break
  }

  this.internalDebugLog('buildNewVariant variantValue: ' + JSON.stringify(variantValue))

  return variantValue
}

de.biancoroyal.opcua.iiot.core.buildMsgPayloadByDataValue = function (dataValue) {
  let opcua = de.biancoroyal.opcua.iiot.core.nodeOPCUA
  let convertedValue = null

  this.internalDebugLog('buildMsgPayloadByDataValue: ' + JSON.stringify(dataValue))

  if (dataValue.value) {
    convertedValue = this.convertDataValue(dataValue.value)
  }

  switch (dataValue.attributeId) {
    case opcua.AttributeIds.NodeId:
      return {
        nodeId: dataValue.nodeId,
        attributeId: dataValue.attributeId,
        indexRange: dataValue.indexRange,
        dataEncoding: {
          namespaceIndex: dataValue.dataEncoding.namespaceIndex,
          name: dataValue.dataEncoding.name
        }
      }
    case opcua.AttributeIds.BrowseName:
      return {
        nodeId: dataValue.nodeId,
        attributeId: dataValue.attributeId,
        indexRange: dataValue.indexRange,
        dataEncoding: {
          namespaceIndex: dataValue.dataEncoding.namespaceIndex,
          name: dataValue.dataEncoding.name
        }
      }
    default:
      if (dataValue.value) {
        if (dataValue.statusCode) {
          return {
            value: convertedValue,
            dataType: dataValue.value.dataType,
            arrayType: dataValue.value.arrayType,
            statusCode: {
              value: dataValue.statusCode.value,
              description: dataValue.statusCode.description,
              name: dataValue.statusCode.name
            },
            sourcePicoseconds: dataValue.sourcePicoseconds,
            serverPicoseconds: dataValue.serverPicoseconds
          }
        } else {
          return {
            value: convertedValue,
            dataValueStringified: JSON.stringify(dataValue)
          }
        }
      } else {
        if (dataValue.statusCode) {
          return {
            value: null,
            statusCode: {
              value: dataValue.statusCode.value,
              description: dataValue.statusCode.description,
              name: dataValue.statusCode.name
            },
            sourcePicoseconds: dataValue.sourcePicoseconds,
            serverPicoseconds: dataValue.serverPicoseconds
          }
        } else {
          return {
            nodeId: dataValue.nodeId,
            attributeId: dataValue.attributeId,
            indexRange: dataValue.indexRange,
            dataEncoding: {
              namespaceIndex: dataValue.dataEncoding.namespaceIndex,
              name: dataValue.dataEncoding.name
            }
          }
        }
      }
  }
}

de.biancoroyal.opcua.iiot.core.convertDataValue = function (value) {
  let opcua = de.biancoroyal.opcua.iiot.core.nodeOPCUA
  let convertedValue = null

  this.internalDebugLog('convertDataValue: ' + JSON.stringify(value))

  switch (value.dataType) {
    case opcua.DataType.Float:
      convertedValue = parseFloat(value.value)
      break
    case opcua.DataType.Double:
      convertedValue = parseFloat(value.value)
      break
    case opcua.DataType.UInt16:
      let uint16 = new Uint16Array([value.value])
      convertedValue = uint16[0]
      break
    case opcua.DataType.UInt32:
      let uint32 = new Uint32Array([value.value])
      convertedValue = uint32[0]
      break
    case opcua.DataType.Integer:
    case opcua.DataType.Int16:
    case opcua.DataType.Int32:
    case opcua.DataType.Int64:
      convertedValue = parseInt(value.value)
      break
    case opcua.DataType.Boolean:
      convertedValue = (value.value && value.value.toString().toLowerCase() !== 'false')
      break
    case opcua.DataType.String:
      if (value.value) {
        convertedValue = value.value.toString()
      } else {
        convertedValue = JSON.stringify(value.value)
      }
      break
    default:
      this.internalDebugLog('convertDataValue unused DataType: ' + value.dataType)
      if (value.value) {
        convertedValue = value.value
      } else {
        convertedValue = value
      }
      break
  }

  this.internalDebugLog('convertDataValue is: ' + convertedValue)

  return convertedValue
}

de.biancoroyal.opcua.iiot.core.buildMsgPayloadByStatusCode = function (statusCode) {
  this.internalDebugLog('buildMsgPayloadByStatusCode: ' + JSON.stringify(statusCode))

  return {
    value: statusCode.value,
    description: statusCode.description,
    name: statusCode.name,
    statusCodeStringified: JSON.stringify(statusCode)
  }
}

de.biancoroyal.opcua.iiot.core.regex_ns_i = /ns=([0-9]+);i=([0-9]+)/
de.biancoroyal.opcua.iiot.core.regex_ns_s = /ns=([0-9]+);s=(.*)/
de.biancoroyal.opcua.iiot.core.regex_ns_b = /ns=([0-9]+);b=(.*)/
de.biancoroyal.opcua.iiot.core.regex_ns_g = /ns=([0-9]+);g=(.*)/

de.biancoroyal.opcua.iiot.core.parseNamspaceFromMsgTopic = function (msg) {
  let nodeNamespace = null

  if (msg && msg.topic) {
    // TODO: real parsing instead of string operations
    // TODO: which type are relevant here? (String, Integer ...)
    nodeNamespace = msg.topic.substring(3, msg.topic.indexOf(';'))
  }

  return nodeNamespace
}

de.biancoroyal.opcua.iiot.core.parseNamspaceFromItemNodeId = function (item) {
  let nodeNamespace = null

  if (item && item.nodeId) {
    // TODO: real parsing instead of string operations
    // TODO: which type are relevant here? (String, Integer ...)
    nodeNamespace = item.nodeId.substring(3, item.nodeId.indexOf(';'))
  }

  return nodeNamespace
}

de.biancoroyal.opcua.iiot.core.parseIdentifierFromMsgTopic = function (msg) {
  let nodeIdentifier = null

  if (msg && msg.topic) {
    // TODO: real parsing instead of string operations
    if (msg.topic.toString().includes(';i=')) {
      nodeIdentifier = {
        identifier: parseInt(msg.topic.substring(msg.topic.indexOf(';i=') + 3)),
        type: de.biancoroyal.opcua.iiot.core.nodeOPCUAId.NodeIdType.NUMERIC
      }
    } else {
      if (msg.topic.toString().includes(';b=')) {
        nodeIdentifier = {
          identifier: msg.topic.substring(msg.topic.indexOf(';b=') + 3),
          type: de.biancoroyal.opcua.iiot.core.nodeOPCUAId.NodeIdType.NUMERIC
        }
      } else {
        nodeIdentifier = {
          identifier: msg.topic.substring(msg.topic.indexOf(';s=') + 3),
          type: de.biancoroyal.opcua.iiot.core.nodeOPCUAId.NodeIdType.STRING
        }
      }
    }
  }

  return nodeIdentifier
}

de.biancoroyal.opcua.iiot.core.parseIdentifierFromItemNodeId = function (item) {
  let nodeIdentifier = null

  if (item && item.nodeId) {
    // TODO: real parsing instead of string operations
    if (item.nodeId.toString().includes(';i=')) {
      nodeIdentifier = {
        identifier: parseInt(item.nodeId.substring(item.nodeId.indexOf(';i=') + 3)),
        type: de.biancoroyal.opcua.iiot.core.nodeOPCUAId.NodeIdType.NUMERIC
      }
    } else {
      if (item.nodeId.toString().includes(';b=')) {
        nodeIdentifier = {
          identifier: item.nodeId.substring(item.nodeId.indexOf(';b=') + 3),
          type: de.biancoroyal.opcua.iiot.core.nodeOPCUAId.NodeIdType.STRING
        }
      } else {
        nodeIdentifier = {
          identifier: item.nodeId.substring(item.nodeId.indexOf(';s=') + 3),
          type: de.biancoroyal.opcua.iiot.core.nodeOPCUAId.NodeIdType.STRING
        }
      }
    }
  }

  return nodeIdentifier
}

de.biancoroyal.opcua.iiot.core.newOPCUANodeIdListFromMsgItems = function (msg) {
  let item = null
  let itemsToRead = []

  if (msg.payload.items) {
    for (item of msg.payload.items) {
      itemsToRead.push(this.newOPCUANodeIdFromItemNodeId(item))
    }
  }

  return itemsToRead
}

de.biancoroyal.opcua.iiot.core.newOPCUANodeIdFromItemNodeId = function (item) {
  let namespace = de.biancoroyal.opcua.iiot.core.parseNamspaceFromItemNodeId(item)
  let nodeIdentifier = de.biancoroyal.opcua.iiot.core.parseIdentifierFromItemNodeId(item)

  this.internalDebugLog('newOPCUANodeIdFromItemNodeId: ' + JSON.stringify(nodeIdentifier))
  return new de.biancoroyal.opcua.iiot.core.nodeOPCUAId.NodeId(nodeIdentifier.type, nodeIdentifier.identifier, namespace)
}

de.biancoroyal.opcua.iiot.core.newOPCUANodeIdFromMsgTopic = function (msg) {
  let namespace = de.biancoroyal.opcua.iiot.core.parseNamspaceFromMsgTopic(msg)
  let nodeIdentifier = de.biancoroyal.opcua.iiot.core.parseIdentifierFromMsgTopic(msg)

  this.internalDebugLog('newOPCUANodeIdFromMsgTopic: ' + JSON.stringify(nodeIdentifier))
  return new de.biancoroyal.opcua.iiot.core.nodeOPCUAId.NodeId(nodeIdentifier.type, nodeIdentifier.identifier, namespace)
}

de.biancoroyal.opcua.iiot.core.buildNodesToWrite = function (msg) {
  let opcua = de.biancoroyal.opcua.iiot.core.nodeOPCUA
  let nodesToWrite = []

  this.internalDebugLog('buildNodesToWrite input: ' + JSON.stringify(msg))

  if (msg.payload.items) {
    let item = null

    for (item of msg.payload.items) {
      nodesToWrite.push({
        nodeId: this.newOPCUANodeIdFromItemNodeId(item),
        attributeId: opcua.AttributeIds.Value,
        indexRange: null,
        value: {value: this.buildNewVariant(item.datatype, item.value)}
      })
    }
  } else {
    nodesToWrite.push({
      nodeId: this.newOPCUANodeIdFromMsgTopic(msg),
      attributeId: opcua.AttributeIds.Value,
      indexRange: null,
      value: {value: this.buildNewVariant(msg.datatype, msg.payload)}
    })
  }

  this.internalDebugLog('buildNodesToWrite output: ' + JSON.stringify(nodesToWrite))

  return nodesToWrite
}

de.biancoroyal.opcua.iiot.core.buildNodesToRead = function (msg) {
  let nodesToRead = []

  this.internalDebugLog('buildNodesToRead input: ' + JSON.stringify(msg))

  if (msg.payload.items) {
    let item = null

    for (item of msg.payload.items) {
      nodesToRead.push(item.nodeId)
    }
  } else {
    nodesToRead.push(msg.topic)
  }

  this.internalDebugLog('buildNodesToRead output: ' + JSON.stringify(nodesToRead))

  return nodesToRead
}

module.exports = de.biancoroyal.opcua.iiot.core
