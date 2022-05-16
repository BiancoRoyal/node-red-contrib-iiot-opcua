/**
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

import { debug as Debug } from 'debug'
import * as os from 'os'
import * as underscore from 'underscore'
// @ts-ignore
import * as assert from 'better-assert'
import * as nodeOPCUA from 'node-opcua'
import * as nodeOPCUAId from 'node-opcua-nodeid'

export {Debug, os, underscore, assert, nodeOPCUA, nodeOPCUAId}

export * as connector from "./opcua-iiot-core-connector";

export const OBJECTS_ROOT = 'ns=0;i=84'
export const TEN_SECONDS_TIMEOUT = 10
export const RUNNING_STATE = 'SESSIONACTIVE'
export const isWindows = /^win/.test(os.platform())
export const FAKTOR_SEC_TO_MSEC = 1000
export const DEFAULT_TIMEOUT = 1000

export const regex_ns_i = /ns=([0-9]+);i=([0-9]+)/
export const regex_ns_s = /ns=([0-9]+);s=(.*)/
export const regex_ns_b = /ns=([0-9]+);b=(.*)/
export const regex_ns_g = /ns=([0-9]+);g=(.*)/

namespace logger {
    export const internalDebugLog = Debug('opcuaIIoT:core')
    export const detailDebugLog = Debug('opcuaIIoT:core:details')
    export const specialDebugLog = Debug('opcuaIIoT:core:special')
}

logger.internalDebugLog(os.endianness())
logger.internalDebugLog(os.hostname())
logger.internalDebugLog(os.platform())
logger.internalDebugLog(os.type())
logger.internalDebugLog(os.arch())

export function getPathFromRequireResolve(requireResolve) {
    let pathToNodeOPCUA = ''

    if (isWindows) {
        pathToNodeOPCUA = requireResolve.replace('\\index.js', '')
    } else {
        pathToNodeOPCUA = requireResolve.replace('/index.js', '')
    }

    logger.internalDebugLog('path to node-opcua: ' + pathToNodeOPCUA)

    return pathToNodeOPCUA
}

export function getNodeOPCUAPath() {
    return getPathFromRequireResolve(require.resolve('node-opcua'))
}

export function getNodeOPCUAClientPath() {
    return getPathFromRequireResolve(require.resolve('node-opcua-client'))
}

export function getNodeOPCUAServerPath() {
    return getPathFromRequireResolve(require.resolve('node-opcua-server'))
}

export function getTimeUnitName(unit) {
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

export function calcMillisecondsByTimeAndUnit(time, unit) {
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

export function buildBrowseMessage(topic) {
    return {
        'topic': topic,
        'nodeId': '',
        'browseName': '',
        'nodeClassType': '',
        'typeDefinition': '',
        'payload': ''
    }
}

export function toInt32(x) {
    let uintSixteen = x

    if (uintSixteen >= Math.pow(2, 15)) {
        uintSixteen = x - Math.pow(2, 16)
        return uintSixteen
    } else {
        return uintSixteen
    }
}

export function getNodeStatus(statusValue, statusLog) {
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

export function buildNewVariant(datatype, value) {
    let variantValue = null

    logger.detailDebugLog('buildNewVariant datatype: ' + datatype + ' value:' + value)

    switch (datatype) {
        case 'Float':
        case nodeOPCUA.DataType.Float:
            variantValue = {
                dataType: nodeOPCUA.DataType.Float,
                value: parseFloat(value)
            }
            break
        case 'Double':
        case nodeOPCUA.DataType.Double:
            variantValue = {
                dataType: nodeOPCUA.DataType.Double,
                value: parseFloat(value)
            }
            break
        case 'UInt16':
        case nodeOPCUA.DataType.UInt16:
            let uint16 = new Uint16Array([value])
            variantValue = {
                dataType: nodeOPCUA.DataType.UInt16,
                value: uint16[0]
            }
            break
        case 'UInt32':
        case nodeOPCUA.DataType.UInt32:
            let uint32 = new Uint32Array([value])
            variantValue = {
                dataType: nodeOPCUA.DataType.UInt32,
                value: uint32[0]
            }
            break
        case 'Int32':
        case nodeOPCUA.DataType.Int32:
            variantValue = {
                dataType: nodeOPCUA.DataType.Int32,
                value: parseInt(value)
            }
            break
        case 'Int16':
        case nodeOPCUA.DataType.Int16:
            variantValue = {
                dataType: nodeOPCUA.DataType.Int16,
                value: parseInt(value)
            }
            break
        case 'Int64':
        case nodeOPCUA.DataType.Int64:
            variantValue = {
                dataType: nodeOPCUA.DataType.Int64,
                value: parseInt(value)
            }
            break
        case 'Boolean':
        case nodeOPCUA.DataType.Boolean:
            if (value && value !== 'false') {
                variantValue = {
                    dataType: nodeOPCUA.DataType.Boolean,
                    value: true
                }
            } else {
                variantValue = {
                    dataType: nodeOPCUA.DataType.Boolean,
                    value: false
                }
            }
            break
        case 'LocalizedText':
        case nodeOPCUA.DataType.LocalizedText:
            variantValue = {
                dataType: nodeOPCUA.DataType.LocalizedText,
                value: JSON.parse(value) /* [{text:'Hello', locale:'en'}, {text:'Hallo', locale:'de'} ... ] */
            }
            break
        case 'DateTime':
        case nodeOPCUA.DataType.DateTime:
            variantValue = {
                dataType: nodeOPCUA.DataType.DateTime,
                value: new Date(value)
            }
            break
        default:
            if (datatype !== '') {
                const datatypeList = getBasicDataTypes()
                datatypeList.forEach((item) => {
                    if (item.name === datatype || item.dataType === datatype) {
                        variantValue = {
                            dataType: item.dataType,
                            value: value
                        }
                    }
                })
            } else {
                variantValue = {
                    dataType: nodeOPCUA.DataType.String,
                    value: value
                }
            }
            break
    }

    logger.detailDebugLog('buildNewVariant variantValue: ' + JSON.stringify(variantValue))

    return variantValue
}

