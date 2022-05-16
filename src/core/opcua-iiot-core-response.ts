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

const internalDebugLog = debug('opcuaIIoT:response') // eslint-disable-line no-use-before-define
const detailDebugLog = debug('opcuaIIoT:response:details') // eslint-disable-line no-use-before-define
const EMPTY_LIST = 0
const NONE = 0

const analyzeBrowserResults = function (node: Todo, payload: Todo) {
  handlePayloadStatusCode(node, payload)
}

const analyzeCrawlerResults = function (node: Todo, payload: Todo) {
  handlePayloadStatusCode(node, payload)
}

const analyzeReadResults = (node: Todo, payload: Todo) => {
  handlePayloadStatusCode(node, payload)
  if (payload.readtype === 'HistoryValue' && payload.length) {
    payload.value.map((item: Todo) => {
      delete item['statusCode']
    })
  }
  reconsturctNodeIdOnRead(payload)
}

const analyzeListenerResults = function (node: Todo, payload: Todo) {
  switch (payload.injectType) {
    case 'subscribe':
    case 'event':
      handlePayloadStatusCode(node, payload)
      break
    default:
      break
  }
}

const analyzeMethodResults = function (node: Todo, msg: Todo) {
  switch (msg.methodType) {
    case 'basic':
    case 'complex':
      handlePayloadStatusCode(node, msg)
      break
    default:
      break
  }
}

const setNodeStatus = function (node: Todo, entryStatus: Todo, informationText: Todo) {
  let fillColor = 'green'

  if (entryStatus && Object.keys(entryStatus).length === 3) {
    if (entryStatus['other'] > EMPTY_LIST) {
      fillColor = 'yellow'
    }

    if (entryStatus['bad'] > EMPTY_LIST) {
      fillColor = 'red'
    }
  }

  if (node.status.text !== informationText) {
    node.status({fill: fillColor, shape: 'dot', text: informationText})
  }
}

const analyzeWriteResults = function (node: Todo, msg: Todo) {
  let entryStatus = handlePayloadArrayOfStatusCodes(msg)
  setNodeStatusInfo(node, msg, entryStatus)
}

const handlePayloadStatusCode = function (node: Todo, payload: Todo) {
  let entryStatus = {
    bad: 0,
    good: 0,
    other: 0
  }

  if (payload.length && (payload.value || payload.browserResults || payload.crawlerResults || payload.statusCodes)) {
    entryStatus = handlePayloadArrayOfObjects(payload)
  } else {
    entryStatus = handlePayloadObject(payload)
  }
  setNodeStatusInfo(node, payload, entryStatus)
  payload.entryStatus = entryStatus
}

const setNodeStatusInfo = function (node: Todo, payload: Todo, entryStatus: Todo) {
  payload.entryStatus = entryStatus
  payload.entryStatusText = 'Good:' + entryStatus['good'] + ' Bad:' + entryStatus['bad'] + ' Other:' + entryStatus['other']
  setNodeStatus(node, payload.entryStatus, payload.entryStatusText)
}

const handlePayloadArrayOfObjects = function (payload: Todo) {
  let entry = null
  let entryStatus = {
    bad: 0,
    good: 0,
    other: 0
  }
  let results = []

  if (payload.value) {
    results = payload.value
  } else if (payload.browserResults) {
    results = payload.browserResults
  } else if (payload.crawlerResults) {
    results = payload.crawlerResults
  } else if (payload.statusCodes) {
    results = payload.statusCodes
  } else {
    if (payload.length) {
      results = payload
    }
  }

  for (entry of results) {
    if (entry.statusCode && entry.statusCode.name) {
      switch (entry.statusCode.name) {
        case 'Good':
          entryStatus['good'] += 1
          break
        case 'Bad':
          entryStatus['bad'] += 1
          break
        default:
          if (entry.statusCode.name.includes('Good')) {
            entryStatus['good'] += 1
          } else if (entry.statusCode.name.includes('Bad')) {
            entryStatus['bad'] += 1
          } else {
            entryStatus['other'] += 1
          }
      }
    } else {
      entryStatus['other'] += 1
    }
  }

  return entryStatus
}

