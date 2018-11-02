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
  const assert = require('better-assert')

  function OPCUAIIoTConnectorConfiguration (config) {
    const CONNECTION_START_DELAY = 2000 // msec.
    const CONNECTION_STOP_DELAY = 2000 // msec.
    const RECONNECT_DELAY = 1000 // msec.
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
    this.strategyMaxRetry = config.strategyMaxRetry || 10000
    this.strategyInitialDelay = config.strategyInitialDelay || 500
    this.strategyMaxDelay = config.strategyMaxDelay || 30000
    this.strategyRandomisationFactor = config.strategyRandomisationFactor || 0.2
    this.requestedSessionTimeout = config.requestedSessionTimeout || 60000
    this.connectionStartDelay = config.connectionStartDelay || CONNECTION_START_DELAY
    this.reconnectDelay = config.reconnectDelay || RECONNECT_DELAY
    this.connectionStopDelay = config.connectionStopDelay || CONNECTION_STOP_DELAY
    this.maxBadSessionRequests = config.maxBadSessionRequests || 10

    let node = this
    coreConnector.internalDebugLog('Open Connector Node')
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
    node.createConnectionTimeout = null
    node.hasOpcUaSubscriptions = false

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

    node.initCertificatesAndKeys = function () {
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

    node.updateServerOptions = function () {
      node.initCertificatesAndKeys()
      node.opcuaClientOptions = {
        securityPolicy: node.securityPolicy || 'None',
        securityMode: node.messageSecurityMode || 'NONE',
        defaultSecureTokenLifetime: node.defaultSecureTokenLifetime || 120000,
        keepSessionAlive: node.keepSessionAlive,
        certificateFile: node.publicCertificateFile,
        privateKeyFile: node.privateKeyFile,
        endpoint_must_exist: node.endpointMustExist,
        requestedSessionTimeout: node.requestedSessionTimeout || 60000,
        connectionStrategy: {
          maxRetry: node.strategyMaxRetry || 2000,
          initialDelay: node.strategyInitialDelay || 1000,
          maxDelay: node.strategyMaxDelay || 30000,
          randomisationFactor: node.strategyRandomisationFactor || 0.2
        }
      }
    }

    node.checkEndpoint = function () {
      if (node.endpoint.includes('opc.tcp://')) {
        return true
      } else {
        coreConnector.internalDebugLog('Endpoint Not Valid -> ' + node.endpoint)
        node.error(new Error('endpoint does not include opc.tcp://'), {payload: 'Client Endpoint Error'})
        return false
      }
    }

    node.connectOPCUAEndpoint = function () {
      if (!node.checkEndpoint()) {
        return
      }

      coreConnector.internalDebugLog('Connecting On ' + node.endpoint)
      coreConnector.detailDebugLog('Options ' + JSON.stringify(node.opcuaClientOptions))

      try {
        node.opcuaClient = null
        node.updateServerOptions()
        node.opcuaClient = new coreConnector.core.nodeOPCUA.OPCUAClient(node.opcuaClientOptions)

        if (node.autoSelectRightEndpoint) {
          node.autoSelectEndpointFromConnection()
        }

        coreConnector.setListenerToClient(node.opcuaClient, node)
        node.connectToClient()
      } catch (e) {
        node.opcuaClient = null
        coreConnector.internalDebugLog('Error on creating OPCUAClient')
        coreConnector.internalDebugLog(e.message)
      }
    }

    node.connectToClient = function () {
      if (!node.checkEndpoint()) {
        return
      }

      node.stateMachine.unlock()
      node.opcuaClient.connect(node.endpoint, function (err) {
        if (err) {
          node.stateMachine.lock()
          node.handleError(err)
        } else {
          coreConnector.internalDebugLog('client is connected now to ' + node.endpoint)
          node.stateMachine.open()
        }
      })
    }

    node.renewConnection = function (done) {
      node.closeConnector(() => {
        node.stateMachine.idle().init()
        done()
      })
    }

    node.endpointMatchForConnecting = function (endpoint) {
      coreConnector.internalDebugLog('Auto Endpoint ' + endpoint.endpointUrl.toString() + ' ' + endpoint.securityPolicyUri.toString())
      let securityMode = endpoint.securityMode.key || endpoint.securityMode
      let securityPolicy = (endpoint.securityPolicyUri.includes('SecurityPolicy#')) ? endpoint.securityPolicyUri.split('#')[1] : endpoint.securityPolicyUri

      coreConnector.internalDebugLog('node-mode:' + node.messageSecurityMode + ' securityMode: ' + securityMode)
      coreConnector.internalDebugLog('node-policy:' + node.securityPolicy + ' securityPolicy: ' + securityPolicy)

      return (securityMode === node.messageSecurityMode && securityPolicy === node.securityPolicy)
    }

    node.selectEndpointFromSettings = function (discoverClient) {
      discoverClient.getEndpoints(function (err, endpoints) {
        if (err) {
          coreConnector.internalDebugLog('Auto Switch To Endpoint Error ' + err)
          if (node.showErrors) {
            node.error(err, {payload: 'Get Endpoints Request Error'})
          }
        } else {
          endpoints.forEach(function (endpoint) {
            if (node.endpointMatchForConnecting(endpoint)) {
              node.endpoint = endpoint.endpointUrl
              coreConnector.internalDebugLog('Auto Switch To Endpoint ' + node.endpoint)
            }
          })
        }

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
    }

    node.autoSelectEndpointFromConnection = function () {
      coreConnector.internalDebugLog('Auto Searching For Endpoint On ' + node.endpoint)

      let endpointMustExist = node.opcuaClientOptions.endpoint_must_exist
      node.opcuaClientOptions.endpoint_must_exist = false

      let discoverClient = new coreConnector.core.nodeOPCUA.OPCUAClient(node.opcuaClientOptions)

      discoverClient.connect(node.endpoint).then(function () {
        coreConnector.internalDebugLog('Auto Searching Endpoint Connected To ' + node.endpoint)
        node.selectEndpointFromSettings(discoverClient)
        node.opcuaClientOptions.endpoint_must_exist = endpointMustExist
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
          coreConnector.logSessionInformation(node)

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

    node.resetBadSession = function () {
      node.sessionNodeRequests += 1
      coreConnector.detailDebugLog('Session Node Requests At Connector No.: ' + node.sessionNodeRequests)
      if (node.showErrors) {
        coreConnector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!   BAD SESSION ON CONNECTOR   !!!!!!!!!!!!!!!!!!'.bgWhite.red)
        coreConnector.logSessionInformation(node)
      }

      if (node.sessionNodeRequests > node.maxBadSessionRequests) {
        if (node.stateMachine.getMachineState() === 'INIT' || node.stateMachine.getMachineState() === 'SESSIONRESTART') {
          coreConnector.internalDebugLog('Renew Session Request Not Allowed On State ' + node.stateMachine.getMachineState())
          node.sessionNodeRequests = 0
          return
        }

        coreConnector.internalDebugLog('Reset Bad Session Request On State ' + node.stateMachine.getMachineState())
        node.stateMachine.lock().sessionrestart()
        node.renewSession('ToManyBadSessionRequests')
      }
    }

    node.renewSession = function (callerInfo) {
      node.closeSession(() => {
        assert(node.stateMachine.getMachineState() === 'SESSIONRESTART')

        if (sessionStartTimeout) {
          clearTimeout(sessionStartTimeout)
          sessionStartTimeout = null
        }

        node.opcuaClient = null
        coreConnector.core.nodeOPCUA = null
        coreConnector.core.nodeOPCUA = require('node-opcua')
        sessionStartTimeout = setTimeout(() => {
          node.stateMachine.idle().init()
        }, node.reconnectDelay)
      })
    }

    node.closeSession = function (done) {
      if (node.opcuaSession) {
        coreConnector.detailDebugLog('Delete Subscriptions From Session ' + node.stateMachine.getMachineState())
        node.opcuaClient.closeSession(node.opcuaSession, node.hasOpcUaSubscriptions, function (err) {
          node.stateMachine.sessionclose().sessionrestart()
          if (err) {
            coreConnector.internalDebugLog('Client Session Close ' + err)
            if (node.showErrors) {
              node.error(err, {payload: 'Client Session Close Error'})
            }
          }
          done()
        })
      } else {
        coreConnector.internalDebugLog('Close Session Without Session')
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
      coreConnector.logSessionInformation(node)
      if (node.stateMachine.getMachineState() !== 'SESSIONRESTART') {
        node.stateMachine.lock().sessionclose()
      }
    }

    node.disconnectNodeOPCUA = function (done) {
      if (node.opcuaClient) {
        coreConnector.internalDebugLog('Close Node Disconnect Connector From ' + node.endpoint)
        node.opcuaClient.disconnect(function (err) {
          node.stateMachine.close()
          if (err) {
            coreConnector.internalDebugLog('Close Node Disconnected Connector From ' + node.endpoint + ' with Error ' + err)
            if (node.showErrors) {
              node.error(err, {payload: 'Client Close Error On Close Connector'})
            }
          } else {
            coreConnector.internalDebugLog('Close Node Disconnected Connector From ' + node.endpoint)
          }
          coreConnector.internalDebugLog('Close Node Done For Connector On ' + node.endpoint)
          done() // closed state
        })
      } else {
        coreConnector.internalDebugLog('Close Node Done For Connector Without Client On ' + node.endpoint)
        node.stateMachine.close()
        done() // closed state
      }
    }

    node.on('close', function (done) {
      node.stateMachine.lock().end()
      assert(node.stateMachine.getMachineState() === 'END')
      node.emit('connection_end')
      node.closeSession(() => {
        node.closeConnector(done) // end state
      })
    })

    node.opcuaDisconnect = function (done) {
      coreConnector.detailDebugLog('OPC UA Disconnect From Connector ' + node.stateMachine.getMachineState())

      if (node.registeredNodeList.length > 0) {
        coreConnector.internalDebugLog('Connector Has Registered Nodes And Can Not Close The Node -> Count: ' + node.registeredNodeList.length)
        setTimeout(() => {
          node.closeConnector(done)
        }, node.connectionStopDelay)
      } else {
        node.disconnectNodeOPCUA(() => {
          node.opcuaClient = null
          let fsmState = node.stateMachine.getMachineState()
          coreConnector.detailDebugLog('Disconnect On State ' + fsmState)
          if (fsmState !== 'CLOSED' && fsmState !== 'END') {
            console.log(fsmState)
            done()
            assert(false)
          }
          done()
        })
      }
    }

    node.closeConnector = (done) => {
      coreConnector.detailDebugLog('Close Connector ' + node.stateMachine.getMachineState())
      if (node.opcuaClient) {
        setTimeout(() => {
          node.opcuaDisconnect(done)
        }, node.connectionStopDelay)
      } else {
        coreConnector.detailDebugLog('OPC UA Client Is Not Valid On Close Connector')
        done()
      }
    }

    node.restartWithNewSettings = function (parameters, done) {
      coreConnector.internalDebugLog('Renew With Flex Connector Request On State ' + node.stateMachine.getMachineState())

      let fsmState = node.stateMachine.getMachineState()
      if (fsmState === 'SESSIONRESTART' || fsmState === 'END') {
        coreConnector.internalDebugLog('Do Not Renew From Flex Connector Request On State ' + fsmState)
        return
      }

      node.stateMachine.lock().sessionrestart()
      node.setNewParameters(parameters)
      node.initCertificatesAndKeys()
      node.closeSession(() => {
        assert(node.stateMachine.getMachineState() === 'SESSIONRESTART')
        node.renewConnection(done)
      })
    }

    node.setNewParameters = function (parameters) {
      node.discoveryUrl = parameters.discoveryUrl || node.discoveryUrl
      node.endpoint = parameters.endpoint || node.endpoint
      node.keepSessionAlive = parameters.keepSessionAlive || node.keepSessionAlive
      node.securityPolicy = parameters.securityPolicy || node.securityPolicy
      node.messageSecurityMode = parameters.securityMode || node.messageSecurityMode
      node.name = parameters.name || node.name
      node.showErrors = parameters.showErrors || node.showErrors
      node.publicCertificateFile = parameters.publicCertificateFile || node.publicCertificateFile
      node.privateKeyFile = parameters.privateKeyFile || node.privateKeyFile
      node.defaultSecureTokenLifetime = parameters.defaultSecureTokenLifetime || node.defaultSecureTokenLifetime
      node.endpointMustExist = parameters.endpointMustExist || node.endpointMustExist
      node.autoSelectRightEndpoint = parameters.autoSelectRightEndpoint || node.autoSelectRightEndpoint
      node.strategyMaxRetry = parameters.strategyMaxRetry || node.strategyMaxRetry
      node.strategyInitialDelay = parameters.strategyInitialDelay || node.strategyInitialDelay
      node.strategyMaxDelay = parameters.strategyMaxDelay || node.strategyMaxDelay
      node.strategyRandomisationFactor = parameters.strategyRandomisationFactor || node.strategyRandomisationFactor
      node.requestedSessionTimeout = parameters.requestedSessionTimeout || node.requestedSessionTimeout
      node.connectionStartDelay = parameters.connectionStartDelay || node.connectionStartDelay
      node.reconnectDelay = parameters.reconnectDelay || node.reconnectDelay
    }

    /* #########   FSM EVENTS  #########     */

    node.stateMachine.onIDLE = function (event, oldState, newState) {
      coreConnector.detailDebugLog('Connector IDLE Event FSM')
      node.sessionNodeRequests = 0
    }

    node.stateMachine.onINIT = function (event, oldState, newState) {
      coreConnector.detailDebugLog('Connector Init Event FSM')
      node.sessionNodeRequests = 0
      node.opcuaClient = null
      node.opcuaSession = null
      node.emit('connector_init')
      node.initCertificatesAndKeys()
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
        node.startSession('Open Event')
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

    node.stateMachine.onSESSIONRESTART = function (event, oldState, newState) {
      coreConnector.detailDebugLog('Connector Session Restart Event FSM')
      node.emit('session_restart')
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
      node.resetAllTimer()
    }

    node.resetAllTimer = function () {
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
      if (!opcuaNode) {
        coreConnector.internalDebugLog('Node Not Valid To Register In Connector')
        return
      }
      coreConnector.internalDebugLog('Register In Connector NodeId: ' + opcuaNode.id)
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
      if (!opcuaNode) {
        coreConnector.internalDebugLog('Node Not Valid To Deregister In Connector')
        done()
        return
      }

      coreConnector.internalDebugLog('Deregister In Connector NodeId: ' + opcuaNode.id)
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
            node.stateMachine.lock().close().idle()
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
        const endpointMustExist = node.opcuaClientOptions.endpoint_must_exist // to reset later
        node.opcuaClientOptions.endpoint_must_exist = false
        let discoveryClient = new coreConnector.core.nodeOPCUA.OPCUAClient(node.opcuaClientOptions)
        discoveryClient.connect(endpointUrlRequest).then(function () {
          coreConnector.internalDebugLog('Get Endpoints Connected For Request')
          discoveryClient.getEndpoints(function (err, endpoints) {
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
