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

import * as nodeOPCUAId from 'node-opcua-nodeid'
import {
    BrowseMessage, DataTypeInput,
    ItemNodeId,
    NodeIdentifier, NodeToWrite,
    TimeUnitNames,
    TimeUnits,
    VariantType, WriteListItem, WriteMessage
} from "../types/core";
import {CoreNode, NodeObject, recursivePrintTypes, Todo} from "../types/placeholders";
import nodeRed, {Node, NodeStatus} from "node-red";
import {NodeMessageInFlow, NodeStatusFill, NodeStatusShape} from "@node-red/registry";
import {isArray, isNotDefined} from "../types/assertion";
import {
    AttributeIds,
    ClientSession,
    DataType,
    DataValue, DataValueOptions,
    isNullOrUndefined,
    NodeId,
    NodeIdType,
    OPCUAClient, Variant
} from "node-opcua";
import {WriteValueOptions} from "node-opcua-service-write";
import {VariantOptions} from "node-opcua-variant";

export {Debug, os, underscore, nodeOPCUAId}

export const OBJECTS_ROOT: string = 'ns=0;i=84'
export const TEN_SECONDS_TIMEOUT: number = 10
export const RUNNING_STATE: string = 'SESSIONACTIVE'
export const isWindows: boolean = /^win/.test(os.platform())
export const FAKTOR_SEC_TO_MSEC: number = 1000
export const DEFAULT_TIMEOUT: number = 1000

export const regex_ns_i: RegExp = /ns=([0-9]+);i=([0-9]+)/
export const regex_ns_s: RegExp = /ns=([0-9]+);s=(.*)/
export const regex_ns_b: RegExp = /ns=([0-9]+);b=(.*)/
export const regex_ns_g: RegExp = /ns=([0-9]+);g=(.*)/

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

export const getPathFromRequireResolve= (requireResolve: string): string => {
    let pathToNodeOPCUA = ''

    if (isWindows) {
        pathToNodeOPCUA = requireResolve.replace('\\index.js', '')
    } else {
        pathToNodeOPCUA = requireResolve.replace('/index.js', '')
    }

    logger.internalDebugLog('path to node-opcua: ' + pathToNodeOPCUA)

    return pathToNodeOPCUA
}

export function getNodeOPCUAPath(): string {
    return getPathFromRequireResolve(require.resolve('node-opcua'))
}

export function getNodeOPCUAClientPath(): string {
    return getPathFromRequireResolve(require.resolve('node-opcua-client'))
}

export function getNodeOPCUAServerPath(): string {
    return getPathFromRequireResolve(require.resolve('node-opcua-server'))
}

export function getTimeUnitName(unit: TimeUnits): TimeUnitNames {
    switch (unit) {
        case 'ms':
            return 'msec.'
        case 's':
            return 'sec.'
        case 'm':
            return 'min.'
        case 'h':
            return 'h.'
        default:
            return ''
    }
}

export function calcMillisecondsByTimeAndUnit(time: number, unit: TimeUnits): number {
    switch (unit) {
        case 'ms':
            return time
        case 's':
            return time * 1000 // seconds
        case 'm':
            return time * 60000 // minutes
        case 'h':
            return time * 3600000 // hours
        default:
            return 10000 // 10 sec.
    }
}

export function buildBrowseMessage(topic: Todo): BrowseMessage {
    return {
        'topic': topic,
        'nodeId': '',
        'browseName': '',
        'nodeClassType': '',
        'typeDefinition': '',
        'payload': ''
    }
}

export function toInt32(uintSixteen: number): number {

    if (uintSixteen >= Math.pow(2, 15)) {
        return uintSixteen - Math.pow(2, 16)
    }
    return uintSixteen
}

export function getNodeStatus(statusValue: string, statusLog: boolean): NodeStatus {
    let fillValue: NodeStatusFill = 'yellow'
    let shapeValue: NodeStatusShape = 'ring'

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
    return {fill: fillValue, shape: shapeValue, text: statusValue}
}

