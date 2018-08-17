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
  let browserEntries = []

  function OPCUAIIoTCrawler (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.justValue = config.justValue
    this.singleResult = config.singleResult
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.filters = config.filters
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

        coreBrowser.internalDebugLog('Crawler Error ' + err)
        if (node.showErrors) {
          node.error(err, msg)
        }

        if (coreBrowser.core.isSessionBad(err)) {
          node.connector.resetBadSession()
        }
      } else {
        results = browserEntries
        coreBrowser.internalDebugLog('Browse Done With Error: ' + results.length + ' item(s)')
      }

      browserEntries = results
    }

    node.sendMessageCrawlerResults = function (msg, browserResult) {
      browserEntries = browserResult || []
      let filteredEntries = []

      if (node.filters && node.filters.length > 0) {
        browserEntries.forEach(function (item) {
          if (node.itemIsNotToFilter(item, filteredEntries)) {
            filteredEntries.push(item)
          }
        })
        browserEntries = filteredEntries
      }

      if (node.justValue) {
        browserEntries.forEach(function (item) {
          if (item.references) {
            delete item['references']
          }
        })
      }

      node.sendMessage(msg)
    }

    node.itemIsNotToFilter = function (item, filteredEntries) {
      let result = true

      node.filters.forEach(function (element, index, array) {
        try {
          if (item.nodeId && item.nodeId.toString() === element.nodeId) {
            result &= false
          }
          if (item.browseName && item.browseName.name === element.name) {
            result &= false
          }
          if (item.typeDefinition) {
            if (item.typeDefinition.toString() === element.nodeId || item.typeDefinition.toString() === element.name) {
              result &= false
            }
          }
        } catch (e) {
          if (node.showErrors) {
            coreBrowser.crawler.internalDebugLog(e)
          }
        }
      })

      return result
    }

    node.crawl = function (session, msg) {
      coreBrowser.internalDebugLog('Browse Topic To Call Crawler ' + node.browseTopic)
      browserEntries = []

      if (node.showStatusActivities) {
        node.setNodeStatusTo('crawling')
      }

      coreBrowser.crawl(session, node.browseTopic)
        .then(function (browserResult) {
          node.sendMessageCrawlerResults(msg, browserResult)
        }).catch(function (err) {
          node.browseErrorHandling(err, msg)
        })
    }

    node.crawlNodeList = function (session, msg) {
      browserEntries = []

      if (node.showStatusActivities) {
        node.setNodeStatusTo('crawling')
      }

      if (node.singleResult) {
        coreBrowser.crawlAddressSpaceItems(session, msg.addressSpaceItems)
          .then(function (browserResult) {
            browserEntries = []
            node.sendMessageCrawlerResults(msg, browserResult)
            if (node.showStatusActivities) {
              node.setNodeStatusTo('active')
            }
          }).catch(function (err) {
            node.browseErrorHandling(err, msg)
            if (node.showStatusActivities) {
              node.setNodeStatusTo('error')
            }
          })
      } else {
        msg.addressSpaceItems.map((entry) => (
          coreBrowser.crawl(session, entry.nodeId)
            .then(function (browserResult) {
              browserEntries = []
              node.sendMessageCrawlerResults(msg, browserResult)
              if (node.showStatusActivities) {
                node.setNodeStatusTo('active')
              }
            }).catch(function (err) {
              node.browseErrorHandling(err, msg)
              if (node.showStatusActivities) {
                node.setNodeStatusTo('error')
              }
            })))
      }
    }

    node.sendMessage = function (originMessage, browserResult) {
      let msg = originMessage
      msg.nodetype = 'crawl'

      msg.payload = {
        browserItems: browserEntries
      }

      if (node.browseTopic && node.browseTopic !== '') {
        msg.payload.browseTopic = node.browseTopic
      }

      if (!node.justValue) {
        msg.payload.browserItemsCount = browserEntries.length
        msg.payload.endpoint = node.connector.endpoint
        msg.payload.session = node.opcuaSession.name || 'none'
      }

      node.send(msg)
    }

    node.on('input', function (msg) {
      node.browseTopic = coreBrowser.extractNodeIdFromTopic(msg, node)

      if (node.connector.stateMachine.getMachineState() !== 'OPEN') {
        coreBrowser.internalDebugLog('Wrong Client State ' + node.connector.stateMachine.getMachineState() + ' On Crawl')
        if (node.showErrors) {
          node.error(new Error('Client Not Open On Crawl'), msg)
        }
        return
      }

      if (!node.opcuaSession) {
        node.error(new Error('Session Not Ready To Browse'), msg)
        return
      }

      if (node.browseTopic && node.browseTopic !== '') {
        node.crawl(node.opcuaSession, msg)
      } else {
        if (msg.addressItemsToBrowse) {
          msg.addressSpaceItems = msg.addressItemsToBrowse
        }

        if (msg.addressSpaceItems) {
          node.crawlNodeList(node.opcuaSession, msg)
        } else {
          node.error(new Error('No AddressSpace Items Or Root To Crawl'), msg)
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
    } else {
      throw new TypeError('Connector Not Valid')
    }

    coreBrowser.core.setNodeInitalState(node.connector.stateMachine.getMachineState(), node)
  }

  RED.nodes.registerType('OPCUA-IIoT-Crawler', OPCUAIIoTCrawler)
}
