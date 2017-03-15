/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-opcua-iiot
 */
'use strict'

module.exports = function (RED) {
  let core = require('./core/opcua-iiot-core')
  let coreBrowser = require('./core/opua-iiot-core-browser')
  let browserItems = []

  function OPCUAIIoTBrowser (config) {
    RED.nodes.createNode(this, config)

    this.item = config.item
    this.datatype = config.datatype
    this.topic = config.topic

    let browseTopic = core.OBJECTS_ROOT
    let node = this
    node.items = []
    node.opcuaEndpoint = RED.nodes.getNode(config.endpoint)

    node.add_item = function (item) {
      if (item) {
        node.items.add({
          referenceTypeId: item.referenceTypeId.toString(),
          isForward: item.isForward,
          nodeId: item.nodeId.toString(),
          browseName: item.browseName.toString(),
          displayName: item.displayName,
          nodeClass: item.nodeClass.toString(),
          typeDefinition: item.typeDefinition.toString()
        })
      }
    }

    node.browseResultHandling = function (err) {
      if (err) {
        browserItems = []
        browserItems.push({displayName: {text: 'Objects'}, nodeId: core.OBJECTS_ROOT, browseName: 'Objects'})
        core.internalDebugLog(err)
        node.status({fill: 'red', shape: 'dot', text: 'error'})
      } else {
        core.internalDebugLog('browse done - result: ' + browserItems.length + ' item(s)')
      }
    }

    node.setupClient = function (url, callback) {
      node.items = []

      coreBrowser.connect(url).then(function (opcuaClient) {
        core.internalDebugLog('connected on ' + node.opcuaEndpoint.endpoint)
        coreBrowser.createSession(opcuaClient).then(function (session) {
          core.internalDebugLog('start session on ' + node.opcuaEndpoint.endpoint)
          coreBrowser.browse(session, browseTopic).then(function (browseResult) {
            core.internalDebugLog('browse root ' + browseTopic + ' on' + node.opcuaEndpoint.endpoint)
            browseResult.forEach(function (result) {
              // core.internalDebugLog('result:' + result)
              result.references.forEach(function (reference) {
                // core.internalDebugLog('reference:' + reference)
                node.add_item(reference)
              })
            })
            browserItems = node.items
            node.status({fill: 'green', shape: 'dot', text: 'active'})
            coreBrowser.closeSession(session).then(function () {
              core.internalDebugLog('sucessfully browsed on ' + node.opcuaEndpoint.endpoint)
            }).catch(callback)
          }).catch(callback)
        }).catch(callback)
      }).catch(callback)
    }

    node.on('input', function (msg) {
      browseTopic = null

      core.internalDebugLog(msg)

      if (msg.payload.actiontype === 'browse') {
        if (msg.payload.root && msg.payload.root.nodeId) {
          browseTopic = browseByItem(msg.payload.root.nodeId)
        } else {
          browseTopic = node.topic || browseToRoot()
        }
      } else {
        if (msg.topic) {
          browseTopic = msg.topic
        } else {
          browseTopic = node.topic || browseToRoot()
        }
      }

      if (browseTopic) {
        node.setupClient(node.opcuaEndpoint.endpoint, node.browseResultHandling)
        msg.payload = {endpoint: node.opcuaEndpoint.endpoint, browseTopic: browseTopic, items: browserItems}
        node.send(msg)
      } else {
        node.error('Browse error', new Error('No Topic To Browse'))
      }
    })

    function browseByItem (nodeId) {
      core.internalDebugLog('browse to parent ' + nodeId)
      return nodeId
    }

    function browseToRoot () {
      core.internalDebugLog('browse to root ' + core.OBJECTS_ROOT)
      return core.OBJECTS_ROOT
    }

    // initial request for browser browse service
    node.setupClient(node.opcuaEndpoint.endpoint, node.browseResultHandling)
  }

  RED.nodes.registerType('OPCUA-IIoT-Browser', OPCUAIIoTBrowser)

  RED.httpAdmin.get('/browser/browse', RED.auth.needsPermission('browser.browse'), function (req, res) {
    core.internalDebugLog(req)
    res.json(browserItems)
  })
}