export function buildNewVariant(datatype: DataTypeInput, value: any): DataValueOptions {
    let variantValue: VariantOptions = {
        dataType: DataType.Null,
        value: null
    }

    logger.detailDebugLog('buildNewVariant datatype: ' + datatype + ' value:' + value)

    switch (datatype) {
        case 'Float':
        case DataType.Float:
            variantValue = {
                dataType: DataType.Float,
                value: parseFloat(value)
            }
            break
        case 'Double':
        case DataType.Double:
            variantValue = {
                dataType: DataType.Double,
                value: parseFloat(value)
            }
            break
        case 'UInt16':
        case DataType.UInt16:
            let uint16 = new Uint16Array([value])
            variantValue = {
                dataType: DataType.UInt16,
                value: uint16[0]
            }
            break
        case 'UInt32':
        case DataType.UInt32:
            let uint32 = new Uint32Array([value])
            variantValue = {
                dataType: DataType.UInt32,
                value: uint32[0]
            }
            break
        case 'Int32':
        case DataType.Int32:
            variantValue = {
                dataType: DataType.Int32,
                value: parseInt(value)
            }
            break
        case 'Int16':
        case DataType.Int16:
            variantValue = {
                dataType: DataType.Int16,
                value: parseInt(value)
            }
            break
        case 'Int64':
        case DataType.Int64:
            variantValue = {
                dataType: DataType.Int64,
                value: parseInt(value)
            }
            break
        case 'Boolean':
        case DataType.Boolean:
            if (value && value !== 'false') {
                variantValue = {
                    dataType: DataType.Boolean,
                    value: true
                }
            } else {
                variantValue = {
                    dataType: DataType.Boolean,
                    value: false
                }
            }
            break
        case 'LocalizedText':
        case DataType.LocalizedText:
            variantValue = {
                dataType: DataType.LocalizedText,
                value: JSON.parse(value) /* [{text:'Hello', locale:'en'}, {text:'Hallo', locale:'de'} ... ] */
            }
            break
        case 'DateTime':
        case DataType.DateTime:
            variantValue = {
                dataType: DataType.DateTime,
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
                    dataType: DataType.String,
                    value: value
                }
            }
            break
    }

    logger.detailDebugLog('buildNewVariant variantValue: ' + JSON.stringify(variantValue))

    return {
        value: variantValue
    }
}

export function getVariantValue(datatype: DataTypeInput, value: any): number | Date | boolean | string {
    switch (datatype) {
        case 'Float':
        case 'Double':
        case DataType.Double:
            return parseFloat(value)
        case 'UInt16':
        case DataType.UInt16:
            let uint16 = new Uint16Array([value])
            return uint16[0]
        case 'UInt32':
        case DataType.UInt32:
            let uint32 = new Uint32Array([value])
            return uint32[0]
        case 'Int16':
        case DataType.Int16:
        case 'Int32':
        case 'Integer':
        case DataType.Int32:
        case 'Int64':
        case DataType.Int64:
            return parseInt(value)
        case 'Boolean':
        case DataType.Boolean:
            return (value && value !== 'false')
        case 'DateTime':
        case DataType.DateTime:
            return new Date(value)
        case 'String':
        case DataType.String:
            return (typeof value !== 'string') ? value.toString() : value
        default:
            return value
    }
}

export function getBasicDataTypes() {
    return [
        {name: 'Null', dataType: DataType.Null},
        {name: 'Boolean', dataType: DataType.Boolean},
        {name: 'SByte', dataType: DataType.SByte},
        {name: 'Byte', dataType: DataType.Byte},
        {name: 'Int16', dataType: DataType.Int16},
        {name: 'UInt16', dataType: DataType.UInt16},
        {name: 'Int32', dataType: DataType.Int32},
        {name: 'UInt32', dataType: DataType.UInt32},
        {name: 'Int64', dataType: DataType.Int64},
        {name: 'UInt64', dataType: DataType.UInt64},
        {name: 'Float', dataType: DataType.Float},
        {name: 'Double', dataType: DataType.Double},
        {name: 'DateTime', dataType: DataType.DateTime},
        {name: 'String', dataType: DataType.String},
        {name: 'Guid', dataType: DataType.Guid},
        {name: 'ByteString', dataType: DataType.ByteString},
        {name: 'XmlElement', dataType: DataType.XmlElement},
        {name: 'NodeId', dataType: DataType.NodeId},
        {name: 'ExpandedNodeId', dataType: DataType.ExpandedNodeId},
        {name: 'StatusCode', dataType: DataType.StatusCode},
        {name: 'LocalizedText', dataType: DataType.LocalizedText},
        {name: 'ExtensionObject', dataType: DataType.ExtensionObject},
        {name: 'DataValue', dataType: DataType.DataValue},
        {name: 'Variant', dataType: DataType.Variant},
        {name: 'DiagnosticInfo', dataType: DataType.DiagnosticInfo}
    ]
}

