/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * Crawler Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED) {
  // SOURCE-MAP-REQUIRED
  let coreBrowser = require('./core/opcua-iiot-core-browser')

  function OPCUAIIoTCrawler (config) {
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

    let node = coreBrowser.initClientNode(this)

    node.filterCrawlerResults = function (crawlerResultToFilter) {
      let crawlerResult = crawlerResultToFilter || []
      let filteredEntries = []

      if (node.activateFilters && node.filters && node.filters.length > 0) {
        crawlerResult.forEach(function (item) {
          if (node.itemIsNotToFilter(item)) {
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

    node.itemIsNotToFilter = function (item) {
      let result = coreBrowser.core.checkItemForUnsetState(node, item)

      if (result) {
        node.filters.forEach(function (element) {
          result = coreBrowser.core.checkCrawlerItemIsNotToFilter(node, item, element, result)
        })
      }

      return (node.negateFilter) ? !result : result
    }

    node.crawl = function (session, msg) {
      if (coreBrowser.core.checkSessionNotValid(node.opcuaSession, 'Crawler')) {
        return
      }

      coreBrowser.internalDebugLog('Browse Topic To Call Crawler ' + node.browseTopic)

      if (node.showStatusActivities) {
        coreBrowser.core.setNodeStatusTo(node, 'crawling')
      }

      coreBrowser.crawl(session, node.browseTopic, msg)
        .then(function (result) {
          coreBrowser.internalDebugLog(result.rootNodeId + ' Crawler Results ' + result.crawlerResult.length)
          node.sendMessage(result.message, node.filterCrawlerResults(result.message, result.crawlerResult))
        }).catch(function (err) {
          coreBrowser.browseErrorHandling(node, err, msg)
        })
    }

    node.crawlForSingleResult = function (session, msg) {
      coreBrowser.crawlAddressSpaceItems(session, msg)
        .then(function (result) {
          coreBrowser.internalDebugLog(result.rootNodeId + ' Crawler Results ' + result.crawlerResult.length)
          node.sendMessage(result.message, node.filterCrawlerResults(result.crawlerResult))
        }).catch(function (err) {
          coreBrowser.browseErrorHandling(node, err, msg)
        })
    }

    node.crawlForResults = function (session, msg) {
      msg.addressSpaceItems.map((entry) => {
        coreBrowser.crawl(session, entry.nodeId)
          .then(function (result) {
            coreBrowser.internalDebugLog(result.rootNodeId + ' Crawler Results ' + result.crawlerResult.length)
            node.sendMessage(result.message, node.filterCrawlerResults(result.crawlerResult))
          }).catch(function (err) {
            coreBrowser.browseErrorHandling(node, err, msg)
          })
      })
    }

    node.crawlNodeList = function (session, msg) {
      if (node.showStatusActivities) {
        coreBrowser.core.setNodeStatusTo(node, 'crawling')
      }

      if (node.singleResult) {
        node.crawlForSingleResult(session, msg)
      } else {
        node.crawlForResults(session, msg)
      }
    }

    node.sendMessage = function (originMessage, crawlerResult) {
      let msg = Object.assign({}, originMessage)
      msg.nodetype = 'crawl'

      const results = {
        crawlerResults: crawlerResult
      }

      try {
        RED.util.setMessageProperty(msg, 'payload', JSON.parse(JSON.stringify(results, null, 2)))
      } catch (err) {
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
        msg.payload.session = node.opcuaSession.name || 'none'
      }

      node.messageList.push(msg)

      if (node.showStatusActivities) {
        coreBrowser.core.setNodeStatusTo(node, 'active')
      }

      // TODO: maybe here RED.util.set ...

      setTimeout(() => {
        node.send(node.messageList.shift())
      }, node.delayPerMessage * coreBrowser.core.FAKTOR_SEC_TO_MSEC)
    }

    node.startCrawling = function (msg) {
      if (node.browseTopic && node.browseTopic !== '') {
        node.crawl(node.opcuaSession, msg)
      } else {
        if (msg.addressItemsToBrowse) {
          msg.addressSpaceItems = msg.addressItemsToBrowse
        }

        if (msg.addressSpaceItems && msg.addressSpaceItems.length) {
          coreBrowser.internalDebugLog('Start Crawling On AddressSpace Items')
          node.crawlNodeList(node.opcuaSession, msg)
        } else {
          node.error(new Error('No AddressSpace Items Or Root To Crawl'), msg)
        }
      }
    }

    node.on('input', function (msg) {
      if (!coreBrowser.core.checkConnectorState(node, msg, 'Crawler')) {
        return
      }

      node.browseTopic = coreBrowser.extractNodeIdFromTopic(msg, node)
      node.startCrawling(msg)
    })

    coreBrowser.core.registerToConnector(node)

    node.on('close', (done) => {
      coreBrowser.core.deregisterToConnector(node, done)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Crawler', OPCUAIIoTCrawler)
}
