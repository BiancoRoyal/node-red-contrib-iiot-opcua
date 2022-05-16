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

/**
 * Nested namespace settings.
 *
 * @type {{biancoroyal: {opcua: {iiot: {core: {response: {}}}}}}}
 *
 * @Namesapce de.biancoroyal.opcua.iiot.core.response
 */
var de: Todo = de || { biancoroyal: { opcua: { iiot: { core: { response: {} } } } } } // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.response.core = de.biancoroyal.opcua.iiot.core.response.core || require('./opcua-iiot-core') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.response.internalDebugLog = de.biancoroyal.opcua.iiot.core.response.internalDebugLog || require('debug')('opcuaIIoT:response') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.response.detailDebugLog = de.biancoroyal.opcua.iiot.core.response.detailDebugLog || require('debug')('opcuaIIoT:response:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.response.EMPTY_LIST = 0
de.biancoroyal.opcua.iiot.core.response.NONE = 0

de.biancoroyal.opcua.iiot.core.response.analyzeBrowserResults = function (node: Todo, msg: Todo) {
  this.handlePayloadStatusCode(node, msg)
}

de.biancoroyal.opcua.iiot.core.response.analyzeCrawlerResults = function (node: Todo, msg: Todo) {
  this.handlePayloadStatusCode(node, msg)
}

de.biancoroyal.opcua.iiot.core.response.analyzeReadResults = function (node: Todo, msg: Todo) {
  this.handlePayloadStatusCode(node, msg)
  if (msg.readtype === 'HistoryValue' && msg.payload && msg.payload.length) {
    msg.payload.forEach((item: Todo) => {
      delete item['statusCode']
    })
  }
  this.reconsturctNodeIdOnRead(msg)
}

de.biancoroyal.opcua.iiot.core.response.analyzeListenerResults = function (node: Todo, msg: Todo) {
  switch (msg.injectType) {
    case 'subscribe':
      this.analyzeSubscribeResultStatus(node, msg)
      break
    case 'event':
      this.analyzeEventResultStatus(node, msg)
      break
    default:
      break
  }
}

de.biancoroyal.opcua.iiot.core.response.analyzeMethodResults = function (node: Todo, msg: Todo) {
  switch (msg.methodType) {
    case 'basic':
      this.handlePayloadStatusCode(node, msg)
      break
    case 'complex':
      this.handlePayloadStatusCode(node, msg)
      break
    default:
      break
  }
}

de.biancoroyal.opcua.iiot.core.response.setNodeStatus = function (node: Todo, entryStatus: Todo, informationText: Todo) {
  let fillColor = 'green'

  if (entryStatus && entryStatus.length === 3) {
    if (entryStatus[2] > this.EMPTY_LIST) {
      fillColor = 'yellow'
    }

    if (entryStatus[1] > this.EMPTY_LIST) {
      fillColor = 'red'
    }
  }

  if (node.status.text !== informationText) {
    node.status({ fill: fillColor, shape: 'dot', text: informationText })
  }
}

de.biancoroyal.opcua.iiot.core.response.analyzeWriteResults = function (node: Todo, msg: Todo) {
  let entryStatus = this.handlePayloadArrayOfStatusCodes(msg)
  this.setNodeStatusInfo(node, msg, entryStatus)
}

de.biancoroyal.opcua.iiot.core.response.analyzeSubscribeResultStatus = function (node: Todo, msg: Todo) {
  this.handlePayloadStatusCode(node, msg)
}

de.biancoroyal.opcua.iiot.core.response.analyzeEventResultStatus = function (node: Todo, msg: Todo) {
  this.handlePayloadStatusCode(node, msg)
}

de.biancoroyal.opcua.iiot.core.response.handlePayloadStatusCode = function (node: Todo, msg: Todo) {
  let entryStatus = [0, 0, 0]

  if (msg.payload.length || msg.payload.results || msg.payload.browserResults || msg.payload.crawlerResults || msg.payload.statusCodes) {
    entryStatus = this.handlePayloadArrayOfObjects(msg)
  } else {
    entryStatus = this.handlePayloadObject(msg)
  }
  this.setNodeStatusInfo(node, msg, entryStatus)
}

de.biancoroyal.opcua.iiot.core.response.setNodeStatusInfo = function (node: Todo, msg: Todo, entryStatus: Todo) {
  msg.entryStatus = entryStatus
  msg.entryStatusText = 'Good:' + entryStatus[0] + ' Bad:' + entryStatus[1] + ' Other:' + entryStatus[2]
  this.setNodeStatus(node, msg.entryStatus, msg.entryStatusText)
}