export function getVariantValue(datatype, value) {
    switch (datatype) {
        case 'Float':
        case 'Double':
        case nodeOPCUA.DataType.Double:
            return parseFloat(value)
        case 'UInt16':
        case nodeOPCUA.DataType.UInt16:
            let uint16 = new Uint16Array([value])
            return uint16[0]
        case 'UInt32':
        case nodeOPCUA.DataType.UInt32:
            let uint32 = new Uint32Array([value])
            return uint32[0]
        case 'Int16':
        case nodeOPCUA.DataType.Int16:
        case 'Int32':
        case 'Integer':
        case nodeOPCUA.DataType.Int32:
        case 'Int64':
        case nodeOPCUA.DataType.Int64:
            return parseInt(value)
        case 'Boolean':
        case nodeOPCUA.DataType.Boolean:
            return (value && value !== 'false')
        case 'DateTime':
        case nodeOPCUA.DataType.DateTime:
            return new Date(value)
        case 'String':
        case nodeOPCUA.DataType.String:
            return (typeof value !== 'string') ? value.toString() : value
        default:
            return value
    }
}

export function getBasicDataTypes() {
    return [
        {name: 'Null', dataType: nodeOPCUA.DataType.Null},
        {name: 'Boolean', dataType: nodeOPCUA.DataType.Boolean},
        {name: 'SByte', dataType: nodeOPCUA.DataType.SByte},
        {name: 'Byte', dataType: nodeOPCUA.DataType.Byte},
        {name: 'Int16', dataType: nodeOPCUA.DataType.Int16},
        {name: 'UInt16', dataType: nodeOPCUA.DataType.UInt16},
        {name: 'Int32', dataType: nodeOPCUA.DataType.Int32},
        {name: 'UInt32', dataType: nodeOPCUA.DataType.UInt32},
        {name: 'Int64', dataType: nodeOPCUA.DataType.Int64},
        {name: 'UInt64', dataType: nodeOPCUA.DataType.UInt64},
        {name: 'Float', dataType: nodeOPCUA.DataType.Float},
        {name: 'Double', dataType: nodeOPCUA.DataType.Double},
        {name: 'DateTime', dataType: nodeOPCUA.DataType.DateTime},
        {name: 'String', dataType: nodeOPCUA.DataType.String},
        {name: 'Guid', dataType: nodeOPCUA.DataType.Guid},
        {name: 'ByteString', dataType: nodeOPCUA.DataType.ByteString},
        {name: 'XmlElement', dataType: nodeOPCUA.DataType.XmlElement},
        {name: 'NodeId', dataType: nodeOPCUA.DataType.NodeId},
        {name: 'ExpandedNodeId', dataType: nodeOPCUA.DataType.ExpandedNodeId},
        {name: 'StatusCode', dataType: nodeOPCUA.DataType.StatusCode},
        {name: 'LocalizedText', dataType: nodeOPCUA.DataType.LocalizedText},
        {name: 'ExtensionObject', dataType: nodeOPCUA.DataType.ExtensionObject},
        {name: 'DataValue', dataType: nodeOPCUA.DataType.DataValue},
        {name: 'Variant', dataType: nodeOPCUA.DataType.Variant},
        {name: 'DiagnosticInfo', dataType: nodeOPCUA.DataType.DiagnosticInfo}
    ]
}

