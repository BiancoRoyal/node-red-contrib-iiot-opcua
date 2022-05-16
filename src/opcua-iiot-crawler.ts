/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {BrowserNode, Todo} from "./types/placeholders";
import {Node, NodeMessageInFlow} from "@node-red/registry";
import {
  checkConnectorState,
  checkCrawlerItemIsNotToFilter,
  checkItemForUnsetState, checkSessionNotValid,
  deregisterToConnector, FAKTOR_SEC_TO_MSEC,
  registerToConnector,
  resetBiancoNode,
  setNodeStatusTo
} from "./core/opcua-iiot-core";
import coreBrowser from "./core/opcua-iiot-core-browser";
import {NodeStatus} from "node-red";
import {browseAll} from "node-opcua";

interface OPCUAIIoTCrawler extends nodered.Node {
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
interface OPCUAIIoTCrawlerDef extends nodered.NodeDef {
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
/**
 * Crawler Node-RED nodeConfig.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
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

    let nodeConfig: Todo = {
      ...this,
      ...coreBrowser.initBrowserNode()
    }
    //
    // let node = {
    //   ...this,
    //   ...coreBrowser.initBrowserNode()
    // }
    nodeConfig.iiot.delayMessageTimer = []

    const filterCrawlerResults = function (crawlerResultToFilter: Todo[]) {
      let crawlerResult = crawlerResultToFilter || []
      let filteredEntries: Todo[] = []

      if (nodeConfig.activateFilters && nodeConfig.filters && nodeConfig.filters.length > 0) {
        crawlerResult.forEach(function (item) {
          if (nodeConfig.iiot.itemIsNotToFilter(item)) {
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

    const crawl = function (session: Todo, msg: Todo) {
      if (checkSessionNotValid(nodeConfig.iiot.opcuaSession, 'Crawler')) {
        return
      }

      coreBrowser.internalDebugLog('Browse Topic To Call Crawler ' + nodeConfig.browseTopic)

      if (nodeConfig.showStatusActivities && nodeConfig.oldStatusParameter) {
        nodeConfig.oldStatusParameter = setNodeStatusTo(nodeConfig, 'crawling', nodeConfig.oldStatusParameter, nodeConfig.showStatusActivities)
      }

      coreBrowser.crawl(session, nodeConfig.browseTopic, msg)
        .then(function (result: Todo) {
          coreBrowser.internalDebugLog(result.rootNodeId + ' Crawler Results ' + result.crawlerResult.length)
          sendMessage(result.message, filterCrawlerResults(result.crawlerResult))
        }).catch(function (err: Todo) {
          coreBrowser.browseErrorHandling(nodeConfig, err, msg, undefined, nodeConfig.oldStatusParameter, nodeConfig.showErrors, nodeConfig.showStatusActivities)

        })
    }

    const crawlForSingleResult = function (session: Todo, msg: Todo) {
      coreBrowser.crawlAddressSpaceItems(session, msg)
        .then(function (result: Todo) {
          coreBrowser.internalDebugLog(result.rootNodeId + ' Crawler Results ' + result.crawlerResult.length)
          sendMessage(result.message, filterCrawlerResults(result.crawlerResult))
        }).catch(function (err: Todo) {
          coreBrowser.browseErrorHandling(nodeConfig, err, msg, undefined, nodeConfig.oldStatusParameter, nodeConfig.showErrors, nodeConfig.showStatusActivities)
        })
    }

    const crawlForResults = function (session: Todo, msg: Todo) {
      msg.addressSpaceItems.map((entry: Todo) => {
        coreBrowser.crawl(session, entry.nodeId, msg)
          .then(function (result: Todo) {
            coreBrowser.internalDebugLog(result.rootNodeId + ' Crawler Results ' + result.crawlerResult.length)
            sendMessage(result.message, filterCrawlerResults(result.crawlerResult))
          }).catch(function (err: Todo) {
            coreBrowser.browseErrorHandling(nodeConfig, err, msg, undefined, nodeConfig.oldStatusParameter, nodeConfig.showErrors, nodeConfig.showStatusActivities)
          })
      })
    }

    const crawlNodeList = function (session: Todo, msg: Todo) {
      if (nodeConfig.showStatusActivities && nodeConfig.oldStatusParameter) {
        nodeConfig.oldStatusParameter = setNodeStatusTo(nodeConfig, 'crawling', nodeConfig.oldStatusParameter, nodeConfig.showStatusActivities)
      }

      if (nodeConfig.singleResult) {
        crawlForSingleResult(session, msg)
      } else {
        crawlForResults(session, msg)
      }
    }

    const sendMessage = function (originMessage: Todo, crawlerResult: Todo) {
      let msg = Object.assign({}, originMessage)
      msg.nodetype = 'crawl'

      const results = {
        crawlerResults: crawlerResult
      }

      try {
        RED.util.setMessageProperty(msg, 'payload', JSON.parse(JSON.stringify(results, null, 2)))
      } catch (err: any) {
        coreBrowser.internalDebugLog(err)
        if (nodeConfig.showErrors) {
          nodeConfig.error(err, msg)
        }
        msg.resultsConverted = JSON.stringify(results, null, 2)
        msg.error = err.message
      }

      if (nodeConfig.browseTopic && nodeConfig.browseTopic !== '') {
        msg.payload.browseTopic = nodeConfig.browseTopic
      }

      if (!nodeConfig.justValue) {
        msg.payload.crawlerResultsCount = crawlerResult.length
        if (nodeConfig.connector) {
          msg.payload.endpoint = (nodeConfig.connector as Todo).endpoint
        }
        msg.payload.session = nodeConfig.iiot.opcuaSession.name || 'none'
      }

      nodeConfig.iiot.messageList.push(msg)

      if (nodeConfig.showStatusActivities && nodeConfig.oldStatusParameter) {
        nodeConfig.oldStatusParameter = setNodeStatusTo(nodeConfig, 'active', nodeConfig.oldStatusParameter, nodeConfig.showStatusActivities)
      }

      // TODO: maybe here RED.util.set ...

      nodeConfig.iiot.delayMessageTimer.push(setTimeout(() => {
        nodeConfig.send(nodeConfig.iiot.messageList.shift())
      }, nodeConfig.delayPerMessage * FAKTOR_SEC_TO_MSEC))
    }

    const resetAllTimer = function () {
      nodeConfig.iiot.delayMessageTimer.forEach((timerId: Todo) => {
        clearTimeout(timerId)
        timerId = null
      })
    }

    const startCrawling = function (msg: Todo) {
      if (nodeConfig.browseTopic && nodeConfig.browseTopic !== '') {
        crawl(nodeConfig.iiot.opcuaSession, msg)
      } else {
        if (msg.addressItemsToBrowse) {
          msg.addressSpaceItems = msg.addressItemsToBrowse
        }

        if (msg.addressSpaceItems && msg.addressSpaceItems.length) {
          coreBrowser.internalDebugLog('Start Crawling On AddressSpace Items')
          crawlNodeList(nodeConfig.iiot.opcuaSession, msg)
        } else {
          nodeConfig.error(new Error('No AddressSpace Items Or Root To Crawl'), msg)
        }
      }
    }

    const setStatus = (status: string | NodeStatus) => {
      this.status(status)
    }

    this.on('input', function (msg: NodeMessageInFlow) {
      console.log('HELLO THERE!!!')
      console.log(msg)
      if (!checkConnectorState(nodeConfig, msg, 'Crawler')) {
        return
      }

      nodeConfig.browseTopic = coreBrowser.extractNodeIdFromTopic(msg, nodeConfig)
      startCrawling(msg)
      console.log(nodeConfig.browseTopic)
    })

    registerToConnector(this, setStatus)

    this.on('close', (done: () => void) => {
      deregisterToConnector(this, () => {
        resetBiancoNode(this)
        done()
      })
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Crawler', OPCUAIIoTCrawler)
}
