/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-opcua-iiot
 */
'use strict'

module.exports = function (RED) {
  let coreClient = require('./core/opcua-iiot-core-client')

  function OPCUAIIoTWrite (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors

    let node = this
    node.connector = RED.nodes.getNode(config.connector)

    setNodeStatusTo(false)

    function verboseLog (logMessage) {
      if (RED.settings.verbose) {
        coreClient.core.internalDebugLog(logMessage)
      }
    }

    function statusLog (logMessage) {
      if (RED.settings.verbose && node.statusLog) {
        coreClient.core.internalDebugLog('Status: ' + logMessage)
      }
    }

    function setNodeStatusTo (statusValue) {
      statusLog(statusValue)
      let statusParameter = coreClient.core.getNodeStatus(statusValue)
      node.status({fill: statusParameter.fill, shape: statusParameter.shape, text: statusParameter.status})
    }

    node.handleWriteError = function (err, msg) {
      if (RED.settings.verbose) {
        coreClient.core.internalDebugLog('ERROR: ' + err)
      }

      if (node.showErrors) {
        node.error(err, msg)
      }

      setNodeStatusTo('error')
    }

    node.writeToSession = function (session, msg) {
      if (session) {
        if (session.sessionId === 'terminated') {
          node.handleWriteError(new Error('Session Terminated'), msg)
        } else {
          let nodesToWrite = coreClient.core.buildNodesToWrite(msg)

          coreClient.write(session, nodesToWrite).then(function (resultsConverted, results, diagnostics) {
            setNodeStatusTo('active')

            coreClient.core.internalDebugLog('write results: ' + JSON.stringify(results))
            coreClient.core.internalDebugLog('write diagnostics: ' + JSON.stringify(diagnostics))

            let message = {payload: resultsConverted, nodetype: 'write'}
            node.send(message)
          }).catch(function (err) {
            node.handleWriteError(err, msg)
          })
        }
      } else {
        node.handleReadError(new Error('Session Not Valid On Write'), msg)
      }
    }

    node.on('input', function (msg) {
      node.writeToSession(node.opcuaSession, msg)
    })

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
      node.connector.startSession(coreClient.core.TEN_SECONDS_TIMEOUT).then(function (session) {
        node.opcuaSession = session
      }).catch(node.handleSessionError)
    }

    node.connector.on('connected', node.startOPCUASession)

    node.on('close', function () {
      if (node.opcuaSession) {
        node.opcuaSession.close(function (err) {
          if (err) {
            coreClient.core.internalDebugLog('ERROR: on close session ' + err)
          }
          node.opcuaSession = null
          verboseLog('Session closed')
        })
      } else {
        node.opcuaSession = null
      }
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Write', OPCUAIIoTWrite)
}
