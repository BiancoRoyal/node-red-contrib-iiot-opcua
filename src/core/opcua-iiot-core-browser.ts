/**
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2017,2018,2019,2020,2021,2022 Klaus Landsdorf (https://bianco-royal.space/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

import {Todo} from "../types/placeholders";
import {initCoreNode, isSessionBad, OBJECTS_ROOT, setNodeStatusTo} from "./opcua-iiot-core";
import {
  BrowseDirection,
  BrowseResult,
  CacheNode,
  ClientSession,
  NodeCrawler,
  NodeCrawlerBase,
  NodeCrawlerClientSession,
  UserData
} from "node-opcua";

import debug from 'debug';
import {NodeStatus} from "node-red";
import {NodeMessageInFlow} from "@node-red/registry";
import {NodeIdLike} from "node-opcua-nodeid";
import {ResponseCallback} from "node-opcua-client";
import {DataValue} from "node-opcua-data-value";
import {ErrorCallback} from "node-opcua-status-code";
import {BrowseDescriptionLike} from "node-opcua-client/source/client_session";
import {isUndefined} from "underscore";
import {ReferenceDescription} from "node-opcua-types/dist/_generated_opcua_types";
import {AddressSpaceItem} from "../types/helpers";

const internalDebugLog = debug('opcuaIIoT:browser') // eslint-disable-line no-use-before-define
const detailDebugLog = debug('opcuaIIoT:browser:details') // eslint-disable-line no-use-before-define
const crawlerInternalDebugLog = debug('opcuaIIoT:browser:crawler') // eslint-disable-line no-use-before-define
const crawlerDetailDebugLog = debug('opcuaIIoT:browser:crawler:details') // eslint-disable-line no-use-before-define

export type BrowserInputPayload = {
  root: Todo
  actiontype: string
  addressSpaceItems: AddressSpaceItem[]
  injectType: string,
  manualInject: boolean
}

export type BrowserInputPayloadLike = {
  [k in keyof BrowserInputPayload]?: BrowserInputPayload[k]
}


const browse = (session: Todo, nodeIdToBrowse: Todo) => {
  return new Promise<BrowseResult[]>(
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

      session.browse(browseOptions, (err: Error | null, browseResult?: BrowseResult[]) => {
        if (err) {
          reject(err)
        } else {
          if (isUndefined(browseResult)) {
            reject('Browse Results are Undefined')
          } else {
            resolve(browseResult)
          }
        }
      })
    }
  )
}

const browseAddressSpaceItems = function (session: ClientSession, addressSpaceItems: AddressSpaceItem[]) {
  return new Promise<BrowseResult[]>(
    function (resolve, reject) {
      let browseOptions: BrowseDescriptionLike[] = []

      addressSpaceItems.flatMap(function (item: Todo) {
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


      if (browseOptions.length === 0) {
        resolve([]);
        return;
      }
      session.browse(browseOptions, (err: Error | null, browseResult?: BrowseResult[]) => {
        if (err) {
          reject(err)
        } else {
          if (isUndefined(browseResult)) {
            reject('Browse Results are Undefined')
          } else {
            resolve(browseResult)
          }
        }
      })
    }
  )
}

const createCrawler = function (session: NodeCrawlerClientSession) {
  return new NodeCrawler(session)
}

const crawl = (session: NodeCrawlerClientSession, nodeIdToCrawl: NodeIdLike, msg: BrowserInputPayloadLike, sendWrapper: (result: Error | Todo) => void) => {
  if (!nodeIdToCrawl) {
    return new Error('NodeId To Crawl Not Valid')
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
  try {

    const crawlback: ErrorCallback = (err) => {
      if (err) {
        sendWrapper(err)
      } else {
        sendWrapper({
          crawlerResult,
          rootNodeId: nodeIdToCrawl
        })
      }
    }

    const readCallback: ResponseCallback<DataValue[]> = (err, response) => {
      if (err) {
        sendWrapper(err)
      } else if (response && response.some((res) => res.statusCode?.name === 'BadNodeIdUnknown')) {
        sendWrapper(new Error('NodeId Not Valid: Please enter a valid NodeId, under the "OPC UA Nodes" tab of the Inject Node configuration.'))
      } else {
        crawler.crawl(nodeIdToCrawl, data, crawlback)
      }
    }

    verifyNodeExists(session, nodeIdToCrawl, readCallback)

  } catch (err) {
    return err
  }
}

/**
 * Crawl based on addressSpaceItems from an inject node.
 *
 * This seems needlessly overcomplicated, but that is necessary to avoid UnhandledPromiseRejection errors from the crawl function.
 *
 */
