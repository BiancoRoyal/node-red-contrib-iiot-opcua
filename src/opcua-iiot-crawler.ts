/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import {Todo} from "./types/placeholders";
import {Node, NodeMessageInFlow} from "@node-red/registry";
import {
  checkCrawlerItemIsNotToFilter,
  checkItemForUnsetState, checkSessionNotValid,
  deregisterToConnector, FAKTOR_SEC_TO_MSEC,
  registerToConnector,
  resetIiotNode,
  setNodeStatusTo
} from "./core/opcua-iiot-core";
import coreBrowser, {BrowserInputPayloadLike} from "./core/opcua-iiot-core-browser";
import {NodeAPI, NodeDef, NodeMessage, NodeStatus} from "node-red";
import {NodeCrawlerClientSession} from "node-opcua-client-crawler/source/node_crawler_base";
import {InjectMessage, InjectPayload} from "./opcua-iiot-inject";
import {DataValue} from "node-opcua";

interface OPCUAIIoTCrawler extends Node {
  name: string
  justValue: Todo
  singleResult: Todo
  showStatusActivities: boolean
  showErrors: boolean
  activateUnsetFilter: Todo
  activateFilters: Todo
  negateFilter: Todo
  filters: Todo
  delayPerMessage: number
  connector: Node
}
interface OPCUAIIoTCrawlerDef extends NodeDef {
  name: string
  justValue: Todo
  singleResult: Todo
  showStatusActivities: boolean
  showErrors: boolean
  activateUnsetFilter: Todo
  activateFilters: Todo
  negateFilter: Todo
  filters: Todo
  delayPerMessage: number
  connector: string
}

type CrawlerMessage = NodeMessageInFlow & {
  payload: CrawlerPayload
}

type CrawlerPayload = InjectPayload & {
  crawlerResults: CrawlerResult[]
}

type CrawlerResult = {
  nodeId: string
  nodeClass: number
  typeDefinition: string
  browseName: {
    name: string
    namespaceIndex: number
  }
  displayName: {
    locale: string
    text: string
  }
  description: {
    locale?: string
    text?: string
  }
  dataType?: string
  dataValue?: DataValue
  valueRank?: number
  minimumSamplingInterval?: number
  accessLevel?: number
  userAccessLevel?: number
} & CrawlerParent

type CrawlerParent = {
  parent?: CrawlerResult
  referenceToParent?: CrawlerResult
}


/**
 * Crawler Node-RED nodeConfig.
 *
 * @param RED
 */
