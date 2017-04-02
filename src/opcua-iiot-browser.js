/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-iiot-opcua
 */
'use strict'

module.exports = function (RED) {
  let coreBrowser = require('./core/opcua-iiot-core-browser')
  let browserEntries = []

  function OPCUAIIoTBrowser (config) {
    RED.nodes.createNode(this, config)
    this.datatype = config.datatype
    this.topic = config.topic
    this.name = config.name
    this.connector = RED.nodes.getNode(config.connector)

    let node = this
    node.items = []
    node.browseTopic = coreBrowser.core.OBJECTS_ROOT
    node.opcuaClient = null
    node.opcuaSession = null

    setNodeStatusTo('waiting')

    function statusLog (logMessage) {
      if (RED.settings.verbose && node.statusLog) {
        coreBrowser.internalDebugLog('Status: ' + logMessage)
      }
    }

    function setNodeStatusTo (statusValue) {
      statusLog(statusValue)
      let statusParameter = coreBrowser.core.getNodeStatus(statusValue)
      node.status({fill: statusParameter.fill, shape: statusParameter.shape, text: statusParameter.status})
    }

    node.browseErrorHandling = function (err, msg, itemList) {
      if (err) {
        itemList = []
        itemList.push({
          displayName: {text: 'Objects'},
          nodeId: coreBrowser.core.OBJECTS_ROOT,
          browseName: 'Objects'
        })
        coreBrowser.internalDebugLog(err)

        if (node.showErrors) {
          node.error(err, msg)
        }
        coreBrowser.internalDebugLog('Browser Error ' + err.message)
        node.status({fill: 'red', shape: 'dot', text: 'error'})
      } else {
        coreBrowser.internalDebugLog('Browse Done With Error: ' + browserEntries.length + ' item(s)')
      }

      return itemList
    }

    node.browse = function (session, msg) {
      browserEntries = []
      coreBrowser.internalDebugLog('Browse Topic To Call Browse ' + node.browseTopic)

      if (session) {
        coreBrowser.browse(session, node.browseTopic).then(function (browseResult) {
          coreBrowser.internalDebugLog('Browser Root ' + node.browseTopic + ' on ' +
            session.name + ' Id: ' + session.sessionId)

          browseResult.forEach(function (result) {
            // coreBrowser.internalDebugLog('result:' + result)
            result.references.forEach(function (reference) {
              coreBrowser.internalDebugLog('Add Reference To List :' + reference)
              browserEntries.push(node.transformToEntry(reference))
            })
          })

          node.status({fill: 'green', shape: 'dot', text: 'active'})
          node.sendMessage(msg)
        }).catch(function (err) {
          browserEntries = node.browseErrorHandling(err, msg, browserEntries)
          node.sendMessage(msg)
        })
      } else {
        coreBrowser.internalDebugLog('Session To Browse Is Not Valid')
      }
    }

    node.transformToEntry = function (reference) {
      if (reference) {
        return {
          referenceTypeId: reference.referenceTypeId.toString(),
          isForward: reference.isForward,
          nodeId: reference.nodeId.toString(),
          browseName: reference.browseName.toString(),
          displayName: reference.displayName,
          nodeClass: reference.nodeClass.toString(),
          typeDefinition: reference.typeDefinition.toString()
        }
      } else {
        coreBrowser.internalDebugLog('Empty Reference On Browse')
      }
    }

    node.sendMessage = function (originMessage) {
      let msg = {}

      msg.nodetype = 'browse'
      msg.payload = {
        request: originMessage,
        endpoint: node.connector.endpoint,
        session: node.opcuaSession.name,
        browseTopic: node.browseTopic,
        browserResultCount: browserEntries.length,
        browserItems: browserEntries
      }

      node.send(msg)
    }

    node.on('input', function (msg) {
      node.browseTopic = null

      if (!node.opcuaSession) {
        node.error(new Error('Session Not Ready To Browse'), msg)
        return
      }

      node.browseTopic = node.extractBrowserTopic(msg)
      if (node.browseTopic) {
        node.browse(node.opcuaSession, msg)
      } else {
        node.error(new Error('No Topic To Browse'), msg)
      }
    })

    node.extractBrowserTopic = function (msg) {
      let rootNodeId

      if (msg.payload.actiontype === 'browse') { // event driven browsing
        if (msg.payload.root && msg.payload.root.nodeId) {
          coreBrowser.internalDebugLog('Root Selected External ' + msg.payload.root)
          rootNodeId = node.browseByItem(msg.payload.root.nodeId)
        } else {
          rootNodeId = node.topic
        }
      } else {
        if (msg.topic) {
          rootNodeId = msg.topic
        } else {
          rootNodeId = node.topic
        }
      }

      return rootNodeId || node.browseToRoot()
    }

    node.browseByItem = function (nodeId) {
      coreBrowser.internalDebugLog('Browse To Parent ' + nodeId)
      return nodeId
    }

    node.browseToRoot = function () {
      coreBrowser.internalDebugLog('Browse To Root ' + coreBrowser.core.OBJECTS_ROOT)
      return coreBrowser.core.OBJECTS_ROOT
    }

    node.handleSessionError = function (err) {
      if (node.showErrors) {
        node.error(err, {payload: 'Browser Session Error'})
      }

      node.connector.closeSession(function () {
        node.startOPCUASession(node.opcuaClient)
      })
    }

    node.startOPCUASession = function (opcuaClient) {
      coreBrowser.internalDebugLog('Browser Start OPC UA Session')
      node.opcuaClient = opcuaClient
      node.connector.startSession(coreBrowser.core.TEN_SECONDS_TIMEOUT).then(function (session) {
        node.opcuaSession = session
        setNodeStatusTo('connected')
      }).catch(node.handleSessionError)
    }

    if (node.connector) {
      coreBrowser.internalDebugLog('Browser Start OPC UA Session')
      node.connector.on('connected', node.startOPCUASession)
    } else {
      throw new TypeError('Connector Not Valid')
    }

    node.on('close', function (done) {
      node.connector.closeSession(done)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Browser', OPCUAIIoTBrowser)

  RED.httpAdmin.get('/browser/browse', RED.auth.needsPermission('browser.browse'), function (req, res) {
    coreBrowser.internalDebugLog(browserEntries.length + ' Items In List On HTTP Request ' + req)
    res.json(browserEntries)
  })
}
