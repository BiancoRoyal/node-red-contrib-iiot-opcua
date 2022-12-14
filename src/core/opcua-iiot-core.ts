/**
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

import {debug as Debug} from 'debug'
import * as os from 'os'
import * as underscore from 'underscore'
import _, {isObject} from 'underscore'

import * as nodeOPCUAId from 'node-opcua-nodeid'
import {NodeIdLike} from 'node-opcua-nodeid'
import {
  AddressSpaceItem,
  BrowseMessage,
  DataTypeInput,
  NodeIdentifier,
  NodeToWrite,
  TimeUnitNames,
  TimeUnits,
  WriteMessage
} from "../types/helpers";
import {TodoTypeAny, TodoVoidFunction} from "../types/placeholders";
import {Node, NodeMessage, NodeStatus} from "node-red";
import {NodeMessageInFlow, NodeStatusFill, NodeStatusShape} from "@node-red/registry";
import {isNotDefined} from "../types/assertion";
import {
  AttributeIds,
  ClientSession,
  DataType,
  DataValue,
  DataValueOptions,
  NodeClass,
  NodeId,
  NodeIdType,
  OPCUAClient, OPCUADiscoveryServer, UserIdentityInfo,
} from "node-opcua";
import {WriteValueOptions} from "node-opcua-service-write";
import {VariantOptions} from "node-opcua-variant";
import {OPCUAClientOptions} from "node-opcua-client/dist/opcua_client";

export {Debug, os, underscore, nodeOPCUAId}

export type ConnectorIIoT = {
  endpoints: string[],
  opcuaClient?: OPCUAClient
  opcuaSession?: ClientSession
  discoveryServer?: OPCUADiscoveryServer
  serverCertificate?: string
  discoveryServerEndpointUrl?: string
  hasOpcUaSubscriptions: boolean
  userIdentity?: UserIdentityInfo
  stateMachine?: TodoTypeAny
  stateService?: TodoTypeAny
  stateSubscription?: TodoTypeAny
  opcuaClientOptions?: OPCUAClientOptions
  registeredNodeList?: Record<string, Node>
  functions?: Record<string, (...args: TodoTypeAny) => TodoTypeAny>
  sessionNodeRequests: number
}

export enum FsmConnectorStates {
  StateIdle = 'idle',
  StateInit = 'init',
  StateOpened = 'opened',
  StateSessionRequested = 'sessionRequested',
  StateSessionActive = 'sessionActive',
  StateSessionClosed = 'sessionClosed',
  StateSessionRestart = 'sessionRestart',
  StateClosed = 'closed',
  StateLocked = 'locked',
  StateUnlocked = 'unlocked',
  StateStopped = 'stopped',
  StateEnd = 'end',
  StateReconfigured = 'reconfigured',
  StateRenewed = 'renewed',
}

export enum FsmListenerStates {
  StateIdle = 'idle',
  StateInit = 'init',
  StateEnd = 'end',
  StateRequested = 'requested',
  StateStarted = 'started',
  StateError = 'error',
  StateTerminated = 'terminated'
}

export const OBJECTS_ROOT: string = 'ns=0;i=84'
export const TEN_SECONDS_TIMEOUT: number = 10
export const RUNNING_STATE: FsmConnectorStates = FsmConnectorStates.StateSessionActive
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

export const getPathFromRequireResolve = (requireResolve: string): string => {
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

function extractValue(value: any) {

  logger.detailDebugLog('extractValue value:' + value)
  if (_.isUndefined(value.value) === false) {
    return value.value // value could be null, 0, and any other, but not undefined
  }

  return value
}

export function buildNewVariant(datatype: DataTypeInput, value: any): DataValueOptions {
  let variantValue: VariantOptions = {
    dataType: DataType.Null,
    value: null
  }

  let originValue = Object.assign({}, value)
  value = extractValue(value);

  logger.detailDebugLog('buildNewVariant datatype: ' + datatype + ' originValue:' + originValue + ' value:' + value)
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
    case 'UInt64':
    case DataType.UInt64:
      return parseInt(value)
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

export function convertDataValueByDataType(value: any, dataType: DataTypeInput): string {
  let convertedValue = null

  const valueType = typeof value

  logger.detailDebugLog('convertDataValue: ' + JSON.stringify(value) +
    ' value origin type ' + valueType + ' convert to' + ' ' + dataType)

  // TODO: we have to check if that is needed or to improve since v2.x - here was a problem, that the node-opcua sent strings or types
  try {
    switch (dataType) {
      case 'NodeId':
      case DataType.NodeId:
        convertedValue = value.toString()
        break
      case 'ExpandedNodeId':
      case DataType.ExpandedNodeId:
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
          convertedValue = parseInt(value)
        }
        break
      case 'QualifiedName':
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
      case "DateTime":
      case DataType.DateTime:
        if (valueType !== 'string') {
          convertedValue = value.toString()
        } else {
          convertedValue = value
        }
        break;
      default:
        logger.internalDebugLog('convertDataValue unused DataType: ' + dataType)
        if(_.isUndefined(value)) {
          convertedValue = null
        } else {
          convertedValue = value
        }
        break
    }
  } catch (err) {
    logger.detailDebugLog('convertDataValue ' + err)
  }

  logger.detailDebugLog('convertDataValue is: ' + convertedValue)

  return convertedValue
}

export function parseNamespaceFromMsgTopic(msg: BrowseMessage | null): number | undefined {
  let nodeNamespace = ''

  if (msg?.topic) {
    // TODO: real parsing instead of string operations
    // TODO: which type are relevant here? (String, Integer ...)
    nodeNamespace = msg.topic.substring(3, msg.topic.indexOf(';'))
  }

  return Number.parseInt(nodeNamespace)
}

export function parseNamespaceFromItemNodeId(item: NodeIdLike): number | undefined {
  if (typeof item === 'number') {
    return 0;
  }

  if(isObject(item) && item.namespace) {
    return item.namespace
  }

  // TODO: real parsing instead of string operations
  const nodeObject = JSON.parse(JSON.stringify(item))
  return Number.parseInt(nodeObject.nodeId.substring(3, nodeObject.nodeId.indexOf(';')))
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

export function parseIdentifierFromItemNodeId(item: NodeIdLike): NodeIdentifier {
  return parseForNodeIdentifier((item as TodoTypeAny).nodeId || item)
}

export function newOPCUANodeIdFromItemNodeId(item: NodeIdLike): NodeId {
  let namespace = parseNamespaceFromItemNodeId(item)
  let nodeIdentifier = parseIdentifierFromItemNodeId(item)

  logger.internalDebugLog('newOPCUANodeIdFromItemNodeId: ' + JSON.stringify(item) + ' -> ' + JSON.stringify(nodeIdentifier) + ' namespace:' + namespace)
  return new NodeId(nodeIdentifier.type, nodeIdentifier.identifier, namespace)
}

export function newOPCUANodeIdFromMsgTopic(msg: BrowseMessage): NodeId {
  let namespace = parseNamespaceFromMsgTopic(msg)
  let nodeIdentifier = parseIdentifierFromMsgTopic(msg)

  logger.internalDebugLog('newOPCUANodeIdFromMsgTopic: ' + JSON.stringify(nodeIdentifier))
  return new NodeId(nodeIdentifier.type, nodeIdentifier.identifier, namespace)
}

export function createItemForWriteList(item: NodeIdLike, value: DataValueOptions): WriteValueOptions {
  return {
    nodeId: newOPCUANodeIdFromItemNodeId(item),
    attributeId: AttributeIds.Value,
    indexRange: undefined,
    value
  }
}

export function normalizeMessage(msg: WriteMessage) {
  const payload = msg.payload as TodoTypeAny
  const addressSpaceValues: NodeToWrite[] = payload.nodesToWrite || payload.addressSpaceItems;

  if (!addressSpaceValues) return [];

  const writeValues = payload.valuesToWrite;

  if (!isNotDefined(writeValues)) {
    return addressSpaceValues.map((item, index) => {
      return {...item, value: _.isUndefined(writeValues[index]) ? null : writeValues[index]}
    })
  } else
    return addressSpaceValues.map((item, index) => {
      if (item.value) return item;
      else return {
        ...item,
        value: (Array.isArray(msg.payload) && msg.payload.length && msg.payload.length === msg.addressSpaceItems.length) ? msg.payload[index] : msg.payload
      }

    })

}

export function buildNodesToWrite(msg: WriteMessage): WriteValueOptions[] {

  logger.detailDebugLog('buildNodesToWrite input: ' + JSON.stringify(msg))
  const writeInputs = normalizeMessage(msg)


  const nodesToWrite = writeInputs.map((item: TodoTypeAny) =>
    createItemForWriteList(item, buildNewVariant(item.datatypeName, item.value)
  ));

  logger.internalDebugLog('buildNodesToWrite output: ' + JSON.stringify(nodesToWrite))

  return nodesToWrite
}

export function buildNodesToRead(payload: TodoTypeAny) {
  logger.detailDebugLog('buildNodesToRead input: ' + JSON.stringify(payload))

  let injectArrayOfNodeIds = (payload.value?.length && payload.value.type === Array) ? payload.value : payload.addressSpaceItems;
  /*
    there are some possible ways to receive the Array<any> from Browser or Inject

    TODO: payload.injectType and/or payload.nodetype should be used to make a clear decision here

    read : nodesToRead
    write : nodesToWrite
    browse : browserResults
    crawl : crawlerResults
    value : inject with Array<any>
    addressSpaceItems : inject fall back for all types

  */

  let nodePayloadList:Array<AddressSpaceItem> = payload.nodesToRead || payload.nodesToWrite || payload.crawlerResults || payload.browserResults || injectArrayOfNodeIds;

  if (nodePayloadList && nodePayloadList.length) {
    return nodePayloadList.map((item: AddressSpaceItem) => {
      return item
    })
  } else {
    let nodeList:Array<AddressSpaceItem> = payload.nodesToRead || payload.nodesToWrite
    if (nodeList && nodeList.length) {
      // legacy
      return nodeList.map((item: AddressSpaceItem) => {
        return item
      })
    } else if (payload.addressSpaceItems && payload.addressSpaceItems.length) {
      return payload.addressSpaceItems.map((item: AddressSpaceItem) => item)
    }
  }
  return []
}