module.exports = (RED: NodeAPI) => {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTCrawler (this: OPCUAIIoTCrawler & Todo, config: OPCUAIIoTCrawlerDef) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.justValue = config.justValue
    this.singleResult = config.singleResult
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.activateUnsetFilter = config.activateUnsetFilter
    this.activateFilters = config.activateFilters
    this.negateFilter = config.negateFilter
    this.filters = config.filters
    this.delayPerMessage = config.delayPerMessage || 0.2

    this.connector = RED.nodes.getNode(config.connector)

    let nodeConfig: Todo = this;
    const {iiot, browseTopic} = coreBrowser.initBrowserNode();
    nodeConfig.browseTopic = browseTopic;
    nodeConfig.iiot = iiot;


    nodeConfig.iiot.delayMessageTimer = []

    const filterCrawlerResults = function (crawlerResultToFilter: Todo[]) {
      let crawlerResult = crawlerResultToFilter || []
      let filteredEntries: Todo[] = []

      if (nodeConfig.activateFilters && nodeConfig.filters && nodeConfig.filters.length > 0) {
        crawlerResult.forEach(function (item) {
          if (itemIsNotToFilter(item)) {
            filteredEntries.push(item)
          }
        })
        crawlerResult = filteredEntries
      }

      if (nodeConfig.justValue) {
        crawlerResult.forEach(function (item) {
          if (item.references) {
            delete item['references']
          }
        })
      }

      return crawlerResult
    }

    const itemIsNotToFilter = function (item: Todo) {
      let result = checkItemForUnsetState(nodeConfig, item)

      if (result) {
        nodeConfig.filters.forEach(function (element: Todo) {
          result = checkCrawlerItemIsNotToFilter(nodeConfig, item, element, result)
        })
      }

      return (nodeConfig.negateFilter) ? !result : result
    }

    const crawl = function (session: Todo, msg: BrowserInputPayloadLike, statusHandler: (status: string | NodeStatus) => void) {
      if (checkSessionNotValid(nodeConfig.iiot.opcuaSession, 'Crawler')) {
        return
      }

      coreBrowser.internalDebugLog('Browse Topic To Call Crawler ' + nodeConfig.browseTopic)

      if (nodeConfig.showStatusActivities && nodeConfig.oldStatusParameter) {
        nodeConfig.oldStatusParameter = setNodeStatusTo(nodeConfig, 'crawling', nodeConfig.oldStatusParameter, nodeConfig.showStatusActivities, statusHandler)
      }
      coreBrowser.crawl(session, nodeConfig.browseTopic, msg)
        .then(function (result: Todo) {
          coreBrowser.internalDebugLog(result.rootNodeId + ' Crawler Results ' + result.crawlerResult.length)
          sendMessage(result.message, filterCrawlerResults(result.crawlerResult))
        }).catch(function (err: Todo) {
          coreBrowser.browseErrorHandling(nodeConfig, err, msg, undefined, callError, statusHandler, nodeConfig.oldStatusParameter, nodeConfig.showErrors, nodeConfig.showStatusActivities)
        })
    }

    const callError = (err: Error, msg: NodeMessageInFlow) => {
      this.error(err, msg)
    }
    const statusHandler = (status: string | NodeStatus) => {
      this.status(status)
    }

    const crawlForSingleResult = function (session: Todo, msg: BrowserInputPayloadLike) {
      coreBrowser.crawlAddressSpaceItems(session, msg)
        .then(function (result: Todo) {
          coreBrowser.internalDebugLog(result.rootNodeId + ' Crawler Results ' + result.crawlerResult.length)
          sendMessage(result.message, filterCrawlerResults(result.crawlerResult))
        }).catch(function (err: Todo) {
          coreBrowser.browseErrorHandling(nodeConfig, err, msg, undefined, callError, statusHandler, nodeConfig.oldStatusParameter, nodeConfig.showErrors, nodeConfig.showStatusActivities)
        })
    }

    const crawlForResults = function (session: NodeCrawlerClientSession, msg: BrowserInputPayloadLike) {
      msg.addressSpaceItems?.map((entry) => {
        coreBrowser.crawl(session, entry.nodeId, msg)
          .then(function (result: Todo) {
            coreBrowser.internalDebugLog(result.rootNodeId + ' Crawler Results ' + result.crawlerResult.length)
            sendMessage(result.message, filterCrawlerResults(result.crawlerResult))
          }).catch(function (err: Todo) {
            coreBrowser.browseErrorHandling(nodeConfig, err, msg, undefined, callError, statusHandler, nodeConfig.oldStatusParameter, nodeConfig.showErrors, nodeConfig.showStatusActivities)
          })
      })
    }

    const crawlNodeList = function (session: NodeCrawlerClientSession, msg: BrowserInputPayloadLike) {
      if (nodeConfig.showStatusActivities && nodeConfig.oldStatusParameter) {
        nodeConfig.oldStatusParameter = setNodeStatusTo(nodeConfig, 'crawling', nodeConfig.oldStatusParameter, nodeConfig.showStatusActivities, statusHandler)
      }
      if (nodeConfig.singleResult) {
        crawlForSingleResult(session, msg)
      } else {
        crawlForResults(session, msg)
      }
    }

    const sendMessage = (originMessage: Todo, crawlerResult: Todo) => {
      let msg = Object.assign({}, originMessage)
      msg.nodetype = 'crawl'

      try {
        RED.util.setMessageProperty(msg, 'crawlerResults', JSON.parse(JSON.stringify(crawlerResult, null, 2)))
      } catch (err: any) {
        coreBrowser.internalDebugLog(err)
        if (nodeConfig.showErrors) {
          this.error(err, msg)
        }
        msg.resultsConverted = JSON.stringify(crawlerResult, null, 2)
        msg.error = err.message
      }

      if (nodeConfig.browseTopic && nodeConfig.browseTopic !== '') {
        msg.payload.browseTopic = nodeConfig.browseTopic
      }

      if (!nodeConfig.justValue) {
        msg.payload.crawlerResultsCount = crawlerResult.length
        if (nodeConfig.connector) {
          msg.payload.endpoint = nodeConfig.connector.endpoint
        }
        msg.payload.session = nodeConfig.iiot.opcuaSession.name || 'none'
      }

      nodeConfig.iiot.messageList.push(msg)

      if (nodeConfig.showStatusActivities && nodeConfig.oldStatusParameter) {
        nodeConfig.oldStatusParameter = setNodeStatusTo(nodeConfig, 'active', nodeConfig.oldStatusParameter, nodeConfig.showStatusActivities, statusHandler)
      }

      // TODO: maybe here RED.util.set ...

      nodeConfig.iiot.delayMessageTimer.push(setTimeout(() => {
        this.send(nodeConfig.iiot.messageList.shift())
      }, nodeConfig.delayPerMessage * FAKTOR_SEC_TO_MSEC))
    }

    const resetAllTimer = function () {
      nodeConfig.iiot.delayMessageTimer.forEach((timerId: Todo) => {
        clearTimeout(timerId)
        timerId = null
      })
    }

    const startCrawling = async (msg: BrowserInputPayloadLike) => {
      if (!nodeConfig.iiot.opcuaSession) {
        nodeConfig.connector.iiot.stateMachine.initopcua()
        const returnCode = await nodeConfig.connector.functions.waitForExist(nodeConfig.connector.iiot, 'opcuaSession').catch((err: Error) => {return -1})
      }
      if (nodeConfig.browseTopic && nodeConfig.browseTopic !== '') {
        crawl(nodeConfig.iiot.opcuaSession, msg, statusHandler)

      } else {
        if (msg.addressSpaceItems && msg.addressSpaceItems.length) {
          coreBrowser.internalDebugLog('Start Crawling On AddressSpace Items')
          crawlNodeList(nodeConfig.connector.iiot.opcuaSession, msg)
        } else {
          this.error(new Error('No AddressSpace Items Or Root To Crawl'), msg)
        }
      }
    }

    const errorHandler = (err: Error, msg: NodeMessage) => {
      this.error(err, msg)
    }

    const setStatus = (status: string | NodeStatus) => {
      this.status(status)
    }

    const emitHandler = (msg: string) => {
      this.emit(msg)
    }

    const onAlias = (event: string, callback: () => void) => {
      this.on(event, callback)
    }

    this.on('input', function (msg: NodeMessageInFlow) {
      console.log('msg received in crawler')
      nodeConfig.browseTopic = coreBrowser.extractNodeIdFromTopic((msg.payload as BrowserInputPayloadLike), nodeConfig)
      startCrawling((msg.payload as BrowserInputPayloadLike)).finally()
    })

    registerToConnector(this, setStatus, onAlias, errorHandler)

    this.on('close', (done: () => void) => {
      deregisterToConnector(this, () => {
        resetIiotNode(this)
        done()
      })
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Crawler', OPCUAIIoTCrawler)
}
