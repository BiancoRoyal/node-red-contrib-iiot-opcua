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

    // HTML settings
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

    // internal settings
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

    coreConnector.internalDebugLog('Open Connector Node')

    node.stateMachine = coreConnector.createStatelyMachine()
    coreConnector.internalDebugLog('Start FSM: ' + node.stateMachine.getMachineState())
    coreConnector.detailDebugLog('FSM events:' + node.stateMachine.getMachineEvents())

    let sessionStartTimeout = null
    let clientStartTimeout = null
    let disconnectTimeout = null
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

    node.connectOPCUAEndpoint = function () {
      if (!coreConnector.checkEndpoint(node)) {
        return
      }

      coreConnector.internalDebugLog('Connecting To Endpoint ' + node.endpoint)

      node.updateServerOptions()
      coreConnector.detailDebugLog('Options ' + JSON.stringify(node.opcuaClientOptions))
      node.opcuaClient = new coreConnector.core.nodeOPCUA.OPCUAClient(node.opcuaClientOptions)

      if (node.autoSelectRightEndpoint) {
        node.autoSelectEndpointFromConnection()
      }

      coreConnector.setListenerToClient(node.opcuaClient, node)
      node.connectToClient()
    }

    node.connectToClient = function () {
      if (!coreConnector.checkEndpoint(node)) {
        return
      }

      node.stateMachine.unlock()
      node.opcuaClient.connect(node.endpoint, function (err) {
        if (err) {
          node.stateMachine.lock().stopopcua()
          node.handleError(err)
        } else {
          coreConnector.internalDebugLog('Client Is Connected To ' + node.endpoint)
          node.stateMachine.open()
        }
      })
    }

    node.renewConnection = function (done) {
      node.opcuaDirectDisconnect(() => {
        node.renewFiniteStateMachine()
        node.stateMachine.idle().initopcua()
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

      if (node.isInactiveOnOPCUA()) {
        coreConnector.internalDebugLog('State Is Not Active While Start Session-> ' + node.stateMachine.getMachineState())
        if (node.showErrors) {
          node.error(new Error('OPC UA Connector Is Not Active'), {payload: 'Create Session Error'})
        }
        return
      }

      if (node.stateMachine.getMachineState() !== 'OPEN') {
        coreConnector.internalDebugLog('Session Request Not Allowed On State ' + node.stateMachine.getMachineState())
        if (node.showErrors) {
          node.error(new Error('OPC UA Connector Is Not Open'), {payload: 'Create Session Error'})
        }
        return
      }

      if (!node.opcuaClient) {
        coreConnector.internalDebugLog('OPC UA Client Connection Is Not Valid On State ' + node.stateMachine.getMachineState())
        if (node.showErrors) {
          node.error(new Error('OPC UA Client Connection Is Not Valid'), {payload: 'Create Session Error'})
        }
        return
      }

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
          node.stateMachine.lock().stopopcua()
          node.emit('session_error', err)
          node.handleError(err)
        })
    }

    node.resetBadSession = function () {
      node.sessionNodeRequests += 1
      coreConnector.detailDebugLog('Session Node Requests At Connector No.: ' + node.sessionNodeRequests)
      if (node.showErrors) {
        coreConnector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!   BAD SESSION ON CONNECTOR   !!!!!!!!!!!!!!!!!!'.bgWhite.red)
      }

      if (node.sessionNodeRequests > node.maxBadSessionRequests) {
        coreConnector.internalDebugLog('Reset Bad Session Request On State ' + node.stateMachine.getMachineState())
        node.resetOPCUAConnection('ToManyBadSessionRequests')
      }
    }

    node.isInactiveOnOPCUA = function () {
      let state = node.stateMachine.getMachineState()
      return (state === 'STOPPED' || state === 'END' || state === 'RENEW' || state === 'RECONFIGURED')
    }

    node.resetOPCUAConnection = function (callerInfo) {
      coreConnector.detailDebugLog(callerInfo + ' Request For New OPC UA Connection')
      if (node.isInactiveOnOPCUA()) {
        return
      }

      node.stateMachine.lock().renew()
      node.emit('reset_opcua_connection')
      node.closeSession(() => {
        node.renewConnection(() => {
          coreConnector.detailDebugLog('OPC UA Connection Reset Done')
        })
      })
    }

    node.closeSession = function (done) {
      if (node.opcuaClient && node.opcuaSession) {
        coreConnector.detailDebugLog('Close Session And Remove Subscriptions From Session On State ' + node.stateMachine.getMachineState())

        try {
          node.opcuaClient.closeSession(node.opcuaSession, node.hasOpcUaSubscriptions, function (err) {
            if (err) {
              node.handleError(err)
            }
            done()
          })
        } catch (err) {
          node.handleError(err)
          done()
        } finally {
          node.opcuaSession = null
        }
      } else {
        coreConnector.internalDebugLog('Close Session Without Session On State ' + node.stateMachine.getMachineState())
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

      if (node.isInactiveOnOPCUA()) {
        coreConnector.detailDebugLog('Connector Is Not Active On OPC UA While Session Close Event')
        return
      }

      coreConnector.logSessionInformation(node)
      if (node.stateMachine.getMachineState() !== 'SESSIONRESTART') {
        node.stateMachine.lock().sessionclose()
      }
    }

    node.disconnectNodeOPCUA = function (done) {
      coreConnector.internalDebugLog('OPC UA Disconnect Connector On State ' + node.stateMachine.getMachineState())

      if (node.opcuaClient) {
        coreConnector.internalDebugLog('Close Node Disconnect Connector From ' + node.endpoint)
        try {
          node.opcuaClient.disconnect(function (err) {
            if (err) {
              node.handleError(err)
            }
            coreConnector.internalDebugLog('Close Node Done For Connector On ' + node.endpoint)
            done()
          })
        } catch (err) {
          node.handleError(err)
          done()
        } finally {
          node.opcuaClient = null
        }
      } else {
        coreConnector.internalDebugLog('Close Node Done For Connector Without Client On ' + node.endpoint)
        done()
      }
    }

    node.on('close', function (done) {
      if (node.isInactiveOnOPCUA()) {
        coreConnector.detailDebugLog('OPC UA Client Is Not Active On Close Node')
        done()
      } else {
        coreConnector.detailDebugLog('OPC UA Client Is Active On Close Node With State ' + node.stateMachine.getMachineState())
        if (node.stateMachine.getMachineState() === 'SESSIONACTIVE') {
          node.closeConnector(done)
        } else {
          coreConnector.internalDebugLog(node.stateMachine.getMachineState() + ' -> !!!  CHECK CONNECTOR STATE ON CLOSE  !!!'.bgWhite.red)
          done()
        }
      }
    })

    node.opcuaDisconnect = function (done) {
      if (node.registeredNodeList.length > 0) {
        coreConnector.internalDebugLog('Connector Has Registered Nodes And Can Not Close The Node -> Count: ' + node.registeredNodeList.length)
        if (disconnectTimeout) {
          clearTimeout(disconnectTimeout)
          disconnectTimeout = null
        }
        disconnectTimeout = setTimeout(() => {
          node.closeConnector(done)
        }, node.connectionStopDelay)
      } else {
        node.opcuaDirectDisconnect(done)
      }
    }

    node.opcuaDirectDisconnect = function (done) {
      coreConnector.detailDebugLog('OPC UA Disconnect From Connector ' + node.stateMachine.getMachineState())
      node.disconnectNodeOPCUA(() => {
        node.stateMachine.lock().close()
        let fsmState = node.stateMachine.getMachineState()
        coreConnector.detailDebugLog('Disconnected On State ' + fsmState)
        if (!node.isInactiveOnOPCUA() && fsmState !== 'CLOSED') {
          console.log(fsmState)
          done()
          assert(false)
        }
        done()
      })
    }

    node.closeConnector = (done) => {
      coreConnector.detailDebugLog('Close Connector ' + node.stateMachine.getMachineState())

      if (node.isInactiveOnOPCUA()) {
        coreConnector.detailDebugLog('OPC UA Client Is Not Active On Close Connector')
        done()
        return
      }

      if (node.opcuaClient) {
        node.opcuaDisconnect(done)
      } else {
        coreConnector.detailDebugLog('OPC UA Client Is Not Valid On Close Connector')
        done()
      }
    }

    node.restartWithNewSettings = function (parameters, done) {
      coreConnector.internalDebugLog('Renew With Flex Connector Request On State ' + node.stateMachine.getMachineState())
      node.stateMachine.lock().reconfigure()
      node.setNewParameters(parameters)
      node.initCertificatesAndKeys()
      node.renewConnection(done)
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

    node.resetOPCUAObjects = function () {
      coreConnector.detailDebugLog('Reset All OPC UA Objects')
      node.sessionNodeRequests = 0
      node.opcuaClient = null
      node.opcuaSession = null
    }

    node.subscribeFSMEvents = function (fsm) {
      /* #########   FSM EVENTS  #########     */

      fsm.onIDLE = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector IDLE Event FSM')
        node.resetOPCUAObjects()
      }

      fsm.onINITOPCUA = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Init OPC UA Event FSM')

        node.resetOPCUAObjects()
        node.resetAllTimer()
        node.emit('connector_init')
        node.initCertificatesAndKeys()

        if (clientStartTimeout) {
          clearTimeout(clientStartTimeout)
          clientStartTimeout = null
        }

        coreConnector.detailDebugLog('connecting OPC UA with delay of msec: ' + node.connectionStartDelay)
        clientStartTimeout = setTimeout(() => {
          try {
            node.connectOPCUAEndpoint()
          } catch (err) {
            node.handleError(err)
            node.resetOPCUAObjects()
            node.stateMachine.lock().stopopcua()
          }
        }, node.connectionStartDelay)
      }

      fsm.onOPEN = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Open Event FSM')
        node.emit('connection_started', node.opcuaClient)
        coreConnector.internalDebugLog('Client Connected To ' + node.endpoint)
        coreConnector.detailDebugLog('Client Options ' + JSON.stringify(node.opcuaClientOptions))
        node.startSession('Open Event')
      }

      fsm.onSESSIONREQUESTED = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Session Request Event FSM')
      }

      fsm.onSESSIONACTIVE = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Session Active Event FSM')
        node.sessionNodeRequests = 0
        node.emit('session_started', node.opcuaSession)
      }

      fsm.onSESSIONCLOSED = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Session Close Event FSM')
        node.emit('session_closed')
        node.opcuaSession = null
      }

      fsm.onSESSIONRESTART = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Session Restart Event FSM')
        node.emit('session_restart')
      }

      fsm.onCLOSED = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Client Close Event FSM')
        node.emit('connection_closed')
        node.opcuaClient = null
      }

      fsm.onLOCKED = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Lock Event FSM')
      }

      fsm.onUNLOCKED = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Unlock Event FSM')
      }

      fsm.onSTOPPED = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Stopped Event FSM')
        node.resetAllTimer()
        node.emit('connection_stopped')
      }

      fsm.onEND = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector End Event FSM')
        node.resetAllTimer()
        node.emit('connection_end')
      }
    }

    node.resetAllTimer = function () {
      coreConnector.detailDebugLog('Reset All Timer')
      if (clientStartTimeout) {
        clearTimeout(clientStartTimeout)
        clientStartTimeout = null
      }

      if (sessionStartTimeout) {
        clearTimeout(sessionStartTimeout)
        sessionStartTimeout = null
      }

      if (disconnectTimeout) {
        clearTimeout(disconnectTimeout)
        disconnectTimeout = null//
      }
    }

    /*  ---------------------  handle config node behaviour --------------------- */
    node.registeredNodeList = {}

    node.renewFiniteStateMachine = function () {
      node.stateMachine = null
      node.stateMachine = coreConnector.createStatelyMachine()
      assert(node.stateMachine.getMachineState() === 'IDLE')
      node.subscribeFSMEvents(node.stateMachine)
    }

    node.registerForOPCUA = function (opcuaNode) {
      if (!opcuaNode) {
        coreConnector.internalDebugLog('Node Not Valid To Register In Connector')
        return
      }

      coreConnector.internalDebugLog('Register In Connector NodeId: ' + opcuaNode.id)
      node.registeredNodeList[opcuaNode.id] = opcuaNode

      opcuaNode.on('opcua_client_not_ready', () => {
        node.resetBadSession()
      })

      if (Object.keys(node.registeredNodeList).length === 1) {
        coreConnector.internalDebugLog('Start Connector OPC UA Connection')
        node.renewFiniteStateMachine()
        node.stateMachine.idle().initopcua()
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

      if (node.stateMachine.getMachineState() === 'STOPPED' || node.stateMachine.getMachineState() === 'END') {
        done()
        return
      }

      if (Object.keys(node.registeredNodeList).length === 0) {
        node.stateMachine.lock().stopopcua()
        if (node.opcuaClient) {
          coreConnector.detailDebugLog('OPC UA Direct Disconnect On Unregister Of All Nodes')
          try {
            node.opcuaClient.disconnect(function (err) {
              if (err) {
                node.handleError(err)
              }
              done()
            })
          } catch (err) {
            node.handleError(err)
            done()
          } finally {
            node.opcuaClient = null
          }
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