export function convertDataValue(value) {
    return de.biancoroyal.opcua.iiot.convertDataValueByDataType(value, value.dataType)
}

export function convertDataValueByDataType(value, dataType) {
    let convertedValue = null

    if (!value.hasOwnProperty('value')) {
        logger.specialDebugLog('value has no value and that is not allowed ' + JSON.stringify(value))
        return value
    }

    let valueType = typeof value.value

    logger.detailDebugLog('convertDataValue: ' + JSON.stringify(value) +
        ' value origin type ' + valueType + ' convert to' + ' ' + dataType)

    try {
        switch (dataType) {
            case 'NodeId':
            case nodeOPCUA.DataType.NodeId:
                convertedValue = value.value.toString()
                break
            case 'NodeIdType':
            case nodeOPCUA.DataType.NodeIdType: // TODO: investigate
                if (value.value instanceof Buffer) {
                    convertedValue = value.value.toString()
                } else {
                    convertedValue = value.value
                }
                break
            case 'ByteString':
            case nodeOPCUA.DataType.ByteString:
                convertedValue = value.value
                break
            case 'Byte':
            case nodeOPCUA.DataType.Byte:
                if (valueType === 'boolean') {
                    convertedValue = value.value ? 1 : 0
                } else {
                    convertedValue = parseInt(value.value)
                }
                break
            case nodeOPCUA.DataType.QualifiedName:
                convertedValue = value.value.toString()
                break
            case 'LocalizedText':
            case nodeOPCUA.DataType.LocalizedText:
                convertedValue = value.value
                break
            case 'Float':
            case nodeOPCUA.DataType.Float:
                if (isNaN(value.value)) {
                    convertedValue = value.value
                } else {
                    convertedValue = parseFloat(value.value)
                }
                break
            case 'Double':
            case nodeOPCUA.DataType.Double:
                if (isNaN(value.value)) {
                    convertedValue = value.value
                } else {
                    convertedValue = parseFloat(value.value)
                }
                break
            case 'UInt16':
            case nodeOPCUA.DataType.UInt16:
                let uint16 = new Uint16Array([value.value])
                convertedValue = uint16[0]
                break
            case 'UInt32':
            case nodeOPCUA.DataType.UInt32:
                let uint32 = new Uint32Array([value.value])
                convertedValue = uint32[0]
                break
            case 'Int16':
            case nodeOPCUA.DataType.Int16:
            case 'Int32':
            case nodeOPCUA.DataType.Int32:
            case 'Int64':
            case nodeOPCUA.DataType.Int64:
                if (valueType === 'boolean') {
                    convertedValue = value.value ? 1 : 0
                } else {
                    if (isNaN(value.value)) {
                        convertedValue = value.value
                    } else {
                        convertedValue = parseInt(value.value)
                    }
                }
                break
            case 'Boolean':
            case nodeOPCUA.DataType.Boolean:
                convertedValue = value.value
                break
            case 'String':
            case nodeOPCUA.DataType.String:
                if (valueType !== 'string') {
                    convertedValue = value.value.toString()
                } else {
                    convertedValue = value.value
                }
                break
            case 'Null':
            case nodeOPCUA.DataType.Null:
                convertedValue = null
                break
            default:
                logger.internalDebugLog('convertDataValue unused DataType: ' + dataType)
                if (value.hasOwnProperty('value')) {
                    convertedValue = value.value
                } else {
                    convertedValue = null
                }
                break
        }
    } catch (err) {
        logger.detailDebugLog('convertDataValue ' + err)
    }

    logger.detailDebugLog('convertDataValue is: ' + convertedValue)

    return convertedValue
}

