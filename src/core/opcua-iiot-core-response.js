/**
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

/**
 * Nested namespace settings.
 *
 * @type {{biancoroyal: {opcua: {iiot: {core: {response: {}}}}}}}
 *
 * @Namesapce de.biancoroyal.opcua.iiot.core.response
 */
var de = de || {biancoroyal: {opcua: {iiot: {core: {response: {}}}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.response.core = de.biancoroyal.opcua.iiot.core.response.core || require('./opcua-iiot-core') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.response.internalDebugLog = de.biancoroyal.opcua.iiot.core.response.internalDebugLog || require('debug')('opcuaIIoT:response') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.response.detailDebugLog = de.biancoroyal.opcua.iiot.core.response.detailDebugLog || require('debug')('opcuaIIoT:response:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.response.EMPTY_LIST = 0
de.biancoroyal.opcua.iiot.core.response.NONE = 0

de.biancoroyal.opcua.iiot.core.response.analyzeBrowserResults = function (node, msg) {
  this.handlePayloadStatusCode(node, msg)
}

de.biancoroyal.opcua.iiot.core.response.analyzeReadResults = function (node, msg) {
  if (msg.readtype !== 'Meta') {
    this.handlePayloadStatusCode(node, msg)
  }
  switch (msg.readtype) {
    case 'Meta':
      this.setNodeStatus([this.NONE, this.NONE, this.NONE], 'None')
      break
    case 'AllAttributes':
      break
    case 'VariableValue':
      break
    case 'HistoryValue':
      msg.payload.forEach(item => {
        delete item['statusCode']
      })
      break
    default:
      break
  }
}

de.biancoroyal.opcua.iiot.core.response.analyzeListenerResults = function (node, msg) {
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

de.biancoroyal.opcua.iiot.core.response.analyzeMethodResults = function (node, msg) {
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

de.biancoroyal.opcua.iiot.core.response.setNodeStatus = function (node, entryStatus, informationText) {
  let fillColor = 'green'

  if (entryStatus && entryStatus.length === 3) {
    if (entryStatus[2] > this.EMPTY_LIST) {
      fillColor = 'yellow'
    }

    if (entryStatus[1] > this.EMPTY_LIST) {
      fillColor = 'red'
    }
  }

  node.status({fill: fillColor, shape: 'dot', text: informationText})
}

de.biancoroyal.opcua.iiot.core.response.analyzeWriteResults = function (node, msg) {
  let entryStatus = this.handlePayloadArrayOfStatusCodes(msg)
  this.setNodeStatusInfo(node, msg, entryStatus)
}

de.biancoroyal.opcua.iiot.core.response.analyzeSubscribeResultStatus = function (node, msg) {
  this.handlePayloadStatusCode(node, msg)
}

de.biancoroyal.opcua.iiot.core.response.analyzeEventResultStatus = function (node, msg) {
  this.handlePayloadStatusCode(node, msg)
}

de.biancoroyal.opcua.iiot.core.response.handlePayloadStatusCode = function (node, msg) {
  let entryStatus = [0, 0, 0]

  if (msg.payload.length || msg.payload.results || msg.payload.statusCodes) {
    entryStatus = this.handlePayloadArrayOfObjects(msg)
  } else {
    entryStatus = this.handlePayloadObject(msg)
  }
  this.setNodeStatusInfo(node, msg, entryStatus)
}

de.biancoroyal.opcua.iiot.core.response.setNodeStatusInfo = function (node, msg, entryStatus) {
  msg.entryStatus = entryStatus
  msg.entryStatusText = 'Good:' + entryStatus[0] + ' Bad:' + entryStatus[1] + ' Other:' + entryStatus[2]
  this.setNodeStatus(node, msg.entryStatus, msg.entryStatusText)
}

de.biancoroyal.opcua.iiot.core.response.handlePayloadArrayOfObjects = function (msg) {
  let entry = null
  let entryStatus = [0, 0, 0]
  let results = []

  if (msg.payload.results) {
    results = msg.payload.results
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

de.biancoroyal.opcua.iiot.core.response.handlePayloadObject = function (msg) {
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

de.biancoroyal.opcua.iiot.core.response.handlePayloadArrayOfStatusCodes = function (msg) {
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

de.biancoroyal.opcua.iiot.core.response.defaultCompress = function (msg) {
  if (msg.payload.hasOwnProperty('value') && msg.payload.value.hasOwnProperty('value')) {
    msg.payload = msg.payload.value.value
  } else {
    if (msg.payload.length) {
      msg.payload.forEach(item => {
        if (item.hasOwnProperty('value') && item.value.hasOwnProperty('value')) {
          item = item.value.value
        }
      })
    }
  }
  this.trimMessageExtensions(msg)
}

de.biancoroyal.opcua.iiot.core.response.trimMessageExtensions = function (msg) {
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
}

de.biancoroyal.opcua.iiot.core.response.trimMessagePayloadExtensions = function (msg) {
  delete msg.payload['listenerParameters']
}

de.biancoroyal.opcua.iiot.core.response.compressBrowseMessageStructure = function (msg) {
  if (msg.payload.hasOwnProperty('browserResults') && msg.payload.browserResults.length) {
    let itemList = []
    msg.payload.browserResults.forEach(item => {
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

de.biancoroyal.opcua.iiot.core.response.compressReadMessageStructure = function (msg) {
  switch (msg.readtype) {
    case 'AllAttributes':
      delete msg.payload['nodesToRead']
      delete msg['resultsConverted']
      break
    case 'VariableValue':
      let itemList = []
      msg.payload.forEach((item, index) => {
        if (item.hasOwnProperty('value') && item.value.hasOwnProperty('value')) {
          itemList.push({
            value: item.value.value,
            dataType: item.value.dataType,
            nodeId: (msg.nodesToRead) ? msg.nodesToRead[index] : msg.addressSpaceItems[index]
          })
        }
      })
      msg.payload = itemList
      delete msg['nodesToRead']
      delete msg['nodesToReadCount']
      delete msg['addressSpaceItems']
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

de.biancoroyal.opcua.iiot.core.response.compressWriteMessageStructure = function (msg) {
  this.defaultCompress(msg)

  let itemList = []
  msg.payload.statusCodes.forEach((item, index) => {
    itemList.push({
      nodeId: (msg.payload.nodesToWrite) ? msg.payload.nodesToWrite[index] : msg.addressSpaceItems[index],
      statusCode: item,
      value: (msg.valuesToWrite) ? msg.valuesToWrite[index] : null
    })
  })
  msg.payload = itemList

  delete msg['valuesToWrite']
}

de.biancoroyal.opcua.iiot.core.response.compressListenMessageStructure = function (msg) {
  if (msg.payload.hasOwnProperty('value') && msg.payload.value.hasOwnProperty('value')) {
    msg.payload = {
      value: msg.payload.value.value,
      dataType: msg.payload.value.dataType,
      nodeId: (msg.addressSpaceItems[0].nodeId) ? msg.addressSpaceItems[0].nodeId : msg.addressSpaceItems[0]
    }
  } else {
    if (msg.payload.length) {
      let itemList = []
      msg.payload.forEach((item, index) => {
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

de.biancoroyal.opcua.iiot.core.response.compressMethodMessageStructure = function (msg) {
  this.defaultCompress(msg)
  this.trimMessageExtensions(msg)

  delete msg['inputArguments']
  delete msg['objectId']
  delete msg['methodId']
  delete msg['methodType']

  delete msg.payload['definition']
}

de.biancoroyal.opcua.iiot.core.response.compressDefaultMessageStructure = function (msg) {
  this.defaultCompress(msg)
  this.trimMessageExtensions(msg)
}

module.exports = de.biancoroyal.opcua.iiot.core.response