export function buildNodesToListen(payload: TodoTypeAny) {
  if (payload.addressItemsToRead?.length)
    return payload.addressItemsToRead
  else if (payload.addressSpaceItems?.length)
    return payload.addressSpaceItems
  else
    return payload.addressSpaceItemList
}

export function buildNodesFromBrowser(payload: TodoTypeAny) {
  return payload.browserResults || payload.addressSpaceItems
}

export function buildNodesFromCrawler(payload: TodoTypeAny) {
  return payload.crawlerResults || payload.addressSpaceItems
}

export function buildNodeListFromClient(payload: TodoTypeAny) {
  /*
    The node type should help users to be aware of wiring mistakes.
    We want to support the user with messages if the wiring and inputs are wrong.
    That brings the needs of a nodeType (where does it come from) and injectType (where should it be for).
    This was the real last feature and needs some more refactoring and work to be done well.
   */
  switch (payload.nodetype) {
    case 'read':
    case 'write':
      return buildNodesToRead(payload)
    case 'node':
    case 'listen':
    case 'inject':
    case 'events':
      return buildNodesToListen(payload)
    case 'browse':
      return buildNodesFromBrowser(payload)
    case 'crawl':
      return buildNodesFromCrawler(payload)
    default:
      logger.internalDebugLog('unknown node type injected to filter for ' + payload.nodetype)
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

export function setNodeInitalState(nodeState: string, node: TodoTypeAny, statusCall: (status: string | NodeStatus) => void) {
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

export function checkConnectorState(
  node: TodoTypeAny,
  msg: NodeMessageInFlow,
  callerType: string,
  errorHandler: (err: Error, msg: NodeMessageInFlow) => void,
  emitHandler: (msg: string) => void,
  statusHandler: (status: string | NodeStatus) => void
): boolean {
  const state = node.connector?.iiot.stateService?.state.value
  logger.internalDebugLog('Check Connector State ' + state + ' By ' + callerType)
  if (state !== RUNNING_STATE) {
    logger.internalDebugLog('Wrong Client State ' + state + ' By ' + callerType)
    if (node.showErrors) {
      errorHandler(new Error('Client Not ' + RUNNING_STATE + ' On ' + callerType), msg)
    }
    node.oldStatusParameter = setNodeStatusTo(node as Node, 'not running', node.oldStatusParameter, node.showStatusActivities, statusHandler)
    emitHandler('opcua_client_not_ready')
    return false
  } else {
    return true
  }
}

export function setNodeOPCUAConnected(node: TodoTypeAny, opcuaClient: OPCUAClient, statusHandler: (status: string | NodeStatus) => void): void {
  if (isInitializedIIoTNode(node)) {
    node.iiot.opcuaClient = opcuaClient
  }
  node.oldStatusParameter = setNodeStatusTo(node as unknown as Node, 'connecting', node.oldStatusParameter, node.showStatusActivities, statusHandler)
}

export function setNodeOPCUAClosed(node: TodoTypeAny, statusHandler: (status: string | NodeStatus) => void): void {
  if (isInitializedIIoTNode(node)) {
    // @ts-ignore
    node.iiot.opcuaClient = null
  }
  node.oldStatusParameter = setNodeStatusTo(node as unknown as Node, 'disconnected', node.oldStatusParameter, node.showStatusActivities, statusHandler)
}

export function setNodeOPCUALost(node: TodoTypeAny, statusHandler: (status: string | NodeStatus) => void): void {
  node.oldStatusParameter = setNodeStatusTo(node as unknown as Node, 'lost', node.oldStatusParameter, node.showStatusActivities, statusHandler)
}

export function setNodeOPCUASessionStarted(node: TodoTypeAny, opcuaSession: ClientSession, statusHandler: (status: string | NodeStatus) => void): void {
  if (isInitializedIIoTNode(node)) {
    node.iiot.opcuaSession = opcuaSession
  }
  node.oldStatusParameter = setNodeStatusTo(node as unknown as Node, 'active', node.oldStatusParameter, node.showStatusActivities, statusHandler)
}

export function setNodeOPCUASessionClosed(node: TodoTypeAny, statusHandler: (status: string | NodeStatus) => void): void {
  if (isInitializedIIoTNode(node)) {
    node.iiot.opcuaSession = null
  }
  node.oldStatusParameter = setNodeStatusTo(node as unknown as Node, 'connecting', node.oldStatusParameter, node.showStatusActivities, statusHandler)
}

export function setNodeOPCUASessionRestart(node: TodoTypeAny, statusHandler: (status: string | NodeStatus) => void): void {
  node.oldStatusParameter = setNodeStatusTo(node as unknown as Node, 'restart', node.oldStatusParameter, node.showStatusActivities, statusHandler)
}

export function setNodeOPCUASessionError(node: TodoTypeAny, statusHandler: (status: string | NodeStatus) => void): void {
  if (isInitializedIIoTNode(node)) {
    node.iiot.opcuaSession = null
  }
  node.oldStatusParameter = setNodeStatusTo(node as unknown as Node, 'connecting', node.oldStatusParameter, node.showStatusActivities, statusHandler)
}

export function setNodeOPCUARestart(node: TodoTypeAny, opcuaClient: OPCUAClient, statusHandler: (status: string | NodeStatus) => void): void {
  logger.internalDebugLog('Connector Restart')
  if (opcuaClient && isInitializedIIoTNode(node)) {
    node.iiot.opcuaClient = opcuaClient
  }
  node.oldStatusParameter = setNodeStatusTo(node as unknown as Node, 'connecting', node.oldStatusParameter, node.showStatusActivities, statusHandler)
}

type NodeWithConnector = Node & {
  connector: ConnectorIIoT
}

export function registerToConnector(node: TodoTypeAny, statusCallback: (status: string | NodeStatus) => void, onAlias: (event: string, callback: () => void) => void, errorHandler: (err: Error, msg: NodeMessage) => void): void {
  if (!node) {
    logger.internalDebugLog('Node Not Valid On Register To Connector')
    return
  }

  if (isNotDefined(node.connector)) {
    errorHandler(new Error('Connector Config Node Not Valid On Registering Client Node ' + (node as unknown as Node).id), {payload: 'No Connector Configured'})
    return
  }
  if (!node.connector.statusCallbacks) {
    node.connector.statusCallbacks = []
  }
  node.connector.statusCallbacks.push(statusCallback)
  node.connector.functions?.registerForOPCUA(node, onAlias)

  const statusCall = (status: string | NodeStatus): void => {
    node.connector.statusCallbacks.forEach((callback: TodoVoidFunction) => callback(status))
  }

  node.connector.on('connector_init', (node: TodoTypeAny) => {
    if (node.iiot?.opcuaClient) {
      // @ts-ignore
      node.iiot.opcuaClient = null
    }

    if (node.iiot?.opcuaSession) {
      node.iiot.opcuaSession = null
    }
  })

  node.connector.on('connection_started', (opcuaClient: OPCUAClient) => {
    setNodeOPCUAConnected(node.connector, opcuaClient, statusCall)
  })

  node.connector.on('server_connection_close', () => {
    setNodeOPCUAClosed(node.connector, statusCall)
  })

  node.connector.on('server_connection_abort', () => {
    setNodeOPCUAClosed(node.connector, statusCall)
  })

  node.connector.on('connection_closed', () => {
    setNodeOPCUAClosed(node.connector, statusCall)
  })

  node.connector.on('server_connection_lost', () => {
    setNodeOPCUALost(node.connector, statusCall)
  })

  node.connector.on('reset_opcua_connection', () => {
    setNodeOPCUASessionClosed(node.connector, statusCall)
  })

  node.connector.on('session_started', (opcuaSession: ClientSession) => {
    setNodeOPCUASessionStarted(node.connector, opcuaSession, statusCall)
  })

  node.connector.on('session_closed', () => {
    setNodeOPCUASessionClosed(node.connector, statusCall)
  })

  node.connector.on('session_restart', () => {
    setNodeOPCUAClosed(node.connector, statusCall)
  })

  node.connector.on('session_error', () => {
    setNodeOPCUASessionError(node.connector, statusCall)
  })

  node.connector.on('after_reconnection', () => {
    setNodeOPCUARestart(node.connector, OPCUAClient.create((node.connector as TodoTypeAny).iiot.opcuaClient), statusCall) // TODO: investigate one args v two
  })
  setNodeInitalState(node.connector?.iiot?.stateService.state.value, node, statusCall)
}

export function deregisterToConnector(node: NodeWithConnector, done: () => void) {
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

  if (isInitializedIIoTNode(node.connector)) {
    node.connector?.functions?.deregisterForOPCUA(node, done)
  } else {
    done()
  }
}

export function checkSessionNotValid(session: TodoTypeAny, callerType: TodoTypeAny) {
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

export function setNodeStatusTo(
  node: Node,
  statusValue: string,
  oldStatus: NodeStatus,
  showStatusActivities: boolean,
  status: (status: string | NodeStatus) => void
): NodeStatus {
  let statusParameter: NodeStatus = getNodeStatus(statusValue, showStatusActivities)
  if (!underscore.isEqual(oldStatus, statusParameter) && statusParameter) {
    logger.detailDebugLog('Node ' + node.id + ' Status To ' + statusValue)
    if (typeof status === "function")
      status(statusParameter)
    else
      logger.internalDebugLog("Status is not a function " + typeof status)
  }
  return statusParameter
}

// sets some values within node.iiot
export function initCoreNode() {
  return {
    reconnectTimeout: DEFAULT_TIMEOUT,
    sessionTimeout: undefined,
    opcuaSession: undefined,
    opcuaClient: undefined
  }
}

export function initCoreServerNode() {
  return {
    initialized: false,
    opcuaServer: null
  }
}

export function getItemFilterValueWithElement(item: TodoTypeAny, element: TodoTypeAny): string | Record<string, any> {
  let filterValue = ''

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
    case 'nodeClass':
      filterValue = NodeClass[item['nodeClass']]
      break
    default:
      filterValue = item[element.name]
  }

  return filterValue
}

export function handleErrorInsideNode(node: TodoTypeAny, err: Error) {
  logger.internalDebugLog(typeof node + ' ' + err.message)
  if (node.showErrors) {
    node.error(err, {payload: err.message})
  }
}

export function checkCrawlerItemIsNotToFilter(node: TodoTypeAny, item: TodoTypeAny, element: TodoTypeAny, result: TodoTypeAny): number {
  try {
    let filterValue = getItemFilterValueWithElement(item, element)



    if (filterValue && typeof filterValue !== "string" && filterValue.key && filterValue.key.match) {
      if (!filterValue.key.match(element.value)) {
        result = 0
      }
    } else {
      if (filterValue && filterValue.match) {
        if (!filterValue.match(element.value)) {
          result = 0
        }
      } else {
        if (filterValue && filterValue.toString) {
          filterValue = filterValue.toString()
          if (filterValue && filterValue.match) {
            if (!filterValue.match(element.value)) {
              result = 0
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

export function checkResponseItemIsNotToFilter(node: Node, item: TodoTypeAny, element: TodoTypeAny, result: TodoTypeAny) {
  try {
    let filterValue = getItemFilterValueWithElement(item, element)

    if (filterValue) {
      if (typeof filterValue !== 'string' && filterValue.key && filterValue.key.match) {
        result &= filterValue.key.match(element.value) !== null ? 1 : 0
      } else {
        if (filterValue.match) {
          result &= filterValue.match(element.value) !== null ? 1 : 0
        } else {
          if (filterValue.toString) {
            filterValue = filterValue.toString()
            if (filterValue.match) {
              result &= filterValue.match(element.value) !== null ? 1 : 0
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

export function checkItemForUnsetState(node: TodoTypeAny, item: TodoTypeAny): number {
  let result = 1

  if (node.activateUnsetFilter) {
    result &= item !== null ? 1 : 0

    if (item && item.hasOwnProperty('value')) {
      if (item.value && item.value.hasOwnProperty('value')) {
        result &= item.value.value !== null ? 1 : 0
      } else {
        result &= item.value !== null ? 1 : 0
      }
    }
  }

  return result
}

export function resetIiotNode(node: TodoTypeAny) {
  // coreListener.internalDebugLog('reset IIoT of the Node with id:' + node.id)   /// Invalid import of lower hirarchy module
  // Valid hirarchy is supposed to be: Core -> CoreSpecific (CoreListener, CoreConnector, ...) -> Specific (Listener, Browser, ...)
  // This is because looped imports and usages before declaration can happen if this is not kept in mind

  if(_.isObject(node) == false || _.isEmpty(node.iiot)) {
    return
  } else {
    if(_.isFunction(node.resetAllTimer)) {
      node.resetAllTimer() // call to close all timer otherwise it stops until timeout and node-red hangs on
    }
  }

  if (isInitializedIIoTNode(node.iiot) && _.isFunction(node.iiot.resetAllTimer)) {
    node.iiot.resetAllTimer()
  }
}

export function filterListEntryByNodeId(nodeId: string, list: string[]) {
  return list.filter((item) => {
    return item.toString().includes(nodeId)
  })
}

export function filterListByNodeId(nodeId: NodeIdLike, list: TodoTypeAny) {
  if (nodeId === '') {
    return list
  }
  return list.filter((item: TodoTypeAny) => {
    // if item.nodeId is null, item may itself be a nodeId
    return (item.nodeId || item).toString().includes(nodeId)
  })
}

export function isNodeTypeToFilterResponse(payload: TodoTypeAny) {
  return payload.nodetype === 'read' || payload.nodetype === 'browse' || payload.nodetype === 'crawl' || payload.nodetype === 'method'
}

export function isInitializedIIoTNode<T>(node: T | undefined): node is T {
  return !!node
}

export interface IotOpcUaNodeMessage extends NodeMessage {
  payload: any
  value: any
  payloadType: string
  nodetype: string
  injectType: string
  addressSpaceItems: AddressSpaceItem[]
  manualInject: boolean
}


