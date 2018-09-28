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
  let browserEntries = []

  function OPCUAIIoTBrowser (config) {
    RED.nodes.createNode(this, config)
    this.nodeId = config.nodeId
    this.name = config.name
    // this.browseAll = config.browseAll
    this.justValue = config.justValue
    this.sendNodesToRead = config.sendNodesToRead
    this.sendNodesToBrowser = config.sendNodesToBrowser
    this.sendNodesToListener = config.sendNodesToListener
    this.singleBrowseResult = config.singleBrowseResult
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.recursiveBrowse = config.recursiveBrowse
    this.recursiveDepth = config.recursiveDepth || 1
    this.connector = RED.nodes.getNode(config.connector)

    let node = this
    node.items = []
    node.browseTopic = coreBrowser.core.OBJECTS_ROOT
    node.opcuaClient = null
    node.opcuaSession = null
    node.reconnectTimeout = 1000

    node.setNodeStatusTo = function (statusValue) {
      let statusParameter = coreBrowser.core.getNodeStatus(statusValue, node.showStatusActivities)
      node.status({fill: statusParameter.fill, shape: statusParameter.shape, text: statusParameter.status})
    }

    node.browseErrorHandling = function (err, msg) {
      let results = []
      if (err) {
        results.push({
          displayName: {text: 'Objects'},
          nodeId: coreBrowser.core.OBJECTS_ROOT,
          browseName: 'Objects'
        })

        coreBrowser.internalDebugLog('Browser Error ' + err)
        if (node.showErrors) {
          node.error(err, msg)
        }

        if (coreBrowser.core.isSessionBad(err) && node.connector) {
          node.connector.resetBadSession()
        }
      } else {
        results = browserEntries
        coreBrowser.internalDebugLog('Browse Done With Error: ' + results.length + ' item(s)')
      }

      browserEntries = results
    }

    node.getExtractItemsFromList = (browserResult, nodesToRead, addressItemList) => {
      browserResult.forEach(function (result) {
        result.references.forEach(function (reference) {
          coreBrowser.detailDebugLog('Add Reference To List :' + reference)
          browserEntries.push(coreBrowser.transformToEntry(reference))
          if (reference.nodeId) {
            nodesToRead.push(reference.nodeId.toString())
            addressItemList.push({ name: reference.browseName.name, nodeId: reference.nodeId.toString(), datatypeName: reference.typeDefinition.toString() })
          }
        })
      })
    }

    node.browse = function (rootNodeId, msg, depth, nodesToBrowse, addressItemList, callback) {
      coreBrowser.internalDebugLog('Browse Topic To Call Browse ' + rootNodeId)
      if (node.opcuaSession) {
        coreBrowser.browse(node.opcuaSession, rootNodeId)
          .then(function (browserResult) {
            if (browserResult.length) {
              node.getExtractItemsFromList(browserResult, nodesToBrowse, addressItemList)
              if (node.recursiveBrowse) {
                if (depth > 0) {
                  let newDepth = depth - 1
                  nodesToBrowse.forEach((item) => {
                    let nodesToSubBrowse = []
                    let addressItemListSub = []
                    node.browse(item, msg, newDepth, nodesToSubBrowse, addressItemListSub, callback)
                  })
                } else {
                  coreBrowser.internalDebugLog('Minimum Depth Reached On Browse At ' + rootNodeId)
                }
              }

              callback(rootNodeId, depth, msg, nodesToBrowse, addressItemList)
            } else {
              coreBrowser.internalDebugLog('No Browse Results On ' + rootNodeId)
            }
          }).catch(function (err) {
            node.browseErrorHandling(err, msg)
          })
      }
    }

    node.browseNodeList = function (addressSpaceItems, msg, depth, nodesToBrowse, addressItemList, callback) {
      coreBrowser.internalDebugLog('Browse For NodeId List')
      if (node.opcuaSession) {
        coreBrowser.browseAddressSpaceItems(node.opcuaSession, addressSpaceItems)
          .then(function (browserResult) {
            node.getExtractItemsFromList(browserResult, nodesToBrowse, addressItemList)

            if (node.recursiveBrowse) {
              if (depth > 0) {
                let newDepth = depth - 1
                let nodesToSubBrowse = []
                let addressItemListSub = []
                node.browseNodeList(addressItemList, msg, newDepth, nodesToSubBrowse, addressItemListSub, callback)
              } else {
                coreBrowser.internalDebugLog('Minimum Depth Reached On Browse List')
              }
            }

            callback(depth, msg, nodesToBrowse, addressItemList)
          }).catch(function (err) {
            node.browseErrorHandling(err, msg)
          })
      }
    }

    node.sendMessage = function (rootNodeId, depth, originMessage, nodesToRead, addressItemList) {
      let msg = originMessage
      msg.nodetype = 'browse'

      msg.payload = {
        browseTopic: node.browseTopic,
        addressSpaceItems: msg.addressSpaceItems,
        rootNodeId,
        browserResults: browserEntries,
        recursiveBrowse: node.recursiveBrowse,
        recursiveDepth: depth,
        recursiveDepthMax: node.recursiveDepth
      }

      if (!node.justValue) {
        msg.payload.browserItemsCount = browserEntries.length
        if (node.connector) {
          msg.payload.endpoint = node.connector.endpoint
        }
        msg.payload.session = (node.opcuaSession) ? node.opcuaSession.name : 'none'
      }

      if (node.sendNodesToRead && nodesToRead) {
        msg.nodesToRead = nodesToRead
        msg.nodesToReadCount = nodesToRead.length
      }

      if (node.sendNodesToListener && addressItemList) {
        msg.addressItemsToRead = addressItemList
        msg.addressItemsToReadCount = addressItemList.length
      }

      if (node.sendNodesToBrowser && addressItemList) {
        msg.addressItemsToBrowse = addressItemList
        msg.addressItemsToBrowseCount = addressItemList.length
      }

      node.send(msg)
    }

    node.browseSendResult = function (rootNodeId, depth, msg, nodesToBrowse, addressItemList) {
      coreBrowser.internalDebugLog(node.browseTopic + ' called by depth ' + depth)

      if (node.singleBrowseResult) {
        if (depth <= 0) {
          node.sendMessage(rootNodeId, depth, msg, nodesToBrowse, addressItemList)
          browserEntries = []
          nodesToBrowse = []
          addressItemList = []
        }
      } else {
        node.sendMessage(rootNodeId, depth, msg, nodesToBrowse, addressItemList)
        browserEntries = []
        nodesToBrowse = []
        addressItemList = []
      }
    }

    node.on('input', function (msg) {
      node.browseTopic = coreBrowser.extractNodeIdFromTopic(msg, node)

      if (node.connector && node.connector.stateMachine.getMachineState() !== 'OPEN') {
        coreBrowser.internalDebugLog('Wrong Client State ' + node.connector.stateMachine.getMachineState() + ' On Browse')
        if (node.showErrors) {
          node.error(new Error('Client Not Open On Browse'), msg)
        }
      }

      if (!node.opcuaSession) {
        node.error(new Error('Session Not Ready To Browse'), msg)
        return
      }

      let nodesToBrowse = []
      let addressItemList = []
      browserEntries = []

      let depth = (node.recursiveBrowse) ? node.recursiveDepth : 0

      if (node.browseTopic && node.browseTopic !== '') {
        node.browse(node.browseTopic, msg, depth, nodesToBrowse, addressItemList, (rootNodeId, depth, msg, nodesToBrowseSub, addressItemListSub) => {
          nodesToBrowse.push(nodesToBrowseSub)
          addressItemList.push(addressItemListSub)
          node.browseSendResult(rootNodeId, depth, msg, nodesToBrowse, addressItemList)
        })
      } else {
        if (msg.addressItemsToBrowse && msg.addressItemsToBrowse.length > 0) {
          msg.addressSpaceItems = msg.addressItemsToBrowse
        }

        if (msg.addressSpaceItems && msg.addressSpaceItems.length > 0) {
          node.browseNodeList(msg.addressSpaceItems, msg, depth, nodesToBrowse, addressItemList, (depth, msg, nodesToBrowseSub, addressItemListSub) => {
            nodesToBrowse.push(nodesToBrowseSub)
            addressItemList.push(addressItemListSub)
            node.browseSendResult('list', depth, msg, nodesToBrowse, addressItemList)
          })
        } else {
          coreBrowser.detailDebugLog('Fallback NodeId On Browse Without AddressSpace Items')
          node.browseTopic = node.nodeId || coreBrowser.browseToRoot()
          node.browse(node.browseTopic, msg, depth, nodesToBrowse, addressItemList, (rootNodeId, depth, msg, nodesToBrowseSub, addressItemListSub) => {
            nodesToBrowse.push(nodesToBrowseSub)
            addressItemList.push(addressItemListSub)
            node.browseSendResult(rootNodeId, depth, msg, nodesToBrowse, addressItemList)
          })
        }
      }
    })

    node.setOPCUAConnected = function (opcuaClient) {
      node.opcuaClient = opcuaClient
      node.setNodeStatusTo('connected')
    }

    node.opcuaSessionStarted = function (opcuaSession) {
      node.opcuaSession = opcuaSession
      node.setNodeStatusTo('active')
    }

    node.connectorShutdown = function (opcuaClient) {
      coreBrowser.internalDebugLog('Connector Shutdown')
      if (opcuaClient) {
        node.opcuaClient = opcuaClient
      }
    }

    if (node.connector) {
      node.connector.on('connected', node.setOPCUAConnected)
      node.connector.on('session_started', node.opcuaSessionStarted)
      node.connector.on('after_reconnection', node.connectorShutdown)

      coreBrowser.core.setNodeInitalState(node.connector.stateMachine.getMachineState(), node)
    } else {
      node.error(new Error('Connector Not Valid'), {payload: 'No connector configured'})
    }
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
        browserEntries = entries
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
        browserEntries = entries
      })
    } else {
      res.json(entries)
      browserEntries = entries
    }
  })
}
