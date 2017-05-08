/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-iiot-opcua
 */
'use strict'

/**
 * Browser Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED) {
  let coreBrowser = require('./core/opcua-iiot-core-browser')
  let browserEntries = []

  function OPCUAIIoTBrowser (config) {
    RED.nodes.createNode(this, config)
    this.nodeId = config.nodeId
    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connector = RED.nodes.getNode(config.connector)

    let node = this
    node.items = []
    node.browseTopic = coreBrowser.core.OBJECTS_ROOT
    node.opcuaClient = null
    node.opcuaSession = null

    node.verboseLog = function (logMessage) {
      if (RED.settings.verbose) {
        coreBrowser.internalDebugLog(logMessage)
      }
    }

    node.statusLog = function (logMessage) {
      if (RED.settings.verbose && node.showStatusActivities) {
        node.verboseLog('Status: ' + logMessage)
      }
    }

    node.setNodeStatusTo = function (statusValue) {
      node.statusLog(statusValue)
      let statusParameter = coreBrowser.core.getNodeStatus(statusValue, node.showStatusActivities)
      node.status({fill: statusParameter.fill, shape: statusParameter.shape, text: statusParameter.status})
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
        node.verboseLog('Empty Reference On Browse')
      }
    }

    node.browseErrorHandling = function (err, msg, itemList) {
      let results = []
      if (err) {
        results.push({
          displayName: {text: 'Objects'},
          nodeId: coreBrowser.core.OBJECTS_ROOT,
          browseName: 'Objects'
        })
        node.verboseLog(err)

        if (node.showErrors) {
          node.error(err, msg)
        }
        node.verboseLog('Browser Error ' + err.message)
        node.status({fill: 'red', shape: 'dot', text: 'error'})
      } else {
        results = itemList
        node.verboseLog('Browse Done With Error: ' + results.length + ' item(s)')
      }

      return results
    }

    node.browse = function (session, msg) {
      browserEntries = []
      node.verboseLog('Browse Topic To Call Browse ' + node.browseTopic)

      if (session) {
        coreBrowser.browse(session, node.browseTopic).then(function (browseResult) {
          node.verboseLog('Browser Root ' + node.browseTopic + ' on ' +
            session.name + ' Id: ' + session.sessionId)

          browseResult.forEach(function (result) {
            // node.verboseLog('result:' + result)
            result.references.forEach(function (reference) {
              node.verboseLog('Add Reference To List :' + reference)
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
        node.verboseLog('Session To Browse Is Not Valid')
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
          node.verboseLog('Root Selected External ' + msg.payload.root)
          rootNodeId = node.browseByItem(msg.payload.root.nodeId)
        } else {
          rootNodeId = node.nodeId
        }
      } else {
        if (msg.topic) {
          rootNodeId = msg.topic
        } else {
          rootNodeId = node.nodeId
        }
      }

      return rootNodeId || node.browseToRoot()
    }

    node.browseByItem = function (nodeId) {
      node.verboseLog('Browse To Parent ' + nodeId)
      return nodeId
    }

    node.browseToRoot = function () {
      node.verboseLog('Browse To Root ' + coreBrowser.core.OBJECTS_ROOT)
      return coreBrowser.core.OBJECTS_ROOT
    }

    node.handleSessionError = function (err) {
      if (node.showErrors) {
        node.error(err, {payload: 'Browser Session Error'})
      }

      node.connector.closeSession(node.opcuaSession, function () {
        node.startOPCUASession(node.opcuaClient)
      })
    }

    node.startOPCUASession = function (opcuaClient) {
      node.verboseLog('Browser Start OPC UA Session')
      node.opcuaClient = opcuaClient
      node.connector.startSession(coreBrowser.core.TEN_SECONDS_TIMEOUT, 'Browser Node').then(function (session) {
        node.opcuaSession = session
        node.verboseLog('Session Connected')
        node.setNodeStatusTo('connected')
      }).catch(node.handleSessionError)
    }

    if (node.connector) {
      node.verboseLog('Browser Start OPC UA Session')
      node.connector.on('connected', node.startOPCUASession)
    } else {
      throw new TypeError('Connector Not Valid')
    }

    node.on('close', function (done) {
      if (node.opcuaSession) {
        node.connector.closeSession(node.opcuaSession, function (err) {
          if (err) {
            node.verboseLog('Error On Close Session ' + err)
          }
          node.opcuaSession = null
          done()
        })
      } else {
        node.opcuaSession = null
        done()
      }
    })

    node.setNodeStatusTo('waiting')
  }

  RED.nodes.registerType('OPCUA-IIoT-Browser', OPCUAIIoTBrowser)

  OPCUAIIoTBrowser.prototype.browseFromSettings = function (node, nodeId, res) {
    let entries = []
    let nodeRootId = nodeId || coreBrowser.core.OBJECTS_ROOT

    if (node.opcuaSession && nodeRootId) {
      coreBrowser.internalDebugLog('Session Is Valid And NodeId Is ' + nodeRootId)

      coreBrowser.browse(node.opcuaSession, nodeRootId).then(function (browseResult) {
        browseResult.forEach(function (result) {
          result.references.forEach(function (reference) {
            entries.push(node.transformToEntry(reference))
          })
        })
        res.json(entries)
        browserEntries = entries
      }).catch(function (err) {
        if (err) {
          node.verboseLog(err)
        }
        entries.push({
          displayName: {text: 'Objects'},
          nodeId: coreBrowser.core.OBJECTS_ROOT,
          browseName: 'Objects'
        })
        res.json(entries)
        browserEntries = entries
      })
    } else {
      res.json(entries)
      browserEntries = entries
      coreBrowser.internalDebugLog('Session To Browse From Settings Is Not Valid')
    }
  }

  RED.httpAdmin.get('/opcuaIIoT/browser/:id/rootid/:rid', RED.auth.needsPermission('opcuaIIoT.browser.write'), function (req, res) {
    coreBrowser.internalDebugLog(browserEntries.length + ' Items In List On HTTP Request Body: ' + JSON.stringify(req.body))
    coreBrowser.internalDebugLog(browserEntries.length + ' Items In List On HTTP Request Params: ' + JSON.stringify(req.params))
    let node = RED.nodes.getNode(req.params.id)
    node.browseFromSettings(node, req.params.rid, res)
  })
}
