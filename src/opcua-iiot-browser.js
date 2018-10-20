/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
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

    let node = coreBrowser.initClientNode(this)
    node.items = []
    node.browseTopic = coreBrowser.core.OBJECTS_ROOT
    node.messageList = []

    node.browseErrorHandling = function (err, msg, lists) {
      let results = lists.browserResults || []

      if (err) {
        coreBrowser.internalDebugLog('Browser Error ' + err)
        if (node.showErrors) {
          node.error(err, msg)
        }

        if (coreBrowser.core.isSessionBad(err) && node.connector) {
          node.connector.resetBadSession()
        }
      } else {
        coreBrowser.internalDebugLog('Browse Done With Error')
        if (results.length) {
          coreBrowser.detailDebugLog(results.length + 'items in lists of browser results')
        }
      }
    }

    node.extractDataFromBrowserResults = (browserResultToFilter, lists) => {
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
    }

    node.browse = function (rootNodeId, msg, depth, lists, callback) {
      if (coreBrowser.core.checkSessionNotValid(node.opcuaSession, 'Browse')) {
        return
      }

      coreBrowser.internalDebugLog('Browse Topic To Call Browse ' + rootNodeId)

      coreBrowser.browse(node.opcuaSession, rootNodeId)
        .then(function (browserResults) {
          if (browserResults.length) {
            coreBrowser.detailDebugLog('Browser Result To String: ' + browserResults.toString())
            node.extractDataFromBrowserResults(browserResults, lists)
            if (node.recursiveBrowse) {
              if (depth > 0) {
                let newDepth = depth - 1
                node.browseNodeList(lists.addressItemList, msg, newDepth, lists, callback)
                if (!node.singleBrowseResult) {
                  callback(rootNodeId, depth, msg, lists)
                }
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
          node.browseErrorHandling(err, msg, lists)
        })
    }

    node.createListsObject = () => {
      return {
        nodesToBrowse: [],
        nodesToRead: [],
        addressItemList: [],
        browserResults: []
      }
    }

    node.browseNodeList = function (addressSpaceItems, msg, depth, lists, callback) {
      if (coreBrowser.core.checkSessionNotValid(node.opcuaSession, 'BrowseList')) {
        return
      }

      coreBrowser.internalDebugLog('Browse For NodeId List')
      let rootNode = 'list'

      if (node.opcuaSession) {
        coreBrowser.browseAddressSpaceItems(node.opcuaSession, addressSpaceItems)
          .then(function (browserResults) {
            coreBrowser.detailDebugLog('List Browser Result To String: ' + browserResults.toString())
            node.extractDataFromBrowserResults(browserResults, lists)
            if (node.recursiveBrowse) {
              if (depth > 0) {
                let newDepth = depth - 1
                let subLists = node.createListsObject()
                node.browseNodeList(lists.addressItemList, msg, newDepth, subLists, callback)
                if (!node.singleBrowseResult) {
                  callback(rootNode, depth, msg, lists)
                }
              } else {
                coreBrowser.internalDebugLog('Minimum Depth Reached On Browse List')
                callback(rootNode, depth, msg, lists)
              }
            } else {
              callback(rootNode, depth, msg, lists)
            }
          }).catch(function (err) {
            node.browseErrorHandling(err, msg, lists)
          })
      }
    }

    node.sendMessage = function (rootNodeId, depth, originMessage, lists) {
      let msg = Object.assign({}, originMessage)
      msg.nodetype = 'browse'
      msg.justValue = node.justValue

      if (!lists) {
        coreBrowser.internalDebugLog('Lists Not Valid!')
        if (node.showErrors) {
          node.error(new Error('Lists Not Valid On Browse Send Message'), msg)
        }
      }

      let listenerParameters = node.getListenParameters(msg)

      msg.payload = {
        rootNodeId,
        browserResults: lists.browserResults,
        recursiveBrowse: node.recursiveBrowse,
        recursiveDepth: depth,
        recursiveDepthMax: node.recursiveDepth,
        listenerParameters
      }

      msg = node.enhanceMessage(msg, lists)
      msg = node.setMessageLists(msg, lists)

      node.messageList.push(msg)

      if (node.showStatusActivities && node.status.text !== 'active') {
        coreBrowser.core.setNodeStatusTo(node, 'active')
      }

      setTimeout(() => {
        node.send(node.messageList.shift())
      }, node.delayPerMessage * coreBrowser.core.FAKTOR_SEC_TO_MSEC)
    }

    node.getListenParameters = function (msg) {
      if (msg.injectType === 'listen') {
        return msg.payload
      } else {
        return null
      }
    }

    node.enhanceMessage = function (msg, lists) {
      if (!node.justValue) {
        msg.payload.browseTopic = node.browseTopic
        msg.payload.addressSpaceItems = msg.addressSpaceItems
        msg.payload.browserResultsCount = lists.browserResults.length
        if (node.connector) {
          msg.payload.endpoint = node.connector.endpoint
        }
        msg.payload.session = (node.opcuaSession) ? node.opcuaSession.name : 'none'
      } else {
        msg.payload.browserResults = lists.addressItemList
      }
      return msg
    }

    node.setMessageLists = function (msg, lists) {
      if (node.sendNodesToRead && lists.nodesToRead) {
        msg.nodesToRead = lists.nodesToRead
        msg.nodesToReadCount = lists.nodesToRead.length
      }

      if (node.sendNodesToListener && lists.addressItemList) {
        msg.addressItemsToRead = lists.addressItemList
        msg.addressItemsToReadCount = lists.addressItemList.length
      }

      if (node.sendNodesToBrowser && lists.addressItemList) {
        msg.addressItemsToBrowse = lists.addressItemList
        msg.addressItemsToBrowseCount = lists.addressItemList.length
      }
      return msg
    }

    node.browseSendResult = function (rootNodeId, depth, msg, lists) {
      coreBrowser.internalDebugLog(rootNodeId + ' called by depth ' + depth)

      if (node.singleBrowseResult) {
        if (depth <= 0) {
          node.sendMessage(rootNodeId, depth, msg, lists)
          node.reset(lists)
        }
      } else {
        node.sendMessage(rootNodeId, depth, msg, lists)
        node.reset(lists)
      }
    }

    node.reset = function (lists) {
      lists = node.createListsObject()
    }

    node.startBrowser = function (msg) {
      if (coreBrowser.core.checkSessionNotValid(node.opcuaSession, 'Browser')) {
        return
      }

      let lists = node.createListsObject()
      let depth = (node.recursiveBrowse) ? node.recursiveDepth : 0
      node.browseTopic = coreBrowser.extractNodeIdFromTopic(msg, node) // set topic to the node object for HTTP requests at node

      if (node.browseTopic && node.browseTopic !== '') {
        node.browse(node.browseTopic, msg, depth, lists, (rootNodeId, depth, msg, subLists) => {
          node.browseSendResult(rootNodeId, depth, msg, subLists)
        })
      } else {
        if (msg.addressItemsToBrowse && msg.addressItemsToBrowse.length > 0) {
          msg.addressSpaceItems = msg.addressItemsToBrowse
        }

        if (msg.addressSpaceItems && msg.addressSpaceItems.length > 0) {
          node.browseNodeList(msg.addressSpaceItems, msg, depth, lists, (rootNodeId, depth, msg, subLists) => {
            node.browseSendResult(rootNodeId, depth, msg, subLists)
          })
        } else {
          coreBrowser.detailDebugLog('Fallback NodeId On Browse Without AddressSpace Items')
          node.browseTopic = node.nodeId || coreBrowser.browseToRoot()
          node.browse(node.browseTopic, msg, depth, lists, (rootNodeId, depth, msg, subLists) => {
            node.browseSendResult(rootNodeId, depth, msg, subLists)
          })
        }
      }
    }

    node.on('input', function (msg) {
      if (!coreBrowser.core.checkConnectorState(node, msg, 'Browser')) {
        return
      }

      if (node.showStatusActivities) {
        coreBrowser.core.setNodeStatusTo(node, 'browsing')
      }
      node.startBrowser(msg)
    })

    coreBrowser.core.registerToConnector(node)

    node.on('close', (done) => {
      coreBrowser.core.deregisterToConnector(node, done)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Browser', OPCUAIIoTBrowser)

  RED.httpAdmin.get('/opcuaIIoT/browse/:id/:nodeId', RED.auth.needsPermission('opcuaIIoT.browse'), function (req, res) {
    let node = RED.nodes.getNode(req.params.id)
    let entries = []
    let nodeRootId = decodeURIComponent(req.params.nodeId) || coreBrowser.core.OBJECTS_ROOT
    coreBrowser.detailDebugLog('request for ' + req.params.nodeId)

    if (node.opcuaSession) {
      coreBrowser.browse(node.opcuaSession, nodeRootId).then(function (browserResult) {
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
          node.error(err, {payload: 'Browse Internal Error'})
        }

        entries.push({
          displayName: {text: 'Objects'},
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
