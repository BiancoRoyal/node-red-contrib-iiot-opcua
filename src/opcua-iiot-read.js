/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-iiot-opcua
 */
'use strict'

module.exports = function (RED) {
  let coreClient = require('./core/opcua-iiot-core-client')

  function OPCUAIIoTRead (config) {
    RED.nodes.createNode(this, config)
    this.attributeId = config.attributeId || 0
    this.maxAge = config.maxAge || 0
    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connector = RED.nodes.getNode(config.connector)

    let node = this

    setNodeStatusTo(false)

    function verboseLog (logMessage) {
      if (RED.settings.verbose) {
        coreClient.internalDebugLog(logMessage)
      }
    }

    function statusLog (logMessage) {
      if (RED.settings.verbose && node.statusLog) {
        coreClient.internalDebugLog('Status: ' + logMessage)
      }
    }

    function setNodeStatusTo (statusValue) {
      statusLog(statusValue)
      let statusParameter = coreClient.core.getNodeStatus(statusValue)
      node.status({fill: statusParameter.fill, shape: statusParameter.shape, text: statusParameter.status})
    }

    node.handleReadError = function (err, msg) {
      if (RED.settings.verbose) {
        coreClient.internalDebugLog('ERROR: ' + err)
      }

      if (node.showErrors) {
        node.error(err, msg)
      }

      setNodeStatusTo('error')
    }

    node.readFromSession = function (session, itemsToRead, msg) {
      if (!itemsToRead || itemsToRead.length === 0) {
        node.handleReadError(new Error('No Items To Read'), msg)
        return
      }

      if (session) {
        if (session.sessionId === 'terminated') {
          coreClient.internalDebugLog('ERROR: Session Terminated')
          if (node.showErrors) {
            node.error(new Error('Session Terminated'), msg)
          }
        } else {
          coreClient.internalDebugLog('Read with AttributeId ' + node.attributeId)

          switch (parseInt(node.attributeId)) {
            case 0:
              coreClient.readAllAttributes(session, itemsToRead).then(function (resultsConverted, nodesToRead, results, diagnostics) {
                setNodeStatusTo('active')

                coreClient.internalDebugLog('readAllAttributes results: ' + JSON.stringify(results))
                coreClient.internalDebugLog('readAllAttributes diagnostics: ' + JSON.stringify(diagnostics))

                let message = {
                  payload: {results: resultsConverted, nodesToRead: nodesToRead},
                  nodetype: 'read',
                  readtype: 'readAllAttributes',
                  attributeId: node.attributeId
                }
                coreClient.internalDebugLog('readAllAttributes:' + JSON.stringify(message))
                node.send(message)
              }).catch(function (err) {
                node.handleReadError(err, msg)
              })
              break
            case 13:
              coreClient.readVariableValue(session, itemsToRead).then(function (resultsConverted, results, diagnostics) {
                setNodeStatusTo('active')

                coreClient.internalDebugLog('readVariableValue results: ' + JSON.stringify(results))
                coreClient.internalDebugLog('readVariableValue diagnostics: ' + JSON.stringify(diagnostics))

                let message = {
                  payload: resultsConverted,
                  nodetype: 'read',
                  readtype: 'readVariableValue',
                  attributeId: node.attributeId
                }
                coreClient.internalDebugLog('readVariableValue:' + JSON.stringify(message))
                node.send(message)
              }).catch(function (err) {
                node.handleReadError(err, msg)
              })
              break
            default:
              let item = null
              let newItem = {}
              let nodesToReadWithAttributeId = []
              for (item of itemsToRead) {
                newItem.nodeId = item
                nodesToReadWithAttributeId.push({
                  nodeId: coreClient.core.newOPCUANodeIdFromItemNodeId(newItem),
                  attributeId: node.attributeId
                })
              }

              coreClient.read(session, nodesToReadWithAttributeId, node.maxAge).then(function (resultsConverted, results, diagnostics) {
                setNodeStatusTo('active')

                coreClient.internalDebugLog('read results: ' + JSON.stringify(results))
                coreClient.internalDebugLog('read diagnostics: ' + JSON.stringify(diagnostics))

                let message = {
                  payload: resultsConverted,
                  nodetype: 'read',
                  readtype: 'read',
                  attributeId: node.attributeId
                }
                coreClient.internalDebugLog('read:' + JSON.stringify(message))
                node.send(message)
              }).catch(function (err) {
                node.handleReadError(err, msg)
              })
          }
        }
      } else {
        node.handleReadError(new Error('Session Not Valid On Read'), msg)
      }
    }

    node.on('input', function (msg) {
      node.readFromSession(node.opcuaSession, coreClient.core.buildNodesToRead(msg), msg)
    })

    node.handleSessionError = function (err) {
      if (node.showErrors) {
        node.error(err, {payload: 'Read Session Error'})
      }

      node.connector.closeSession(function () {
        node.startOPCUASession(node.opcuaClient)
      })
    }

    node.startOPCUASession = function (opcuaClient) {
      coreClient.internalDebugLog('Read Start OPC UA Session')
      node.opcuaClient = opcuaClient
      node.connector.startSession(coreClient.core.TEN_SECONDS_TIMEOUT).then(function (session) {
        node.opcuaSession = session
        setNodeStatusTo('connected')
      }).catch(node.handleSessionError)
    }

    if (node.connector) {
      node.connector.on('connected', node.startOPCUASession)
    } else {
      throw new TypeError('Connector Not Valid')
    }

    node.on('close', function () {
      if (node.opcuaSession) {
        node.opcuaSession.close(function (err) {
          if (err) {
            coreClient.internalDebugLog('ERROR: on close session ' + err)
          }
          node.opcuaSession = null
          verboseLog('Session closed')
        })
      } else {
        node.opcuaSession = null
      }
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Read', OPCUAIIoTRead)

  // AttributeId via REST
}
