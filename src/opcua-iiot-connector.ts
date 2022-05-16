/*
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as path from 'path'
import * as nodered from 'node-red'
import * as core from './core/opcua-iiot-core'
import { underscore as _ } from './core/opcua-iiot-core'
import {
  AttributeIds,
  coerceMessageSecurityMode,
  coerceSecurityPolicy,
  DataTypeIds,
  EndpointDescription, findServers,
  MessageSecurityMode, nodesets,
  ObjectTypeIds, OPCUAClient, ReferenceTypeIds,
  SecurityPolicy, StatusCodes, VariableTypeIds
} from "node-opcua";
import {getEnumKeys, Todo} from "./types/placeholders";
import {logger} from "./core/opcua-iiot-core-connector";
import internalDebugLog = logger.internalDebugLog;
import coreConnector from "./core/opcua-iiot-core-connector";
import detailDebugLog = logger.detailDebugLog;
import {FindServerResults} from "node-opcua-client/source/tools/findservers";

interface OPCUAIIoTConnectorCredentials {
  user: {
    type: 'text' | 'password'
  }
  password: {
    type: 'text' | 'password'
  }
}

export interface OPCUAIIoTConnectorConfiguration extends nodered.Node<OPCUAIIoTConnectorCredentials> {
  discoveryUrl: string | null
  endpoint: string
  keepSessionAlive: boolean
  loginEnabled: boolean
  securityPolicy: SecurityPolicy
  messageSecurityMode: MessageSecurityMode
  name: string
  showErrors: boolean
  individualCerts: boolean
  publicCertificateFile: string | null
  privateKeyFile: string | null
  defaultSecureTokenLifetime: number
  endpointMustExist: boolean
  autoSelectRightEndpoint: boolean
  strategyMaxRetry: number
  strategyInitialDelay: number
  strategyMaxDelay: number
  strategyRandomisationFactor: number
  requestedSessionTimeout: number
  connectionStartDelay: number
  reconnectDelay: number
  connectionStopDelay: number
  maxBadSessionRequests: number
  securedCommunication?: boolean
  bianco?: any
}

interface OPCUAIIoTConnectorConfigurationDef extends nodered.NodeDef {
  discoveryUrl: string
  endpoint: string
  keepSessionAlive: boolean
  loginEnabled: boolean
  securityPolicy: string
  securityMode: string
  name: string
  showErrors: boolean
  individualCerts: boolean
  publicCertificateFile: string
  privateKeyFile: string
  defaultSecureTokenLifetime: number
  endpointMustExist: boolean
  autoSelectRightEndpoint: boolean
  strategyMaxRetry: number
  strategyInitialDelay: number
  strategyMaxDelay: number
  strategyRandomisationFactor: number
  requestedSessionTimeout: number
  connectionStartDelay: number
  reconnectDelay: number
  connectionStopDelay: number
  maxBadSessionRequests: number
}

/**
 * OPC UA connector Node-RED config node.
 *
 * @param RED
 */
