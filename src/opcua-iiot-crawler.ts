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
 * Crawler Node-RED node.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTCrawler (this: OPCUAIIoTCrawler, config: OPCUAIIoTCrawlerDef) {
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

    let node = {
      ...this,
      ...coreBrowser.initBrowserNode()
    }
    node.iiot.delayMessageTimer = []

    node.iiot.filterCrawlerResults = function (crawlerResultToFilter: Todo[]) {
      let crawlerResult = crawlerResultToFilter || []
      let filteredEntries: Todo[] = []

      if (node.activateFilters && node.filters && node.filters.length > 0) {
        crawlerResult.forEach(function (item) {
          if (node.iiot.itemIsNotToFilter(item)) {
            filteredEntries.push(item)
          }
        })
        crawlerResult = filteredEntries
      }

      if (node.justValue) {
        crawlerResult.forEach(function (item) {
          if (item.references) {
            delete item['references']
          }
        })
      }

      return crawlerResult
    }

    node.iiot.itemIsNotToFilter = function (item: Todo) {
      let result = checkItemForUnsetState(node, item)

      if (result) {
        node.filters.forEach(function (element: Todo) {
          result = checkCrawlerItemIsNotToFilter(node, item, element, result)
        })
      }

      return (node.negateFilter) ? !result : result
    }

    node.iiot.crawl = function (session: Todo, msg: Todo) {
      if (checkSessionNotValid(node.iiot.opcuaSession, 'Crawler')) {
        return
      }

      coreBrowser.internalDebugLog('Browse Topic To Call Crawler ' + node.browseTopic)

      if (node.showStatusActivities && node.oldStatusParameter) {
        node.oldStatusParameter = setNodeStatusTo(node, 'crawling', node.oldStatusParameter, node.showStatusActivities)
      }

      coreBrowser.crawl(session, node.browseTopic, msg)
        .then(function (result: Todo) {
          coreBrowser.internalDebugLog(result.rootNodeId + ' Crawler Results ' + result.crawlerResult.length)
          node.iiot.sendMessage(result.message, node.iiot.filterCrawlerResults(result.message, result.crawlerResult))
        }).catch(function (err: Todo) {
          coreBrowser.browseErrorHandling(node, err, msg, undefined, node.oldStatusParameter, node.showErrors, node.showStatusActivities)

        })
    }

    node.iiot.crawlForSingleResult = function (session: Todo, msg: Todo) {
      coreBrowser.crawlAddressSpaceItems(session, msg)
        .then(function (result: Todo) {
          coreBrowser.internalDebugLog(result.rootNodeId + ' Crawler Results ' + result.crawlerResult.length)
          node.iiot.sendMessage(result.message, node.iiot.filterCrawlerResults(result.crawlerResult))
        }).catch(function (err: Todo) {
          coreBrowser.browseErrorHandling(node, err, msg, undefined, node.oldStatusParameter, node.showErrors, node.showStatusActivities)
        })
    }

    node.iiot.crawlForResults = function (session: Todo, msg: Todo) {
      msg.addressSpaceItems.map((entry: Todo) => {
        coreBrowser.crawl(session, entry.nodeId, msg)
          .then(function (result: Todo) {
            coreBrowser.internalDebugLog(result.rootNodeId + ' Crawler Results ' + result.crawlerResult.length)
            node.iiot.sendMessage(result.message, node.iiot.filterCrawlerResults(result.crawlerResult))
          }).catch(function (err: Todo) {
            coreBrowser.browseErrorHandling(node, err, msg, undefined, node.oldStatusParameter, node.showErrors, node.showStatusActivities)
          })
      })
    }

    node.iiot.crawlNodeList = function (session: Todo, msg: Todo) {
      if (node.showStatusActivities && node.oldStatusParameter) {
        node.oldStatusParameter = setNodeStatusTo(node, 'crawling', node.oldStatusParameter, node.showStatusActivities)
      }

      if (node.singleResult) {
        node.iiot.crawlForSingleResult(session, msg)
      } else {
        node.iiot.crawlForResults(session, msg)
      }
    }

    node.iiot.sendMessage = function (originMessage: Todo, crawlerResult: Todo) {
      let msg = Object.assign({}, originMessage)
      msg.nodetype = 'crawl'

      const results = {
        crawlerResults: crawlerResult
      }

      try {
        RED.util.setMessageProperty(msg, 'payload', JSON.parse(JSON.stringify(results, null, 2)))
      } catch (err: any) {
        coreBrowser.internalDebugLog(err)
        if (node.showErrors) {
          node.error(err, msg)
        }
        msg.resultsConverted = JSON.stringify(results, null, 2)
        msg.error = err.message
      }

      if (node.browseTopic && node.browseTopic !== '') {
        msg.payload.browseTopic = node.browseTopic
      }

      if (!node.justValue) {
        msg.payload.crawlerResultsCount = crawlerResult.length
        if (node.connector) {
          msg.payload.endpoint = (node.connector as Todo).endpoint
        }
        msg.payload.session = node.iiot.opcuaSession.name || 'none'
      }

      node.iiot.messageList.push(msg)

      if (node.showStatusActivities && node.oldStatusParameter) {
        node.oldStatusParameter = setNodeStatusTo(node, 'active', node.oldStatusParameter, node.showStatusActivities)
      }

      // TODO: maybe here RED.util.set ...

      node.iiot.delayMessageTimer.push(setTimeout(() => {
        node.send(node.iiot.messageList.shift())
      }, node.delayPerMessage * FAKTOR_SEC_TO_MSEC))
    }

    node.iiot.resetAllTimer = function () {
      node.iiot.delayMessageTimer.forEach((timerId: Todo) => {
        clearTimeout(timerId)
        timerId = null
      })
    }

    node.iiot.startCrawling = function (msg: Todo) {
      if (node.browseTopic && node.browseTopic !== '') {
        node.iiot.crawl(node.iiot.opcuaSession, msg)
      } else {
        if (msg.addressItemsToBrowse) {
          msg.addressSpaceItems = msg.addressItemsToBrowse
        }

        if (msg.addressSpaceItems && msg.addressSpaceItems.length) {
          coreBrowser.internalDebugLog('Start Crawling On AddressSpace Items')
          node.iiot.crawlNodeList(node.iiot.opcuaSession, msg)
        } else {
          node.error(new Error('No AddressSpace Items Or Root To Crawl'), msg)
        }
      }
    }

    node.on('input', function (msg: NodeMessageInFlow) {
      if (!checkConnectorState(node, msg, 'Crawler')) {
        return
      }

      node.browseTopic = coreBrowser.extractNodeIdFromTopic(msg, node)
      node.iiot.startCrawling(msg)
      console.log(node.browseTopic)
    })

    registerToConnector((node as Todo))

    node.on('close', (done: () => void) => {
      deregisterToConnector((node as Todo), () => {
        resetBiancoNode(node)
        done()
      })
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Crawler', OPCUAIIoTCrawler)
}