export function parseNamspaceFromMsgTopic(msg) {
    let nodeNamespace = null

    if (msg && msg.topic) {
        // TODO: real parsing instead of string operations
        // TODO: which type are relevant here? (String, Integer ...)
        nodeNamespace = msg.topic.substring(3, msg.topic.indexOf(';'))
    }

    return nodeNamespace
}

export function parseNamspaceFromItemNodeId(item) {
    let nodeNamespace = null
    let nodeItem = item.nodeId || item

    if (nodeItem) {
        // TODO: real parsing instead of string operations
        // TODO: which type are relevant here? (String, Integer ...)
        nodeNamespace = nodeItem.substring(3, nodeItem.indexOf(';'))
    }

    return nodeNamespace
}

export function parseForNodeIdentifier(nodeItem) {
    let nodeIdentifier = null

    if (nodeItem) {
        // TODO: real parsing instead of string operations
        if (nodeItem.includes(';i=')) {
            nodeIdentifier = {
                identifier: parseInt(nodeItem.substring(nodeItem.indexOf(';i=') + 3)),
                type: de.biancoroyal.opcua.iiot.nodeOPCUAId.NodeIdType.NUMERIC
            }
        } else if (nodeItem.includes(';g=')) {
            nodeIdentifier = {
                identifier: nodeItem.substring(nodeItem.indexOf(';g=') + 3),
                type: de.biancoroyal.opcua.iiot.nodeOPCUAId.NodeIdType.GUID
            }
        } else {
            if (nodeItem.includes(';b=')) {
                nodeIdentifier = {
                    identifier: nodeItem.substring(nodeItem.indexOf(';b=') + 3),
                    type: de.biancoroyal.opcua.iiot.nodeOPCUAId.NodeIdType.BYTESTRING
                }
            } else {
                nodeIdentifier = {
                    identifier: nodeItem.substring(nodeItem.indexOf(';s=') + 3),
                    type: de.biancoroyal.opcua.iiot.nodeOPCUAId.NodeIdType.STRING
                }
            }
        }
    }
    return nodeIdentifier
}

export function parseIdentifierFromMsgTopic(msg) {
    return parseForNodeIdentifier(msg.topic)
}

export function parseIdentifierFromItemNodeId(item) {
    return parseForNodeIdentifier(item.nodeId || item)
}

export function newOPCUANodeIdFromItemNodeId(item) {
    let namespace = parseNamspaceFromItemNodeId(item)
    let nodeIdentifier = parseIdentifierFromItemNodeId(item)

    logger.internalDebugLog('newOPCUANodeIdFromItemNodeId: ' + JSON.stringify(item) + ' -> ' + JSON.stringify(nodeIdentifier) + ' namespace:' + namespace)
    return new de.biancoroyal.opcua.iiot.nodeOPCUAId.NodeId(nodeIdentifier.type, nodeIdentifier.identifier, namespace)
}

