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

  // let OPCUADiscoveryServer = require('lib/server/opcua_discovery_server').OPCUADiscoveryServer

  function OPCUAIIoTConnectorConfiguration (config) {
    const CONNECTION_START_DELAY = 2000 // 2 sec.
    const UNLIMITED_LISTENERS = 0

    RED.nodes.createNode(this, config)
    this.endpoint = config.endpoint
    this.keepSessionAlive = config.keepSessionAlive
    this.loginEnabled = config.loginEnabled
    this.name = config.name
    this.securityPolicy = config.securityPolicy
    this.messageSecurityMode = config.securityMode

    let node = this
    node.client = null
    node.userIdentity = null
    node.opcuaClient = null
    node.discoveryServer = null
    node.serverCertificate = null
    node.discoveryServerEndpointUrl = null

    node.opcuaClientOptions = {
      securityPolicy: node.securityPolicy || 'None',
      securityMode: node.messageSecurityMode || 'NONE',
      defaultSecureTokenLifetime: 40000,
      keepSessionAlive: true,
      connectionStrategy: {
        maxRetry: 10,
        initialDelay: 2000,
        maxDelay: 10000
      }
    }

    if (node.loginEnabled) {
      if (node.credentials) {
        // client.createSession({userName: "JoeDoe", password:"secret"}, function ...
        node.userIdentity = {
          userName: node.credentials.user,
          password: node.credentials.password
        }
        coreConnector.internalDebugLog('Connecting With Login Data On ' + node.endpoint)
      } else {
        node.error(new Error('Login Enabled But No Credentials'))
      }
    }

    // TODO: refactor code!
    node.connectOPCUAEndpoint = function () {
      coreConnector.internalDebugLog('Connecting On ' + node.endpoint + ' Options ' + JSON.stringify(node.opcuaClientOptions))
      node.opcuaClient = null

      coreConnector.connect(node.endpoint, node.opcuaClientOptions).then(function (opcuaClient) {
        coreConnector.internalDebugLog('Connected On ' + node.endpoint + ' Options ' + JSON.stringify(node.opcuaClientOptions))

        coreConnector.setupSecureConnectOptions(opcuaClient, node.opcuaClientOptions).then(function (opcuaClient) {
          coreConnector.internalDebugLog('Setup Certified Options For ' + node.endpoint + ' Options ' + JSON.stringify(node.opcuaClientOptions))
          delete node.opcuaClientOptions.keepSessionAlive

          coreConnector.disconnect(opcuaClient).then(function () {
            coreConnector.internalDebugLog('Disconnected From ' + node.endpoint + ' Options ' + JSON.stringify(node.opcuaClientOptions))

            node.opcuaClient = null

            coreConnector.connect(node.endpoint, node.opcuaClientOptions).then(function (opcuaClient) {
              coreConnector.internalDebugLog('Secured Connected On ' + node.endpoint + ' Options ' + JSON.stringify(node.opcuaClientOptions))

              node.opcuaClient = opcuaClient

              node.opcuaClient.getEndpointsRequest(function (err, endpoints) {
                if (err) {
                  coreConnector.internalDebugLog('Get Endpoints Request Error' + err)
                } else {
                  coreConnector.internalDebugLog('Emit Connected Event')
                  node.emit('connected', node.opcuaClient)
                }
              })
            }).catch(function (err) {
              node.handleError(err)
            })
          }).catch(function (err) {
            node.handleError(err)
          })
        }).catch(function (err) {
          node.handleError(err)
        })
      }).catch(function (err) {
        node.handleError(err)
      })

      // TODO: use discovery to find other servers
      // node.discoveryServer = new OPCUADiscoveryServer()
      // node.discoveryServerEndpointUrl = node.discoveryServer._get_endpoints()[0].endpointUrl
      // node.discoveryServer.start(function (err) {
      //   if (err) {
      //     coreConnector.internalDebugLog('Discovery Server Error ' + err)
      //   } else {
      //     coreConnector.internalDebugLog('Discovery Server Started ' + node.discoveryServerEndpointUrl)
      //   }
      // })

      let findServersRequest = require('node-opcua/lib/findservers').perform_findServersRequest
      findServersRequest('opc.tcp://localhost:4840/UADiscovery', function (err, servers) {
        if (err) {
          coreConnector.internalDebugLog('Discovery Error ' + err)
        } else {
          servers.forEach(function (server) {
            coreConnector.internalDebugLog('Discovery Server')
            coreConnector.internalDebugLog('     applicationUri:' + server.applicationUri.cyan.bold)
            coreConnector.internalDebugLog('         productUri:' + server.productUri.cyan.bold)
            coreConnector.internalDebugLog('    applicationName:' + server.applicationName.text.cyan.bold)
            coreConnector.internalDebugLog('               type:' + server.applicationType.key.cyan.bold)
            coreConnector.internalDebugLog('   gatewayServerUri:' + server.gatewayServerUri ? server.gatewayServerUri.cyan.bold : '')
            coreConnector.internalDebugLog('discoveryProfileUri:' + server.discoveryProfileUri ? server.discoveryProfileUri.cyan.bold : '')
            coreConnector.internalDebugLog('      discoveryUrls:')

            server.discoveryUrls.forEach(function (discoveryUrl) {
              coreConnector.internalDebugLog('                    ' + discoveryUrl.cyan.bold)
            })
            coreConnector.internalDebugLog('--------------------------------------')
          })
        }
      })
    }

    node.startSession = function (timeoutSeconds, type) {
      coreConnector.internalDebugLog('Request For New Session From ' + type)
      let now = Date.now()

      return new Promise(
        function (resolve, reject) {
          coreConnector.createSession(node.opcuaClient, node.userIdentity).then(function (session) {
            coreConnector.internalDebugLog(type + ' Starting Session On ' + node.endpoint)

            session.timeout = coreConnector.core.calcMillisecondsByTimeAndUnit(timeoutSeconds || 10, 's')
            if (node.keepSessionAlive) {
              session.startKeepAliveManager()
            }
            session.on('error', node.handleError)

            coreConnector.internalDebugLog(type + ' Session ' + session.sessionId + ' Started On ', node.endpoint)
            coreConnector.internalDebugLog('name :' + session.name)
            coreConnector.internalDebugLog('sessionId :' + session.sessionId)
            coreConnector.internalDebugLog('authenticationToken :' + session.authenticationToken)
            coreConnector.internalDebugLog('timeout :' + session.timeout)

            if (session.serverNonce) {
              coreConnector.internalDebugLog('serverNonce :' + session.serverNonce.toString('hex') | 'none')
            }

            if (session.serverCertificate) {
              coreConnector.internalDebugLog('serverCertificate :' + session.serverCertificate.toString('base64') | 'none')
            }
            coreConnector.internalDebugLog('serverSignature :' + session.serverSignature)
            coreConnector.internalDebugLog('lastRequestSentTime :' + new Date(session.lastRequestSentTime).toISOString() + ' ' + now - session.lastRequestSentTime)
            coreConnector.internalDebugLog('lastResponseReceivedTime :' + new Date(session.lastResponseReceivedTime).toISOString() + ' ' + now - session.lastResponseReceivedTime)

            resolve(session)
          }).catch(function (err) {
            coreConnector.internalDebugLog('Session Start Error ' + err)
            reject(err)
          })
        })
    }

    node.closeSession = function (session, done) {
      if (session) {
        coreConnector.internalDebugLog('Close Session Id: ' + session.sessionId)
        coreConnector.closeSession(session).then(function (done) {
          coreConnector.internalDebugLog('Successfully Closed For Reconnect On ' + node.endpoint)
          done()
        }).catch(function (err) {
          coreConnector.internalDebugLog('Session Close Error ' + err)
          done()
        })
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
