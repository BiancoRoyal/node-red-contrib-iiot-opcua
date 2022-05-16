/**
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

import {BrowserNode, BrowserNodeAttributes, Todo} from "../types/placeholders";
import {initCoreNode, isSessionBad, OBJECTS_ROOT, setNodeStatusTo} from "./opcua-iiot-core";
import {BrowseDirection, NodeCrawler} from "node-opcua";

import debug from 'debug';
import {Node, NodeStatus} from "node-red";
import {NodeMessageInFlow} from "@node-red/registry";

const internalDebugLog = debug('opcuaIIoT:browser') // eslint-disable-line no-use-before-define
const detailDebugLog = debug('opcuaIIoT:browser:details') // eslint-disable-line no-use-before-define
const crawlerInternalDebugLog =debug('opcuaIIoT:browser:crawler') // eslint-disable-line no-use-before-define
const crawlerDetailDebugLog =debug('opcuaIIoT:browser:crawler:details') // eslint-disable-line no-use-before-define


const browse = function (session: Todo, nodeIdToBrowse: Todo) {
  return new Promise(
    function (resolve, reject) {
      let browseOptions = [
        {
          nodeId: nodeIdToBrowse,
          referenceTypeId: 'Organizes',
          includeSubtypes: true,
          browseDirection: BrowseDirection.Forward,
          resultMask: 63
        },
        {
          nodeId: nodeIdToBrowse,
          referenceTypeId: 'Aggregates',
          includeSubtypes: true,
          browseDirection: BrowseDirection.Forward,
          resultMask: 63
        }
      ]

      session.browse(browseOptions, function (err: Error, browseResult: Todo) {
        if (err) {
          reject(err)
        } else {
          resolve(browseResult)
        }
      })
    }
  )
}

const browseAddressSpaceItems = function (session: Todo, addressSpaceItems: Todo) {
  return new Promise(
    function (resolve, reject) {
      let browseOptions: Todo[] = []

      addressSpaceItems.forEach(function (item: Todo) {
        browseOptions.push({
          nodeId: item.nodeId,
          referenceTypeId: 'Organizes',
          includeSubtypes: true,
          browseDirection: BrowseDirection.Forward,
          resultMask: 63
        })

        browseOptions.push({
          nodeId: item.nodeId,
          referenceTypeId: 'Aggregates',
          includeSubtypes: true,
          browseDirection: BrowseDirection.Forward,
          resultMask: 63
        })
      })

      session.browse(browseOptions, function (err: Error, browseResult: Todo) {
        if (err) {
          reject(err)
        } else {
          resolve(browseResult)
        }
      })
    }
  )
}

const createCrawler = function (session: Todo) {
  return new NodeCrawler(session)
}

const crawl = function (session: Todo, nodeIdToCrawl: Todo, msg: Todo) {
  return new Promise(
    function (resolve, reject) {
      if (!nodeIdToCrawl) {
        reject(new Error('NodeId To Crawl Not Valid'))
        return
      }

      const message = Object.assign({}, msg)
      const crawler = coreBrowser.createCrawler(session)
      let crawlerResult: Todo[] = []

      const data = {
        onBrowse: function (crawler: Todo, cacheNode: Todo) {
          crawlerResult.push(cacheNode)
          NodeCrawler.follow(crawler, cacheNode, this)
        }
      }

      crawler.crawl(nodeIdToCrawl, data, function (err) {
        if (err) {
          reject(err)
        } else {
          resolve({ rootNodeId: nodeIdToCrawl, message, crawlerResult })
        }
      })
    })
}

const crawlAddressSpaceItems = function (session: Todo, msg: Todo) {
  return new Promise(
    function (resolve, reject) {
      if (!msg.addressSpaceItems) {
        reject(new Error('AddressSpace Items Not Valid To Crawl'))
        return
      }

      const message = Object.assign({}, msg)
      const crawler = coreBrowser.createCrawler(session)
      let crawlerResult: Todo[] = []

      const data = {
        onBrowse (crawler: Todo, cacheNode: Todo) {
          if (!cacheNode) {
            coreBrowser.internalDebugLog('Item Not To Crawl - Missing NodeId')
          }
          crawlerResult.push(cacheNode)
          NodeCrawler.follow(crawler, cacheNode, this)
        }
      }

      message.addressSpaceItems.forEach((item: Todo) => {
        if (!item.nodeId) {
          coreBrowser.internalDebugLog('Item Not To Crawl - Missing NodeId')
          return
        }

        crawler.crawl(item.nodeId, data, function (err) {
          if (err) {
            reject(err)
          } else {
            resolve({ rootNodeId: item.nodeId, message, crawlerResult })
          }
        })
      })
    })
}

const browseToRoot = function () {
  detailDebugLog('Browse To Root ' + OBJECTS_ROOT)
  return OBJECTS_ROOT
}

const extractNodeIdFromTopic = function (msg: Todo, node: Todo) {
  let rootNodeId = null

  if (msg.payload.actiontype === 'browse') { // event driven browsing
    if (msg.payload.root && msg.payload.root.nodeId) {
      internalDebugLog('Root Selected External ' + msg.payload.root)
      rootNodeId = msg.payload.root.nodeId
    } else {
      rootNodeId = node.nodeId
    }
    detailDebugLog('Extracted NodeId ' + rootNodeId)

    rootNodeId = rootNodeId || browseToRoot()
  }

  return rootNodeId
}

const transformToEntry = function (reference: Todo) {
  if (reference) {
    try {
      return reference.toJSON()
    } catch (err) {
      internalDebugLog(err)

      if (reference.referenceTypeId) {
        return {
          referenceTypeId: reference.referenceTypeId.toString(),
          isForward: reference.isForward,
          nodeId: reference.nodeId.toString(),
          browseName: reference.browseName.toString(),
          displayName: reference.displayName.toString(),
          nodeClass: reference.nodeClass.toString(),
          typeDefinition: reference.typeDefinition.toString()
        }
      }
    }
  } else {
    internalDebugLog('Empty Reference On Browse')
  }
  return reference
}

const initBrowserNode = function (): BrowserNodeAttributes {
  return {
    browseTopic: OBJECTS_ROOT,
    iiot:{
      ...initCoreNode(),
      items: [],
      messageList: [],
      delayMessageTimer: []
    }
  }
}

const browseErrorHandling = function (node: BrowserNode, err: Error, msg: Todo, lists: Todo, oldStatusParameter: NodeStatus | undefined = undefined, showErrors: boolean = true, showStatusActivities: boolean = true) {
  let results = lists?.browserResults || []

  if (err) {
    internalDebugLog(typeof node + 'Error ' + err)
    if (showErrors) {
      node.error(err, msg)
    }

    if (isSessionBad(err)) {
      node.emit('opcua_client_not_ready')
    }
  } else {
    internalDebugLog(typeof node + ' Done With Error')
    if (results.length) {
      detailDebugLog(results.length + 'items in lists of browser results')
    }
  }

  if (showStatusActivities && oldStatusParameter) {
    node.oldStatusParameter = setNodeStatusTo(node, 'error', oldStatusParameter, showStatusActivities)
  }
}

const coreBrowser = {
  internalDebugLog,
  detailDebugLog,
  crawlerInternalDebugLog,
  crawlerDetailDebugLog,

  // Browser functions
  browse,
  browseAddressSpaceItems,
  createCrawler,
  crawl,
  crawlAddressSpaceItems,
  browseToRoot,
  extractNodeIdFromTopic,
  transformToEntry,
  initBrowserNode,
  browseErrorHandling,
}

export default coreBrowser;
