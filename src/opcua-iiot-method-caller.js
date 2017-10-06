/*
 The BSD 3-Clause License

 Copyright 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * OPC UA node representation for Node-RED OPC UA IIoT method call.
 *
 * @param RED
 */
module.exports = function (RED) {
  let coreMethod = require('./core/opcua-iiot-core-method')

  function OPCUAIIoTMethodCaller (config) {
    RED.nodes.createNode(this, config)
    this.objectId = config.objectId
    this.methodId = config.methodId
    this.methodtype = config.methodtype
    this.value = config.value
    this.name = config.name
    this.inputArguments = config.inputArguments
    this.connector = RED.nodes.getNode(config.connector)

    let node = this
    node.reconnectTimeout = 1000
    node.sessionTimeout = null

    node.verboseLog = function (logMessage) {
      if (RED.settings.verbose) {
        coreMethod.internalDebugLog(logMessage)
      }
    }

    node.statusLog = function (logMessage) {
      if (RED.settings.verbose && node.showStatusActivities) {
        node.verboseLog('Status: ' + logMessage)
      }
    }

    node.setNodeStatusTo = function (statusValue) {
      node.statusLog(statusValue)
      let statusParameter = coreMethod.core.getNodeStatus(statusValue, node.showStatusActivities)
      node.status({fill: statusParameter.fill, shape: statusParameter.shape, text: statusParameter.status})
    }

    node.resetSession = function () {
      if (!node.sessionTimeout && node.opcuaClient) {
        coreMethod.internalDebugLog('Reset Session')
        node.connector.closeSession(node.opcuaSession, function () {
          node.startOPCUASessionWithTimeout(node.opcuaClient)
        })
      }
    }

    node.handleMethodError = function (err, msg) {
      node.verboseLog('Method Handle Error '.red + err)

      if (node.showErrors) {
        node.error(err, msg)
      }

      coreMethod.internalDebugLog(err.message)
      node.setNodeStatusTo('error')

      if (err.message && err.message.includes('BadSession')) {
        node.resetSession()
      }
    }

    node.on('input', function (msg) {
      coreMethod.detailDebugLog(JSON.stringify(msg))
      let message = {}

      if (node.objectId) {
        message.objectId = node.objectId
      } else {
        if (!msg.payload.objectId) {
          coreMethod.detailDebugLog('No Object-Id Found For Method Call')
          return
        } else {
          message.objectId = msg.payload.objectId
        }
      }

      if (node.methodId) {
        message.methodId = node.methodId
      } else {
        if (!msg.topic && !msg.methodId) {
          coreMethod.detailDebugLog('No Method-Id Found For Method Call')
          return
        } else {
          if (!msg.methodId) {
            message.methodId = msg.topic // Inject
          }
        }
      }

      if (node.inputArguments && node.inputArguments.length) {
        message.inputArguments = node.inputArguments
      } else {
        if (!msg.payload.inputArguments) {
          coreMethod.detailDebugLog('No Input Arguments Found For Method Call')
          return
        } else {
          message.inputArguments = msg.payload.inputArguments
        }
      }

      message.methodtype = node.methodtype
      message.nodetype = 'method'

      if (node.opcuaSession) {
        node.callMethodOnSession(message)
      }
    })

    node.callMethodOnSession = function (msg) {
      if (msg.methodId && msg.inputArguments) {
        coreMethod.getArgumentDefinition(node.opcuaSession, msg).then(function (results) {
          coreMethod.detailDebugLog('Call Argument Definition Results: ' + JSON.stringify(results))
          node.callMethod(msg, results)
        }).catch(node.handleMethodError)
      } else {
        coreMethod.internalDebugLog(new Error('No Method Id And/Or Parameters'))
      }
    }

    node.callMethod = function (msg, definitionResults) {
      coreMethod.callMethods(node.opcuaSession, msg).then(function (results) {
        coreMethod.detailDebugLog('Methods Call Results: ' + JSON.stringify(results))
        node.send({
          payload: JSON.parse(JSON.stringify(results)),
          definitionResults: JSON.parse(JSON.stringify(definitionResults)),
          input: msg,
          nodetype: 'method',
          methodtype: node.methodtype
        })
      })
    }

    node.handleSessionError = function (err) {
      coreMethod.internalDebugLog('Handle Session Error '.red + err)

      if (node.showErrors) {
        node.error(err, {payload: 'Write Session Error'})
      }

      node.resetSession()
    }

    node.startOPCUASession = function (opcuaClient) {
      coreMethod.internalDebugLog('Start OPC UA Session')
      node.opcuaClient = opcuaClient
      node.connector.startSession(coreMethod.core.TEN_SECONDS_TIMEOUT, 'Write Node').then(function (session) {
        node.opcuaSession = session
        coreMethod.internalDebugLog('Session Connected')
        node.setNodeStatusTo('connected')
      }).catch(node.handleSessionError)
    }

    node.startOPCUASessionWithTimeout = function (opcuaClient) {
      if (node.sessionTimeout !== null) {
        clearTimeout(node.sessionTimeout)
        node.sessionTimeout = null
      }
      coreMethod.internalDebugLog('starting OPC UA session with delay of ' + node.reconnectTimeout)
      node.sessionTimeout = setTimeout(function () {
        node.startOPCUASession(opcuaClient)
      }, node.reconnectTimeout)
    }

    node.connectorShutdown = function (opcuaClient) {
      coreMethod.internalDebugLog('Connector Shutdown')
      if (opcuaClient) {
        node.opcuaClient = opcuaClient
      }
      // node.startOPCUASessionWithTimeout(node.opcuaClient)
    }

    if (node.connector) {
      node.connector.on('connected', node.startOPCUASessionWithTimeout)
      node.connector.on('after_reconnection', node.connectorShutdown)
    } else {
      throw new TypeError('Connector Not Valid')
    }

    node.on('close', function (done) {
      if (node.opcuaSession && node.connector.opcuaClient) {
        node.connector.closeSession(node.opcuaSession, function (err) {
          if (err) {
            coreMethod.internalDebugLog('Error On Close Session ' + err)
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

  RED.nodes.registerType('OPCUA-IIoT-Method-Caller', OPCUAIIoTMethodCaller)

  RED.httpAdmin.get('/opcuaIIoT/method/basicDataTypesForSelect', RED.auth.needsPermission('opcuaIIoT.method.read'), function (req, res) {
    res.json(coreMethod.core.getBasicDataTypesForSelect())
  })
}