export function newOPCUANodeIdFromMsgTopic(msg) {
    let namespace = parseNamspaceFromMsgTopic(msg)
    let nodeIdentifier = parseIdentifierFromMsgTopic(msg)

    logger.internalDebugLog('newOPCUANodeIdFromMsgTopic: ' + JSON.stringify(nodeIdentifier))
    return new de.biancoroyal.opcua.iiot.nodeOPCUAId.NodeId(nodeIdentifier.type, nodeIdentifier.identifier, namespace)
}

export function pushItemToWriteList(msg, nodesToWrite, item, value) {
    nodesToWrite.push({
        nodeId: newOPCUANodeIdFromItemNodeId(item),
        attributeId: nodeOPCUA.AttributeIds.Value,
        indexRange: null,
        value
    })
}

export function buildNodesToWrite(msg) {
    let nodesToWrite = []

    logger.detailDebugLog('buildNodesToWrite input: ' + JSON.stringify(msg))
    let item = null

    // compatible mode to nodesToWrite of node-opcua
    if (!msg.addressSpaceItems || !msg.addressSpaceItems.length) {
        let itemList = msg.payload.nodesToWrite || msg.nodesToWrite
        if (itemList && itemList.length) {
            msg.addressSpaceItems = itemList
        }
    }

    if (msg.addressSpaceItems) {
        let index = 0
        if (msg.valuesToWrite) {
            for (item of msg.addressSpaceItems) {
                pushItemToWriteList(msg, nodesToWrite, item, {value: this.buildNewVariant(item.datatypeName, msg.valuesToWrite[index++])})
            }
        } else {
            for (item of msg.addressSpaceItems) {
                if (item.value) {
                    pushItemToWriteList(msg, nodesToWrite, item, {value: this.buildNewVariant(item.datatypeName, item.value)})
                } else {
                    pushItemToWriteList(msg, nodesToWrite, item, {value: this.buildNewVariant(item.datatypeName, (msg.payload.length && msg.payload.length === msg.addressSpaceItems.length) ? msg.payload[index++] : msg.payload)})
                }
            }
        }
    }

    logger.internalDebugLog('buildNodesToWrite output: ' + JSON.stringify(nodesToWrite))

    return nodesToWrite
}

export function buildNodesToRead(msg) {
    let nodesToRead = []
    let item = null

    logger.detailDebugLog('buildNodesToRead input: ' + JSON.stringify(msg))

    let nodePayloadList = msg.payload.nodesToRead || msg.payload.nodesToWrite
    if (nodePayloadList && nodePayloadList.length) {
        // read to read
        for (item of nodePayloadList) {
            item = item.nodeId || item
            nodesToRead.push(item.toString())
        }
    } else {
        let nodeList = msg.nodesToRead || msg.nodesToWrite
        if (nodeList && nodeList.length) {
            // legacy
            for (item of nodeList) {
                item = item.nodeId || item
                nodesToRead.push(item.toString())
            }
        } else {
            // new structure
            if (msg.payload.addressSpaceItems && msg.payload.addressSpaceItems.length) {
                for (item of msg.payload.addressSpaceItems) {
                    nodesToRead.push(item.nodeId)
                }
            } else {
                if (msg.addressSpaceItems && msg.addressSpaceItems.length) {
                    for (item of msg.addressSpaceItems) {
                        nodesToRead.push(item.nodeId)
                    }
                }
            }
        }
    }

    logger.internalDebugLog('buildNodesToRead output: ' + JSON.stringify(nodesToRead))

    return nodesToRead
}

export function buildNodesToListen(msg) {
    return msg.addressItemsToRead || msg.addressSpaceItems
}

export function buildNodesFromBrowser(msg) {
    return msg.payload.browserResults || msg.addressSpaceItems
}

export function buildNodesFromCrawler(msg) {
    return msg.payload.crawlerResults || msg.addressSpaceItems
}

