/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
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
      defaultSecureTokenLifetime: 60000,
      keepSessionAlive: true,
      connectionStrategy: {
        maxRetry: 15,
        initialDelay: 3000,
        maxDelay: 15000
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
      coreConnector.internalDebugLog('Connecting On ' + node.endpoint)
      coreConnector.detailDebugLog('Options ' + JSON.stringify(node.opcuaClientOptions))
      node.opcuaClient = null

      coreConnector.connect(node.endpoint, node.opcuaClientOptions).then(function (opcuaClient) {
        coreConnector.internalDebugLog('Connected On ' + node.endpoint + ' Options ' + JSON.stringify(node.opcuaClientOptions))

        coreConnector.setupSecureConnectOptions(opcuaClient, node.opcuaClientOptions).then(function (opcuaClient) {
          coreConnector.internalDebugLog('Setup Certified Options For ' + node.endpoint)
          coreConnector.detailDebugLog('Options ' + JSON.stringify(node.opcuaClientOptions))
          delete node.opcuaClientOptions.keepSessionAlive

          coreConnector.disconnect(opcuaClient).then(function () {
            coreConnector.internalDebugLog('Disconnected From ' + node.endpoint)
            coreConnector.detailDebugLog('Options ' + JSON.stringify(node.opcuaClientOptions))

            node.opcuaClient = null

            coreConnector.connect(node.endpoint, node.opcuaClientOptions).then(function (opcuaClient) {
              coreConnector.internalDebugLog('Secured Connected On ' + node.endpoint)
              coreConnector.detailDebugLog('Options ' + JSON.stringify(node.opcuaClientOptions))

              node.opcuaClient = opcuaClient

              node.opcuaClient.getEndpointsRequest(function (err, endpoints) {
                if (err) {
                  coreConnector.internalDebugLog('Get Endpoints Request Error' + err)
                } else {
                  coreConnector.internalDebugLog('Emit Connected Event'.white.bgGreen)
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

      let findServersRequest = require('node-opcua').perform_findServersRequest
      findServersRequest('opc.tcp://localhost:4840/UADiscovery', function (err, servers) {
        if (err) {
          coreConnector.internalDebugLog('Discovery Error ' + err)
        } else {
          if (servers && servers.length) {
            servers.forEach(function (server) {
              coreConnector.internalDebugLog('Discovery Server')
              coreConnector.internalDebugLog('     applicationUri:' + server.applicationUri && server.applicationUri !== null ? server.applicationUri : 'none')
              coreConnector.internalDebugLog('         productUri:' + server.productUri && server.productUri !== null ? server.productUri : 'none')
              coreConnector.detailDebugLog('    applicationName:' + server.applicationName && server.applicationName !== null ? server.applicationName.text : 'none')
              coreConnector.detailDebugLog('               type:' + server.applicationType && server.applicationType !== null ? server.applicationType.key : 'none')
              coreConnector.detailDebugLog('   gatewayServerUri:' + server.gatewayServerUri && server.gatewayServerUri !== null ? server.gatewayServerUri : 'none')
              coreConnector.detailDebugLog('discoveryProfileUri:' + server.discoveryProfileUri && server.discoveryProfileUri !== null ? server.discoveryProfileUri : 'none')
              coreConnector.detailDebugLog('      discoveryUrls:')

              if (server.discoveryUrls && server.discoveryUrls.length) {
                server.discoveryUrls.forEach(function (discoveryUrl) {
                  coreConnector.detailDebugLog('                    ' + discoveryUrl && discoveryUrl !== null ? discoveryUrl : 'none')
                })
              }

              coreConnector.detailDebugLog('--------------------------------------')
            })
          }
        }
      })
    }

    node.startSession = function (timeoutSeconds, type) {
      coreConnector.internalDebugLog('Request For New Session From ' + type)

      try {
        return new Promise(
          function (resolve, reject) {
            coreConnector.createSession(node.opcuaClient, node.userIdentity).then(function (session) {
              coreConnector.internalDebugLog(type + ' Starting Session On ' + node.endpoint)

              session.timeout = coreConnector.core.calcMillisecondsByTimeAndUnit(timeoutSeconds || 10, 's')
              if (node.keepSessionAlive) {
                session.startKeepAliveManager()
              }
              session.on('error', node.handleError)

              coreConnector.internalDebugLog(type + ' ' + session.name + ' Session ' +
                session.sessionId + ' Started' + ' On' + ' ', node.endpoint)

              coreConnector.detailDebugLog('name :' + session.name)
              coreConnector.detailDebugLog('sessionId :' + session.sessionId)
              coreConnector.detailDebugLog('authenticationToken :' + session.authenticationToken)
              coreConnector.internalDebugLog('timeout :' + session.timeout)

              if (session.serverNonce) {
                coreConnector.detailDebugLog('serverNonce :' + session.serverNonce ? session.serverNonce.toString('hex') : 'none')
              }

              if (session.serverCertificate) {
                coreConnector.detailDebugLog('serverCertificate :' + session.serverCertificate ? session.serverCertificate.toString('base64') : 'none')
              }

              coreConnector.detailDebugLog('serverSignature :' + session.serverSignature)

              if (session.lastRequestSentTime) {
                coreConnector.detailDebugLog('lastRequestSentTime : ' + session.lastRequestSentTime)
                coreConnector.internalDebugLog('lastRequestSentTime converted :' + session.lastRequestSentTime ? new Date(session.lastRequestSentTime).toISOString() : 'none')
              }

              if (session.lastResponseReceivedTime) {
                coreConnector.detailDebugLog('lastResponseReceivedTime : ' + session.lastResponseReceivedTime)
                coreConnector.internalDebugLog('lastResponseReceivedTime converted :' + session.lastResponseReceivedTime ? new Date(session.lastResponseReceivedTime).toISOString() : 'none')
              }

              resolve(session)
            }).catch(function (err) {
              coreConnector.internalDebugLog('Session Start Error ' + err)
              reject(err)
            })
          })
      } catch (err) {
        coreConnector.internalDebugLog(err)
      }
    }

    node.closeSession = function (session, done) {
      try {
        if (session && node.opcuaClient) {
          coreConnector.internalDebugLog('Close Session Id: ' + session.sessionId)
          coreConnector.closeSession(session).then(function (done) {
            coreConnector.internalDebugLog('Successfully Closed For Reconnect On ' + node.endpoint)
            session = null
            done()
          }).catch(function (err) {
            coreConnector.internalDebugLog('Session Close Error ' + err)
            session = null
            done()
          })
        } else {
          coreConnector.internalDebugLog('No Session To Close ' + node.endpoint)
          session = null
          done()
        }
      } catch (err) {
        coreConnector.internalDebugLog(err)
        session = null
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
    try {
      setTimeout(node.connectOPCUAEndpoint, CONNECTION_START_DELAY)
    } catch (err) {
      coreConnector.internalDebugLog(err)
    }

    node.on('close', function (done) {
      coreConnector.internalDebugLog('Connector Close ' + node.endpoint)

      if (node.opcuaClient) {
        coreConnector.disconnect(node.opcuaClient).then(function () {
          coreConnector.internalDebugLog('Close Disconnected From ' + node.endpoint)
          node.opcuaClient = null
          done()
        }).catch(function (err) {
          node.error(new Error('Error On Close Disconnect Server', err))
          done()
        })
      }
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