de.biancoroyal.opcua.iiot.core.response.handlePayloadArrayOfObjects = function (msg: Todo) {
  let entry = null
  let entryStatus = [0, 0, 0]
  let results = []

  if (msg.payload.results) {
    results = msg.payload.results
  } else if (msg.payload.browserResults) {
    results = msg.payload.browserResults
  } else if (msg.payload.crawlerResults) {
    results = msg.payload.crawlerResults
  } else if (msg.payload.statusCodes) {
    results = msg.payload.statusCodes
  } else {
    if (msg.payload.length) { results = msg.payload }
  }

  for (entry of results) {
    if (entry.statusCode && entry.statusCode.name) {
      switch (entry.statusCode.name) {
        case 'Good':
          entryStatus[0] += 1
          break
        case 'Bad':
          entryStatus[1] += 1
          break
        default:
          if (entry.statusCode.name.includes('Good')) {
            entryStatus[0] += 1
          } else if (entry.statusCode.name.includes('Bad')) {
            entryStatus[1] += 1
          } else {
            entryStatus[2] += 1
          }
      }
    } else {
      entryStatus[2] += 1
    }
  }

  return entryStatus
}

de.biancoroyal.opcua.iiot.core.response.handlePayloadObject = function (msg: Todo) {
  let entryStatus = [0, 0, 0]

  if (msg.payload.results || msg.payload.statusCodes) {
    entryStatus = this.handlePayloadArrayOfObjects(msg)
  }

  if (msg.payload && msg.payload.statusCode) {
    if (msg.payload.statusCode.name) {
      switch (msg.payload.statusCode.name) {
        case 'Good':
          entryStatus[0] += 1
          break
        case 'Bad':
          entryStatus[1] += 1
          break
        default:
          if (msg.payload.statusCode.name.includes('Good')) {
            entryStatus[0] += 1
          } else if (msg.payload.statusCode.name.includes('Bad')) {
            entryStatus[1] += 1
          } else {
            entryStatus[2] += 1
          }
      }
    } else {
      entryStatus[2] += 1
    }
  } else {
    entryStatus[2] += 1
  }

  return entryStatus
}

de.biancoroyal.opcua.iiot.core.response.handlePayloadArrayOfStatusCodes = function (msg: Todo) {
  let entry = null
  let entryStatus = [0, 0, 0]

  if (msg.payload.statusCodes) {
    for (entry of msg.payload.statusCodes) {
      if (entry && entry.name) {
        switch (entry.name) {
          case 'Good':
            entryStatus[0] += 1
            break
          case 'Bad':
            entryStatus[1] += 1
            break
          default:
            if (entry.name.includes('Good')) {
              entryStatus[0] += 1
            } else if (entry.name.includes('Bad')) {
              entryStatus[1] += 1
            } else {
              entryStatus[2] += 1
            }
        }
      } else {
        entryStatus[2] += 1
      }
    }
  } else {
    entryStatus[2] += 1
  }

  return entryStatus
}

de.biancoroyal.opcua.iiot.core.response.defaultCompress = function (msg: Todo) {
  if (msg.payload.hasOwnProperty('value') && msg.payload.value.hasOwnProperty('value')) {
    msg.payload = msg.payload.value.value
  } else {
    if (msg.payload.length) {
      msg.payload.forEach((item: Todo) => {
        if (item.hasOwnProperty('value') && item.value.hasOwnProperty('value')) {
          item = item.value.value
        }
      })
    }
  }
  this.trimMessageExtensions(msg)
}

de.biancoroyal.opcua.iiot.core.response.trimMessageExtensions = function (msg: Todo) {
  delete msg['nodesToRead']
  delete msg['nodesToReadCount']
  delete msg['addressItemsToRead']
  delete msg['addressItemsToReadCount']
  delete msg['addressItemsToBrowse']
  delete msg['addressItemsToBrowseCount']
  delete msg['addressSpaceItems']
  delete msg['injectType']
  delete msg['nodetype']
  delete msg['entryStatus']
  delete msg['entryStatusText']

  if (msg.filter) {
    msg = this.compressFilteredMessage(msg)
  }
}

de.biancoroyal.opcua.iiot.core.response.trimMessagePayloadExtensions = function (msg: Todo) {
  delete msg.payload['listenerParameters']
}

de.biancoroyal.opcua.iiot.core.response.compressBrowseMessageStructure = function (msg: Todo) {
  if (msg.payload.hasOwnProperty('browserResults') && msg.payload.browserResults.length) {
    let itemList: Todo[] = []
    msg.payload.browserResults.forEach((item: Todo) => {
      itemList.push({
        nodeId: item.nodeId.toString(),
        browseName: (item.browseName.namespaceIndex) ? item.browseName.namespaceIndex + ':' + item.browseName.name : item.browseName,
        displayName: item.displayName.text
      })
    })
    msg.payload = itemList
    this.trimMessageExtensions(msg)
    this.trimMessagePayloadExtensions(msg)
  } else {
    this.defaultCompress(msg)
  }
}