const crawlAddressSpaceItems = (session: NodeCrawlerClientSession, payload: Todo, sendWrapper: (result: Error | Todo) => void, timeout: number) => {
  const crawler = coreBrowser.createCrawler(session)

  const crawlerPromises: Todo = []
  const resolvers: Todo = []


  payload.addressSpaceItems.forEach((item: Todo, index: number) => {
    if (!item.nodeId) {
      coreBrowser.internalDebugLog('Item Not To Crawl - Missing NodeId')
      return
    }

    // Each item should track results itself
    // results will be combined in the payload.value field, but remain independent in payload.crawlerResult
    let crawlerResult: Todo[] = []
    const data: UserData = {
      onBrowse: (crawler: NodeCrawlerBase, cacheNode: CacheNode, userData: UserData) => {
        if (!cacheNode) {
          coreBrowser.internalDebugLog('Item Not To Crawl - Missing NodeId')
        }
        crawlerResult.push(cacheNode)
        NodeCrawler.follow(crawler, cacheNode, userData)
      }
    }

    /**
     * Handle the response of the verifyNodeExists function.
     * If the response doesn't contain any error, then the node exists and it can be crawled..
     */
    const readCallback: ResponseCallback<DataValue[]> = (err, response) => {
      crawlerPromises.push(new Promise((resolve, reject) => {
        resolvers.push({resolve, reject})
        setTimeout(reject, timeout * 1000, new Error('Timeout'))
      }).catch((test) => test))// The catch needs to be here, despite seeming useless

      /**
       * Resolves the promise of the current item.
       * If the current item is the last, wait for all promises to resolve, then call the send function.
       * Intended as a  callback for the crawl function, but also called directly, since this needs to be called every time.
       */
      const crawlback: ErrorCallback = (err) => {
        resolvers[index].resolve(crawlerResult)
        // Ensure only one message is sent
        if (index === payload.addressSpaceItems.length - 1) {
          Promise.allSettled(crawlerPromises).then((promiseList: Todo) => {
            sendWrapper({rootNodeId: item.nodeId, payload, crawlerResult: promiseList, promises: true})
          }).catch((err) => {
            sendWrapper(err)
          })
        }
      }

      // Crawlback must be called in every branch to ensure a message is sent
      if (err) {
        resolvers[index].reject(err)
        crawlback(err)
        return;
      } else if (response && response.some((res) => res.statusCode?.name === 'BadNodeIdUnknown')) {
        const error = new Error('NodeId Not Valid: Please enter a valid NodeId, under the "OPC UA Nodes" tab of the Inject Node configuration.')
        resolvers[index].reject(error)
        crawlback(error)
        return;
      }
      crawler.crawl(item.nodeId, data, crawlback)
    }

    verifyNodeExists(session, item.nodeId, readCallback)

  })
}

const browseToRoot = function () {
  detailDebugLog('Browse To Root ' + OBJECTS_ROOT)
  return OBJECTS_ROOT
}

const extractNodeIdFromTopic = function (payload: BrowserInputPayloadLike, node: Todo) {
  let rootNodeId = null

  if (payload.actiontype === 'browse') { // event driven browsing
    if (payload.root && payload.root.nodeId) {
      internalDebugLog('Root Selected External ' + payload.root)
      rootNodeId = payload.root.nodeId
    } else {
      rootNodeId = node.nodeId
    }
    detailDebugLog('Extracted NodeId ' + rootNodeId)

    rootNodeId = rootNodeId || browseToRoot()
  }

  return rootNodeId
}

export type Entry = {
  referenceTypeId?: string,
  isForward?: boolean,
  nodeId?: string,
  browseName?: string,
  displayName?: string,
  nodeClass?: string,
  typeDefinition?: string,
}

const transformToEntry = (reference: ReferenceDescription): Entry | ReferenceDescription => {
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

const initBrowserNode = function () {
  return {
    browseTopic: OBJECTS_ROOT,
    iiot: {
      ...initCoreNode(),
      items: [],
      messageList: [],
      delayMessageTimer: []
    }
  }
}

const browseErrorHandling = function (
  node: Node & Todo,
  err: Error,
  msg: Todo,
  lists: Todo,
  errorHandler: (err: Error, msg: NodeMessageInFlow) => void,
  statusHandler: (status: string | NodeStatus) => void,
  oldStatusParameter: NodeStatus | undefined = undefined,
  showErrors: boolean = true,
  showStatusActivities: boolean = true,
) {
  let results = lists?.browserResults || []

  if (err) {
    internalDebugLog(typeof node + 'Error ' + err)
    if (showErrors) {
      errorHandler(err, msg)
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
    node.oldStatusParameter = setNodeStatusTo(node, 'error', oldStatusParameter, showStatusActivities, statusHandler)
  }
}

/**
 * Verifies that a node exists and catches the error, sending a nonexistent node to the crawler causes an error
 *
 * The endCallback function should do error checking and then call the crawl function
 */
const verifyNodeExists = (session: NodeCrawlerClientSession, nodeId: Todo, endCallback: ResponseCallback<DataValue[]>) => {
  session.read([{nodeId: nodeId}], endCallback)
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
