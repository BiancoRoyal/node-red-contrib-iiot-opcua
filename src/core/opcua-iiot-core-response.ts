/**
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

import {Todo} from "../types/placeholders";
import debug from 'debug';
import {Node, NodeStatus, NodeStatusFill} from "node-red";
import {BrowseResult, StatusCode} from "node-opcua";
import {NodeIdLike} from "node-opcua-nodeid";
import {AddressSpaceItem, StatusInput} from "../types/helpers";
import {CrawlerPayload} from "../opcua-iiot-crawler";
import {BrowserPayload} from "../opcua-iiot-browser";
import {AnyPayload} from "../types/payloads";
import {isArray} from "../types/assertion";
import {ReadPayload} from "../opcua-iiot-read";

type EntryStatus = {
  good: number,
  bad: number,
  other: number,
}

export type ResponseInputPayload = {
  outputArguments: Todo;
  value?: any
  browserResults?: BrowseResult[]
  crawlerResults?: (string | BrowseResult[])[]
  statusCodes?: StatusCode[]
  entryStatus: EntryStatus
  entryStatusText?: string
  readtype?: string
  injectType?: string
  results?: any
  statusCode?: StatusCode
  nodesToRead?: AddressSpaceItem[]
  nodesToWrite?: AddressSpaceItem[]
  valuesToWrite?: AddressSpaceItem[]
  addressSpaceItems: AddressSpaceItem[]
  dataType?: Todo
  nodeId?: NodeIdLike
  methodType?: string
  nodetype?: string
}

const internalDebugLog = debug('opcuaIIoT:response') // eslint-disable-line no-use-before-define
const detailDebugLog = debug('opcuaIIoT:response:details') // eslint-disable-line no-use-before-define
const EMPTY_LIST = 0
const NONE = 0

const analyzeBrowserResults = function (node: Node, payload: BrowserPayload) {
  handlePayloadStatusCode(node, payload.browserResults, payload as AnyPayload)
}

const analyzeCrawlerResults = function (node: Node, payload: CrawlerPayload) {
  handlePayloadStatusCode(node, payload.value as StatusInput[], payload as AnyPayload)
}

const analyzeReadResults = (node: Node, payload: ReadPayload) => {
  handlePayloadStatusCode(node, payload.value, payload)
  if (payload.readtype === 'HistoryValue') {
    payload.value.map((item: any) => {
      delete item['statusCode']
    })
  }
  reconsturctNodeIdOnRead(payload)
}

const analyzeListenerResults = function (node: Node, payload: ResponseInputPayload) {
  switch (payload.injectType) {
    case 'subscribe':
    case 'event':
      handlePayloadStatusCode(node, payload.value, payload)
      break
    default:
      break
  }
}

const analyzeMethodResults = function (node: Node, payload: ResponseInputPayload) {
  switch (payload.methodType) {
    case 'basic':
    case 'complex':
      handlePayloadStatusCode(node, payload.value, payload)
      break
    default:
      break
  }
}

const setNodeStatus = (node: Node, entryStatus: EntryStatus, informationText: string ) => {
  let fillColor: NodeStatusFill = 'green'

  if (entryStatus && Object.keys(entryStatus).length === 3) {
    if (entryStatus['other'] > EMPTY_LIST) {
      fillColor = 'yellow'
    }

    if (entryStatus['bad'] > EMPTY_LIST) {
      fillColor = 'red'
    }
  }

  node.status({fill: fillColor, shape: 'dot', text: informationText})
}

const analyzeWriteResults = function (node: Node, msg: Todo) {
  let entryStatus = handlePayloadArrayOfStatusCodes(msg)
  setNodeStatusInfo(node, msg, entryStatus)
}

const handlePayloadStatusCode = function (node: Node, statusInputs: StatusInput | StatusInput[], payload: AnyPayload) {
  let entryStatus = {
    bad: 0,
    good: 0,
    other: 0
  }

  if (!statusInputs || (statusInputs as StatusInput[]).length === 0) {
    payload.entryStatus = {
      ...entryStatus,
      bad: 1
    }
    return;
  }

  if (isArray(statusInputs)) {
    entryStatus = handlePayloadArrayOfObjects(statusInputs)
  } else {
    entryStatus = handlePayloadObject(statusInputs)
  }
  setNodeStatusInfo(node, payload, entryStatus)
  payload.entryStatus = entryStatus
}

const setNodeStatusInfo = function (node: Node, payload: ResponseInputPayload, entryStatus: Todo) {
  payload.entryStatus = entryStatus
  payload.entryStatusText = 'Good:' + entryStatus['good'] + ' Bad:' + entryStatus['bad'] + ' Other:' + entryStatus['other']
  setNodeStatus(node, payload.entryStatus, payload.entryStatusText)
}

const handlePayloadArrayOfObjects = function (statusInputs: StatusInput[]) {
  let entryStatus = {
    bad: 0,
    good: 0,
    other: 0
  }

  statusInputs.forEach((entry: any) => {
      switch (entry.statusCode?.name) {
        case 'Good':
          entryStatus['good'] += 1
          break
        case 'Bad':
          entryStatus['bad'] += 1
          break
        default:
          if (entry.statusCode?.name?.includes('Bad') || entry.toString().includes('Error')) {
            entryStatus['bad'] += 1
          } else {
            entryStatus['good'] += 1
          }
      }
    }
  )
  return entryStatus
}

const handlePayloadObject = function (statusInput: StatusInput) {
  let entryStatus = {
    good: 0,
    bad: 0,
    other: 0,
  }

  if (isArray(statusInput)) {
    entryStatus = handlePayloadArrayOfObjects(statusInput as StatusInput[])
  }

  if (statusInput && statusInput.statusCode) {
    if (statusInput.statusCode.name) {
      switch (statusInput.statusCode.name) {
        case 'Good':
          entryStatus['good'] += 1
          break
        case 'Bad':
          entryStatus['bad'] += 1
          break
        default:
          if (statusInput.statusCode.name.includes('Good')) {
            entryStatus['good'] += 1
          } else if (statusInput.statusCode.name.includes('Bad')) {
            entryStatus['bad'] += 1
          } else {
            entryStatus['other'] += 1
          }
      }
    } else {
      entryStatus['other'] += 1
    }
  } else {
    entryStatus['other'] += 1
  }

  return entryStatus
}

const handlePayloadArrayOfStatusCodes = function (payload: ResponseInputPayload) {
  let entry = null
  let entryStatus = {
    good: 0,
    bad: 0,
    other: 0,
  }

  if (payload.statusCodes) {
    for (entry of payload.statusCodes) {
      if (entry && entry.name) {
        switch (entry.name) {
          case 'Good':
            entryStatus['good'] += 1
            break
          case 'Bad':
            entryStatus['bad'] += 1
            break
          default:
            if (entry.name.includes('Good')) {
              entryStatus['good'] += 1
            } else if (entry.name.includes('Bad')) {
              entryStatus['bad'] += 1
            } else {
              entryStatus['other'] += 1
            }
        }
      } else {
        entryStatus['other'] += 1
      }
    }
  } else {
    entryStatus['other'] += 1
  }

  return entryStatus
}

const defaultCompress = function (payload: any) {
  if (payload.value.value) {
    payload.value = payload.value.value
  }
  trimMessageExtensions(payload)
}

const trimMessageExtensions = function (payload: any) {
  delete payload['nodesToRead']
  delete payload['nodesToReadCount']
  delete payload['addressItemsToRead']
  delete payload['addressItemsToReadCount']
  delete payload['addressItemsToBrowse']
  delete payload['addressItemsToBrowseCount']
  delete payload['addressSpaceItems']
  delete payload['injectType']
  delete payload['entryStatusText']

  if (payload.filter) {
    compressFilteredMessage(payload)
  }
}

const trimMessagePayloadExtensions = (payload: any) => {
  delete payload['listenerParameters']
}

export type CompressedBrowseResult = {
  nodeId: string
  browseName: string
  displayName: string
}

const compressBrowseMessageStructure = function (payload: BrowserPayload) {
  if (payload.browserResults?.length) {
    payload.value = payload.browserResults.map((item: Todo) => {
      return {
        nodeId: item.nodeId.toString(),
        browseName: (item.browseName?.namespaceIndex) ? item.browseName?.namespaceIndex + ':' + item.browseName?.name : item.browseName,
        displayName: item.displayName?.text
      }
    })
    trimMessageExtensions(payload)
    trimMessagePayloadExtensions(payload)
  } else {
    defaultCompress(payload as AnyPayload)
  }
}

const compressCrawlerMessageStructure = function (payload: CrawlerPayload) {
  if (payload.hasOwnProperty('crawlerResults') && payload.crawlerResults?.length) {
    payload.value = payload.crawlerResults?.map((item: Todo) => {
      return {
        nodeId: item.nodeId.toString(),
        browseName: (item.browseName.namespaceIndex) ? item.browseName.namespaceIndex + ':' + item.browseName.name : item.browseName,
        displayName: item.displayName.text
      }
    })
    trimMessageExtensions(payload)
    trimMessagePayloadExtensions(payload)
  } else {
    defaultCompress(payload)
  }
}

const reconsturctNodeIdOnRead = function (payload: ResponseInputPayload) {
  let results = payload.value || payload
  let nodesToRead = payload.nodesToRead

  if (results && results.length) {
    payload.value = results.map((item: Todo, index: number) => {
      if (item?.value?.value) {
        let nodeId = null
        if (nodesToRead && index < nodesToRead.length) {
          nodeId = nodesToRead[index]
        } else {
          if (payload.addressSpaceItems && index < payload.addressSpaceItems.length) {
            nodeId = payload.addressSpaceItems[index]
          }
        }
        return {
          value: item.value?.value,
          dataType: item.value?.dataType,
          nodeId
        }
      } else {
        return item
      }
    })
  }
}

const compressVariableValueMessage = function (payload: any) {
  delete payload['nodesToRead']
  delete payload['nodesToReadCount']
  delete payload['addressSpaceItems']

  return payload
}

const compressFilteredMessage = function (payload: any) {
  delete payload['filter']
  delete payload['filtertype']
}

const compressReadMessageStructure = function (payload: any) {
  switch (payload.readtype) {
    case 'AllAttributes':
      delete payload['nodesToRead']
      delete payload['resultsConverted']
      break
    case 'VariableValue':
      payload = compressVariableValueMessage(payload)
      break
    default:
      break
  }

  delete payload['readtype']
  delete payload['attributeId']

  delete payload['addressItemsToReadn']
  delete payload['addressItemsToReadCount']

  trimMessageExtensions(payload)
}

const compressWriteMessageStructure = function (payload: any) {
  defaultCompress(payload)

  let itemList: Todo[] = []
  payload.value = payload.statusCodes.map((item: Todo, index: number) => {
    return {
      nodeId: (payload.nodesToWrite) ? payload.nodesToWrite[index] : payload.addressSpaceItems[index],
      statusCode: item,
      value: (payload.valuesToWrite) ? payload.valuesToWrite[index] : null
    }
  })

  delete payload['valuesToWrite']
}

const compressListenMessageStructure = function (payload: ResponseInputPayload | any) {
  // interpreting payload as any makes reassigning it not cause errors
  if (payload.hasOwnProperty('value') && payload.value.hasOwnProperty('value')) {
    payload = {
      value: payload.value.value,
      dataType: payload.value.dataType,
      nodeId: (payload.addressSpaceItems[0].nodeId) ? payload.addressSpaceItems[0].nodeId : payload.addressSpaceItems[0]
    }
  }
  trimMessageExtensions(payload)
}

const compressMethodMessageStructure = function (payload: any) {
  defaultCompress(payload)
  trimMessageExtensions(payload)

  delete payload['inputArguments']
  delete payload['objectId']
  delete payload['methodId']
  delete payload['methodType']

  delete payload['definition']
}

const compressDefaultMessageStructure = function (payload: ResponseInputPayload) {
  defaultCompress(payload)
  trimMessageExtensions(payload)
}


const coreResponse = {
  internalDebugLog,
  detailDebugLog,
  EMPTY_LIST,
  NONE,

  analyzeBrowserResults,
  analyzeCrawlerResults,
  analyzeReadResults,
  analyzeListenerResults,
  analyzeMethodResults,
  setNodeStatus,
  analyzeWriteResults,
  handlePayloadStatusCode,
  setNodeStatusInfo,
  handlePayloadArrayOfObjects,
  handlePayloadObject,
  handlePayloadArrayOfStatusCodes,
  defaultCompress,
  trimMessageExtensions,
  trimMessagePayloadExtensions,
  compressBrowseMessageStructure,
  compressCrawlerMessageStructure,
  reconsturctNodeIdOnRead,
  compressVariableValueMessage,
  compressFilteredMessage,
  compressReadMessageStructure,
  compressWriteMessageStructure,
  compressListenMessageStructure,
  compressMethodMessageStructure,
  compressDefaultMessageStructure,
}

export default coreResponse
