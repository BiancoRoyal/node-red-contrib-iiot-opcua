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

    let node = coreConnector.initConnectorNode(this)
    coreConnector.core.assert(node.bianco.iiot)

    node.setMaxListeners(UNLIMITED_LISTENERS)

    coreConnector.internalDebugLog('Open Connector Node')

    node.bianco.iiot.stateMachine = coreConnector.createStatelyMachine()
    coreConnector.internalDebugLog('Start FSM: ' + node.bianco.iiot.stateMachine.getMachineState())
    coreConnector.detailDebugLog('FSM events:' + node.bianco.iiot.stateMachine.getMachineEvents())

    let sessionStartTimeout = null
    let clientStartTimeout = null
    let disconnectTimeout = null
    let nodeOPCUAClientPath = coreConnector.core.getNodeOPCUAClientPath()

    node.securedCommunication = (node.securityPolicy && node.securityPolicy !== 'None' && node.messageSecurityMode && node.messageSecurityMode !== 'None')

    coreConnector.detailDebugLog('config: ' + node.publicCertificateFile)
    coreConnector.detailDebugLog('config: ' + node.privateKeyFile)
    coreConnector.detailDebugLog('securedCommunication: ' + node.securedCommunication.toString())

    node.bianco.iiot.initCertificatesAndKeys = function () {
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
        node.bianco.iiot.userIdentity = {
          userName: node.credentials.user,
          password: node.credentials.password
        }
        coreConnector.internalDebugLog('Connecting With Login Data On ' + node.endpoint)
      } else {
        node.error(new Error('Login Enabled But No Credentials'), { payload: '' })
      }
    }

    /*  #########   CONNECTION  #########     */

    node.bianco.iiot.updateServerOptions = function () {
      node.bianco.iiot.initCertificatesAndKeys()
      node.bianco.iiot.opcuaClientOptions = {
        securityPolicy: coreConnector.core.nodeOPCUA.coerceSecurityPolicy(node.securityPolicy || 'None'),
        securityMode: coreConnector.core.nodeOPCUA.coerceMessageSecurityMode(node.messageSecurityMode || 'None'),
        defaultSecureTokenLifetime: node.defaultSecureTokenLifetime || 120000,
        keepSessionAlive: node.keepSessionAlive,
        certificateFile: node.publicCertificateFile,
        privateKeyFile: node.privateKeyFile,
        endpointMustExist: node.endpointMustExist,
        requestedSessionTimeout: node.requestedSessionTimeout || 60000,
        connectionStrategy: {
          maxRetry: node.strategyMaxRetry || 2000,
          initialDelay: node.strategyInitialDelay || 1000,
          maxDelay: node.strategyMaxDelay || 30000,
          randomisationFactor: node.strategyRandomisationFactor || 0.2
        }
      }
    }

    node.bianco.iiot.connectOPCUAEndpoint = function () {
      if (!coreConnector.checkEndpoint(node)) {
        return
      }

      coreConnector.internalDebugLog('Connecting To Endpoint ' + node.endpoint)

      node.bianco.iiot.updateServerOptions()
      // TODO: causes "TypeError: Converting circular structure to JSON" at line 578 in this file
      //    node.bianco.iiot.opcuaClient = coreConnector.core.nodeOPCUA.OPCUAClient.create(node.bianco.iiot.opcuaClientOptions)
      //    coreConnector.detailDebugLog('Options ' + node.bianco.iiot.opcuaClientOptions)
      // workaround: JSON.parse(JSON.stringify(obj))
      const optsJson = JSON.stringify(node.bianco.iiot.opcuaClientOptions)
      coreConnector.detailDebugLog('Options ' + optsJson)
      node.bianco.iiot.opcuaClient = coreConnector.core.nodeOPCUA.OPCUAClient.create(JSON.parse(optsJson))
      if (Object.keys(node.bianco.iiot.opcuaClient).length === 0) {
        coreConnector.detailDebugLog('Failed to create OPCUA Client ', {opcuaClient: node.bianco.iiot.opcuaClient})
      }

      if (node.autoSelectRightEndpoint) {
        node.bianco.iiot.autoSelectEndpointFromConnection()
      }

      // coreConnector.setListenerToClient(node)
      node.bianco.iiot.connectToClient()
    }

    node.bianco.iiot.connectToClient = function () {
      if (!coreConnector.checkEndpoint(node)) {
        return
      }

      node.bianco.iiot.stateMachine.unlock()
      node.bianco.iiot.opcuaClient.connect(node.endpoint, function (err) {
        if (coreConnector.core.isInitializedBiancoIIoTNode(node)) {
          if (err) {
            node.bianco.iiot.stateMachine.lock().stopopcua()
            node.bianco.iiot.handleError(err)
          } else {
            coreConnector.internalDebugLog('Client Is Connected To ' + node.endpoint)
            node.bianco.iiot.stateMachine.open()
          }
        } else {
          coreConnector.internalDebugLog('bianco.iiot not valid on connect resolve')
        }
      })
    }

    node.bianco.iiot.renewConnection = function (done) {
      if (coreConnector.core.isInitializedBiancoIIoTNode(node)) {
        node.bianco.iiot.opcuaDirectDisconnect(() => {
          node.bianco.iiot.renewFiniteStateMachine()
          node.bianco.iiot.stateMachine.idle().initopcua()
          done()
        })
      } else {
        coreConnector.internalDebugLog('bianco.iiot not valid on renew connection')
      }
    }

    node.bianco.iiot.endpointMatchForConnecting = function (endpoint) {
      coreConnector.internalDebugLog('Auto Endpoint ' + endpoint.endpointUrl.toString() + ' ' + endpoint.securityPolicyUri.toString())
      let securityMode = endpoint.securityMode.key || endpoint.securityMode
      let securityPolicy = (endpoint.securityPolicyUri.includes('SecurityPolicy#')) ? endpoint.securityPolicyUri.split('#')[1] : endpoint.securityPolicyUri

      coreConnector.internalDebugLog('node-mode:' + node.messageSecurityMode + ' securityMode: ' + securityMode)
      coreConnector.internalDebugLog('node-policy:' + node.securityPolicy + ' securityPolicy: ' + securityPolicy)

      return (securityMode === node.messageSecurityMode && securityPolicy === node.securityPolicy)
    }

    node.bianco.iiot.selectEndpointFromSettings = function (discoverClient) {
      discoverClient.getEndpoints(function (err, endpoints) {
        if (err) {
          coreConnector.internalDebugLog('Auto Switch To Endpoint Error ' + err)
          if (node.showErrors) {
            node.error(err, { payload: 'Get Endpoints Request Error' })
          }
        } else {
          endpoints.forEach(function (endpoint) {
            if (node.bianco.iiot.endpointMatchForConnecting(endpoint)) {
              node.endpoint = endpoint.endpointUrl
              coreConnector.internalDebugLog('Auto Switch To Endpoint ' + node.endpoint)
            }
          })
        }

        discoverClient.disconnect(function (err) {
          if (err) {
            coreConnector.internalDebugLog('Endpoints Auto Request Error ' + err)
            if (node.showErrors) {
              node.error(err, { payload: 'Discover Client Disconnect Error' })
            }
          } else {
            coreConnector.internalDebugLog('Endpoints Auto Request Done With Endpoint ' + node.endpoint)
          }
        })
      })
    }

    node.bianco.iiot.autoSelectEndpointFromConnection = function () {
      coreConnector.internalDebugLog('Auto Searching For Endpoint On ' + node.endpoint)

      let endpointMustExist = node.bianco.iiot.opcuaClientOptions.endpointMustExist
      node.bianco.iiot.opcuaClientOptions.endpointMustExist = false

      let discoverClient = coreConnector.core.nodeOPCUA.OPCUAClient.create(node.bianco.iiot.opcuaClientOptions)

      discoverClient.connect(node.endpoint).then(function () {
        coreConnector.internalDebugLog('Auto Searching Endpoint Connected To ' + node.endpoint)
        node.bianco.iiot.selectEndpointFromSettings(discoverClient)
        node.bianco.iiot.opcuaClientOptions.endpointMustExist = endpointMustExist
      }).catch(function (err) {
        coreConnector.internalDebugLog('Get Auto Endpoint Request Error ' + err.message)
        if (coreConnector.core.isInitializedBiancoIIoTNode(node)) {
          node.bianco.iiot.opcuaClientOptions.endpointMustExist = endpointMustExist
        }
      })
    }

    /*  #########    SESSION    #########     */

    node.bianco.iiot.startSession = function (callerInfo) {
      coreConnector.internalDebugLog('Request For New Session From ' + callerInfo)

      if (node.bianco.iiot.isInactiveOnOPCUA()) {
        coreConnector.internalDebugLog('State Is Not Active While Start Session-> ' + node.bianco.iiot.stateMachine.getMachineState())
        if (node.showErrors) {
          node.error(new Error('OPC UA Connector Is Not Active'), { payload: 'Create Session Error' })
        }
        return
      }

      if (node.bianco.iiot.stateMachine.getMachineState() !== 'OPEN') {
        coreConnector.internalDebugLog('Session Request Not Allowed On State ' + node.bianco.iiot.stateMachine.getMachineState())
        if (node.showErrors) {
          node.error(new Error('OPC UA Connector Is Not Open'), { payload: 'Create Session Error' })
        }
        return
      }

      if (!node.bianco.iiot.opcuaClient) {
        coreConnector.internalDebugLog('OPC UA Client Connection Is Not Valid On State ' + node.bianco.iiot.stateMachine.getMachineState())
        if (node.showErrors) {
          node.error(new Error('OPC UA Client Connection Is Not Valid'), { payload: 'Create Session Error' })
        }
        return
      }

      node.bianco.iiot.stateMachine.sessionrequest()

      node.bianco.iiot.opcuaClient.createSession(node.bianco.iiot.userIdentity || {})
        .then(function (session) {
          session.requestedMaxReferencesPerNode = 100000
          node.bianco.iiot.opcuaSession = session
          node.bianco.iiot.stateMachine.sessionactive()

          coreConnector.detailDebugLog('Session Created On ' + node.endpoint + ' For ' + callerInfo)
          coreConnector.logSessionInformation(node)

          node.bianco.iiot.opcuaSession.on('session_closed', function (statusCode) {
            node.bianco.iiot.handleSessionClose(statusCode)
          })
        }).catch(function (err) {
          if (coreConnector.core.isInitializedBiancoIIoTNode(node)) {
            node.bianco.iiot.stateMachine.lock().stopopcua()
            node.bianco.iiot.handleError(err)
          } else {
            coreConnector.internalDebugLog(err.message)
          }
          node.emit('session_error', err)
        })
    }

    node.bianco.iiot.resetBadSession = function () {
      if (!node.bianco) {
        return
      }

      node.bianco.iiot.sessionNodeRequests += 1
      coreConnector.detailDebugLog('Session Node Requests At Connector No.: ' + node.bianco.iiot.sessionNodeRequests)
      if (node.showErrors) {
        coreConnector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!   BAD SESSION ON CONNECTOR   !!!!!!!!!!!!!!!!!!'.bgWhite.red)
      }

      if (node.bianco.iiot.sessionNodeRequests > node.maxBadSessionRequests) {
        coreConnector.internalDebugLog('Reset Bad Session Request On State ' + node.bianco.iiot.stateMachine.getMachineState())
        node.bianco.iiot.resetOPCUAConnection('ToManyBadSessionRequests')
      }
    }

    node.bianco.iiot.isInactiveOnOPCUA = function () {
      let state = node.bianco.iiot.stateMachine.getMachineState()
      return (state === 'STOPPED' || state === 'END' || state === 'RENEW' || state === 'RECONFIGURED')
    }

    node.bianco.iiot.resetOPCUAConnection = function (callerInfo) {
      coreConnector.detailDebugLog(callerInfo + ' Request For New OPC UA Connection')
      if (node.bianco.iiot.isInactiveOnOPCUA()) {
        return
      }

      node.bianco.iiot.stateMachine.lock().renew()
      node.emit('reset_opcua_connection')
      node.bianco.iiot.closeSession(() => {
        node.bianco.iiot.renewConnection(() => {
          coreConnector.detailDebugLog('OPC UA Connection Reset Done')
        })
      })
    }

    node.bianco.iiot.closeSession = function (done) {
      if (node.bianco.iiot.opcuaClient && node.bianco.iiot.opcuaSession) {
        coreConnector.detailDebugLog('Close Session And Remove Subscriptions From Session On State ' + node.bianco.iiot.stateMachine.getMachineState())

        try {
          node.bianco.iiot.opcuaSession.removeAllListeners()
          node.bianco.iiot.opcuaClient.closeSession(node.bianco.iiot.opcuaSession, node.bianco.iiot.hasOpcUaSubscriptions, function (err) {
            if (err) {
              node.bianco.iiot.handleError(err)
            }
            done()
          })
        } catch (err) {
          node.bianco.iiot.handleError(err)
          done()
        } finally {
          node.bianco.iiot.opcuaSession = null
        }
      } else {
        coreConnector.internalDebugLog('Close Session Without Session On State ' + node.bianco.iiot.stateMachine.getMachineState())
        done()
      }
    }

    node.bianco.iiot.handleError = function (err) {
      coreConnector.internalDebugLog('Handle Error On ' + node.endpoint + ' err: ' + err)
      if (node.showErrors) {
        node.error(err, { payload: 'Handle Connector Error' })
      }
    }

    node.bianco.iiot.handleSessionClose = function (statusCode) {
      coreConnector.internalDebugLog('Session Closed With StatusCode ' + statusCode)

      if (node.bianco.iiot.isInactiveOnOPCUA()) {
        coreConnector.detailDebugLog('Connector Is Not Active On OPC UA While Session Close Event')
        return
      }

      coreConnector.logSessionInformation(node)
      if (node.bianco.iiot.stateMachine.getMachineState() !== 'SESSIONRESTART') {
        node.bianco.iiot.stateMachine.lock().sessionclose()
      }
    }

    node.bianco.iiot.disconnectNodeOPCUA = function (done) {
      coreConnector.internalDebugLog('OPC UA Disconnect Connector On State ' + node.bianco.iiot.stateMachine.getMachineState())

      if (node.bianco.iiot.opcuaClient) {
        coreConnector.internalDebugLog('Close Node Disconnect Connector From ' + node.endpoint)
        try {
          node.bianco.iiot.opcuaClient.disconnect(function (err) {
            if (err) {
              node.bianco.iiot.handleError(err)
            }
            coreConnector.internalDebugLog('Close Node Done For Connector On ' + node.endpoint)
            done()
          })
        } catch (err) {
          node.bianco.iiot.handleError(err)
          done()
        } finally {
          node.bianco.iiot.opcuaClient = null
        }
      } else {
        coreConnector.internalDebugLog('Close Node Done For Connector Without Client On ' + node.endpoint)
        done()
      }
    }

    node.on('close', function (done) {
      if (!coreConnector.core.isInitializedBiancoIIoTNode(node)) {
        done() // if we have a very fast deploy clicking uer
      } else {
        if (node.bianco.iiot.isInactiveOnOPCUA()) {
          coreConnector.detailDebugLog('OPC UA Client Is Not Active On Close Node')
          coreConnector.core.resetBiancoNode(node)
          done()
        } else {
          coreConnector.detailDebugLog('OPC UA Client Is Active On Close Node With State ' + node.bianco.iiot.stateMachine.getMachineState())
          if (node.bianco.iiot.stateMachine.getMachineState() === 'SESSIONACTIVE') {
            node.bianco.iiot.closeConnector(() => {
              coreConnector.core.resetBiancoNode(node)
              done()
            })
          } else {
            coreConnector.internalDebugLog(node.bianco.iiot.stateMachine.getMachineState() + ' -> !!!  CHECK CONNECTOR STATE ON CLOSE  !!!'.bgWhite.red)
            coreConnector.core.resetBiancoNode(node)
            done()
          }
        }
      }
    })

    node.bianco.iiot.opcuaDisconnect = function (done) {
      if (node.bianco.iiot.registeredNodeList.length > 0) {
        coreConnector.internalDebugLog('Connector Has Registered Nodes And Can Not Close The Node -> Count: ' + node.bianco.iiot.registeredNodeList.length)
        if (disconnectTimeout) {
          clearTimeout(disconnectTimeout)
          disconnectTimeout = null
        }
        disconnectTimeout = setTimeout(() => {
          if (coreConnector.core.isInitializedBiancoIIoTNode(node)) {
            node.bianco.iiot.closeConnector(done)
          }
        }, node.connectionStopDelay)
      } else {
        node.bianco.iiot.opcuaDirectDisconnect(done)
      }
    }

    node.bianco.iiot.opcuaDirectDisconnect = function (done) {
      coreConnector.detailDebugLog('OPC UA Disconnect From Connector ' + node.bianco.iiot.stateMachine.getMachineState())
      node.bianco.iiot.disconnectNodeOPCUA(() => {
        node.bianco.iiot.stateMachine.lock().close()
        let fsmState = node.bianco.iiot.stateMachine.getMachineState()
        coreConnector.detailDebugLog('Disconnected On State ' + fsmState)
        if (!node.bianco.iiot.isInactiveOnOPCUA() && fsmState !== 'CLOSED') {
          console.log(fsmState)
          done()
          assert(false)
        }
        done()
      })
    }

    node.bianco.iiot.closeConnector = (done) => {
      coreConnector.detailDebugLog('Close Connector ' + node.bianco.iiot.stateMachine.getMachineState())

      if (node.bianco.iiot.isInactiveOnOPCUA()) {
        coreConnector.detailDebugLog('OPC UA Client Is Not Active On Close Connector')
        done()
        return
      }

      if (node.bianco.iiot.opcuaClient) {
        node.bianco.iiot.opcuaDisconnect(done)
      } else {
        coreConnector.detailDebugLog('OPC UA Client Is Not Valid On Close Connector')
        done()
      }
    }

    node.bianco.iiot.restartWithNewSettings = function (parameters, done) {
      coreConnector.internalDebugLog('Renew With Flex Connector Request On State ' + node.bianco.iiot.stateMachine.getMachineState())
      node.bianco.iiot.stateMachine.lock().reconfigure()
      node.bianco.iiot.setNewParameters(parameters)
      node.bianco.iiot.initCertificatesAndKeys()
      node.bianco.iiot.renewConnection(done)
    }

    node.bianco.iiot.setNewParameters = function (parameters) {
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

    node.bianco.iiot.resetOPCUAObjects = function () {
      coreConnector.detailDebugLog('Reset All OPC UA Objects')
      node.bianco.iiot.sessionNodeRequests = 0
      if (node.bianco.iiot.opcuaSession) {
        if (node.bianco.iiot.opcuaClient) {
          node.bianco.iiot.opcuaClient.closeSession(node.bianco.iiot.opcuaSession, true)
        }
        node.bianco.iiot.opcuaSession.removeAllListeners()
        node.bianco.iiot.opcuaSession = null
      }
      if (Object.keys(node.bianco.iiot.opcuaClient || {}).length > 1) {
        // TODO: should this be .disconnect() since removeAllListeners() is not implemented anymore?
        node.bianco.iiot.opcuaClient.removeAllListeners()
        node.bianco.iiot.opcuaClient.disconnect(function (err) {
          if (err) {
            node.bianco.iiot.handleError(err)
          }          
        })
        node.bianco.iiot.opcuaClient = null
      }
    }

    node.bianco.iiot.subscribeFSMEvents = function (fsm) {
      /* #########   FSM EVENTS  #########     */

      fsm.onIDLE = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector IDLE Event FSM')
        node.bianco.iiot.resetOPCUAObjects()
      }

      fsm.onINITOPCUA = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Init OPC UA Event FSM')

        if (!node.bianco) {
          return
        }

        node.bianco.iiot.resetOPCUAObjects()
        node.bianco.iiot.resetAllTimer()
        node.emit('connector_init')
        node.bianco.iiot.initCertificatesAndKeys()

        if (clientStartTimeout) {
          clearTimeout(clientStartTimeout)
          clientStartTimeout = null
        }

        coreConnector.detailDebugLog('connecting OPC UA with delay of msec: ' + node.connectionStartDelay)
        clientStartTimeout = setTimeout(() => {
          if (coreConnector.core.isInitializedBiancoIIoTNode(node)) {
            try {
              node.bianco.iiot.connectOPCUAEndpoint()
            } catch (err) {
              node.bianco.iiot.handleError(err)
              node.bianco.iiot.resetOPCUAObjects()
              node.bianco.iiot.stateMachine.lock().stopopcua()
            }
          }
        }, node.connectionStartDelay)
      }

      fsm.onOPEN = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Open Event FSM')
        if (coreConnector.core.isInitializedBiancoIIoTNode(node)) {
          node.emit('connection_started', node.bianco.iiot.opcuaClient)
          coreConnector.internalDebugLog('Client Connected To ' + node.endpoint)
          coreConnector.detailDebugLog('Client Options ' + JSON.stringify(node.bianco.iiot.opcuaClientOptions))
          node.bianco.iiot.startSession('Open Event')
        }
      }

      fsm.onSESSIONREQUESTED = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Session Request Event FSM')
      }

      fsm.onSESSIONACTIVE = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Session Active Event FSM')
        node.bianco.iiot.sessionNodeRequests = 0
        node.emit('session_started', node.bianco.iiot.opcuaSession)
      }

      fsm.onSESSIONCLOSED = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Session Close Event FSM')
        node.emit('session_closed')
        if (coreConnector.core.isInitializedBiancoIIoTNode(node)) {
          node.bianco.iiot.opcuaSession = null
        }
      }

      fsm.onSESSIONRESTART = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Session Restart Event FSM')
        node.emit('session_restart')
      }

      fsm.onCLOSED = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Client Close Event FSM')
        node.emit('connection_closed')
        if (coreConnector.core.isInitializedBiancoIIoTNode(node)) {
          if (Object.keys(node.bianco.iiot.opcuaClient || {}).length > 1) {
            // TODO: should this be .disconnect() since removeAllListeners() is not implemented anymore?
            node.bianco.iiot.opcuaClient.removeAllListeners()
            node.bianco.iiot.opcuaClient.disconnect(function (err) {
              if (err) {
                node.bianco.iiot.handleError(err)
              }          
            })
            node.bianco.iiot.opcuaClient = null
          }
        }
      }

      fsm.onLOCKED = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Lock Event FSM')
      }

      fsm.onUNLOCKED = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Unlock Event FSM')
      }

      fsm.onSTOPPED = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Stopped Event FSM')
        node.emit('connection_stopped')
        if (coreConnector.core.isInitializedBiancoIIoTNode(node)) {
          node.bianco.iiot.resetAllTimer()
        }
      }

      fsm.onEND = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector End Event FSM')
        node.emit('connection_end')
        if (coreConnector.core.isInitializedBiancoIIoTNode(node)) {
          node.bianco.iiot.resetAllTimer()
        }
      }

      fsm.onRECONFIGURED = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Reconfigure Event FSM')
        node.emit('connection_reconfigure')
        if (coreConnector.core.isInitializedBiancoIIoTNode(node)) {
          node.bianco.iiot.resetAllTimer()
        }
      }

      fsm.onRENEW = function (event, oldState, newState) {
        coreConnector.detailDebugLog('Connector Renew Event FSM')
        node.emit('connection_renew')
        if (coreConnector.core.isInitializedBiancoIIoTNode(node)) {
          node.bianco.iiot.resetAllTimer()
        }
      }
    }

    node.bianco.iiot.resetAllTimer = function () {
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
        disconnectTimeout = null
      }
    }

    /*  ---------------------  handle config node behaviour --------------------- */
    node.bianco.iiot.registeredNodeList = {}

    node.bianco.iiot.renewFiniteStateMachine = function () {
      node.bianco.iiot.stateMachine = null
      node.bianco.iiot.stateMachine = coreConnector.createStatelyMachine()
      assert(node.bianco.iiot.stateMachine.getMachineState() === 'IDLE')
      node.bianco.iiot.subscribeFSMEvents(node.bianco.iiot.stateMachine)
    }

    node.bianco.iiot.registerForOPCUA = function (opcuaNode) {
      if (!opcuaNode) {
        coreConnector.internalDebugLog('Node Not Valid To Register In Connector')
        return
      }

      coreConnector.internalDebugLog('Register In Connector NodeId: ' + opcuaNode.id)

      if (!node.bianco) {
        coreConnector.internalDebugLog('Node Not Initialized With Bianco To Register In Connector')
        return
      }

      node.bianco.iiot.registeredNodeList[opcuaNode.id] = opcuaNode

      opcuaNode.on('opcua_client_not_ready', () => {
        if (coreConnector.core.isInitializedBiancoIIoTNode(node) && node.bianco.iiot.stateMachine.getMachineState() !== 'END') {
          node.bianco.iiot.resetBadSession()
        }
      })

      if (Object.keys(node.bianco.iiot.registeredNodeList).length === 1) {
        coreConnector.internalDebugLog('Start Connector OPC UA Connection')
        node.bianco.iiot.renewFiniteStateMachine()
        node.bianco.iiot.stateMachine.idle().initopcua()
      }
    }

    node.bianco.iiot.deregisterForOPCUA = function (opcuaNode, done) {
      if (!opcuaNode) {
        coreConnector.internalDebugLog('Node Not Valid To Deregister In Connector')
        done()
        return
      }

      opcuaNode.removeAllListeners('opcua_client_not_ready')

      if (!node.bianco) {
        coreConnector.internalDebugLog('Node Not Initialized With Bianco To Deregister In Connector')
        return
      }

      coreConnector.internalDebugLog('Deregister In Connector NodeId: ' + opcuaNode.id)
      delete node.bianco.iiot.registeredNodeList[opcuaNode.id]

      if (node.bianco.iiot.stateMachine.getMachineState() === 'STOPPED' || node.bianco.iiot.stateMachine.getMachineState() === 'END') {
        done()
        return
      }

      if (Object.keys(node.bianco.iiot.registeredNodeList).length === 0) {
        node.bianco.iiot.stateMachine.lock().stopopcua()
        if (Object.keys(node.bianco.iiot.opcuaClient || {}).length > 1) {
          coreConnector.detailDebugLog('OPC UA Direct Disconnect On Unregister Of All Nodes')
          try {
            node.bianco.iiot.opcuaClient.disconnect(function (err) {
              if (err) {
                node.bianco.iiot.handleError(err)
              }
              done()
            })
          } catch (err) {
            node.bianco.iiot.handleError(err)
            done()
          } finally {
            node.bianco.iiot.opcuaClient.removeAllListeners()
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
        user: { type: 'text' },
        password: { type: 'password' }
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
              node.error(err, { payload: '' })
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
        const endpointMustExist = node.bianco.iiot.opcuaClientOptions.endpointMustExist // to reset later
        node.bianco.iiot.opcuaClientOptions.endpointMustExist = false
        let discoveryClient = new coreConnector.core.nodeOPCUA.OPCUAClient(node.bianco.iiot.opcuaClientOptions)
        discoveryClient.connect(endpointUrlRequest).then(function () {
          coreConnector.internalDebugLog('Get Endpoints Connected For Request')
          discoveryClient.getEndpoints(function (err, endpoints) {
            if (err) {
              if (node.showErrors) {
                node.error(err, { payload: '' })
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
            node.bianco.iiot.opcuaClientOptions.endpointMustExist = endpointMustExist
          })
        }).catch(function (err) {
          if (coreConnector.core.isInitializedBiancoIIoTNode(node)) {
            node.bianco.iiot.opcuaClientOptions.endpointMustExist = endpointMustExist
          }
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
