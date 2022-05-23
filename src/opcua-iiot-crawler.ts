/*
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import {Todo} from "./types/placeholders";
import {NodeMessageInFlow} from "@node-red/registry";
import {
  checkCrawlerItemIsNotToFilter,
  checkItemForUnsetState,
  checkSessionNotValid,
  deregisterToConnector,
  FAKTOR_SEC_TO_MSEC,
  registerToConnector,
  resetIiotNode,
  setNodeStatusTo
} from "./core/opcua-iiot-core";
import coreBrowser, {BrowserInputPayloadLike} from "./core/opcua-iiot-core-browser";
import {Node, NodeAPI, NodeDef, NodeMessage, NodeStatus} from "node-red";
import {NodeCrawlerClientSession} from "node-opcua-client-crawler/source/node_crawler_base";
import {InjectPayload} from "./opcua-iiot-inject";
import {DataValue} from "node-opcua";
import {CompressedBrowseResult} from "./core/opcua-iiot-core-response";

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
  timeout: number
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
  timeout: number
  connector: string
}

type CrawlerMessage = NodeMessageInFlow & {
  payload: CrawlerPayload
}

export interface CrawlerPayload extends Omit<InjectPayload, 'nodetype'> {
  crawlerResults: (CrawlerResult | Error)[]
  browseTopic?: string
  crawlerResultsCount?: number
  endpoint?: string
  session?: string
  nodetype?: 'crawl'
  resultsConverted?: string
  error?: string
  value: CrawlerResult[] | CompressedBrowseResult[]
}

export type CrawlerResult = {
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

  function OPCUAIIoTCrawler(this: OPCUAIIoTCrawler & Todo, config: OPCUAIIoTCrawlerDef) {
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
    this.timeout = config.timeout || 30

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

    const crawl = async (session: Todo, payload: BrowserInputPayloadLike, statusHandler: (status: string | NodeStatus) => void) => {
      if (checkSessionNotValid(nodeConfig.connector.iiot.opcuaSession, 'Crawler')) {
        return
      }

      coreBrowser.internalDebugLog('Browse Topic To Call Crawler ' + nodeConfig.browseTopic)

      if (nodeConfig.showStatusActivities && nodeConfig.oldStatusParameter) {
        nodeConfig.oldStatusParameter = setNodeStatusTo(nodeConfig, 'crawling', nodeConfig.oldStatusParameter, nodeConfig.showStatusActivities, statusHandler)
      }
      coreBrowser.crawl(session, nodeConfig.browseTopic, payload, getSendWrapper(payload))

    }

    const callError = (err: Error, msg: NodeMessageInFlow) => {
      this.error(err, msg)
    }
    const statusHandler = (status: string | NodeStatus) => {
      this.status(status)
    }

    const crawlForSingleResult = function (session: NodeCrawlerClientSession, payload: BrowserInputPayloadLike) {
      coreBrowser.crawlAddressSpaceItems(session, payload, getSendWrapper(payload), nodeConfig.timeout)
    }

    type PromiseResult = {
      status: string,
      value: Error | Todo
    }

    const handleResultArray = (results: PromiseResult[], payload: Todo) => {
      // map each result 1-to-1 input to output
      const crawlerResult = results.map(function (result) {
        if (result.value instanceof Error) {
          return result.value.toString()
        } else {
          return result.value
        }
      })

      // combine the valid results into payload.value
      const value = results.filter((result) => {
        return !(result.value instanceof Error)
      }).flatMap((result) => {
        return result.value
      })

      // list errors in payload.error
      const error = results.filter((result) => {
        return (result.value instanceof Error)
      }).map((result) => {
        return result.value
      })

      if (error.length > 0) {
        payload.error = error
      }
      payload.value = value

      sendMessage(payload, crawlerResult)
    }

    /**
     * Returns a sendWrapper function with the correct payload context
     */
    const getSendWrapper = (payload: BrowserInputPayloadLike) => {
      return (result: Error | Todo) => {
        if (result.promises) {
          handleResultArray(result.crawlerResult, payload)
        } else if (result instanceof Error) {
          coreBrowser.browseErrorHandling(nodeConfig, result, payload, undefined, callError, statusHandler, nodeConfig.oldStatusParameter, nodeConfig.showErrors, nodeConfig.showStatusActivities)
        } else {
          coreBrowser.internalDebugLog(result.rootNodeId + ' Crawler Results ' + result.crawlerResult.length);
          const filteredResults = filterCrawlerResults(result.crawlerResult);
          (payload as Todo).value = [filteredResults]
          sendMessage(payload as FlatMessage<CrawlerPayload>, filteredResults)
        }
      }
    }

    const crawlForResults = function (session: NodeCrawlerClientSession, payload: BrowserInputPayloadLike) {
      payload.addressSpaceItems?.forEach((entry) => {
        coreBrowser.crawl(session, entry.nodeId, payload, getSendWrapper(payload))

      })
    }

    const crawlNodeList = function (session: NodeCrawlerClientSession, payload: BrowserInputPayloadLike) {
      if (nodeConfig.showStatusActivities && nodeConfig.oldStatusParameter) {
        nodeConfig.oldStatusParameter = setNodeStatusTo(nodeConfig, 'crawling', nodeConfig.oldStatusParameter, nodeConfig.showStatusActivities, statusHandler)
      }
      if (nodeConfig.singleResult) {
        crawlForSingleResult(session, payload)
      } else {
        crawlForResults(session, payload)
      }
    }

    interface FlatMessage<T extends object> extends CrawlerPayload {
      _msgid: string,
      topic: string,
    }

    const sendMessage = (payload: FlatMessage<CrawlerPayload>, crawlerResult: Todo) => {
      const {
        _msgid,
        topic,
        ...restMessage
      } = payload;

      restMessage.nodetype = 'crawl'

      try {
        RED.util.setMessageProperty(restMessage, 'crawlerResults', JSON.parse(JSON.stringify(crawlerResult, null, 2)))
      } catch (err: any) {
        coreBrowser.internalDebugLog(err)
        if (nodeConfig.showErrors) {
          this.error(err, restMessage)
        }
        restMessage.resultsConverted = JSON.stringify(crawlerResult, null, 2)
        restMessage.error = err.message
      }

      if (nodeConfig.browseTopic && nodeConfig.browseTopic !== '') {
        restMessage.browseTopic = nodeConfig.browseTopic
      }

      if (!nodeConfig.justValue) {
        restMessage.crawlerResultsCount = crawlerResult.length
        if (nodeConfig.connector) {
          restMessage.endpoint = nodeConfig.connector.endpoint
        }
        restMessage.session = nodeConfig.connector.iiot.opcuaSession.name || 'none'
      }

      const msg = {
        _msgid,
        topic,
        payload: restMessage
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

    const startCrawling = async (payload: BrowserInputPayloadLike) => {
      if (!nodeConfig.connector.iiot.opcuaSession) {
        nodeConfig.connector.iiot.stateMachine.initopcua()
      }
      if (nodeConfig.browseTopic && nodeConfig.browseTopic !== '') {
        crawl(nodeConfig.connector.iiot.opcuaSession, payload, statusHandler)

      } else {
        if (payload.addressSpaceItems && payload.addressSpaceItems.length) {
          coreBrowser.internalDebugLog('Start Crawling On AddressSpace Items')
          crawlNodeList(nodeConfig.connector.iiot.opcuaSession, payload)
        } else {
          this.error(new Error('No AddressSpace Items Or Root To Crawl'), payload)
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

    type enhancedPayload = BrowserInputPayloadLike & {
      _msgid: string
      topic: string | undefined
    }

    this.on('input', function (msg: NodeMessageInFlow) {
      const payload = msg.payload as enhancedPayload
      nodeConfig.browseTopic = coreBrowser.extractNodeIdFromTopic(payload, nodeConfig);
      payload._msgid = msg._msgid;
      payload.topic = msg.topic;

      startCrawling(msg.payload as BrowserInputPayloadLike).finally()
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
