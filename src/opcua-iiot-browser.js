/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018,2019 - Klaus Landsdorf (https://bianco-royal.com/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * Browser Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED) {
  // SOURCE-MAP-REQUIRED
  let coreBrowser = require('./core/opcua-iiot-core-browser')

  function OPCUAIIoTBrowser (config) {
    RED.nodes.createNode(this, config)

    this.nodeId = config.nodeId
    this.name = config.name
    this.justValue = config.justValue
    this.sendNodesToRead = config.sendNodesToRead
    this.sendNodesToBrowser = config.sendNodesToBrowser
    this.sendNodesToListener = config.sendNodesToListener
    this.singleBrowseResult = config.singleBrowseResult
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.recursiveBrowse = config.recursiveBrowse
    this.recursiveDepth = config.recursiveDepth || 1
    this.delayPerMessage = config.delayPerMessage || 0.2

    this.connector = RED.nodes.getNode(config.connector)

    let node = coreBrowser.initBrowserNode(this)
    coreBrowser.core.assert(node.bianco.iiot)
    node.bianco.iiot.delayMessageTimer = []

    node.bianco.iiot.extractDataFromBrowserResults = (browserResultToFilter, lists) => {
      lists.addressItemList = []

      browserResultToFilter.forEach(function (result) {
        result.references.forEach(function (reference) {
          coreBrowser.detailDebugLog('Add Reference To List :' + reference)
          lists.browserResults.push(coreBrowser.transformToEntry(reference))

          if (reference.nodeId) {
            lists.nodesToRead.push(reference.nodeId.toString())

            lists.addressItemList.push({
              nodeId: reference.nodeId.toString(),
              browseName: reference.browseName.toString(),
              displayName: reference.displayName.toString(),
              nodeClass: reference.nodeClass.toString(),
              datatypeName: reference.typeDefinition.toString() })
          }
        })
      })

      lists.addressSpaceItemList = lists.addressSpaceItemList.concat(lists.addressItemList)
    }

    node.bianco.iiot.browse = function (rootNodeId, msg, depth, lists, callback) {
      if (coreBrowser.core.checkSessionNotValid(node.bianco.iiot.opcuaSession, 'Browse')) {
        return
      }

      coreBrowser.internalDebugLog('Browse Topic To Call Browse ' + rootNodeId)
      let rootNode = 'list'

      coreBrowser.browse(node.bianco.iiot.opcuaSession, rootNodeId)
        .then(function (browserResults) {
          if (browserResults.length) {
            coreBrowser.detailDebugLog('Browser Result To String: ' + browserResults.toString())
            node.bianco.iiot.extractDataFromBrowserResults(browserResults, lists)
            if (node.recursiveBrowse) {
              if (depth > 0) {
                let newDepth = depth - 1

                let subLists = node.bianco.iiot.createListsObject()
                if (!node.singleBrowseResult) {
                  callback(rootNode, depth, msg, lists)
                } else {
                  subLists = lists
                }

                node.bianco.iiot.browseNodeList(lists.addressItemList, msg, newDepth, subLists, callback)
              } else {
                coreBrowser.internalDebugLog('Minimum Depth Reached On Browse At ' + rootNodeId)
                callback(rootNodeId, depth, msg, lists)
              }
            } else {
              callback(rootNodeId, depth, msg, lists)
            }
          } else {
            coreBrowser.internalDebugLog('No Browse Results On ' + rootNodeId)
          }
        }).catch(function (err) {
          coreBrowser.browseErrorHandling(node, err, msg, lists)
        })
    }

    node.bianco.iiot.createListsObject = () => {
      return {
        nodesToBrowse: [],
        nodesToRead: [],
        addressItemList: [],
        addressSpaceItemList: [],
        browserResults: []
      }
    }

    node.bianco.iiot.browseNodeList = function (addressSpaceItems, msg, depth, lists, callback) {
      if (coreBrowser.core.checkSessionNotValid(node.bianco.iiot.opcuaSession, 'BrowseList')) {
        return
      }

      coreBrowser.internalDebugLog('Browse For NodeId List')
      let rootNode = 'list'

      if (node.bianco.iiot.opcuaSession) {
        coreBrowser.browseAddressSpaceItems(node.bianco.iiot.opcuaSession, addressSpaceItems)
          .then(function (browserResults) {
            coreBrowser.detailDebugLog('List Browser Result To String: ' + browserResults.toString())
            node.bianco.iiot.extractDataFromBrowserResults(browserResults, lists)
            if (node.recursiveBrowse) {
              if (depth > 0) {
                let newDepth = depth - 1

                let subLists = node.bianco.iiot.createListsObject()
                if (!node.singleBrowseResult) {
                  callback(rootNode, depth, msg, lists)
                } else {
                  subLists = lists
                }
                node.bianco.iiot.browseNodeList(lists.addressItemList, msg, newDepth, subLists, callback)
              } else {
                coreBrowser.internalDebugLog('Minimum Depth Reached On Browse List')
                callback(rootNode, depth, msg, lists)
              }
            } else {
              callback(rootNode, depth, msg, lists)
            }
          }).catch(function (err) {
            coreBrowser.browseErrorHandling(node, err, msg, lists)
          })
      }
    }

    node.bianco.iiot.sendMessage = function (rootNodeId, depth, originMessage, lists) {
      let msg = Object.assign({}, originMessage)
      msg.nodetype = 'browse'
      msg.justValue = node.justValue

      if (!lists) {
        coreBrowser.internalDebugLog('Lists Not Valid!')
        if (node.showErrors) {
          node.error(new Error('Lists Not Valid On Browse Send Message'), msg)
        }
      }

      let listenerParameters = node.bianco.iiot.getListenParameters(msg)

      msg.payload = {
        rootNodeId,
        browserResults: lists.browserResults,
        recursiveBrowse: node.recursiveBrowse,
        recursiveDepth: depth,
        recursiveDepthMax: node.recursiveDepth,
        listenerParameters
      }

      msg = node.bianco.iiot.enhanceMessage(msg, lists)
      msg = node.bianco.iiot.setMessageLists(msg, lists)

      node.bianco.iiot.messageList.push(msg)

      if (node.showStatusActivities && node.status.text !== 'active') {
        coreBrowser.core.setNodeStatusTo(node, 'active')
      }

      node.bianco.iiot.delayMessageTimer.push(setTimeout(() => {
        node.send(node.bianco.iiot.messageList.shift())
      }, node.delayPerMessage * coreBrowser.core.FAKTOR_SEC_TO_MSEC))
    }

    node.bianco.iiot.resetAllTimer = function () {
      node.bianco.iiot.delayMessageTimer.forEach((timerId) => {
        clearTimeout(timerId)
        timerId = null
      })
    }

    node.bianco.iiot.getListenParameters = function (msg) {
      if (msg.injectType === 'listen') {
        return msg.payload
      } else {
        return null
      }
    }

    node.bianco.iiot.enhanceMessage = function (msg, lists) {
      if (!node.justValue) {
        msg.payload.browseTopic = node.browseTopic
        msg.payload.addressSpaceItems = msg.addressSpaceItems
        msg.payload.browserResultsCount = lists.browserResults.length
        if (node.connector) {
          msg.payload.endpoint = node.connector.endpoint
        }
        msg.payload.session = (node.bianco.iiot.opcuaSession) ? node.bianco.iiot.opcuaSession.name : 'none'
      } else {
        msg.payload.browserResults = lists.addressSpaceItemList
      }
      return msg
    }

    node.bianco.iiot.setMessageLists = function (msg, lists) {
      if (node.sendNodesToRead && lists.nodesToRead) {
        msg.nodesToRead = lists.nodesToRead
        msg.nodesToReadCount = lists.nodesToRead.length
      }

      if (node.sendNodesToListener && lists.addressSpaceItemList) {
        msg.addressItemsToRead = lists.addressSpaceItemList
        msg.addressItemsToReadCount = lists.addressSpaceItemList.length
      }

      if (node.sendNodesToBrowser && lists.addressSpaceItemList) {
        msg.addressItemsToBrowse = lists.addressSpaceItemList
        msg.addressItemsToBrowseCount = lists.addressSpaceItemList.length
      }
      return msg
    }

    node.bianco.iiot.browseSendResult = function (rootNodeId, depth, msg, lists) {
      coreBrowser.internalDebugLog(rootNodeId + ' called by depth ' + depth)

      if (node.singleBrowseResult) {
        if (depth <= 0) {
          node.bianco.iiot.sendMessage(rootNodeId, depth, msg, lists)
          node.bianco.iiot.reset(lists)
        }
      } else {
        node.bianco.iiot.sendMessage(rootNodeId, depth, msg, lists)
        node.bianco.iiot.reset(lists)
      }
    }

    node.bianco.iiot.reset = function (lists) {
      lists = node.bianco.iiot.createListsObject()
    }

    node.bianco.iiot.browseWithAddressSpaceItems = function (msg, depth, lists) {
      if (msg.addressItemsToBrowse && msg.addressItemsToBrowse.length > 0) {
        msg.addressSpaceItems = msg.addressItemsToBrowse
      }

      if (msg.addressSpaceItems && msg.addressSpaceItems.length > 0) {
        node.bianco.iiot.browseNodeList(msg.addressSpaceItems, msg, depth, lists, (rootNodeId, depth, msg, subLists) => {
          node.bianco.iiot.browseSendResult(rootNodeId, depth, msg, subLists)
        })
      } else {
        coreBrowser.detailDebugLog('Fallback NodeId On Browse Without AddressSpace Items')
        node.browseTopic = node.nodeId || coreBrowser.browseToRoot()
        node.bianco.iiot.browse(node.browseTopic, msg, depth, lists, (rootNodeId, depth, msg, subLists) => {
          node.bianco.iiot.browseSendResult(rootNodeId, depth, msg, subLists)
        })
      }
    }

    node.bianco.iiot.startBrowser = function (msg) {
      if (coreBrowser.core.checkSessionNotValid(node.bianco.iiot.opcuaSession, 'Browser')) {
        return
      }

      let lists = node.bianco.iiot.createListsObject()
      let depth = (node.recursiveBrowse) ? node.recursiveDepth : 0
      node.browseTopic = coreBrowser.extractNodeIdFromTopic(msg, node) // set topic to the node object for HTTP requests at node

      if (node.browseTopic && node.browseTopic !== '') {
        node.bianco.iiot.browse(node.browseTopic, msg, depth, lists, (rootNodeId, depth, msg, subLists) => {
          node.bianco.iiot.browseSendResult(rootNodeId, depth, msg, subLists)
        })
      } else {
        node.bianco.iiot.browseWithAddressSpaceItems(msg, depth, lists)
      }
    }

    node.on('input', function (msg) {
      if (!coreBrowser.core.checkConnectorState(node, msg, 'Browser')) {
        return
      }

      if (node.showStatusActivities) {
        coreBrowser.core.setNodeStatusTo(node, 'browsing')
      }
      node.bianco.iiot.startBrowser(msg)
    })

    coreBrowser.core.registerToConnector(node)

    node.on('close', (done) => {
      coreBrowser.core.deregisterToConnector(node, () => {
        coreBrowser.core.resetBiancoNode(node)
        done()
      })
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Browser', OPCUAIIoTBrowser)

  RED.httpAdmin.get('/opcuaIIoT/browse/:id/:nodeId', RED.auth.needsPermission('opcuaIIoT.browse'), function (req, res) {
    let node = RED.nodes.getNode(req.params.id)
    let entries = []
    let nodeRootId = decodeURIComponent(req.params.nodeId) || coreBrowser.core.OBJECTS_ROOT
    coreBrowser.detailDebugLog('request for ' + req.params.nodeId)

    if (node.bianco.iiot.opcuaSession) {
      coreBrowser.browse(node.bianco.iiot.opcuaSession, nodeRootId).then(function (browserResult) {
        browserResult.forEach(function (result) {
          if (result.references && result.references.length) {
            result.references.forEach(function (reference) {
              entries.push(coreBrowser.transformToEntry(reference))
            })
          }
        })
        res.json(entries)
      }).catch(function (err) {
        coreBrowser.internalDebugLog('Browser Error ' + err)
        if (node.showErrors) {
          node.error(err, { payload: 'Browse Internal Error' })
        }

        entries.push({
          displayName: { text: 'Objects' },
          nodeId: coreBrowser.core.OBJECTS_ROOT,
          browseName: 'Objects'
        })
        res.json(entries)
      })
    } else {
      res.json(entries)
    }
  })
}
