/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-opcua-iiot
 */
'use strict'

module.exports = function (RED) {
  let coreBrowser = require('./core/opcua-iiot-core-browser')
  let browserItems = []

  function OPCUAIIoTBrowser (config) {
    RED.nodes.createNode(this, config)

    this.datatype = config.datatype
    this.topic = config.topic
    this.name = config.name

    let node = this
    node.items = []
    node.connector = RED.nodes.getNode(config.connector)
    node.browseTopic = coreBrowser.core.OBJECTS_ROOT
    node.opcuaClient = null
    node.opcuaSession = null

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

    node.browseResultHandling = function (err, msg) {
      if (err) {
        browserItems = []
        browserItems.push({
          displayName: {text: 'Objects'},
          nodeId: coreBrowser.core.OBJECTS_ROOT,
          browseName: 'Objects'
        })
        coreBrowser.core.internalDebugLog(err)

        if (node.showErrors) {
          node.error(err, msg)
        }

        node.status({fill: 'red', shape: 'dot', text: 'error'})
      } else {
        coreBrowser.core.internalDebugLog('browse done with catch but no error: ' + browserItems.length + ' item(s)')
      }
    }

    node.browse = function (session, msg) {
      node.items = []

      if (session && node.browseTopic) {
        coreBrowser.browse(session, node.browseTopic).then(function (browseResult) {
          coreBrowser.core.internalDebugLog('browse root ' + node.browseTopic + ' on ' +
            node.opcuaSession.name + ' Id: ' + node.opcuaSession.sessionId)

          browseResult.forEach(function (result) {
            // coreBrowser.core.internalDebugLog('result:' + result)

            result.references.forEach(function (reference) {
              // coreBrowser.core.internalDebugLog('reference:' + reference)
              node.add_item(reference)
            })
          })

          browserItems = node.items
          node.status({fill: 'green', shape: 'dot', text: 'active'})
        }).catch(function (err) {
          node.browseResultHandling(err, msg)
        })
      }
    }

    node.on('input', function (msg) {
      node.browseTopic = null

      coreBrowser.core.internalDebugLog(msg)

      if (msg.payload.actiontype === 'browse') { // event driven browsing
        if (msg.payload.root && msg.payload.root.nodeId) {
          node.browseTopic = node.browseByItem(msg.payload.root.nodeId)
        } else {
          node.browseTopic = node.topic || node.browseToRoot()
        }
      } else {
        if (msg.topic) {
          node.browseTopic = msg.topic
        } else {
          node.browseTopic = node.topic || node.browseToRoot()
        }
      }

      if (node.browseTopic) {
        node.browse(node.opcuaSession, msg)
        msg.nodetype = 'browse'

        msg.payload = {
          endpoint: node.connector.endpoint,
          session: node.opcuaSession.name,
          browseTopic: node.browseTopic,
          items: browserItems
        }
        node.send(msg)
      } else {
        node.error(new Error('No Topic To Browse'), msg)
      }
    })

    node.browseByItem = function (nodeId) {
      coreBrowser.core.internalDebugLog('browse to parent ' + nodeId)
      return nodeId
    }

    node.browseToRoot = function () {
      coreBrowser.core.internalDebugLog('browse to root ' + coreBrowser.core.OBJECTS_ROOT)
      return coreBrowser.core.OBJECTS_ROOT
    }

    node.handleSessionError = function (err) {
      if (node.showErrors) {
        node.error(err, {payload: 'OPC UA Session Error'})
      }

      node.connector.closeSession(function () {
        node.startOPCUASession(node.opcuaClient)
      })
    }

    node.startOPCUASession = function (opcuaClient) {
      node.opcuaClient = opcuaClient
      node.connector.startSession(coreBrowser.core.TEN_SECONDS_TIMEOUT).then(function (session) {
        node.opcuaSession = session
      }).catch(node.handleSessionError)
    }

    node.connector.on('connected', node.startOPCUASession)

    node.on('close', function (done) {
      node.connector.closeSession(done)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Browser', OPCUAIIoTBrowser)

  RED.httpAdmin.get('/browser/browse', RED.auth.needsPermission('browser.browse'), function (req, res) {
    coreBrowser.core.internalDebugLog(req)
    res.json(browserItems)
  })
}
