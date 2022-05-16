/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {Todo} from "./types/placeholders";
import {Node} from "@node-red/registry";

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
  let coreBrowser = require('./core/opcua-iiot-core-browser')

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

    let node = coreBrowser.initBrowserNode(this)
    coreBrowser.core.assert(node.bianco.iiot)
    node.bianco.iiot.delayMessageTimer = []

    node.bianco.iiot.filterCrawlerResults = function (crawlerResultToFilter: Todo[]) {
      let crawlerResult = crawlerResultToFilter || []
      let filteredEntries: Todo[] = []

      if (node.activateFilters && node.filters && node.filters.length > 0) {
        crawlerResult.forEach(function (item) {
          if (node.bianco.iiot.itemIsNotToFilter(item)) {
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

    node.bianco.iiot.itemIsNotToFilter = function (item: Todo) {
      let result = coreBrowser.core.checkItemForUnsetState(node, item)

      if (result) {
        node.filters.forEach(function (element: Todo) {
          result = coreBrowser.core.checkCrawlerItemIsNotToFilter(node, item, element, result)
        })
      }

      return (node.negateFilter) ? !result : result
    }

    node.bianco.iiot.crawl = function (session: Todo, msg: Todo) {
      if (coreBrowser.core.checkSessionNotValid(node.bianco.iiot.opcuaSession, 'Crawler')) {
        return
      }

      coreBrowser.internalDebugLog('Browse Topic To Call Crawler ' + node.browseTopic)

      if (node.showStatusActivities) {
        coreBrowser.core.setNodeStatusTo(node, 'crawling')
      }

      coreBrowser.crawl(session, node.browseTopic, msg)
        .then(function (result: Todo) {
          coreBrowser.internalDebugLog(result.rootNodeId + ' Crawler Results ' + result.crawlerResult.length)
          node.bianco.iiot.sendMessage(result.message, node.bianco.iiot.filterCrawlerResults(result.message, result.crawlerResult))
        }).catch(function (err: Todo) {
          coreBrowser.browseErrorHandling(node, err, msg)
        })
    }

    node.bianco.iiot.crawlForSingleResult = function (session: Todo, msg: Todo) {
      coreBrowser.crawlAddressSpaceItems(session, msg)
        .then(function (result: Todo) {
          coreBrowser.internalDebugLog(result.rootNodeId + ' Crawler Results ' + result.crawlerResult.length)
          node.bianco.iiot.sendMessage(result.message, node.bianco.iiot.filterCrawlerResults(result.crawlerResult))
        }).catch(function (err: Todo) {
          coreBrowser.browseErrorHandling(node, err, msg)
        })
    }

    node.bianco.iiot.crawlForResults = function (session: Todo, msg: Todo) {
      msg.addressSpaceItems.map((entry: Todo) => {
        coreBrowser.crawl(session, entry.nodeId)
          .then(function (result: Todo) {
            coreBrowser.internalDebugLog(result.rootNodeId + ' Crawler Results ' + result.crawlerResult.length)
            node.bianco.iiot.sendMessage(result.message, node.bianco.iiot.filterCrawlerResults(result.crawlerResult))
          }).catch(function (err: Todo) {
            coreBrowser.browseErrorHandling(node, err, msg)
          })
      })
    }

    node.bianco.iiot.crawlNodeList = function (session: Todo, msg: Todo) {
      if (node.showStatusActivities) {
        coreBrowser.core.setNodeStatusTo(node, 'crawling')
      }

      if (node.singleResult) {
        node.bianco.iiot.crawlForSingleResult(session, msg)
      } else {
        node.bianco.iiot.crawlForResults(session, msg)
      }
    }

    node.bianco.iiot.sendMessage = function (originMessage: Todo, crawlerResult: Todo) {
      let msg = Object.assign({}, originMessage)
      msg.nodetype = 'crawl'

      const results = {
        crawlerResults: crawlerResult
      }

      try {
        RED.util.setMessageProperty(msg, 'payload', JSON.parse(JSON.stringify(results, null, 2)))
      } catch (err: any) {
        coreBrowser.writeDebugLog(err)
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
          msg.payload.endpoint = node.connector.endpoint
        }
        msg.payload.session = node.bianco.iiot.opcuaSession.name || 'none'
      }

      node.bianco.iiot.messageList.push(msg)

      if (node.showStatusActivities) {
        coreBrowser.core.setNodeStatusTo(node, 'active')
      }

      // TODO: maybe here RED.util.set ...

      node.bianco.iiot.delayMessageTimer.push(setTimeout(() => {
        node.send(node.bianco.iiot.messageList.shift())
      }, node.delayPerMessage * coreBrowser.core.FAKTOR_SEC_TO_MSEC))
    }

    node.bianco.iiot.resetAllTimer = function () {
      node.bianco.iiot.delayMessageTimer.forEach((timerId: Todo) => {
        clearTimeout(timerId)
        timerId = null
      })
    }

    node.bianco.iiot.startCrawling = function (msg: Todo) {
      if (node.browseTopic && node.browseTopic !== '') {
        node.bianco.iiot.crawl(node.bianco.iiot.opcuaSession, msg)
      } else {
        if (msg.addressItemsToBrowse) {
          msg.addressSpaceItems = msg.addressItemsToBrowse
        }

        if (msg.addressSpaceItems && msg.addressSpaceItems.length) {
          coreBrowser.internalDebugLog('Start Crawling On AddressSpace Items')
          node.bianco.iiot.crawlNodeList(node.bianco.iiot.opcuaSession, msg)
        } else {
          node.error(new Error('No AddressSpace Items Or Root To Crawl'), msg)
        }
      }
    }

    node.on('input', function (msg: Todo) {
      if (!coreBrowser.core.checkConnectorState(node, msg, 'Crawler')) {
        return
      }

      node.browseTopic = coreBrowser.extractNodeIdFromTopic(msg, node)
      node.bianco.iiot.startCrawling(msg)
    })

    coreBrowser.core.registerToConnector(node)

    node.on('close', (done: () => void) => {
      coreBrowser.core.deregisterToConnector(node, () => {
        coreBrowser.core.resetBiancoNode(node)
        done()
      })
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Crawler', OPCUAIIoTCrawler)
}