de.biancoroyal.opcua.iiot.core.response.compressCrawlerMessageStructure = function (msg: Todo) {
  if (msg.payload.hasOwnProperty('crawlerResults') && msg.payload.crawlerResults.length) {
    let itemList: Todo[] = []
    msg.payload.crawlerResults.forEach((item: Todo) => {
      itemList.push({
        nodeId: item.nodeId.toString(),
        browseName: (item.browseName.namespaceIndex) ? item.browseName.namespaceIndex + ':' + item.browseName.name : item.browseName,
        displayName: item.displayName.text
      })
    })
    msg.payload = itemList
    this.trimMessageExtensions(msg)
    this.trimMessagePayloadExtensions(msg)
  } else {
    this.defaultCompress(msg)
  }
}

de.biancoroyal.opcua.iiot.core.response.reconsturctNodeIdOnRead = function (msg: Todo) {
  let itemList: Todo[] = []
  let results = msg.payload.results || msg.payload
  let nodesToRead = msg.nodesToRead

  if (results && results.length) {
    results.forEach((item: Todo, index: number) => {
      if (item.hasOwnProperty('value') && item.value.hasOwnProperty('value')) {
        let nodeId = null
        if (nodesToRead && index < nodesToRead.length) {
          nodeId = nodesToRead[index]
        } else {
          if (msg.addressSpaceItems && index < msg.addressSpaceItems.length) {
            nodeId = msg.addressSpaceItems[index]
          }
        }

        itemList.push({
          value: item.value.value,
          dataType: item.value.dataType,
          nodeId
        })
      } else {
        itemList.push(item)
      }
    })

    msg.payload = itemList
  }
}

de.biancoroyal.opcua.iiot.core.response.compressVariableValueMessage = function (msg: Todo) {
  delete msg['nodesToRead']
  delete msg['nodesToReadCount']
  delete msg['addressSpaceItems']

  return msg
}

de.biancoroyal.opcua.iiot.core.response.compressFilteredMessage = function (msg: Todo) {
  delete msg['filter']
  delete msg['filtertype']
}

de.biancoroyal.opcua.iiot.core.response.compressReadMessageStructure = function (msg: Todo) {
  switch (msg.readtype) {
    case 'AllAttributes':
      delete msg.payload['nodesToRead']
      delete msg['resultsConverted']
      break
    case 'VariableValue':
      msg = this.compressVariableValueMessage(msg)
      break
    default:
      break
  }

  delete msg['readtype']
  delete msg['attributeId']

  delete msg['addressItemsToRead']
  delete msg['addressItemsToReadCount']

  this.trimMessageExtensions(msg)
}

de.biancoroyal.opcua.iiot.core.response.compressWriteMessageStructure = function (msg: Todo) {
  this.defaultCompress(msg)

  let itemList: Todo[] = []
  msg.payload.statusCodes.forEach((item: Todo, index: number) => {
    itemList.push({
      nodeId: (msg.payload.nodesToWrite) ? msg.payload.nodesToWrite[index] : msg.addressSpaceItems[index],
      statusCode: item,
      value: (msg.valuesToWrite) ? msg.valuesToWrite[index] : null
    })
  })
  msg.payload = itemList

  delete msg['valuesToWrite']
}

de.biancoroyal.opcua.iiot.core.response.compressListenMessageStructure = function (msg: Todo) {
  if (msg.payload.hasOwnProperty('value') && msg.payload.value.hasOwnProperty('value')) {
    msg.payload = {
      value: msg.payload.value.value,
      dataType: msg.payload.value.dataType,
      nodeId: (msg.addressSpaceItems[0].nodeId) ? msg.addressSpaceItems[0].nodeId : msg.addressSpaceItems[0]
    }
  } else {
    if (msg.payload.length) {
      let itemList: Todo[] = []
      msg.payload.forEach((item: Todo, index: number) => {
        if (item.hasOwnProperty('value') && item.value.hasOwnProperty('value')) {
          itemList.push({
            value: item.value.value,
            dataType: item.value.dataType,
            nodeId: (msg.addressSpaceItems[index].nodeId) ? msg.addressSpaceItems[index].nodeId : msg.addressSpaceItems[index]
          })
        }
      })
      msg.payload = itemList
    }
  }
  this.trimMessageExtensions(msg)
}

de.biancoroyal.opcua.iiot.core.response.compressMethodMessageStructure = function (msg: Todo) {
  this.defaultCompress(msg)
  this.trimMessageExtensions(msg)

  delete msg['inputArguments']
  delete msg['objectId']
  delete msg['methodId']
  delete msg['methodType']

  delete msg.payload['definition']
}

de.biancoroyal.opcua.iiot.core.response.compressDefaultMessageStructure = function (msg: Todo) {
  this.defaultCompress(msg)
  this.trimMessageExtensions(msg)
}

module.exports = de.biancoroyal.opcua.iiot.core.response