export function buildNodeListFromClient(msg) {
    switch (msg.nodetype) {
        case 'read':
        case 'write':
            return buildNodesToRead(msg)
        case 'listen':
            return buildNodesToListen(msg)
        case 'browse':
            return buildNodesFromBrowser(msg)
        case 'crawl':
            return buildNodesFromCrawler(msg)
        default:
            logger.internalDebugLog('unknown node type injected to filter for ' + msg.nodetype)
            return []
    }
}

export function availableMemory() {
    return os.freemem() / os.totalmem() * 100.0
}

export function isSessionBad(err) {
    return (err.toString().includes('Session') ||
        err.toString().includes('Channel') ||
        err.toString().includes('Transaction') ||
        err.toString().includes('timeout') ||
        err.toString().includes('Connection'))
}

export function setNodeInitalState(nodeState, node) {
    switch (nodeState) {
        case 'INITOPCUA':
        case 'SESSIONREQUESTED':
            setNodeStatusTo(node, 'connecting')
            break
        case 'OPEN':
        case 'SESSIONCLOSED':
            node.bianco.iiot.opcuaClient = node.connector.bianco.iiot.opcuaClient
            setNodeStatusTo(node, 'connected')
            break
        case 'SESSIONACTIVE':
            node.bianco.iiot.opcuaSession = node.connector.bianco.iiot.opcuaSession
            setNodeStatusTo(node, 'active')
            break
        case 'LOCKED':
            setNodeStatusTo(node, 'locked')
            break
        case 'UNLOCKED':
            setNodeStatusTo(node, 'unlocked')
            break
        case 'STOPPED':
            setNodeStatusTo(node, 'stopped')
            break
        case 'END':
            setNodeStatusTo(node, 'end')
            break
        default:
            setNodeStatusTo(node, 'waiting')
    }
}

export function isNodeId(nodeId) {
    if (!nodeId || !nodeId.identifierType) {
        return false
    }

    switch (nodeId.identifierType) {
        case nodeOPCUA.NodeIdType.NUMERIC:
        case nodeOPCUA.NodeIdType.STRING:
        case nodeOPCUA.NodeIdType.GUID:
            return true
        default:
            return false
    }
}

export function checkConnectorState(node, msg, callerType) {
    logger.internalDebugLog('Check Connector State ' + node.connector.bianco.iiot.stateMachine.getMachineState() + ' By ' + callerType)

    if (node.connector && node.connector.bianco.iiot.stateMachine && node.connector.bianco.iiot.stateMachine.getMachineState() !== this.RUNNING_STATE) {
        logger.internalDebugLog('Wrong Client State ' + node.connector.bianco.iiot.stateMachine.getMachineState() + ' By ' + callerType)
        if (node.showErrors) {
            node.error(new Error('Client Not ' + RUNNING_STATE + ' On ' + callerType), msg)
        }
        setNodeStatusTo(node, 'not running')
        node.emit('opcua_client_not_ready')
        return false
    } else {
        return true
    }
}

export function setNodeOPCUAConnected(node, opcuaClient) {
    if (isInitializedBiancoIIoTNode(node)) {
        node.bianco.iiot.opcuaClient = opcuaClient
    }
    setNodeStatusTo(node, 'connecting')
}

export function setNodeOPCUAClosed(node) {
    if (isInitializedBiancoIIoTNode(node)) {
        node.bianco.iiot.opcuaClient = null
    }
    setNodeStatusTo(node, 'disconnected')
}

export function setNodeOPCUALost(node) {
    setNodeStatusTo(node, 'lost')
}

export function setNodeOPCUASessionStarted(node, opcuaSession) {
    if (isInitializedBiancoIIoTNode(node)) {
        node.bianco.iiot.opcuaSession = opcuaSession
    }
    setNodeStatusTo(node, 'active')
}

export function setNodeOPCUASessionClosed(node) {
    if (isInitializedBiancoIIoTNode(node)) {
        node.bianco.iiot.opcuaSession = null
    }
    setNodeStatusTo(node, 'connecting')
}

export function setNodeOPCUASessionRestart(node) {
    setNodeStatusTo(node, 'restart')
}

