/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-iiot-opcua
 */
'use strict'

/**
 * OPC UA connector Node-RED config node.
 *
 * @param RED
 */
module.exports = function (RED) {
  let coreConnector = require('./core/opcua-iiot-core-connector')

  function OPCUAIIoTConnectorConfiguration (config) {
    const CONNECTION_START_DELAY = 2000 // 2 sec.
    const UNLIMITED_LISTENERS = 0

    RED.nodes.createNode(this, config)
    this.endpoint = config.endpoint
    this.loginEnabled = config.loginEnabled
    this.name = config.name
    this.credentials = config.credentials

    let node = this
    node.client = null
    node.userIdentity = {}
    node.opcuaClient = null

    if (node.credentials && node.loginEnabled) {
      node.userIdentity.userName = node.credentials.user
      node.userIdentity.password = node.credentials.password
      coreConnector.internalDebugLog('Connecting With Login Data On ' + node.endpoint)
    }

    node.connectOPCUAEndpoint = function () {
      coreConnector.internalDebugLog('Connecting On ' + node.endpoint)
      node.opcuaClient = null

      coreConnector.connect(node.endpoint).then(function (opcuaClient) {
        coreConnector.internalDebugLog('Connected On ' + node.endpoint)
        node.opcuaClient = opcuaClient
        coreConnector.internalDebugLog('Emit Connected Event')
        node.emit('connected', node.opcuaClient)
      }).catch(node.handleError)
    }

    node.startSession = function (timeoutSeconds, type) {
      coreConnector.internalDebugLog('Request For New Session From ' + type)
      let now = Date.now()

      return new Promise(
        function (resolve, reject) {
          coreConnector.createSession(node.opcuaClient, node.userIdentity).then(function (session) {
            coreConnector.internalDebugLog(type + ' Starting Session On ' + node.endpoint)
            session.timeout = coreConnector.core.calcMillisecondsByTimeAndUnit(timeoutSeconds || 10, 's')
            session.startKeepAliveManager()
            session.on('error', node.handleError)
            coreConnector.internalDebugLog(type + ' Session ' + session.sessionId + ' Started On ' + node.endpoint)

            coreConnector.internalDebugLog(' name..................... ', session.name)
            coreConnector.internalDebugLog(' sessionId................ ', session.sessionId)
            coreConnector.internalDebugLog(' authenticationToken...... ', session.authenticationToken)
            coreConnector.internalDebugLog(' timeout.................. ', session.timeout)
            coreConnector.internalDebugLog(' serverNonce.............. ', session.serverNonce.toString('hex'))
            coreConnector.internalDebugLog(' serverCertificate........ ', session.serverCertificate.toString('base64'))
            coreConnector.internalDebugLog(' serverSignature.......... ', session.serverSignature)
            coreConnector.internalDebugLog(' lastRequestSentTime...... ', new Date(session.lastRequestSentTime).toISOString(), now - session.lastRequestSentTime)
            coreConnector.internalDebugLog(' lastResponseReceivedTime. ', new Date(session.lastResponseReceivedTime).toISOString(), now - session.lastResponseReceivedTime)

            resolve(session)
          }).catch(reject)
        })
    }

    node.closeSession = function (session, done) {
      if (session) {
        coreConnector.internalDebugLog('Close Session Id: ' + session.sessionId)
        coreConnector.closeSession(session).then(function (done) {
          coreConnector.internalDebugLog('Successfully Closed For Reconnect On ' + node.endpoint)
          done()
        }).catch(done)
      } else {
        coreConnector.internalDebugLog('No Session To Close ' + node.endpoint)
        done()
      }
    }

    node.handleError = function (err) {
      if (err) {
        node.error(err, {payload: 'Connector Error'})
      } else {
        coreConnector.internalDebugLog('Error on ' + node.endpoint)
      }
    }

    node.setMaxListeners(UNLIMITED_LISTENERS)
    setTimeout(node.connectOPCUAEndpoint, CONNECTION_START_DELAY)

    node.on('close', function () {
      coreConnector.internalDebugLog('Connector Close ' + node.endpoint)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Connector', OPCUAIIoTConnectorConfiguration, {
    credentials: {
      user: {type: 'text'},
      password: {type: 'password'}
    }
  })

  // SecurityPolicy enum via REST
}