const handlePayloadObject = function (payload: Todo) {
  let entryStatus = {
    good: 0,
    bad: 0,
    other: 0,
  }

  if (payload.results || payload.statusCodes) {
    entryStatus = handlePayloadArrayOfObjects(payload)
  }

  if (payload && payload.statusCode) {
    if (payload.statusCode.name) {
      switch (payload.statusCode.name) {
        case 'Good':
          entryStatus['good'] += 1
          break
        case 'Bad':
          entryStatus['bad'] += 1
          break
        default:
          if (payload.statusCode.name.includes('Good')) {
            entryStatus['good'] += 1
          } else if (payload.statusCode.name.includes('Bad')) {
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

const handlePayloadArrayOfStatusCodes = function (payload: Todo) {
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

const defaultCompress = function (payload: Todo) {
  if (payload.hasOwnProperty('value') && payload.value.hasOwnProperty('value')) {
    payload.value = payload.value.value
  } else {
    if (payload.length) {
      payload.value = payload.map((item: Todo) => {
        if (item.value) {
          if (item.value.value) {
            return item.value.value
          } else {
            return item.value
          }
        } else {
          return item
        }
      })
    }
  }
  trimMessageExtensions(payload)
}

const trimMessageExtensions = function (payload: Todo) {
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

const trimMessagePayloadExtensions = (payload: Todo) => {
  delete payload['listenerParameters']
}

const compressBrowseMessageStructure = function (payload: Todo) {
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
    defaultCompress(payload)
  }
}

const compressCrawlerMessageStructure = function (payload: Todo) {
  if (payload.hasOwnProperty('crawlerResults') && payload.crawlerResults.length) {
    payload.value = payload.crawlerResults.map((item: Todo) => {
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

const reconsturctNodeIdOnRead = function (payload: Todo) {
  let results = payload.value || payload
  let nodesToRead = payload.nodesToRead

  if (results && results.length) {
    payload.value = results.map((item: Todo, index: number) => {
      if (item.hasOwnProperty('value') && item.value.hasOwnProperty('value')) {
        let nodeId = null
        if (nodesToRead && index < nodesToRead.length) {
          nodeId = nodesToRead[index]
        } else {
          if (payload.addressSpaceItems && index < payload.addressSpaceItems.length) {
            nodeId = payload.addressSpaceItems[index]
          }
        }

        return {
          value: item.value.value,
          dataType: item.value.dataType,
          nodeId
        }
      } else {
        return item
      }
    })
  }

}

const compressVariableValueMessage = function (msg: Todo) {
  delete msg['nodesToRead']
  delete msg['nodesToReadCount']
  delete msg['addressSpaceItems']

  return msg
}

const compressFilteredMessage = function (payload: Todo) {
  delete payload['filter']
  delete payload['filtertype']
}

const compressReadMessageStructure = function (payload: Todo) {
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

  delete payload['addressItemsToRead']
  delete payload['addressItemsToReadCount']

  trimMessageExtensions(payload)
}

const compressWriteMessageStructure = function (payload: Todo) {
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

const compressListenMessageStructure = function (payload: Todo) {
  if (payload.hasOwnProperty('value') && payload.value.hasOwnProperty('value')) {
    payload = {
      value: payload.value.value,
      dataType: payload.value.dataType,
      nodeId: (payload.addressSpaceItems[0].nodeId) ? payload.addressSpaceItems[0].nodeId : payload.addressSpaceItems[0]
    }
  } else {
    if (payload.length) {
      payload.value = payload.map((item: Todo, index: number) => {
        return {
          // be safe regardless of how deep the values sit
          value: item?.value?.value ?? item?.value,
          dataType: item.value?.dataType ?? item.dataType,
          nodeId: (payload.addressSpaceItems[index].nodeId) ? payload.addressSpaceItems[index].nodeId : payload.addressSpaceItems[index]
        }
      })
    }
  }
  trimMessageExtensions(payload)
}

const compressMethodMessageStructure = function (payload: Todo) {
  defaultCompress(payload)
  trimMessageExtensions(payload)

  delete payload['inputArguments']
  delete payload['objectId']
  delete payload['methodId']
  delete payload['methodType']

  delete payload['definition']
}

const compressDefaultMessageStructure = function (payload: Todo) {
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