export function setNodeOPCUASessionError(node) {
    if (isInitializedBiancoIIoTNode(node)) {
        node.bianco.iiot.opcuaSession = null
    }
    setNodeStatusTo(node, 'connecting')
}

export function setNodeOPCUARestart(node, opcuaClient) {
    logger.internalDebugLog('Connector Restart')
    if (opcuaClient && isInitializedBiancoIIoTNode(node)) {
        node.bianco.iiot.opcuaClient = opcuaClient
    }
    setNodeStatusTo(node, 'connecting')
}

export function registerToConnector(node) {
    if (!node) {
        logger.internalDebugLog('Node Not Valid On Register To Connector')
        return
    }

    if (!node.connector) {
        node.error(new Error('Connector Config Node Not Valid On Registering Client Node ' + node.id), {payload: 'No Connector Configured'})
        return
    }

    node.connector.bianco.iiot.registerForOPCUA(node)

    node.connector.on('connector_init', () => {
        if (node.bianco.iiot.opcuaClient) {
            node.bianco.iiot.opcuaClient = null
        }

        if (node.bianco.iiot.opcuaSession) {
            node.bianco.iiot.opcuaSession = null
        }
    })

    node.connector.on('connection_started', (opcuaClient) => {
        setNodeOPCUAConnected(node, opcuaClient)
    })

    node.connector.on('server_connection_close', () => {
        setNodeOPCUAClosed(node)
    })

    node.connector.on('server_connection_abort', () => {
        setNodeOPCUAClosed(node)
    })

    node.connector.on('connection_closed', () => {
        setNodeOPCUAClosed(node)
    })

    node.connector.on('server_connection_lost', () => {
        setNodeOPCUALost(node)
    })

    node.connector.on('reset_opcua_connection', () => {
        setNodeOPCUASessionClosed(node)
    })

    node.connector.on('session_started', (opcuaSession) => {
        setNodeOPCUASessionStarted(node, opcuaSession)
    })

    node.connector.on('session_closed', () => {
        setNodeOPCUASessionClosed(node)
    })

    node.connector.on('session_restart', () => {
        setNodeOPCUAClosed(node)
    })

    node.connector.on('session_error', () => {
        setNodeOPCUASessionError(node)
    })

    node.connector.on('after_reconnection', () => {
        setNodeOPCUARestart(node) // TODO: investigate one args v two
    })

    setNodeInitalState(node.connector.bianco.iiot.stateMachine.getMachineState(), node)
}

export function deregisterToConnector(node, done) {
    if (!node) {
        logger.internalDebugLog('Node Not Valid On Register To Connector')
        done()
        return
    }

    if (!node.connector) {
        node.error(new Error('Connector Not Valid On Register To Connector'), {payload: 'No Connector Configured'})
        done()
        return
    }

    node.connector.removeAllListeners()
    if (isInitializedBiancoIIoTNode(node.connector)) {
        node.connector.bianco.iiot.deregisterForOPCUA(node, done)
    }
}

export function checkSessionNotValid(session, callerType) {
    if (!session) {
        logger.internalDebugLog('Session Not Valid On Check For ' + callerType)
        return true
    }

    if (session.sessionId === 'terminated') {
        logger.internalDebugLog('Session Is Valid But Terminated On Check For ' + callerType)
        return true
    }

    return false
}

export function setNodeStatusTo(node, statusValue) {
    let statusParameter = getNodeStatus(statusValue, node.showStatusActivities)
    if (!underscore.isEqual(node.oldStatusParameter, statusParameter)) {
        logger.detailDebugLog('Node ' + node.id + ' Status To ' + statusValue)
        node.oldStatusParameter = statusParameter
        node.status({fill: statusParameter.fill, shape: statusParameter.shape, text: statusParameter.status})
    }
}

export function createBiancoIIoT() {
    return {iiot: {}}
}

