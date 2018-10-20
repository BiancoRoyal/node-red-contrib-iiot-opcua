/**
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

/**
 * Nested namespace settings.
 *
 * @type {{biancoroyal: {opcua: {iiot: {core: {browser: {}}}}}}}
 *
 * @Namesapce de.biancoroyal.opcua.iiot.core.browser
 */
var de = de || {biancoroyal: {opcua: {iiot: {core: {browser: {crawler: {}}}}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.browser.core = de.biancoroyal.opcua.iiot.core.browser.core || require('./opcua-iiot-core') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.browser.internalDebugLog = de.biancoroyal.opcua.iiot.core.browser.internalDebugLog || require('debug')('opcuaIIoT:browser') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.browser.detailDebugLog = de.biancoroyal.opcua.iiot.core.browser.detailDebugLog || require('debug')('opcuaIIoT:browser:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.browser.crawler.internalDebugLog = de.biancoroyal.opcua.iiot.core.browser.crawler.internalDebugLog || require('debug')('opcuaIIoT:browser:crawler') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.browser.crawler.detailDebugLog = de.biancoroyal.opcua.iiot.core.browser.crawler.detailDebugLog || require('debug')('opcuaIIoT:browser:crawler:details') // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.browser.browse = function (session, nodeIdToBrowse) {
  let coreBrowser = this
  return new Promise(
    function (resolve, reject) {
      let browseOptions = [
        {
          nodeId: nodeIdToBrowse,
          referenceTypeId: 'Organizes',
          includeSubtypes: true,
          browseDirection: coreBrowser.core.nodeOPCUA.browse_service.BrowseDirection.Forward,
          resultMask: 63
        },
        {
          nodeId: nodeIdToBrowse,
          referenceTypeId: 'Aggregates',
          includeSubtypes: true,
          browseDirection: coreBrowser.core.nodeOPCUA.browse_service.BrowseDirection.Forward,
          resultMask: 63
        }
      ]

      session.browse(browseOptions, function (err, browseResult) {
        if (err) {
          reject(err)
        } else {
          resolve(browseResult)
        }
      })
    }
  )
}

de.biancoroyal.opcua.iiot.core.browser.browseAddressSpaceItems = function (session, addressSpaceItems) {
  let coreBrowser = this
  return new Promise(
    function (resolve, reject) {
      let browseOptions = []

      addressSpaceItems.forEach(function (item) {
        browseOptions.push({
          nodeId: item.nodeId,
          referenceTypeId: 'Organizes',
          includeSubtypes: true,
          browseDirection: coreBrowser.core.nodeOPCUA.browse_service.BrowseDirection.Forward,
          resultMask: 63
        })

        browseOptions.push({
          nodeId: item.nodeId,
          referenceTypeId: 'Aggregates',
          includeSubtypes: true,
          browseDirection: coreBrowser.core.nodeOPCUA.browse_service.BrowseDirection.Forward,
          resultMask: 63
        })
      })

      session.browse(browseOptions, function (err, browseResult) {
        if (err) {
          reject(err)
        } else {
          resolve(browseResult)
        }
      })
    }
  )
}

de.biancoroyal.opcua.iiot.core.browser.crawl = function (session, nodeIdToCrawl, msg) {
  let coreBrowser = this
  return new Promise(
    function (resolve, reject) {
      if (!nodeIdToCrawl) {
        reject(new Error('NodeId To Crawl Not Valid'))
        return
      }

      const message = Object.assign({}, msg)

      const crawler = new coreBrowser.core.nodeOPCUA.NodeCrawler(session)
      let crawlerResult = []
      const data = {
        onBrowse: function (crawler, cacheNode) {
          crawlerResult.push(cacheNode)
          coreBrowser.core.nodeOPCUA.NodeCrawler.follow(crawler, cacheNode, this)
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

de.biancoroyal.opcua.iiot.core.browser.crawlAddressSpaceItems = function (session, msg) {
  let coreBrowser = this
  return new Promise(
    function (resolve, reject) {
      if (!msg.addressSpaceItems) {
        reject(new Error('AddressSpace Items Not Valid To Crawl'))
        return
      }

      const message = Object.assign({}, msg)

      const crawler = new coreBrowser.core.nodeOPCUA.NodeCrawler(session)
      let crawlerResult = []
      const data = {
        onBrowse (crawler, cacheNode) {
          if (!cacheNode) {
            coreBrowser.internalDebugLog('Item Not To Crawl - Missing NodeId')
          }
          crawlerResult.push(cacheNode)
          coreBrowser.core.nodeOPCUA.NodeCrawler.follow(crawler, cacheNode, this)
        }
      }
      message.addressSpaceItems.forEach((item) => {
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

de.biancoroyal.opcua.iiot.core.browser.browseToRoot = function () {
  let coreBrowser = this
  coreBrowser.detailDebugLog('Browse To Root ' + coreBrowser.core.OBJECTS_ROOT)
  return coreBrowser.core.OBJECTS_ROOT
}

de.biancoroyal.opcua.iiot.core.browser.extractNodeIdFromTopic = function (msg, node) {
  let coreBrowser = this
  let rootNodeId = null

  if (msg.payload.actiontype === 'browse') { // event driven browsing
    if (msg.payload.root && msg.payload.root.nodeId) {
      coreBrowser.internalDebugLog('Root Selected External ' + msg.payload.root)
      rootNodeId = msg.payload.root.nodeId || coreBrowser.browseToRoot()
    } else {
      rootNodeId = node.nodeId || coreBrowser.browseToRoot()
    }
  }

  coreBrowser.detailDebugLog('Extracted NodeId ' + rootNodeId)
  return rootNodeId
}

de.biancoroyal.opcua.iiot.core.browser.transformToEntry = function (reference) {
  if (reference) {
    try {
      return reference.toJSON()
    } catch (err) {
      this.internalDebugLog(err)

      return {
        referenceTypeId: reference.referenceTypeId.toString(),
        isForward: reference.isForward,
        nodeId: reference.nodeId.toString(),
        browseName: reference.browseName.toString(),
        displayName: reference.displayName,
        nodeClass: reference.nodeClass.toString(),
        typeDefinition: reference.typeDefinition.toString()
      }
    }
  } else {
    this.internalDebugLog('Empty Reference On Browse')
  }
}

de.biancoroyal.opcua.iiot.core.browser.initClientNode = function (node) {
  let browseNode = this.core.initClientNode(node)
  browseNode.items = []
  browseNode.browseTopic = this.core.OBJECTS_ROOT
  browseNode.messageList = []
  return browseNode
}

module.exports = de.biancoroyal.opcua.iiot.core.browser
