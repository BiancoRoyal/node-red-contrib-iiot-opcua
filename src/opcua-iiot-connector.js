/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
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
  // SOURCE-MAP-REQUIRED
  let coreConnector = require('./core/opcua-iiot-core-connector')
  let path = require('path')
  const _ = require('underscore')

  function OPCUAIIoTConnectorConfiguration (config) {
    const CONNECTION_START_DELAY = 1200 // msec.
    const RECONNECT_DELAY = 600 // msec.
    const UNLIMITED_LISTENERS = 0

    RED.nodes.createNode(this, config)
    this.discoveryUrl = config.discoveryUrl || null
    this.endpoint = config.endpoint
    this.endpointMustExist = config.endpointMustExist || false
    this.keepSessionAlive = config.keepSessionAlive
    this.loginEnabled = config.loginEnabled
    this.name = config.name
    this.showErrors = config.showErrors
    this.securityPolicy = config.securityPolicy
    this.messageSecurityMode = config.securityMode
    this.publicCertificateFile = config.publicCertificateFile
    this.privateKeyFile = config.privateKeyFile
    this.defaultSecureTokenLifetime = config.defaultSecureTokenLifetime || 120000
    this.autoSelectRightEndpoint = config.autoSelectRightEndpoint
    this.strategyMaxRetry = config.strategyMaxRetry || 200
    this.strategyInitialDelay = config.strategyInitialDelay || 1000
    this.strategyMaxDelay = config.strategyMaxDelay || 30000
    this.strategyRandomisationFactor = config.strategyRandomisationFactor || 0.2
    this.requestedSessionTimeout = config.requestedSessionTimeout || 60000
    this.connectionStartDelay = config.connectionStartDelay || CONNECTION_START_DELAY
    this.reconnectDelay = config.reconnectDelay || RECONNECT_DELAY

    let node = this
    node.setMaxListeners(UNLIMITED_LISTENERS)
    node.client = null
    node.sessionNodeRequests = 0
    node.endpoints = []
    node.userIdentity = null
    node.opcuaClient = null
    node.opcuaSession = null
    node.discoveryServer = null
    node.serverCertificate = null
    node.discoveryServerEndpointUrl = null
    node.sessionNotInRenewMode = true

    node.stateMachine = coreConnector.createStatelyMachine()
    coreConnector.internalDebugLog('Start FSM: ' + node.stateMachine.getMachineState())
    coreConnector.detailDebugLog('FSM events:' + node.stateMachine.getMachineEvents())

    node.closingOPCUA = false

    let sessionStartTimeout = null
    let clientStartTimeout = null
    let nodeOPCUAClientPath = coreConnector.core.getNodeOPCUAClientPath()

    node.securedCommunication = (node.securityPolicy && node.securityPolicy !== 'None' && node.messageSecurityMode && node.messageSecurityMode !== 'NONE')

    coreConnector.detailDebugLog('config: ' + node.publicCertificateFile)
    coreConnector.detailDebugLog('config: ' + node.privateKeyFile)
    coreConnector.detailDebugLog('securedCommunication: ' + node.securedCommunication.toString())

    if (node.securedCommunication) {
      if (node.publicCertificateFile === null || node.publicCertificateFile === '') {
        node.publicCertificateFile = path.join(nodeOPCUAClientPath, '/certificates/client_selfsigned_cert_1024.pem')
        coreConnector.detailDebugLog('default key: ' + node.publicCertificateFile)
      }

      if (node.privateKeyFile === null || node.privateKeyFile === '') {
        node.privateKeyFile = path.join(nodeOPCUAClientPath, '/certificates/PKI/own/private/private_key.pem')
        coreConnector.detailDebugLog('default key: ' + node.privateKeyFile)
      }
    } else {
      node.publicCertificateFile = null
      node.privateKeyFile = null
    }

    node.opcuaClientOptions = {
      securityPolicy: node.securityPolicy || 'None',
      securityMode: node.messageSecurityMode || 'NONE',
      defaultSecureTokenLifetime: node.defaultSecureTokenLifetime,
      keepSessionAlive: node.keepSessionAlive,
      certificateFile: node.publicCertificateFile,
      privateKeyFile: node.privateKeyFile,
      endpoint_must_exist: node.endpointMustExist,
      requestedSessionTimeout: node.requestedSessionTimeout,
      connectionStrategy: {
        maxRetry: node.strategyMaxRetry,
        initialDelay: node.strategyInitialDelay,
        maxDelay: node.strategyMaxDelay,
        randomisationFactor: node.strategyRandomisationFactor
      }
    }

    if (node.loginEnabled) {
      if (node.credentials) {
        node.userIdentity = {
          userName: node.credentials.user,
          password: node.credentials.password
        }
        coreConnector.internalDebugLog('Connecting With Login Data On ' + node.endpoint)
      } else {
        node.error(new Error('Login Enabled But No Credentials'), {payload: ''})
      }
    }

    /*  #########   CONNECTION  #########     */

    node.connectOPCUAEndpoint = function () {
      if (!node.endpoint.includes('opc.tcp:')) {
        coreConnector.internalDebugLog('connector endpoint is wrong and needs opc.tcp// ' + node.endpoint)
        return
      }

      coreConnector.internalDebugLog('Connecting On ' + node.endpoint)
      coreConnector.detailDebugLog('Options ' + JSON.stringify(node.opcuaClientOptions))

      try {
        node.opcuaClient = new coreConnector.core.nodeOPCUA.OPCUAClient(node.opcuaClientOptions)

        if (node.autoSelectRightEndpoint) {
          node.autoSelectEndpointFromConnection()
        }
      } catch (e) {
        node.opcuaClient = null
        coreConnector.internalDebugLog('Error on creating OPCUAClient')
        coreConnector.internalDebugLog(e.message)
        return
      }

      if (RED.settings.verbose) {
        coreConnector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT INFORMATION !!!!!!!!!!!!!!!!!!!!!!!!!'.bgWhite.yellow)
        coreConnector.internalDebugLog('Client Information: ' + node.opcuaClient.toString())
      }

      node.opcuaClient.on('close', function (err) {
        if (err) {
          coreConnector.internalDebugLog('Connection Error On Close ' + err)
          node.stateMachine.close().end()
        } else {
          node.stateMachine.close().init()
        }
        coreConnector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION CLOSED !!!!!!!!!!!!!!!!!!!'.bgWhite.red)
        coreConnector.internalDebugLog('CONNECTION CLOSED: ' + node.endpoint)
        node.emit('server_connection_close')
      })

      node.opcuaClient.on('backoff', function (number, delay) {
        coreConnector.internalDebugLog('!!! CONNECTION FAILED FOR #'.bgWhite.yellow, number, ' retrying ', delay / 1000.0, ' sec. !!!')
        coreConnector.internalDebugLog('CONNECTION FAILED: ' + node.endpoint)
        node.stateMachine.lock()
      })

      node.opcuaClient.on('connection_reestablished', function () {
        coreConnector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION RE-ESTABLISHED !!!!!!!!!!!!!!!!!!!'.bgWhite.orange)
        coreConnector.internalDebugLog('CONNECTION RE-ESTABLISHED: ' + node.endpoint)
        node.stateMachine.unlock().open()
      })

      node.opcuaClient.on('start_reconnection', function () {
        coreConnector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT STARTING RECONNECTION !!!!!!!!!!!!!!!!!!!'.bgWhite.yellow)
        coreConnector.internalDebugLog('CONNECTION STARTING RECONNECTION: ' + node.endpoint)
        node.stateMachine.lock()
      })

      node.opcuaClient.on('timed_out_request', function () {
        coreConnector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!! CLIENT TIMED OUT REQUEST !!!!!!!!!!!!!!!!!!!'.bgWhite.blue)
        coreConnector.internalDebugLog('CONNECTION TIMED OUT REQUEST: ' + node.endpoint)
      })

      if (RED.settings.verbose) {
        node.opcuaClient.on('security_token_renewed', function () {
          coreConnector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!! CLIENT SECURITY TOKEN RENEWED !!!!!!!!!!!!!!!!!!!'.bgWhite.violet)
          coreConnector.internalDebugLog('CONNECTION SECURITY TOKEN RENEWE: ' + node.endpoint)
        })
      }

      node.opcuaClient.on('after_reconnection', function () {
        coreConnector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!      CLIENT RECONNECTED     !!!!!!!!!!!!!!!!!!!'.bgWhite.green)
        coreConnector.internalDebugLog('CONNECTION RECONNECTED: ' + node.endpoint)
        node.emit('after_reconnection', node.opcuaClient)
        node.stateMachine.unlock().open()
      })

      try {
        node.connectToClient()
      } catch (e) {
        node.opcuaClient = null
        coreConnector.internalDebugLog('Error on creating OPCUAClient')
        coreConnector.internalDebugLog(e.message)
      }
    }

    node.connectToClient = function () {
      if (!node.endpoint.includes('opc.tcp://')) {
        coreConnector.internalDebugLog('Endpoint Not Valid -> ' + node.endpoint)
        node.error(new Error('endpoint does not include opc.tcp://'), {payload: 'Client Endpoint Error'})
      }

      node.opcuaClient.connect(node.endpoint, function (err) {
        if (err) {
          node.stateMachine.lock().end()
          node.handleError(err)
        } else {
          coreConnector.internalDebugLog('client is connected now to ' + node.endpoint)
          node.stateMachine.open()
        }
      })
    }

    node.renewConnection = function () {
      node.stateMachine.lock()
      node.opcuaClient.disconnect(function (err) {
        if (err) {
          coreConnector.internalDebugLog('Disconnected With Error ' + err + ' From ' + node.endpoint)
          if (node.showErrors) {
            node.error(err, {payload: 'Error On Close Connector For Renew'})
          }
        } else {
          coreConnector.internalDebugLog('Disconnected From ' + node.endpoint)
        }
        node.stateMachine.unlock()
        node.connectToClient()
      })
    }

    node.autoSelectEndpointFromConnection = function () {
      coreConnector.internalDebugLog('Auto Searching For Endpoint On ' + node.endpoint)

      let endpointMustExist = node.opcuaClientOptions.endpoint_must_exist
      node.opcuaClientOptions.endpoint_must_exist = false
      let discoverClient = new coreConnector.core.nodeOPCUA.OPCUAClient(node.opcuaClientOptions)
      discoverClient.connect(node.endpoint).then(function () {
        coreConnector.internalDebugLog('Auto Searching Endpoint Connected To ' + node.endpoint)

        discoverClient.getEndpointsRequest(function (err, endpoints) {
          if (err) {
            coreConnector.internalDebugLog('Auto Switch To Endpoint Error ' + err)
            if (node.showErrors) {
              node.error(err, {payload: 'Get Endpoints Request Error'})
            }
          } else {
            endpoints.forEach(function (endpoint, i) {
              coreConnector.internalDebugLog('Auto Endpoint ' + endpoint.endpointUrl.toString() + ' ' + endpoint.securityPolicyUri.toString())
              let securityMode = endpoint.securityMode.key || endpoint.securityMode
              let securityPolicy = (endpoint.securityPolicyUri.includes('SecurityPolicy#')) ? endpoint.securityPolicyUri.split('#')[1] : endpoint.securityPolicyUri

              coreConnector.internalDebugLog('node-mode:' + node.messageSecurityMode + ' securityMode: ' + securityMode)
              coreConnector.internalDebugLog('node-policy:' + node.securityPolicy + ' securityPolicy: ' + securityPolicy)

              if (securityMode === node.messageSecurityMode && securityPolicy === node.securityPolicy) {
                node.endpoint = endpoint.endpointUrl
                coreConnector.internalDebugLog('Auto Switch To Endpoint ' + node.endpoint)
              }
            })
          }
          node.opcuaClientOptions.endpoint_must_exist = endpointMustExist
          discoverClient.disconnect(function (err) {
            if (err) {
              coreConnector.internalDebugLog('Endpoints Auto Request Error ' + err)
              if (node.showErrors) {
                node.error(err, {payload: 'Discover Client Disconnect Error'})
              }
            } else {
              coreConnector.internalDebugLog('Endpoints Auto Request Done With Endpoint ' + node.endpoint)
            }
          })
        })
      }).catch(function (err) {
        coreConnector.internalDebugLog('Get Auto Endpoint Request Error ' + err.message)
        node.opcuaClientOptions.endpoint_must_exist = endpointMustExist
      })
    }

    /*  #########    SESSION    #########     */

    node.startSession = function (callerInfo) {
      coreConnector.internalDebugLog('Request For New Session From ' + callerInfo)

      if (node.stateMachine.getMachineState() === 'END') {
        coreConnector.internalDebugLog('State Is End While Reconnecting')
        coreConnector.internalDebugLog('You have to restart for NodeOPCUA!')
        return
      }

      if (node.stateMachine.getMachineState() !== 'OPEN') {
        coreConnector.internalDebugLog('Session Request Not Allowed On State ' + node.stateMachine.getMachineState())
        return
      }

      if (!node.opcuaClient) {
        coreConnector.internalDebugLog('OPC UA Client Connection Is Not Valid On State ' + node.stateMachine.getMachineState())
        if (node.showErrors) {
          node.error(new Error('OPC UA Client Connection Is Not Valid'), {payload: 'Create Session Error'})
        }
        return
      }

      node.opcuaSession = null
      node.stateMachine.sessionrequest()

      node.opcuaClient.createSession(node.userIdentity || {})
        .then(function (session) {
          node.opcuaSession = session
          node.stateMachine.sessionactive()

          coreConnector.detailDebugLog('Session Created On ' + node.endpoint + ' For ' + callerInfo)
          node.logSessionInformation(node.opcuaSession)

          node.opcuaSession.on('session_closed', function (statusCode) {
            node.handleSessionClose(statusCode)
          })
        }).catch(function (err) {
          node.emit('session_error', err)
          coreConnector.internalDebugLog('Error Create Session ' + err)
          if (node.showErrors) {
            node.error(err, {payload: 'Create Session Error'})
          }
        })
    }

    node.logSessionInformation = function (session) {
      if (!session) {
        coreConnector.detailDebugLog('Session Not Valid To Log Information')
        if (node.showErrors) {
          node.error(new Error('Session Not Valid To Log Information'), {payload: 'No Session Information Log'})
        }
        return
      }

      coreConnector.internalDebugLog('Session ' + session.name + ' Id: ' + session.sessionId + ' Started On ' + node.endpoint)
      coreConnector.detailDebugLog('name :' + session.name)
      coreConnector.detailDebugLog('sessionId :' + session.sessionId)
      coreConnector.detailDebugLog('authenticationToken :' + session.authenticationToken)
      coreConnector.internalDebugLog('timeout :' + session.timeout)

      if (session.serverNonce) {
        coreConnector.detailDebugLog('serverNonce :' + session.serverNonce ? session.serverNonce.toString('hex') : 'none')
      }

      if (session.serverCertificate) {
        coreConnector.detailDebugLog('serverCertificate :' + session.serverCertificate ? session.serverCertificate.toString('base64') : 'none')
      } else {
        coreConnector.detailDebugLog('serverCertificate : None'.red)
      }

      coreConnector.detailDebugLog('serverSignature :' + session.serverSignature ? session.serverSignature : 'none')

      if (session.lastRequestSentTime) {
        coreConnector.detailDebugLog('lastRequestSentTime : ' + session.lastRequestSentTime)
        coreConnector.internalDebugLog('lastRequestSentTime converted :' + session.lastRequestSentTime ? new Date(session.lastRequestSentTime).toISOString() : 'none')
      }

      if (session.lastResponseReceivedTime) {
        coreConnector.detailDebugLog('lastResponseReceivedTime : ' + session.lastResponseReceivedTime)
        coreConnector.internalDebugLog('lastResponseReceivedTime converted :' + session.lastResponseReceivedTime ? new Date(session.lastResponseReceivedTime).toISOString() : 'none')
      }
    }

    node.resetBadSession = function () {
      node.sessionNodeRequests += 1
      coreConnector.detailDebugLog('Session Node Requests At Connection ' + node.sessionNodeRequests)
      if (node.showErrors) {
        coreConnector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!   BAD SESSION ON CONNECTOR   !!!!!!!!!!!!!!!!!!'.bgWhite.red)
        node.logSessionInformation(node.opcuaSession)
      }

      if (node.sessionNodeRequests > 10) {
        node.stateMachine.lock()
        node.renewSession('ToManyBadSessionRequests')
      }
    }

    node.renewSession = function (callerInfo) {
      if (node.stateMachine.getMachineState() !== 'LOCKED') {
        coreConnector.internalDebugLog('Renew Session Request Not Allowed On State ' + node.stateMachine.getMachineState())
        return
      }

      node.closeSession(() => {
        if (sessionStartTimeout) {
          clearTimeout(sessionStartTimeout)
          sessionStartTimeout = null
        }
        sessionStartTimeout = setTimeout(() => {
          node.startSession('Renew Session From' + callerInfo)
        }, node.reconnectDelay)
      })
    }

    node.closeSession = function (done) {
      if (node.opcuaSession && node.opcuaSession.sessionId !== 'terminated') {
        node.opcuaClient.closeSession(node.opcuaSession, false, function (err) {
          if (err) {
            coreConnector.internalDebugLog('Client Session Close ' + err)
            if (node.showErrors) {
              node.error(err, {payload: 'Client Session Close Error'})
            }
          }
          done()
        })
      } else {
        done()
      }
    }

    node.handleError = function (err) {
      coreConnector.internalDebugLog('Handle Error On ' + node.endpoint + ' err:' + err)
      if (node.showErrors) {
        node.error(err, {payload: 'Handle Connector Error'})
      }
    }

    node.handleSessionClose = function (statusCode) {
      coreConnector.internalDebugLog('Session Closed With StatusCode ' + statusCode)
      node.logSessionInformation(node.opcuaSession)
      node.stateMachine.sessionclose()
    }

    node.disconnectNodeOPCUA = function (done) {
      if (node.opcuaClient) {
        coreConnector.internalDebugLog('Close Node Disconnect Connector From ' + node.endpoint)
        node.opcuaClient.disconnect(function (err) {
          if (err) {
            coreConnector.internalDebugLog('Close Node Disconnected Connector From ' + node.endpoint + ' with Error ' + err)
            if (node.showErrors) {
              node.error(err, {payload: 'Client Close Error On Close Connector'})
            }
          } else {
            coreConnector.internalDebugLog('Close Node Disconnected Connector From ' + node.endpoint)
          }
          coreConnector.internalDebugLog('Close Node Done For Connector On ' + node.endpoint)
          done()
        })
      } else {
        coreConnector.internalDebugLog('Close Node Done For Connector Without Client On ' + node.endpoint)
        done()
      }
    }

    node.on('close', function (done) {
      node.stateMachine.lock().end()
      node.disconnectNodeOPCUA(done)
    })

    /* #########   FSM EVENTS  #########     */

    node.stateMachine.onIDLE = function (event, oldState, newState) {
      coreConnector.detailDebugLog('Connector IDLE Event FSM')
    }

    node.stateMachine.onINIT = function (event, oldState, newState) {
      coreConnector.detailDebugLog('Connector Init Event FSM')
      try {
        if (clientStartTimeout) {
          clearTimeout(clientStartTimeout)
          clientStartTimeout = null
        }
        clientStartTimeout = setTimeout(node.connectOPCUAEndpoint, node.connectionStartDelay)
      } catch (err) {
        coreConnector.internalDebugLog('OPC UA Connecting ' + err)
        if (node.showErrors) {
          node.error(err, {payload: 'OPC UA Connecting Error On Init'})
        }
      }
    }

    node.stateMachine.onOPEN = function (event, oldState, newState) {
      coreConnector.detailDebugLog('Connector Open Event FSM')

      node.opcuaSession = null
      node.emit('connection_started', node.opcuaClient)

      coreConnector.internalDebugLog('Client Connected To ' + node.endpoint)
      coreConnector.detailDebugLog('Client Options ' + JSON.stringify(node.opcuaClientOptions))

      try {
        if (sessionStartTimeout) {
          clearTimeout(sessionStartTimeout)
          sessionStartTimeout = null
        }
        sessionStartTimeout = setTimeout(() => { node.startSession('Open Event') }, RECONNECT_DELAY)
      } catch (err) {
        coreConnector.internalDebugLog('OPC UA Open Session ' + err)
        if (node.showErrors) {
          node.error(err, {payload: 'OPC UA Session Error On Open'})
        }
      }
    }

    node.stateMachine.onSESSIONREQUESTED = function (event, oldState, newState) {
      coreConnector.detailDebugLog('Connector Session Request Event FSM')
    }

    node.stateMachine.onSESSIONACTIVE = function (event, oldState, newState) {
      coreConnector.detailDebugLog('Connector Session Active Event FSM')
      node.sessionNodeRequests = 0
      node.emit('session_started', node.opcuaSession)
    }

    node.stateMachine.onSESSIONCLOSED = function (event, oldState, newState) {
      coreConnector.detailDebugLog('Connector Session Close Event FSM')
      node.emit('session_closed')
      node.opcuaSession = null
    }

    node.stateMachine.onCLOSED = function (event, oldState, newState) {
      coreConnector.detailDebugLog('Connector Client Close Event FSM')
      node.emit('connection_closed')
      node.opcuaClient = null
    }

    node.stateMachine.onLOCKED = function (event, oldState, newState) {
      coreConnector.detailDebugLog('Connector Lock Event FSM')
    }

    node.stateMachine.onUNLOCKED = function (event, oldState, newState) {
      coreConnector.detailDebugLog('Connector Unlock Event FSM')
    }

    node.stateMachine.onEND = function (event, oldState, newState) {
      coreConnector.detailDebugLog('Connector End Event FSM')

      if (clientStartTimeout) {
        clearTimeout(clientStartTimeout)
        clientStartTimeout = null
      }

      if (sessionStartTimeout) {
        clearTimeout(sessionStartTimeout)
        sessionStartTimeout = null
      }
    }

    // handle using as config node
    node.registeredNodeList = {}

    node.registerForOPCUA = function (opcuaNode) {
      node.registeredNodeList[opcuaNode.id] = opcuaNode
      if (Object.keys(node.registeredNodeList).length === 1) {
        node.closingOPCUA = false
        if (node.stateMachine.getMachineState() === 'LOCKED') {
          node.stateMachine.unlock().idle().init()
        } else {
          node.stateMachine.init()
        }
      }
    }

    node.deregisterForOPCUA = function (opcuaNode, done) {
      delete node.registeredNodeList[opcuaNode.id]

      if (node.closingOPCUA) {
        done()
      }
      if (Object.keys(node.registeredNodeList).length === 0) {
        node.closingOPCUA = true
        if (node.opcuaClient) {
          node.opcuaClient.disconnect(function (err) {
            if (err) {
              coreConnector.internalDebugLog(err.message)
              if (node.showErrors) {
                node.error(err, {payload: 'OPC UA Unregister Last Node'})
              }
            }
            node.stateMachine.close().idle()
            done()
          })
        } else {
          done()
        }
      } else {
        done()
      }
    }
  }

  try {
    RED.nodes.registerType('OPCUA-IIoT-Connector', OPCUAIIoTConnectorConfiguration, {
      credentials: {
        user: {type: 'text'},
        password: {type: 'password'}
      }
    })
  } catch (e) {
    coreConnector.internalDebugLog(e.message)
  }

  /*  ---------------------  HTTP Requests --------------------- */

  RED.httpAdmin.get('/opcuaIIoT/client/discover/:id/:discoveryUrl', RED.auth.needsPermission('opcua.discovery'), function (req, res) {
    let node = RED.nodes.getNode(req.params.id)
    let discoverUrlRequest = decodeURIComponent(req.params.discoveryUrl)
    coreConnector.internalDebugLog('Get Discovery Request ' + JSON.stringify(req.params) + ' for ' + discoverUrlRequest)
    if (node) {
      if (discoverUrlRequest && !discoverUrlRequest.includes('opc.tcp://')) {
        res.json([])
      } else {
        let performFindServersRequest = coreConnector.core.nodeOPCUA.perform_findServersRequest
        performFindServersRequest(discoverUrlRequest, function (err, servers) {
          if (!err) {
            let endpoints = []
            servers.forEach(function (server) {
              server.discoveryUrls.forEach(function (discoveryUrl) {
                if (discoveryUrl.toString() !== discoverUrlRequest) {
                  endpoints.push(discoveryUrl.toString())
                }
              })
            })
            res.json(endpoints)
          } else {
            coreConnector.internalDebugLog('Perform Find Servers Request ' + err)
            if (node.showErrors) {
              node.error(err, {payload: ''})
            }
            res.json([])
          }
        })
      }
    } else {
      coreConnector.internalDebugLog('Get Discovery Request None Node ' + JSON.stringify(req.params))
      res.json([])
    }
  })

  RED.httpAdmin.get('/opcuaIIoT/client/endpoints/:id/:endpointUrl', RED.auth.needsPermission('opcua.endpoints'), function (req, res) {
    let node = RED.nodes.getNode(req.params.id)
    let endpointUrlRequest = decodeURIComponent(req.params.endpointUrl)
    coreConnector.internalDebugLog('Get Endpoints Request ' + JSON.stringify(req.params) + ' for ' + endpointUrlRequest)
    if (node) {
      if (endpointUrlRequest && !endpointUrlRequest.includes('opc.tcp://')) {
        res.json([])
      } else {
        node.opcuaClientOptions.endpoint_must_exist = false
        let discoveryClient = new coreConnector.core.nodeOPCUA.OPCUAClient(node.opcuaClientOptions)
        discoveryClient.connect(endpointUrlRequest).then(function () {
          coreConnector.internalDebugLog('Get Endpoints Connected For Request')
          discoveryClient.getEndpointsRequest(function (err, endpoints) {
            if (err) {
              if (node.showErrors) {
                node.error(err, {payload: ''})
              }
              coreConnector.internalDebugLog('Get Endpoints Request Error ' + err)
              res.json([])
            } else {
              coreConnector.internalDebugLog('Sending Endpoints For Request')
              res.json(endpoints)
            }
            discoveryClient.disconnect(function () {
              coreConnector.internalDebugLog('Get Endpoints Request Disconnect')
            })
            node.opcuaClientOptions.endpoint_must_exist = endpointMustExist
          })
        }).catch(function (err) {
          node.opcuaClientOptions.endpoint_must_exist = endpointMustExist
          coreConnector.internalDebugLog('Get Endpoints Request Error ' + err.message)
          res.json([])
        })
        let endpointMustExist = node.opcuaClientOptions.endpoint_must_exist
      }
    } else {
      coreConnector.internalDebugLog('Get Endpoints Request None Node ' + JSON.stringify(req.params))
      res.json([])
    }
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/DataTypeIds', RED.auth.needsPermission('opcuaIIoT.plain.datatypes'), function (req, res) {
    res.json(_.toArray(_.invert(coreConnector.core.nodeOPCUA.DataTypeIds)))
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/AttributeIds', RED.auth.needsPermission('opcuaIIoT.plain.attributeids'), function (req, res) {
    res.json(_.toArray(_.invert(coreConnector.core.nodeOPCUA.AttributeIds)))
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/StatusCodes', RED.auth.needsPermission('opcuaIIoT.plain.statuscodes'), function (req, res) {
    res.json(_.toArray(_.invert(coreConnector.core.nodeOPCUA.StatusCodes)))
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/ObjectTypeIds', RED.auth.needsPermission('opcuaIIoT.plain.objecttypeids'), function (req, res) {
    res.json(coreConnector.core.nodeOPCUA.ObjectTypeIds)
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/VariableTypeIds', RED.auth.needsPermission('opcuaIIoT.plain.variabletypeids'), function (req, res) {
    res.json(coreConnector.core.nodeOPCUA.VariableTypeIds)
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/ReferenceTypeIds', RED.auth.needsPermission('opcuaIIoT.plain.referencetypeids'), function (req, res) {
    res.json(coreConnector.core.nodeOPCUA.ReferenceTypeIds)
  })

  RED.httpAdmin.get('/opcuaIIoT/xmlsets/public', RED.auth.needsPermission('opcuaIIoT.xmlsets'), function (req, res) {
    let xmlset = []
    xmlset.push(coreConnector.core.nodeOPCUA.di_nodeset_filename)
    xmlset.push(coreConnector.core.nodeOPCUA.adi_nodeset_filename)
    xmlset.push('public/vendor/opc-foundation/xml/Opc.ISA95.NodeSet2.xml')
    xmlset.push('public/vendor/opc-foundation/xml/Opc.Ua.Adi.NodeSet2.xml')
    xmlset.push('public/vendor/opc-foundation/xml/Opc.Ua.Di.NodeSet2.xml')
    xmlset.push('public/vendor/opc-foundation/xml/Opc.Ua.Gds.NodeSet2.xml')
    xmlset.push('public/vendor/harting/10_di.xml')
    xmlset.push('public/vendor/harting/20_autoid.xml')
    xmlset.push('public/vendor/harting/30_aim.xml')
    res.json(xmlset)
  })

  RED.httpAdmin.get('/opcuaIIoT/list/DataTypeIds', RED.auth.needsPermission('opcuaIIoT.list.datatypeids'), function (req, res) {
    let typeList = coreConnector.core.nodeOPCUA.DataTypeIds
    let invertedTypeList = _.toArray(_.invert(typeList))
    let resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ nodeId: 'i=' + typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/opcuaIIoT/list/EventTypeIds', RED.auth.needsPermission('opcuaIIoT.list.eventtypeids'), function (req, res) {
    let objectTypeIds = coreConnector.core.nodeOPCUA.ObjectTypeIds
    let invertedObjectTypeIds = _.invert(objectTypeIds)
    let eventTypes = _.filter(invertedObjectTypeIds, function (objectTypeId) {
      return objectTypeId.indexOf('Event') > -1
    })

    let typelistEntry
    let eventTypesResults = []
    for (typelistEntry of eventTypes) {
      eventTypesResults.push({ nodeId: 'i=' + objectTypeIds[typelistEntry], label: typelistEntry })
    }
    res.json(eventTypesResults)
  })

  RED.httpAdmin.get('/opcuaIIoT/list/InstanceTypeIds', RED.auth.needsPermission('opcuaIIoT.list.instancetypeids'), function (req, res) {
    let typeList = coreConnector.core.nodeOPCUA.ObjectTypeIds
    let variabletypeList = coreConnector.core.nodeOPCUA.VariableTypeIds
    let invertedTypeList = _.toArray(_.invert(typeList))
    let invertedVariableTypeList = _.toArray(_.invert(variabletypeList))
    let resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ nodeId: 'i=' + typeList[typelistEntry], label: typelistEntry })
    }

    for (typelistEntry of invertedVariableTypeList) {
      resultTypeList.push({ nodeId: 'i=' + typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/opcuaIIoT/list/VariableTypeIds', RED.auth.needsPermission('opcuaIIoT.list.variabletypeids'), function (req, res) {
    let typeList = coreConnector.core.nodeOPCUA.VariableTypeIds
    let invertedTypeList = _.toArray(_.invert(typeList))
    let resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ nodeId: 'i=' + typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/opcuaIIoT/list/ReferenceTypeIds', RED.auth.needsPermission('opcuaIIoT.list.referencetypeids'), function (req, res) {
    let typeList = coreConnector.core.nodeOPCUA.ReferenceTypeIds
    let invertedTypeList = _.toArray(_.invert(typeList))
    let resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ nodeId: 'i=' + typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/opcuaIIoT/list/FilterTypes', RED.auth.needsPermission('opcuaIIoT.list.filterids'), function (req, res) {
    let resultTypeList = []
    resultTypeList.push({ name: 'dataType', label: 'Data Type' })
    resultTypeList.push({ name: 'dataValue', label: 'Data Value' })
    resultTypeList.push({ name: 'nodeClass', label: 'Node Class' })
    resultTypeList.push({ name: 'typeDefinition', label: 'Type Definition' })
    resultTypeList.push({ name: 'browseName', label: 'Browse Name' })
    resultTypeList.push({ name: 'nodeId', label: 'Node Id' })
    res.json(resultTypeList)
  })
}