export function valueIsString(value: DataValue | string): value is string {
    return typeof value === 'string'
}

export function convertDataValue(value: DataValue | string) {
    if (valueIsString(value)) {
        return value;
    } else
        return convertDataValueByDataType(value.value.value, value.value.dataType)
}

export function convertDataValueByDataType(value: any , dataType: DataTypeInput): string {
    let convertedValue = null

    const valueType = typeof value

    logger.detailDebugLog('convertDataValue: ' + JSON.stringify(value) +
        ' value origin type ' + valueType + ' convert to' + ' ' + dataType)

    try {
        switch (dataType) {
            case 'NodeId':
            case DataType.NodeId:
                convertedValue = value.toString()
                break
            case 'NodeIdType':
            case DataType.ExpandedNodeId: // TODO: investigate, original value (NodeIdType) doesn't exist
                if (value.value instanceof Buffer) {
                    convertedValue = value.toString()
                } else {
                    convertedValue = value
                }
                break
            case 'ByteString':
            case DataType.ByteString:
                convertedValue = value
                break
            case 'Byte':
            case DataType.Byte:
                if (valueType === 'boolean') {
                    convertedValue = value ? 1 : 0
                } else {
                    convertedValue = parseInt(value.value)
                }
                break
            case DataType.QualifiedName:
                convertedValue = value.toString()
                break
            case 'LocalizedText':
            case DataType.LocalizedText:
                convertedValue = value
                break
            case 'Float':
            case DataType.Float:
                if (isNaN(value)) {
                    convertedValue = value
                } else {
                    convertedValue = parseFloat(value)
                }
                break
            case 'Double':
            case DataType.Double:
                if (isNaN(value)) {
                    convertedValue = value
                } else {
                    convertedValue = parseFloat(value)
                }
                break
            case 'UInt16':
            case DataType.UInt16:
                let uint16 = new Uint16Array([value])
                convertedValue = uint16[0]
                break
            case 'UInt32':
            case DataType.UInt32:
                let uint32 = new Uint32Array([value])
                convertedValue = uint32[0]
                break
            case 'Int16':
            case DataType.Int16:
            case 'Int32':
            case DataType.Int32:
            case 'Int64':
            case DataType.Int64:
                if (valueType === 'boolean') {
                    convertedValue = value ? 1 : 0
                } else {
                    if (isNaN(value)) {
                        convertedValue = value
                    } else {
                        convertedValue = parseInt(value)
                    }
                }
                break
            case 'Boolean':
            case DataType.Boolean:
                convertedValue = value
                break
            case 'String':
            case DataType.String:
                if (valueType !== 'string') {
                    convertedValue = value.toString()
                } else {
                    convertedValue = value
                }
                break
            case 'Null':
            case DataType.Null:
                convertedValue = null
                break
            default:
                logger.internalDebugLog('convertDataValue unused DataType: ' + dataType)
                if (value.hasOwnProperty('value')) {
                    convertedValue = value
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

export function parseNamspaceFromMsgTopic(msg: BrowseMessage | null): number | undefined {
    let nodeNamespace = ''

    if (msg?.topic) {
        // TODO: real parsing instead of string operations
        // TODO: which type are relevant here? (String, Integer ...)
        nodeNamespace = msg.topic.substring(3, msg.topic.indexOf(';'))
    }

    return Number.parseInt(nodeNamespace)
}

export function parseNamspaceFromItemNodeId(item: ItemNodeId | string): number | undefined {
    let nodeNamespace = ''
    let nodeItem: string = item.nodeId || item

    if (nodeItem) {
        // TODO: real parsing instead of string operations
        // TODO: which type are relevant here? (String, Integer ...)
        nodeNamespace = nodeItem.substring(3, nodeItem.indexOf(';'))
    }

    return Number.parseInt(nodeNamespace)
}

export function parseForNodeIdentifier(nodeItem: string): NodeIdentifier {
    if (nodeItem) {
        // TODO: real parsing instead of string operations
        if (nodeItem.includes(';i=')) {
            return {
                identifier: parseInt(nodeItem.substring(nodeItem.indexOf(';i=') + 3)),
                type: NodeIdType.NUMERIC
            }
        } else if (nodeItem.includes(';g=')) {
            return {
                identifier: nodeItem.substring(nodeItem.indexOf(';g=') + 3),
                type: NodeIdType.GUID
            }
        } else {
            if (nodeItem.includes(';b=')) {
                return {
                    identifier: nodeItem.substring(nodeItem.indexOf(';b=') + 3),
                    type: NodeIdType.BYTESTRING
                }
            } else {
                return {
                    identifier: nodeItem.substring(nodeItem.indexOf(';s=') + 3),
                    type: NodeIdType.STRING
                }
            }
        }
    }
    return {
        identifier: 'null',
        type: 0x00
    }
}

export function parseIdentifierFromMsgTopic(msg: BrowseMessage): NodeIdentifier {
    return parseForNodeIdentifier(msg.topic)
}

export function parseIdentifierFromItemNodeId(item: ItemNodeId | string): NodeIdentifier {
    return parseForNodeIdentifier(item.nodeId || item)
}

export function newOPCUANodeIdFromItemNodeId(item: ItemNodeId | string): NodeId {
    let namespace = parseNamspaceFromItemNodeId(item)
    let nodeIdentifier = parseIdentifierFromItemNodeId(item)

    logger.internalDebugLog('newOPCUANodeIdFromItemNodeId: ' + JSON.stringify(item) + ' -> ' + JSON.stringify(nodeIdentifier) + ' namespace:' + namespace)
    return new NodeId(nodeIdentifier.type, nodeIdentifier.identifier, namespace)
}

export function newOPCUANodeIdFromMsgTopic(msg: BrowseMessage): NodeId {
    let namespace = parseNamspaceFromMsgTopic(msg)
    let nodeIdentifier = parseIdentifierFromMsgTopic(msg)

    logger.internalDebugLog('newOPCUANodeIdFromMsgTopic: ' + JSON.stringify(nodeIdentifier))
    return new NodeId(nodeIdentifier.type, nodeIdentifier.identifier, namespace)
}

export function createItemForWriteList(item: ItemNodeId | string, value: DataValueOptions): WriteValueOptions {
    return {
        nodeId: newOPCUANodeIdFromItemNodeId(item),
        attributeId: AttributeIds.Value,
        indexRange: undefined,
        value
    }
}

export function normalizeMessage(msg: WriteMessage) {
    const addressSpaceValues = msg.addressSpaceItems || msg.payload?.nodesToWrite;

    if (!addressSpaceValues) return [];

    const writeValues = msg.valuesToWrite;

    if (!isNotDefined(writeValues))
        return addressSpaceValues.map((item, index) => {
            return {...item, value: writeValues[index] || ''}
        })

    else
        return addressSpaceValues.map((item, index) => {
            if (item.value) return item;
            else return {...item, value: (isArray(msg.payload) && msg.payload.length && msg.payload.length === msg.addressSpaceItems.length) ? msg.payload[index] : msg.payload}

        })

}

export function buildNodesToWrite(msg: WriteMessage): WriteValueOptions[] {

    logger.detailDebugLog('buildNodesToWrite input: ' + JSON.stringify(msg))
    const writeInputs = normalizeMessage(msg)


    const nodesToWrite = writeInputs.map((item) =>
      createItemForWriteList(item, buildNewVariant(item.datatypeName, item.value)
    ));

    logger.internalDebugLog('buildNodesToWrite output: ' + JSON.stringify(nodesToWrite))

    return nodesToWrite
}

export function buildNodesToRead(msg: Todo) {
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

export function buildNodesToListen(msg: Todo) {
    return msg.addressItemsToRead || msg.addressSpaceItems
}

export function buildNodesFromBrowser(msg: Todo) {
    return msg.payload.browserResults || msg.addressSpaceItems
}

export function buildNodesFromCrawler(msg: Todo) {
    return msg.payload.crawlerResults || msg.addressSpaceItems
}

export function buildNodeListFromClient(msg: {nodetype: Todo}) {
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

export function isSessionBad(err: Error) {
    return (err.toString().includes('Session') ||
        err.toString().includes('Channel') ||
        err.toString().includes('Transaction') ||
        err.toString().includes('timeout') ||
        err.toString().includes('Connection'))
}

export function setNodeInitalState(nodeState: string, node: Todo, statusCall?: (status: string | NodeStatus)=>  void) {
    switch (nodeState) {
        case 'INITOPCUA':
        case 'SESSIONREQUESTED':
            node.oldStatusParameter = setNodeStatusTo(node, 'connecting', node.oldStatusParameter, node.showStatusActivities, statusCall)
            break
        case 'OPEN':
        case 'SESSIONCLOSED':
            node.iiot.opcuaClient = node.connector.iiot.opcuaClient
            node.oldStatusParameter = setNodeStatusTo(node, 'connected', node.oldStatusParameter, node.showStatusActivities, statusCall)
            break
        case 'SESSIONACTIVE':
            node.iiot.opcuaSession = node.connector.iiot.opcuaSession
            node.oldStatusParameter = setNodeStatusTo(node, 'active', node.oldStatusParameter, node.showStatusActivities, statusCall)
            break
        case 'LOCKED':
            node.oldStatusParameter = setNodeStatusTo(node, 'locked', node.oldStatusParameter, node.showStatusActivities, statusCall)
            break
        case 'UNLOCKED':
            node.oldStatusParameter = setNodeStatusTo(node, 'unlocked', node.oldStatusParameter, node.showStatusActivities, statusCall)
            break
        case 'STOPPED':
            node.oldStatusParameter = setNodeStatusTo(node, 'stopped', node.oldStatusParameter, node.showStatusActivities, statusCall)
            break
        case 'END':
            node.oldStatusParameter = setNodeStatusTo(node, 'end', node.oldStatusParameter, node.showStatusActivities, statusCall)
            break
        default:
            node.oldStatusParameter = setNodeStatusTo(node, 'waiting', node.oldStatusParameter, node.showStatusActivities, statusCall)
    }
}

export function isNodeId(nodeId: NodeId) {
    if (!nodeId || !nodeId.identifierType) {
        return false
    }

    switch (nodeId.identifierType) {
        case NodeIdType.NUMERIC:
        case NodeIdType.STRING:
        case NodeIdType.GUID:
            return true
        default:
            return false
    }
}

export function checkConnectorState(node: Todo, msg: NodeMessageInFlow, callerType: Todo): boolean {
    const state = node.connector?.iiot.stateMachine?.getMachineState()
    logger.internalDebugLog('Check Connector State ' + state + ' By ' + callerType)

    if (node.connector?.iiot?.stateMachine && state !== RUNNING_STATE) {
        logger.internalDebugLog('Wrong Client State ' + state + ' By ' + callerType)
        if (node.showErrors) {
            node.error(new Error('Client Not ' + RUNNING_STATE + ' On ' + callerType), msg)
        }
        node.oldStatusParameter = setNodeStatusTo(node as Node, 'not running', node.oldStatusParameter, node.showStatusActivities)
        node.emit('opcua_client_not_ready')
        return false
    } else {
        return true
    }
}

export function setNodeOPCUAConnected(node: NodeObject, opcuaClient: OPCUAClient): void {
    if (isInitializedIIoTNode(node)) {
        node.iiot.opcuaClient = opcuaClient
    }
    node.oldStatusParameter = setNodeStatusTo(node as unknown as Node, 'connecting', node.oldStatusParameter, node.showStatusActivities)
}

export function setNodeOPCUAClosed(node: NodeObject): void {
    if (isInitializedIIoTNode(node)) {
        // @ts-ignore
        node.iiot.opcuaClient = null
    }
    node.oldStatusParameter = setNodeStatusTo(node as unknown as Node, 'disconnected', node.oldStatusParameter, node.showStatusActivities)
}

export function setNodeOPCUALost(node: NodeObject): void {
    node.oldStatusParameter = setNodeStatusTo(node as unknown as Node, 'lost', node.oldStatusParameter, node.showStatusActivities)
}

export function setNodeOPCUASessionStarted(node: NodeObject, opcuaSession: ClientSession): void {
    if (isInitializedIIoTNode(node)) {
        node.iiot.opcuaSession = opcuaSession
    }
    node.oldStatusParameter = setNodeStatusTo(node as unknown as Node, 'active', node.oldStatusParameter, node.showStatusActivities)
}

export function setNodeOPCUASessionClosed(node: NodeObject): void {
    if (isInitializedIIoTNode(node)) {
        node.iiot.opcuaSession = null
    }
    node.oldStatusParameter = setNodeStatusTo(node as unknown as Node, 'connecting', node.oldStatusParameter, node.showStatusActivities)
}

export function setNodeOPCUASessionRestart(node: NodeObject): void {
    node.oldStatusParameter = setNodeStatusTo(node as unknown as Node, 'restart', node.oldStatusParameter, node.showStatusActivities)
}

export function setNodeOPCUASessionError(node: NodeObject): void {
    if (isInitializedIIoTNode(node)) {
        node.iiot.opcuaSession = null
    }
    node.oldStatusParameter = setNodeStatusTo(node as unknown as Node, 'connecting', node.oldStatusParameter, node.showStatusActivities)
}

export function setNodeOPCUARestart(node: NodeObject, opcuaClient: OPCUAClient): void {
    logger.internalDebugLog('Connector Restart')
    if (opcuaClient && isInitializedIIoTNode(node)) {
        node.iiot.opcuaClient = opcuaClient
    }
    node.oldStatusParameter = setNodeStatusTo(node as unknown as Node, 'connecting', node.oldStatusParameter, node.showStatusActivities)
}

export function registerToConnector(node: NodeObject, statusCall?: (status: string | NodeStatus) =>  void) {
    if (!node) {
        logger.internalDebugLog('Node Not Valid On Register To Connector')
        return
    }

    if (isNotDefined(node.connector)) {
        node.error(new Error('Connector Config Node Not Valid On Registering Client Node ' + node.id), {payload: 'No Connector Configured'})
        return
    }

    node.connector?.iiot.registerForOPCUA(node)

    node.connector.on('connector_init', () => {
        if (node.iiot.opcuaClient) {
            // @ts-ignore
            node.iiot.opcuaClient = null
        }

        if (node.iiot.opcuaSession) {
            node.iiot.opcuaSession = null
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

    node.connector.on('session_started', (opcuaSession: ClientSession) => {
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
        setNodeOPCUARestart(node, OPCUAClient.create(node.iiot.opcuaClient)) // TODO: investigate one args v two
    })
    setNodeInitalState(node.connector?.iiot.stateMachine?.getMachineState(), node, statusCall)
}

export function deregisterToConnector(node: NodeObject, done: () => void) {
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
    if (isInitializedIIoTNode(node.connector)) {
        node.connector?.iiot.deregisterForOPCUA(node, done)
    }
}

export function checkSessionNotValid(session: Todo, callerType: Todo) {
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

export function setNodeStatusTo(node: Node, statusValue: string, oldStatus: NodeStatus, showStatusActivities: boolean, status: (status: string | NodeStatus) => void = node.status): NodeStatus {
    let statusParameter: NodeStatus = getNodeStatus(statusValue, showStatusActivities)
    if (!underscore.isEqual(oldStatus, statusParameter) && statusParameter) {
        logger.detailDebugLog('Node ' + node.id + ' Status To ' + statusValue)
        status(statusParameter)
    }
    return statusParameter
}

// sets some values within node.iiot
export function initCoreNode(): CoreNode {
    return {
        reconnectTimeout: DEFAULT_TIMEOUT,
        sessionTimeout: null,
        opcuaSession: null,
        opcuaClient: null
    }
}

export function initCoreServerNode() {
    return {
        initialized: false,
        opcuaServer: null
    }
}

export function getItemFilterValueWithElement(item: Todo, element: Todo) {
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

export function handleErrorInsideNode(node: Todo, err: Error) {
    logger.internalDebugLog(typeof node + ' ' + err.message)
    if (node.showErrors) {
        node.error(err, {payload: err.message})
    }
}

export function checkCrawlerItemIsNotToFilter(node: Todo, item: Todo, element: Todo, result: Todo) {
    try {
        let filterValue = getItemFilterValueWithElement(item, element)

        if (filterValue && filterValue.key && filterValue.key.match) {
            if (filterValue.key.match(element.value)) {
                result &= 0
            }
        } else {
            if (filterValue && filterValue.match) {
                if (filterValue.match(element.value)) {
                    result &= 0
                }
            } else {
                if (filterValue && filterValue.toString) {
                    filterValue = filterValue.toString()
                    if (filterValue && filterValue.match) {
                        if (filterValue.match(element.value)) {
                            result &= 0
                        }
                    }
                }
            }
        }
    } catch (err: any) {
        handleErrorInsideNode(node, err)
    }

    return result
}

export function checkResponseItemIsNotToFilter(node: Todo, item: Todo, element: Todo, result: Todo) {
    try {
        let filterValue = getItemFilterValueWithElement(item, element)

        if (filterValue) {
            if (filterValue.key && filterValue.key.match) {
                result &= filterValue.key.match(element.value) !== null ? 1: 0
            } else {
                if (filterValue.match) {
                    result &= filterValue.match(element.value) !== null ? 1: 0
                } else {
                    if (filterValue.toString) {
                        filterValue = filterValue.toString()
                        if (filterValue.match) {
                            result &= filterValue.match(element.value) !== null ? 1: 0
                        }
                    }
                }
            }
        } else {
            result &= 0 // undefined items
        }
    } catch (err: any) {
        handleErrorInsideNode(node, err)
    }

    return result
}

export function checkItemForUnsetState(node: Todo, item: Todo) {
    let result = 1

    if (node.activateUnsetFilter) {
        result &= item !== null ? 1: 0

        if (item && item.hasOwnProperty('value')) {
            if (item.value && item.value.hasOwnProperty('value')) {
                result &= item.value.value !== null ? 1: 0
            } else {
                result &= item.value !== null ? 1: 0
            }
        }
    }

    return result
}

export function resetBiancoNode(node: Todo) {
    if (isInitializedIIoTNode(node) && node.iiot.resetAllTimer) {
        node.iiot.resetAllTimer()
    }
    if (isInitializedIIoTNode(node)) {
        node.iiot = null
    }
}

export function filterListEntryByNodeId(nodeId: Todo, list: Todo) {
    let result: Todo[] = []

    if (list && list.length) {
        list.forEach((item: Todo) => {
            if (item === nodeId) {
                result.push(item)
            }
        })
    }

    return result
}

export function filterListByNodeId(nodeId: Todo, list: Todo) {
    let result: Todo[] = []

    if (list && list.length) {
        list.forEach((item: Todo) => {
            if (item.nodeId === nodeId) {
                result.push(item)
            }
        })
    }

    return result
}

export function isNodeTypeToFilterResponse(msg: Todo) {
    return msg.nodetype === 'read' || msg.nodetype === 'browse' || msg.nodetype === 'crawl' || msg.nodetype === 'method'
}

export function isInitializedIIoTNode(node: Todo) {
    return !!node.iiot
}