module.exports = function (RED: nodered.NodeAPI) {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTConnectorConfiguration(
      this: OPCUAIIoTConnectorConfiguration, config: OPCUAIIoTConnectorConfigurationDef) {
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
    this.securityPolicy =  coerceSecurityPolicy(config.securityPolicy)
    this.messageSecurityMode = coerceMessageSecurityMode(config.securityMode)
    this.publicCertificateFile = config.publicCertificateFile
    this.privateKeyFile = config.privateKeyFile
    this.defaultSecureTokenLifetime = config.defaultSecureTokenLifetime || 120000
    this.autoSelectRightEndpoint = config.autoSelectRightEndpoint
    this.strategyMaxRetry = config.strategyMaxRetry || 10000
    this.strategyInitialDelay = config.strategyInitialDelay || 1000
    this.strategyMaxDelay = config.strategyMaxDelay || 30000
    this.strategyRandomisationFactor = config.strategyRandomisationFactor || 0.2
    this.requestedSessionTimeout = config.requestedSessionTimeout || 60000
    this.connectionStartDelay = config.connectionStartDelay || CONNECTION_START_DELAY
    this.reconnectDelay = config.reconnectDelay || RECONNECT_DELAY
    this.connectionStopDelay = config.connectionStopDelay || CONNECTION_STOP_DELAY
    this.maxBadSessionRequests = config.maxBadSessionRequests || 10

    let node: Todo = this
    node.iiot =  coreConnector.initConnectorNode()

    node.setMaxListeners(UNLIMITED_LISTENERS)

    internalDebugLog('Open Connector Node')

    let sessionStartTimeout: NodeJS.Timeout | null
    let clientStartTimeout: NodeJS.Timeout | null
    let disconnectTimeout: NodeJS.Timeout | null
    let nodeOPCUAClientPath = core.getNodeOPCUAClientPath()

    node.securedCommunication = (
      node.securityPolicy !== SecurityPolicy.None &&
      node.messageSecurityMode !== MessageSecurityMode.None
    )

    detailDebugLog('config: ' + node.publicCertificateFile)
    detailDebugLog('config: ' + node.privateKeyFile)
    detailDebugLog('securedCommunication: ' + node.securedCommunication.toString())

    const initCertificatesAndKeys = function () {
      if (node.securedCommunication) {
        node.publicCertificateFile = node.publicCertificateFile || path.join(nodeOPCUAClientPath, '/certificates/client_selfsigned_cert_1024.pem')
        detailDebugLog('using cert: ' + node.publicCertificateFile)

        node.privateKeyFile = node.privateKeyFile || path.join(nodeOPCUAClientPath, '/certificates/PKI/own/private/private_key.pem')
        detailDebugLog('using key: ' + node.privateKeyFile)
      } else {
        node.publicCertificateFile = null
        node.privateKeyFile = null
      }
    }

    if (node.loginEnabled) {
      if (node.credentials) {
        node.iiot.userIdentity = {
          userName: node.credentials.user,
          password: node.credentials.password
        }
        internalDebugLog('Connecting With Login Data On ' + node.endpoint)
      } else {
        node.error(new Error('Login Enabled But No Credentials'), { payload: '' })
      }
    }

    /*  #########   CONNECTION  #########     */

    node.iiot.updateServerOptions = function () {
      initCertificatesAndKeys()
      node.iiot.opcuaClientOptions = {
        securityPolicy: node.securityPolicy,
        securityMode: node.messageSecurityMode,
        defaultSecureTokenLifetime: node.defaultSecureTokenLifetime,
        keepSessionAlive: node.keepSessionAlive,
        certificateFile: node.publicCertificateFile,
        privateKeyFile: node.privateKeyFile,
        endpointMustExist: node.endpointMustExist,
        requestedSessionTimeout: node.requestedSessionTimeout,
        connectionStrategy: {
          maxRetry: node.strategyMaxRetry,
          initialDelay: node.strategyInitialDelay,
          maxDelay: node.strategyMaxDelay,
          randomisationFactor: node.strategyRandomisationFactor
        }
      }
    }

    node.iiot.connectOPCUAEndpoint = function () {
      if (!coreConnector.checkEndpoint(node)) {
        return
      }

      internalDebugLog('Connecting To Endpoint ' + node.endpoint)

      node.iiot.updateServerOptions()
      // TODO: causes "TypeError: Converting circular structure to JSON" at line 578 in this file
      //    node.iiot.opcuaClient = OPCUAClient.create(node.iiot.opcuaClientOptions)
      //    detailDebugLog('Options ' + node.iiot.opcuaClientOptions)
      // workaround: JSON.parse(JSON.stringify(obj))
      const optsJson = JSON.stringify(node.iiot.opcuaClientOptions)
      detailDebugLog('Options ' + optsJson)
      node.iiot.opcuaClient = OPCUAClient.create(JSON.parse(optsJson))
      if (Object.keys(node.iiot.opcuaClient).length === 0) {
        detailDebugLog('Failed to create OPCUA Client ', {opcuaClient: node.iiot.opcuaClient})
      }

      if (node.autoSelectRightEndpoint) {
        node.iiot.autoSelectEndpointFromConnection()
      }

      // coreConnector.setListenerToClient(node)
      node.iiot.connectToClient()
    }

    node.iiot.connectToClient = function () {
      if (!coreConnector.checkEndpoint(node)) {
        return
      }

      node.iiot.stateMachine.unlock()
      node.iiot.opcuaClient.connect(node.endpoint, function (err: Error) {
        if (core.isInitializedIIoTNode(node)) {
          if (err) {
            node.iiot.stateMachine.lock().stopopcua()
            node.iiot.handleError(err)
          } else {
            internalDebugLog('Client Is Connected To ' + node.endpoint)
            node.iiot.stateMachine.open()
          }
        } else {
          internalDebugLog('bianco.iiot not valid on connect resolve')
        }
      })
    }

    node.iiot.renewConnection = function (done: () => void) {
      if (core.isInitializedIIoTNode(node)) {
        node.iiot.opcuaDirectDisconnect(() => {
          node.iiot.renewFiniteStateMachine()
          node.iiot.stateMachine.idle().initopcua()
          done()
        })
      } else {
        internalDebugLog('bianco.iiot not valid on renew connection')
      }
    }

    node.iiot.endpointMatchForConnecting = function (endpoint: EndpointDescription | Todo) {
      internalDebugLog('Auto Endpoint ' + endpoint.endpointUrl?.toString() + ' ' + endpoint.securityPolicyUri?.toString())
      let securityMode = endpoint.securityMode.key || endpoint.securityMode
      let securityPolicy = (endpoint.securityPolicyUri.includes('SecurityPolicy#')) ? endpoint.securityPolicyUri.split('#')[1] : endpoint.securityPolicyUri

      internalDebugLog('node-mode:' + node.messageSecurityMode + ' securityMode: ' + securityMode)
      internalDebugLog('node-policy:' + node.securityPolicy + ' securityPolicy: ' + securityPolicy)

      return (securityMode === node.messageSecurityMode && securityPolicy === node.securityPolicy)
    }

    node.iiot.selectEndpointFromSettings = function (discoverClient: OPCUAClient) {
      discoverClient.getEndpoints(function (err, endpoints) {
        if (err) {
          internalDebugLog('Auto Switch To Endpoint Error ' + err)
          if ((node as Todo).showErrors) {
            node.error(err, { payload: 'Get Endpoints Request Error' })
          }
        } else {
          const endpoint = (endpoints || []).find((endpoint) => {
            node.iiot.endpointMatchForConnecting(endpoint)
          })

          if (endpoint && endpoint.endpointUrl != null) {
            internalDebugLog('Auto Switch To Endpoint ' + endpoint.endpointUrl)
            node.endpoint = endpoint.endpointUrl
          } else {
            internalDebugLog('Auto Switch To Endpoint failed: no valid endpoints')
          }
        }

        discoverClient.disconnect(function (err: Error | undefined) {
          if (err) {
            internalDebugLog('Endpoints Auto Request Error ' + err)
            if ((node as Todo).showErrors) {
              node.error(err, { payload: 'Discover Client Disconnect Error' })
            }
          } else {
            internalDebugLog('Endpoints Auto Request Done With Endpoint ' + node.endpoint)
          }
        })
      })
    }

    node.iiot.autoSelectEndpointFromConnection = function () {
      internalDebugLog('Auto Searching For Endpoint On ' + node.endpoint)

      let endpointMustExist = node.iiot.opcuaClientOptions.endpointMustExist
      node.iiot.opcuaClientOptions.endpointMustExist = false

      let discoverClient = OPCUAClient.create(node.iiot.opcuaClientOptions)

      discoverClient.connect(node.endpoint).then(function () {
        internalDebugLog('Auto Searching Endpoint Connected To ' + node.endpoint)
        node.iiot.selectEndpointFromSettings(discoverClient)
        node.iiot.opcuaClientOptions.endpointMustExist = endpointMustExist
      }).catch(function (err: Error) {
        internalDebugLog('Get Auto Endpoint Request Error ' + err.message)
        if (core.isInitializedIIoTNode(node)) {
          node.iiot.opcuaClientOptions.endpointMustExist = endpointMustExist
        }
      })
    }

    /*  #########    SESSION    #########     */

    node.iiot.startSession = function (callerInfo: string) {
      internalDebugLog('Request For New Session From ' + callerInfo)

      if (node.iiot.isInactiveOnOPCUA()) {
        internalDebugLog('State Is Not Active While Start Session-> ' + node.iiot.stateMachine.getMachineState())
        if ((node as Todo).showErrors) {
          node.error(new Error('OPC UA Connector Is Not Active'), { payload: 'Create Session Error' })
        }
        return
      }

      if (node.iiot.stateMachine.getMachineState() !== 'OPEN') {
        internalDebugLog('Session Request Not Allowed On State ' + node.iiot.stateMachine.getMachineState())
        if ((node as Todo).showErrors) {
          node.error(new Error('OPC UA Connector Is Not Open'), { payload: 'Create Session Error' })
        }
        return
      }

      if (!node.iiot.opcuaClient) {
        internalDebugLog('OPC UA Client Connection Is Not Valid On State ' + node.iiot.stateMachine.getMachineState())
        if ((node as Todo).showErrors) {
          node.error(new Error('OPC UA Client Connection Is Not Valid'), { payload: 'Create Session Error' })
        }
        return
      }

      node.iiot.stateMachine.sessionrequest()

      node.iiot.opcuaClient.createSession(node.iiot.userIdentity || {})
        .then(function (session: Todo) {
          session.requestedMaxReferencesPerNode = 100000
          node.iiot.opcuaSession = session
          node.iiot.stateMachine.sessionactive()

          detailDebugLog('Session Created On ' + node.endpoint + ' For ' + callerInfo)
          coreConnector.logSessionInformation(node)

          node.iiot.opcuaSession.on('session_closed', function (statusCode: number) {
            node.iiot.handleSessionClose(statusCode)
          })
        }).catch(function (err: Error) {
          if (core.isInitializedIIoTNode(node)) {
            node.iiot.stateMachine.lock().stopopcua()
            node.iiot.handleError(err)
          } else {
            internalDebugLog(err.message)
          }
          node.emit('session_error', err)
        })
    }

    node.iiot.resetBadSession = function () {
      if (!node.bianco) {
        return
      }

      node.iiot.sessionNodeRequests += 1
      detailDebugLog('Session Node Requests At Connector No.: ' + node.iiot.sessionNodeRequests)
      if ((node as Todo).showErrors) {
        internalDebugLog('!!!!!!!!!!!!!!!!!!!!!   BAD SESSION ON CONNECTOR   !!!!!!!!!!!!!!!!!!')
      }

      if (node.iiot.sessionNodeRequests > node.maxBadSessionRequests) {
        internalDebugLog('Reset Bad Session Request On State ' + node.iiot.stateMachine.getMachineState())
        node.iiot.resetOPCUAConnection('ToManyBadSessionRequests')
      }
    }

    node.iiot.isInactiveOnOPCUA = function () {
      let state = node.iiot.stateMachine.getMachineState()
      return (state === 'STOPPED' || state === 'END' || state === 'RENEW' || state === 'RECONFIGURED')
    }

    node.iiot.resetOPCUAConnection = function (callerInfo: string) {
      detailDebugLog(callerInfo + ' Request For New OPC UA Connection')
      if (node.iiot.isInactiveOnOPCUA()) {
        return
      }

      node.iiot.stateMachine.lock().renew()
      node.emit('reset_opcua_connection')
      node.iiot.closeSession(() => {
        node.iiot.renewConnection(() => {
          detailDebugLog('OPC UA Connection Reset Done')
        })
      })
    }

    node.iiot.closeSession = function (done: () => void) {
      if (node.iiot.opcuaClient && node.iiot.opcuaSession) {
        detailDebugLog('Close Session And Remove Subscriptions From Session On State ' + node.iiot.stateMachine.getMachineState())

        try {
          node.iiot.opcuaSession.removeAllListeners()
          node.iiot.opcuaClient.closeSession(node.iiot.opcuaSession, node.iiot.hasOpcUaSubscriptions, function (err: Error) {
            if (err) {
              node.iiot.handleError(err)
            }
            done()
          })
        } catch (err) {
          node.iiot.handleError(err)
          done()
        } finally {
          node.iiot.opcuaSession = null
        }
      } else {
        internalDebugLog('Close Session Without Session On State ' + node.iiot.stateMachine.getMachineState())
        done()
      }
    }

    node.iiot.handleError = function (err: Error) {
      internalDebugLog('Handle Error On ' + node.endpoint + ' err: ' + err)
      if ((node as Todo).showErrors) {
        node.error(err, { payload: 'Handle Connector Error' })
      }
    }

    node.iiot.handleSessionClose = function (statusCode: number) {
      internalDebugLog('Session Closed With StatusCode ' + statusCode)

      if (node.iiot.isInactiveOnOPCUA()) {
        detailDebugLog('Connector Is Not Active On OPC UA While Session Close Event')
        return
      }

      coreConnector.logSessionInformation(node)
      if (node.iiot.stateMachine.getMachineState() !== 'SESSIONRESTART') {
        node.iiot.stateMachine.lock().sessionclose()
      }
    }

    node.iiot.disconnectNodeOPCUA = function (done: () => void) {
      internalDebugLog('OPC UA Disconnect Connector On State ' + node.iiot.stateMachine.getMachineState())

      if (node.iiot.opcuaClient) {
        internalDebugLog('Close Node Disconnect Connector From ' + node.endpoint)
        try {
          node.iiot.opcuaClient.disconnect(function (err: Error) {
            if (err) {
              node.iiot.handleError(err)
            }
            internalDebugLog('Close Node Done For Connector On ' + node.endpoint)
            done()
          })
        } catch (err) {
          node.iiot.handleError(err)
          done()
        } finally {
          node.iiot.opcuaClient = null
        }
      } else {
        internalDebugLog('Close Node Done For Connector Without Client On ' + node.endpoint)
        done()
      }
    }

    this.on('close', function (done: () => void) {
      if (!core.isInitializedIIoTNode(node)) {
        done() // if we have a very fast deploy clicking uer
      } else {
        if (node.iiot.isInactiveOnOPCUA()) {
          detailDebugLog('OPC UA Client Is Not Active On Close Node')
          core.resetBiancoNode(node)
          done()
        } else {
          detailDebugLog('OPC UA Client Is Active On Close Node With State ' + node.iiot.stateMachine.getMachineState())
          if (node.iiot.stateMachine.getMachineState() === 'SESSIONACTIVE') {
            node.iiot.closeConnector(() => {
              core.resetBiancoNode(node)
              done()
            })
          } else {
            internalDebugLog(node.iiot.stateMachine.getMachineState() + ' -> !!!  CHECK CONNECTOR STATE ON CLOSE  !!!')
            core.resetBiancoNode(node)
            done()
          }
        }
      }
    })

    node.iiot.opcuaDisconnect = function (done: () => void) {
      if (node.iiot.registeredNodeList.length > 0) {
        internalDebugLog('Connector Has Registered Nodes And Can Not Close The Node -> Count: ' + node.iiot.registeredNodeList.length)
        if (disconnectTimeout) {
          clearTimeout(disconnectTimeout)
          disconnectTimeout = null
        }
        disconnectTimeout = setTimeout(() => {
          if (core.isInitializedIIoTNode(node)) {
            node.iiot.closeConnector(done)
          }
        }, node.connectionStopDelay)
      } else {
        node.iiot.opcuaDirectDisconnect(done)
      }
    }

    node.iiot.opcuaDirectDisconnect = function (done: () => void) {
      detailDebugLog('OPC UA Disconnect From Connector ' + node.iiot.stateMachine.getMachineState())
      node.iiot.disconnectNodeOPCUA(() => {
        node.iiot.stateMachine.lock().close()
        let fsmState = node.iiot.stateMachine.getMachineState()
        detailDebugLog('Disconnected On State ' + fsmState)
        if (!node.iiot.isInactiveOnOPCUA() && fsmState !== 'CLOSED') {
          console.log(fsmState)
          done()
        }
        done()
      })
    }

    node.iiot.closeConnector = (done: () => void) => {
      detailDebugLog('Close Connector ' + node.iiot.stateMachine.getMachineState())

      if (node.iiot.isInactiveOnOPCUA()) {
        detailDebugLog('OPC UA Client Is Not Active On Close Connector')
        done()
        return
      }

      if (node.iiot.opcuaClient) {
        node.iiot.opcuaDisconnect(done)
      } else {
        detailDebugLog('OPC UA Client Is Not Valid On Close Connector')
        done()
      }
    }

    node.iiot.restartWithNewSettings = function (config: OPCUAIIoTConnectorConfigurationDef, done: () => void) {
      internalDebugLog('Renew With Flex Connector Request On State ' + node.iiot.stateMachine.getMachineState())
      node.iiot.stateMachine.lock().reconfigure()
      node.iiot.updateSettings(config)
      initCertificatesAndKeys()
      node.iiot.renewConnection(done)
    }

    node.iiot.updateSettings = function (config: OPCUAIIoTConnectorConfigurationDef) {
      node.discoveryUrl = config.discoveryUrl || node.discoveryUrl
      node.endpoint = config.endpoint || node.endpoint
      node.keepSessionAlive = config.keepSessionAlive || node.keepSessionAlive
      node.securityPolicy =  coerceSecurityPolicy(config.securityPolicy || node.securityPolicy)
      node.messageSecurityMode = coerceMessageSecurityMode(config.securityMode || node.messageSecurityMode)
      node.name = config.name || node.name
      node.showErrors = config.showErrors || (node as Todo).showErrors
      node.publicCertificateFile = config.publicCertificateFile || node.publicCertificateFile
      node.privateKeyFile = config.privateKeyFile || node.privateKeyFile
      node.defaultSecureTokenLifetime = config.defaultSecureTokenLifetime || node.defaultSecureTokenLifetime
      node.endpointMustExist = config.endpointMustExist || node.endpointMustExist
      node.autoSelectRightEndpoint = config.autoSelectRightEndpoint || node.autoSelectRightEndpoint
      node.strategyMaxRetry = config.strategyMaxRetry || node.strategyMaxRetry
      node.strategyInitialDelay = config.strategyInitialDelay || node.strategyInitialDelay
      node.strategyMaxDelay = config.strategyMaxDelay || node.strategyMaxDelay
      node.strategyRandomisationFactor = config.strategyRandomisationFactor || node.strategyRandomisationFactor
      node.requestedSessionTimeout = config.requestedSessionTimeout || node.requestedSessionTimeout
      node.connectionStartDelay = config.connectionStartDelay || node.connectionStartDelay
      node.reconnectDelay = config.reconnectDelay || node.reconnectDelay
    }

    node.iiot.resetOPCUAObjects = function () {
      detailDebugLog('Reset All OPC UA Objects')
      node.iiot.sessionNodeRequests = 0
      if (node.iiot.opcuaSession) {
        if (node.iiot.opcuaClient) {
          node.iiot.opcuaClient.closeSession(node.iiot.opcuaSession, true)
        }
        node.iiot.opcuaSession.removeAllListeners()
        node.iiot.opcuaSession = null
      }
      if (Object.keys(node.iiot.opcuaClient || {}).length > 1) {
        // TODO: should this be .disconnect() since removeAllListeners() is not implemented anymore?
        node.iiot.opcuaClient.removeAllListeners()
        node.iiot.opcuaClient.disconnect(function (err: Error) {
          if (err) {
            node.iiot.handleError(err)
          }
        })
        node.iiot.opcuaClient = null
      }
    }

    node.iiot.subscribeFSMEvents = function (fsm: Todo) {
      /* #########   FSM EVENTS  #########     */

      fsm.onIDLE = function () {
        detailDebugLog('Connector IDLE Event FSM')
        node.iiot.resetOPCUAObjects()
      }

      fsm.onINITOPCUA = function () {
        detailDebugLog('Connector Init OPC UA Event FSM')

        if (!node.bianco) {
          return
        }

        node.iiot.resetOPCUAObjects()
        node.iiot.resetAllTimer()
        node.emit('connector_init')
        initCertificatesAndKeys()

        if (clientStartTimeout) {
          clearTimeout(clientStartTimeout)
          clientStartTimeout = null
        }

        detailDebugLog('connecting OPC UA with delay of msec: ' + node.connectionStartDelay)
        clientStartTimeout = setTimeout(() => {
          if (core.isInitializedIIoTNode(node)) {
            try {
              node.iiot.connectOPCUAEndpoint()
            } catch (err) {
              node.iiot.handleError(err)
              node.iiot.resetOPCUAObjects()
              node.iiot.stateMachine.lock().stopopcua()
            }
          }
        }, node.connectionStartDelay)
      }

      fsm.onOPEN = function () {
        detailDebugLog('Connector Open Event FSM')
        if (core.isInitializedIIoTNode(node)) {
          node.emit('connection_started', node.iiot.opcuaClient)
          internalDebugLog('Client Connected To ' + node.endpoint)
          detailDebugLog('Client Options ' + JSON.stringify(node.iiot.opcuaClientOptions))
          node.iiot.startSession('Open Event')
        }
      }

      fsm.onSESSIONREQUESTED = function () {
        detailDebugLog('Connector Session Request Event FSM')
      }

      fsm.onSESSIONACTIVE = function () {
        detailDebugLog('Connector Session Active Event FSM')
        node.iiot.sessionNodeRequests = 0
        node.emit('session_started', node.iiot.opcuaSession)
      }

      fsm.onSESSIONCLOSED = function () {
        detailDebugLog('Connector Session Close Event FSM')
        node.emit('session_closed')
        if (core.isInitializedIIoTNode(node)) {
          node.iiot.opcuaSession = null
        }
      }

      fsm.onSESSIONRESTART = function () {
        detailDebugLog('Connector Session Restart Event FSM')
        node.emit('session_restart')
      }

      fsm.onCLOSED = function () {
        detailDebugLog('Connector Client Close Event FSM')
        node.emit('connection_closed')
        if (core.isInitializedIIoTNode(node)) {
          if (Object.keys(node.iiot.opcuaClient || {}).length > 1) {
            // TODO: should this be .disconnect() since removeAllListeners() is not implemented anymore?
            node.iiot.opcuaClient.removeAllListeners()
            node.iiot.opcuaClient.disconnect(function (err: Error) {
              if (err) {
                node.iiot.handleError(err)
              }
            })
            node.iiot.opcuaClient = null
          }
        }
      }

      fsm.onLOCKED = function () {
        detailDebugLog('Connector Lock Event FSM')
      }

      fsm.onUNLOCKED = function () {
        detailDebugLog('Connector Unlock Event FSM')
      }

      fsm.onSTOPPED = function () {
        detailDebugLog('Connector Stopped Event FSM')
        node.emit('connection_stopped')
        if (core.isInitializedIIoTNode(node)) {
          node.iiot.resetAllTimer()
        }
      }

      fsm.onEND = function () {
        detailDebugLog('Connector End Event FSM')
        node.emit('connection_end')
        if (core.isInitializedIIoTNode(node)) {
          node.iiot.resetAllTimer()
        }
      }

      fsm.onRECONFIGURED = function () {
        detailDebugLog('Connector Reconfigure Event FSM')
        node.emit('connection_reconfigure')
        if (core.isInitializedIIoTNode(node)) {
          node.iiot.resetAllTimer()
        }
      }

      fsm.onRENEW = function () {
        detailDebugLog('Connector Renew Event FSM')
        node.emit('connection_renew')
        if (core.isInitializedIIoTNode(node)) {
          node.iiot.resetAllTimer()
        }
      }
    }

    node.iiot.resetAllTimer = function () {
      detailDebugLog('Reset All Timer')
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
    node.iiot.registeredNodeList = {}

    node.iiot.renewFiniteStateMachine = function () {
      node.iiot.stateMachine = null
      node.iiot.stateMachine = coreConnector.createCoreStatelyMachine()
      node.iiot.subscribeFSMEvents(node.iiot.stateMachine)
    }

    node.iiot.registerForOPCUA = function (opcuaNode: Todo) {
      if (!opcuaNode) {
        internalDebugLog('Node Not Valid To Register In Connector')
        return
      }

      internalDebugLog('Register In Connector NodeId: ' + opcuaNode.id)

      if (!node.bianco) {
        internalDebugLog('Node Not Initialized With Bianco To Register In Connector')
        return
      }

      node.iiot.registeredNodeList[opcuaNode.id] = opcuaNode

      opcuaNode.on('opcua_client_not_ready', () => {
        if (core.isInitializedIIoTNode(node) && node.iiot.stateMachine.getMachineState() !== 'END') {
          node.iiot.resetBadSession()
        }
      })

      if (Object.keys(node.iiot.registeredNodeList).length === 1) {
        internalDebugLog('Start Connector OPC UA Connection')
        node.iiot.renewFiniteStateMachine()
        node.iiot.stateMachine.idle().initopcua()
      }
    }

    node.iiot.deregisterForOPCUA = function (opcuaNode: Todo, done: () => void) {
      if (!opcuaNode) {
        internalDebugLog('Node Not Valid To Deregister In Connector')
        done()
        return
      }

      opcuaNode.removeAllListeners('opcua_client_not_ready')

      if (!node.bianco) {
        internalDebugLog('Node Not Initialized With Bianco To Deregister In Connector')
        return
      }

      internalDebugLog('Deregister In Connector NodeId: ' + opcuaNode.id)
      delete node.iiot.registeredNodeList[opcuaNode.id]

      if (node.iiot.stateMachine.getMachineState() === 'STOPPED' || node.iiot.stateMachine.getMachineState() === 'END') {
        done()
        return
      }

      if (Object.keys(node.iiot.registeredNodeList).length === 0) {
        node.iiot.stateMachine.lock().stopopcua()
        if (Object.keys(node.iiot.opcuaClient || {}).length > 1) {
          detailDebugLog('OPC UA Direct Disconnect On Unregister Of All Nodes')
          try {
            node.iiot.opcuaClient.disconnect(function (err: Error) {
              if (err) {
                node.iiot.handleError(err)
              }
              done()
            })
          } catch (err) {
            node.iiot.handleError(err)
            done()
          } finally {
            node.iiot.opcuaClient.removeAllListeners()
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
  } catch (e: any) {
    internalDebugLog(e.message)
  }

  /*  ---------------------  HTTP Requests --------------------- */

  RED.httpAdmin.get('/opcuaIIoT/client/discover/:id/:discoveryUrl', RED.auth.needsPermission('opcua.discovery'), function (req, res) {
    let node = RED.nodes.getNode(req.params.id)
    let discoverUrlRequest = decodeURIComponent(req.params.discoveryUrl)
    internalDebugLog('Get Discovery Request ' + JSON.stringify(req.params) + ' for ' + discoverUrlRequest)
    if (node) {
      if (discoverUrlRequest && !discoverUrlRequest.includes('opc.tcp://')) {
        res.json([])
      } else {
        findServers(discoverUrlRequest, function (err: Error | null, results?: FindServerResults) {
          if (!err && results) {
            const endpoints = results.servers.flatMap((server) => server.discoveryUrls)
            res.json(endpoints)
          } else {
            internalDebugLog('Perform Find Servers Request ' + err)
            if ((node as Todo).showErrors) {
              node.error(err, { payload: '' })
            }
            res.json([])
          }
        })
      }
    } else {
      internalDebugLog('Get Discovery Request None Node ' + JSON.stringify(req.params))
      res.json([])
    }
  })

  RED.httpAdmin.get('/opcuaIIoT/client/endpoints/:id/:endpointUrl', RED.auth.needsPermission('opcua.endpoints'), function (req, res) {
    console.log('Get Endpoints Request ' + JSON.stringify(req.params))
    let node: Todo = RED.nodes.getNode(req.params.id)
    let endpointUrlRequest = decodeURIComponent(req.params.endpointUrl)
    internalDebugLog('Get Endpoints Request ' + JSON.stringify(req.params) + ' for ' + endpointUrlRequest)
    if (node) {
      if (endpointUrlRequest && !endpointUrlRequest.includes('opc.tcp://')) {
        res.json([])
      } else {
        if (!node.iiot.opcuaClientOptions) {
          node.iiot.updateServerOptions()
        }
        const endpointMustExist = !!node.iiot.opcuaClientOptions.endpointMustExist // to reset later
        node.iiot.opcuaClientOptions.endpointMustExist = false
        let discoveryClient = OPCUAClient.create(node.iiot.opcuaClientOptions)
        discoveryClient.connect(endpointUrlRequest).then(function () {
          internalDebugLog('Get Endpoints Connected For Request')
          discoveryClient.getEndpoints(function (err, endpoints) {
            if (err) {
              if (node.showErrors) {
                node.error(err, { payload: '' })
              }
              internalDebugLog('Get Endpoints Request Error ' + err)
              res.json([])
            } else {
              internalDebugLog('Sending Endpoints For Request')
              res.json(endpoints)
            }
            discoveryClient.disconnect(function () {
              internalDebugLog('Get Endpoints Request Disconnect')
            });
            node.iiot.opcuaClientOptions.endpointMustExist = endpointMustExist
          })
        }).catch(function (err: Error) {
          if (core.isInitializedIIoTNode(node)) {
            node.iiot.opcuaClientOptions.endpointMustExist = endpointMustExist
          }
          internalDebugLog('Get Endpoints Request Error ' + err.message)
          res.json([])
        })
      }
    } else {
      internalDebugLog('Get Endpoints Request None Node ' + JSON.stringify(req.params))
      res.json([])
    }
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/DataTypeIds', RED.auth.needsPermission('opcuaIIoT.plain.datatypes'), function (req, res) {
    res.json(_.toArray(_.invert(DataTypeIds)))
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/AttributeIds', RED.auth.needsPermission('opcuaIIoT.plain.attributeids'), function (req, res) {
    res.json(_.toArray(_.invert(AttributeIds)))
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/StatusCodes', RED.auth.needsPermission('opcuaIIoT.plain.statuscodes'), function (req, res) {
    res.json(_.toArray(_.invert(StatusCodes)))
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/ObjectTypeIds', RED.auth.needsPermission('opcuaIIoT.plain.objecttypeids'), function (req, res) {
    res.json(ObjectTypeIds)
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/VariableTypeIds', RED.auth.needsPermission('opcuaIIoT.plain.variabletypeids'), function (req, res) {
    res.json(VariableTypeIds)
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/ReferenceTypeIds', RED.auth.needsPermission('opcuaIIoT.plain.referencetypeids'), function (req, res) {
    res.json(ReferenceTypeIds)
  })

  RED.httpAdmin.get('/opcuaIIoT/xmlsets/public', RED.auth.needsPermission('opcuaIIoT.xmlsets'), function (req, res) {
    const xmlset = [
      nodesets.di,
      nodesets.adi,
      'public/vendor/opc-foundation/xml/Opc.ISA95.NodeSet2.xml',
      'public/vendor/opc-foundation/xml/Opc.Ua.Adi.NodeSet2.xml',
      'public/vendor/opc-foundation/xml/Opc.Ua.Di.NodeSet2.xml',
      'public/vendor/opc-foundation/xml/Opc.Ua.Gds.NodeSet2.xml',
      'public/vendor/harting/10_di.xml',
      'public/vendor/harting/20_autoid.xml',
      'public/vendor/harting/30_aim.xml',
    ]
    res.json(xmlset)
  })

  RED.httpAdmin.get('/opcuaIIoT/list/DataTypeIds', RED.auth.needsPermission('opcuaIIoT.list.datatypeids'), function (req, res) {
    const resultTypeList = enumToTypeList(DataTypeIds)
    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/opcuaIIoT/list/EventTypeIds', RED.auth.needsPermission('opcuaIIoT.list.eventtypeids'), function (req, res) {
    const eventTypesResults = enumToTypeList(ObjectTypeIds).filter((item) => {
      return item.label.indexOf('Event') > -1
    })
    res.json(eventTypesResults)
  })

  RED.httpAdmin.get('/opcuaIIoT/list/InstanceTypeIds', RED.auth.needsPermission('opcuaIIoT.list.instancetypeids'), function (req, res) {
    const resultTypeList = [ObjectTypeIds, VariableTypeIds].flatMap((item) => enumToTypeList(item))

    res.json(resultTypeList)
  })

  const enumToTypeList = <O extends object>(inputEnum: O): typeListItem<keyof O>[] => {
    return getEnumKeys(inputEnum).map((key) => {
      return { nodeId: `i=${inputEnum[key]}`, label: key }
    })
  }

  type typeListItem<T> ={
    nodeId: `i=${string}`
    label: T
  }

  RED.httpAdmin.get('/opcuaIIoT/list/VariableTypeIds', RED.auth.needsPermission('opcuaIIoT.list.variabletypeids'), function (req, res) {
    const resultTypeList = enumToTypeList(VariableTypeIds)

    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/opcuaIIoT/list/ReferenceTypeIds', RED.auth.needsPermission('opcuaIIoT.list.referencetypeids'), function (req, res) {
    const resultTypeList = enumToTypeList(ReferenceTypeIds)
    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/opcuaIIoT/list/FilterTypes', RED.auth.needsPermission('opcuaIIoT.list.filterids'), function (req, res) {
    const resultTypeList = [
    { name: 'dataType', label: 'Data Type' },
    { name: 'dataValue', label: 'Data Value' },
    { name: 'nodeClass', label: 'Node Class' },
    { name: 'typeDefinition', label: 'Type Definition' },
    { name: 'browseName', label: 'Browse Name' },
    { name: 'nodeId', label: 'Node Id' },
    ]
    res.json(resultTypeList)
  })
}
