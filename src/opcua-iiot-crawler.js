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

    node.browseErrorHandling = function (err, msg) {
      if (err) {
        coreBrowser.internalDebugLog('Crawler Error ' + err)
        if (node.showErrors) {
          node.error(err, msg)
        }

        if (coreBrowser.core.isSessionBad(err) && node.connector) {
          node.connector.resetBadSession()
        }
      } else {
        coreBrowser.internalDebugLog('Crawling Done With Error')
      }
    }

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
      let result = true
      let filterValue

      if (node.activateUnsetFilter) {
        result &= item !== null

        if (item.value) {
          if (item.value.hasOwnProperty('value')) {
            result &= item.value.value !== null
          } else {
            result &= item.value !== null
          }
        }
      }

      node.filters.forEach(function (element, index, array) {
        try {
          switch (element.name) {
            case 'browseName':
            case 'statusCode':
              filterValue = item[element.name].name
              break
            case 'displayName':
              filterValue = item[element.name].text
              break
            case 'value':
              if (item.value && item.value.hasOwnProperty('value')) {
                filterValue = item.value[element.name]
              } else {
                filterValue = item[element.name]
              }
              break
            default:
              filterValue = item[element.name]
          }

          if (filterValue && filterValue.key && filterValue.key.match) {
            if (filterValue.key.match(element.value)) {
              result &= false
            }
          } else {
            if (filterValue && filterValue.match) {
              if (filterValue.match(element.value)) {
                result &= false
              }
            } else {
              if (filterValue && filterValue.toString) {
                filterValue = filterValue.toString()
                if (filterValue && filterValue.match) {
                  if (filterValue.match(element.value)) {
                    result &= false
                  }
                }
              }
            }
          }
        } catch (e) {
          coreBrowser.crawler.internalDebugLog(e)
          if (node.showErrors) {
            node.error(e, {payload: e.message})
          }
        }
      })

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
          node.browseErrorHandling(err, msg)
        })
    }

    node.crawlNodeList = function (session, msg) {
      if (node.showStatusActivities) {
        coreBrowser.core.setNodeStatusTo(node, 'crawling')
      }

      if (node.singleResult) {
        coreBrowser.crawlAddressSpaceItems(session, msg)
          .then(function (result) {
            coreBrowser.internalDebugLog(result.rootNodeId + ' Crawler Results ' + result.crawlerResult.length)
            node.sendMessage(result.message, node.filterCrawlerResults(result.crawlerResult))
          }).catch(function (err) {
            node.browseErrorHandling(err, msg)
            if (node.showStatusActivities) {
              coreBrowser.core.setNodeStatusTo(node, 'error')
            }
          })
      } else {
        msg.addressSpaceItems.map((entry) => (
          coreBrowser.crawl(session, entry.nodeId)
            .then(function (result) {
              coreBrowser.internalDebugLog(result.rootNodeId + ' Crawler Results ' + result.crawlerResult.length)
              node.sendMessage(result.message, node.filterCrawlerResults(result.crawlerResult))
            }).catch(function (err) {
              node.browseErrorHandling(err, msg)
              if (node.showStatusActivities) {
                coreBrowser.core.setNodeStatusTo(node, 'error')
              }
            })))
      }
    }

    node.sendMessage = function (originMessage, crawlerResult) {
      let msg = Object.assign({}, originMessage)
      msg.nodetype = 'crawl'

      msg.payload = {
        crawlerResults: crawlerResult
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

      setTimeout(() => {
        node.send(node.messageList.shift())
      }, node.delayPerMessage * coreBrowser.core.FAKTOR_SEC_TO_MSEC)
    }

    node.on('input', function (msg) {
      if (!coreBrowser.core.checkConnectorState(node, msg, 'Crawler')) {
        return
      }

      node.browseTopic = coreBrowser.extractNodeIdFromTopic(msg, node)

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
    })

    coreBrowser.core.registerToConnector(node)

    node.on('close', (done) => {
      coreBrowser.core.deregisterToConnector(node, done)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Crawler', OPCUAIIoTCrawler)
}
