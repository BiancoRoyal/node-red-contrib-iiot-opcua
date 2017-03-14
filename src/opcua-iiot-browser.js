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

    let node = this
    node.items = browserItems

    let browseTopic = core.OBJECTS_ROOT
    let opcuaEndpoint = RED.nodes.getNode(config.endpoint)

    node.status({fill: 'gray', shape: 'dot', text: 'no Items'})

    node.add_item = function (item) {
      if (item) {
        node.items.add({'item': item})
      }
    }

    function setupClient (url, callback) {
      coreBrowser.connect(url).then(function (opcuaClient) {
        core.internalDebugLog('connected on ' + opcuaEndpoint.endpoint)
        coreBrowser.createSession(opcuaClient).then(function (session) {
          core.internalDebugLog('start session on ' + opcuaEndpoint.endpoint)
          coreBrowser.browse(session, browseTopic).then(function (browseResult) {
            browseResult.forEach(function (result) {
              result.references.forEach(function (reference) {
                node.add_item(reference)
              })
            })

            node.status({fill: 'green', shape: 'dot', text: 'Items: ' + node.items.length})

            coreBrowser.closeSession(session).then(function () {
              node.send({payload: node.items, endpoint: opcuaEndpoint.endpoint})
              core.internalDebugLog('sucessfully browse on ' + opcuaEndpoint.endpoint)
            }).catch(callback)
          }).catch(callback)
        }).catch(callback)
      }).catch(callback)
    }

    setupClient(opcuaEndpoint.endpoint, function (err) {
      if (err) {
        core.internalDebugLog(err)
        node.status({fill: 'red', shape: 'dot', text: 'Error Items: ' + node.items.length})
      } else {
        core.internalDebugLog('Browse loading Items done ...')
      }
    })

    node.on('input', function (msg) {
      browseTopic = null
      core.internalDebugLog(msg)

      if (msg.payload.hasOwnProperty('actiontype')) {
        switch (msg.payload.actiontype) {
          case 'browse':
            if (msg.payload.hasOwnProperty('root')) {
              if (msg.payload.root && msg.payload.root.hasOwnProperty('item')) {
                if (msg.payload.root.item.hasOwnProperty('nodeId')) {
                  browseTopic = browseByItem(msg.payload.root.item.nodeId)
                }
              }
            }
            break

          default:
            break
        }
      } else {
        if (!node.topic && msg.topic) {
          if (msg.topic) {
            browseTopic = msg.topic
          }
        } else {
          browseTopic = node.topic
        }
      }

      node.items = []

      if (!browseTopic) {
        browseTopic = browseToRoot()
      }

      setupClient(opcuaEndpoint.endpoint, function (err) {
        if (err) {
          core.internalDebugLog(err)
          node.status({fill: 'red', shape: 'dot', text: 'Error Items: ' + node.items.length})
        } else {
          core.internalDebugLog('Browse loading Items done ...')
        }
      })

      msg.endpoint = opcuaEndpoint.endpoint
      msg.payload = node.items

      node.send(msg)
    })

    function browseByItem (nodeId) {
      core.internalDebugLog('Browse to parent ' + nodeId)
      return nodeId
    }

    function browseToRoot () {
      core.internalDebugLog('Browse to root named Objects')
      return core.OBJECTS_ROOT
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Browser', OPCUAIIoTBrowser)

  RED.httpAdmin.get('/browser/browse', RED.auth.needsPermission('browser.browse'), function (req, res) {
    core.internalDebugLog(req)
    res.json(browserItems)
  })
}