export function initClientNode(node) {
    node.bianco = createBiancoIIoT()
    node.bianco.iiot.reconnectTimeout = DEFAULT_TIMEOUT
    node.bianco.iiot.sessionTimeout = null
    node.bianco.iiot.opcuaSession = null
    node.bianco.iiot.opcuaClient = null
    return node
}

export function initCoreServerNode(node) {
    node.bianco = createBiancoIIoT()
    node.bianco.iiot.initialized = false
    node.bianco.iiot.opcuaServer = null
    return node
}

export function getItemFilterValueWithElement(item, element) {
    let filterValue = null

    switch (element.name) {
        case 'browseName':
        case 'statusCode':
            filterValue = item[element.name].name
            break
        case 'displayName':
            filterValue = item[element.name].text
            break
        case 'value':
        case 'dataType':
            if (item.value && item.value.hasOwnProperty('value')) {
                filterValue = item.value[element.name]
            } else {
                filterValue = item[element.name]
            }
            break
        default:
            filterValue = item[element.name]
    }

    return filterValue
}

export function handleErrorInsideNode(node, err) {
    logger.internalDebugLog(typeof node + ' ' + err.message)
    if (node.showErrors) {
        node.error(err, {payload: err.message})
    }
}

export function checkCrawlerItemIsNotToFilter(node, item, element, result) {
    try {
        let filterValue = getItemFilterValueWithElement(item, element)

        if (filterValue && filterValue.key && filterValue.key.match) {
            if (filterValue.key.match(element.value)) {
                result &= false
            }
        } else {
            if (filterValue && filterValue.match) {
                if (filterValue.match(element.value)) {
                    result &= false
                }
            } else {
                if (filterValue && filterValue.toString) {
                    filterValue = filterValue.toString()
                    if (filterValue && filterValue.match) {
                        if (filterValue.match(element.value)) {
                            result &= false
                        }
                    }
                }
            }
        }
    } catch (err) {
        handleErrorInsideNode(node, err)
    }

    return result
}

export function checkResponseItemIsNotToFilter(node, item, element, result) {
    try {
        let filterValue = getItemFilterValueWithElement(item, element)

        if (filterValue) {
            if (filterValue.key && filterValue.key.match) {
                result &= filterValue.key.match(element.value) !== null
            } else {
                if (filterValue.match) {
                    result &= filterValue.match(element.value) !== null
                } else {
                    if (filterValue.toString) {
                        filterValue = filterValue.toString()
                        if (filterValue.match) {
                            result &= filterValue.match(element.value) !== null
                        }
                    }
                }
            }
        } else {
            result &= false // undefined items
        }
    } catch (err) {
        handleErrorInsideNode(node, err)
    }

    return result
}

export function checkItemForUnsetState(node, item) {
    let result = true

    if (node.activateUnsetFilter) {
        result &= item !== null

        if (item && item.hasOwnProperty('value')) {
            if (item.value && item.value.hasOwnProperty('value')) {
                result &= item.value.value !== null
            } else {
                result &= item.value !== null
            }
        }
    }

    return result
}

export function resetBiancoNode(node) {
    if (isInitializedBiancoIIoTNode(node) && node.bianco.iiot.resetAllTimer) {
        node.bianco.iiot.resetAllTimer()
    }
    if (isInitializedBiancoIIoTNode(node)) {
        node.bianco.iiot = null
    }
    node.bianco = null
}

export function filterListEntryByNodeId(nodeId, list) {
    let result = []

    if (list && list.length) {
        list.forEach((item) => {
            if (item === nodeId) {
                result.push(item)
            }
        })
    }

    return result
}

export function filterListByNodeId(nodeId, list) {
    let result = []

    if (list && list.length) {
        list.forEach((item) => {
            if (item.nodeId === nodeId) {
                result.push(item)
            }
        })
    }

    return result
}

export function isNodeTypeToFilterResponse(msg) {
    return msg.nodetype === 'read' || msg.nodetype === 'browse' || msg.nodetype === 'crawl' || msg.nodetype === 'method'
}

export function isInitializedBiancoIIoTNode(node) {
    return node && node.bianco && node.bianco.iiot
}


