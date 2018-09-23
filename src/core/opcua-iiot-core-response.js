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

de.biancoroyal.opcua.iiot.core.response.analyzeBrowserResults = function (msg) {
  switch (msg.readtype) {
    case 'AllAttributes':
      this.handlePayloadStatusCode(msg) // TODO: do more
      break
    case 'VariableValue':
      this.handlePayloadStatusCode(msg) // TODO: do less
      break
    case 'Meta':
      this.setNodeStatus([this.NONE, this.NONE, this.NONE], 'None')
      break
    default:
      this.handlePayloadStatusCode(msg) // TODO: do default
      break
  }
}

de.biancoroyal.opcua.iiot.core.response.analyzeReadResults = function (msg) {
  switch (msg.readtype) {
    case 'AllAttributes':
      this.handlePayloadStatusCode(msg) // TODO: do more
      break
    case 'VariableValue':
      this.handlePayloadStatusCode(msg) // TODO: do less
      break
    case 'Meta':
      this.setNodeStatus([this.NONE, this.NONE, this.NONE], 'None')
      break
    default:
      this.handlePayloadStatusCode(msg) // TODO: do default
      break
  }
}

de.biancoroyal.opcua.iiot.core.response.analyzeListenerResults = function (msg) {
  switch (msg.injectType) {
    case 'subscribe':
      this.analyzeSubscribeResultStatus(msg)
      break
    case 'event':
      this.analyzeEventResultStatus(msg)
      break
    default:
      break
  }
}

de.biancoroyal.opcua.iiot.core.response.analyzeMethodResults = function (msg) {
  switch (msg.methodType) {
    case 'basic':
      this.handlePayloadStatusCode(msg)
      break
    case 'complex':
      this.handlePayloadStatusCode(msg)
      break
    default:
      break
  }
}

de.biancoroyal.opcua.iiot.core.response.setNodeStatus = function (node, entryStatus, informationText) {
  let fillColor = 'green'

  if (entryStatus[2] > this.EMPTY_LIST) {
    fillColor = 'yellow'
  }

  if (entryStatus[1] > this.EMPTY_LIST) {
    fillColor = 'red'
  }

  node.status({fill: fillColor, shape: 'dot', text: informationText})
}

de.biancoroyal.opcua.iiot.core.response.analyzeWriteResults = function (msg) {
  let entryStatus = this.handlePayloadArrayOfStatusCodes(msg)
  msg.entryStatus = entryStatus
  msg.entryStatusText = 'Good:' + entryStatus[0] + ' Bad:' + entryStatus[1] + ' Other:' + entryStatus[2]
}

de.biancoroyal.opcua.iiot.core.response.analyzeSubscribeResultStatus = function (msg) {
  this.handlePayloadStatusCode(msg)
}

de.biancoroyal.opcua.iiot.core.response.analyzeEventResultStatus = function (msg) {
  this.handlePayloadStatusCode(msg)
}

de.biancoroyal.opcua.iiot.core.response.handlePayloadStatusCode = function (msg) {
  let entryStatus = [0, 0, 0]

  if (msg.payload.length || msg.payload.results || msg.payload.statusCodes) {
    entryStatus = this.handlePayloadArrayOfObjects(msg)
  } else {
    entryStatus = this.handlePayloadObject(msg)
  }

  msg.entryStatus = entryStatus
  msg.entryStatusText = 'Good:' + entryStatus[0] + ' Bad:' + entryStatus[1] + ' Other:' + entryStatus[2]
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
  delete msg['addressSpaceItems']
  delete msg['injectType']
  delete msg['nodetype']
  delete msg['entryStatus']
  delete msg['entryStatusText']
}

de.biancoroyal.opcua.iiot.core.response.compressBrowseMessageStructure = function (msg) {
  if (msg.payload.hasOwnProperty('browserItems') && msg.payload.browserItems.length) {
    let itemList = []
    msg.payload.browserItems.forEach(item => {
      itemList.push({
        nodeId: item.nodeId.toString(),
        browseName: item.browseName.namespaceIndex + ':' + item.browseName.name,
        displayName: item.displayName.text
      })
    })
    msg.payload = itemList
    this.trimMessageExtensions(msg)
  } else {
    this.defaultCompress(msg)
  }
}

de.biancoroyal.opcua.iiot.core.response.compressReadMessageStructure = function (msg) {
  switch (msg.readtype) {
    case 'VariableValue':
      let itemList = []
      msg.payload.forEach((item, index) => {
        if (item.hasOwnProperty('value') && item.value.hasOwnProperty('value')) {
          itemList.push({
            value: item.value.value,
            dataType: item.value.dataType,
            nodeId: msg.nodesToRead[index]
          })
        }
      })
      msg.payload = itemList
      delete msg['nodesToRead']
      delete msg['nodesToReadCount']
      break
    default:
      break
  }

  delete msg['addressItemsToRead']
  delete msg['addressItemsToReadCount']

  this.trimMessageExtensions(msg)
}

de.biancoroyal.opcua.iiot.core.response.compressWriteMessageStructure = function (msg) {
  this.defaultCompress(msg)
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
}

module.exports = de.biancoroyal.opcua.iiot.core.response
