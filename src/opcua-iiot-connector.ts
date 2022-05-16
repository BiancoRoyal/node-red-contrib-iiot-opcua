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
import { underscore as _, assert } from './core/opcua-iiot-core'
import {MessageSecurityMode} from "node-opcua-types/dist/_generated_opcua_types";
import {SecurityPolicy} from "node-opcua-secure-channel/source/security_policy";
import {EndpointDescription} from "node-opcua";

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
  securityPolicy: core.nodeOPCUA.SecurityPolicy
  messageSecurityMode: core.nodeOPCUA.MessageSecurityMode
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
    this.securityPolicy =  core.nodeOPCUA.coerceSecurityPolicy(config.securityPolicy)
    this.messageSecurityMode = core.nodeOPCUA.coerceMessageSecurityMode(config.securityMode)
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

    let node = core.connector.initConnectorNode(this)
    assert(node.bianco.iiot)

    node.setMaxListeners(UNLIMITED_LISTENERS)

    core.connector.logger.internalDebugLog('Open Connector Node')

    node.bianco.iiot.stateMachine = core.connector.createStatelyMachine()
    core.connector.logger.internalDebugLog('Start FSM: ' + node.bianco.iiot.stateMachine.getMachineState())
    core.connector.logger.detailDebugLog('FSM events:' + node.bianco.iiot.stateMachine.getMachineEvents())

    let sessionStartTimeout: NodeJS.Timeout | null
    let clientStartTimeout: NodeJS.Timeout | null
    let disconnectTimeout: NodeJS.Timeout | null
    let nodeOPCUAClientPath = core.getNodeOPCUAClientPath()

    node.securedCommunication = (
        node.securityPolicy !== core.nodeOPCUA.SecurityPolicy.None &&
        node.messageSecurityMode !== core.nodeOPCUA.MessageSecurityMode.None
    )

    core.connector.logger.detailDebugLog('config: ' + node.publicCertificateFile)
    core.connector.logger.detailDebugLog('config: ' + node.privateKeyFile)
    core.connector.logger.detailDebugLog('securedCommunication: ' + node.securedCommunication.toString())

    node.bianco.iiot.initCertificatesAndKeys = function () {
      if (node.securedCommunication) {
        if (node.publicCertificateFile === null || node.publicCertificateFile === '') {
          node.publicCertificateFile = path.join(nodeOPCUAClientPath, '/certificates/client_selfsigned_cert_1024.pem')
          core.connector.logger.detailDebugLog('default key: ' + node.publicCertificateFile)
        }

        if (node.privateKeyFile === null || node.privateKeyFile === '') {
          node.privateKeyFile = path.join(nodeOPCUAClientPath, '/certificates/PKI/own/private/private_key.pem')
          core.connector.logger.detailDebugLog('default key: ' + node.privateKeyFile)
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
        core.connector.logger.internalDebugLog('Connecting With Login Data On ' + node.endpoint)
      } else {
        node.error(new Error('Login Enabled But No Credentials'), { payload: '' })
      }
    }

    /*  #########   CONNECTION  #########     */

    node.bianco.iiot.updateServerOptions = function () {
      node.bianco.iiot.initCertificatesAndKeys()
      node.bianco.iiot.opcuaClientOptions = {
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

    node.bianco.iiot.connectOPCUAEndpoint = function () {
      if (!core.connector.checkEndpoint(node)) {
        return
      }

      core.connector.logger.internalDebugLog('Connecting To Endpoint ' + node.endpoint)

      node.bianco.iiot.updateServerOptions()
      // TODO: causes "TypeError: Converting circular structure to JSON" at line 578 in this file
      //    node.bianco.iiot.opcuaClient = core.nodeOPCUA.OPCUAClient.create(node.bianco.iiot.opcuaClientOptions)
      //    core.connector.logger.detailDebugLog('Options ' + node.bianco.iiot.opcuaClientOptions)
      // workaround: JSON.parse(JSON.stringify(obj))
      const optsJson = JSON.stringify(node.bianco.iiot.opcuaClientOptions)
      core.connector.logger.detailDebugLog('Options ' + optsJson)
      node.bianco.iiot.opcuaClient = core.nodeOPCUA.OPCUAClient.create(JSON.parse(optsJson))
      if (Object.keys(node.bianco.iiot.opcuaClient).length === 0) {
        core.connector.logger.detailDebugLog('Failed to create OPCUA Client ', {opcuaClient: node.bianco.iiot.opcuaClient})
      }

      if (node.autoSelectRightEndpoint) {
        node.bianco.iiot.autoSelectEndpointFromConnection()
      }

      // core.connector.setListenerToClient(node)
      node.bianco.iiot.connectToClient()
    }

    node.bianco.iiot.connectToClient = function () {
      if (!core.connector.checkEndpoint(node)) {
        return
      }

      node.bianco.iiot.stateMachine.unlock()
      node.bianco.iiot.opcuaClient.connect(node.endpoint, function (err) {
        if (core.isInitializedBiancoIIoTNode(node)) {
          if (err) {
            node.bianco.iiot.stateMachine.lock().stopopcua()
            node.bianco.iiot.handleError(err)
          } else {
            core.connector.logger.internalDebugLog('Client Is Connected To ' + node.endpoint)
            node.bianco.iiot.stateMachine.open()
          }
        } else {
          core.connector.logger.internalDebugLog('bianco.iiot not valid on connect resolve')
        }
      })
    }

    node.bianco.iiot.renewConnection = function (done) {
      if (core.isInitializedBiancoIIoTNode(node)) {
        node.bianco.iiot.opcuaDirectDisconnect(() => {
          node.bianco.iiot.renewFiniteStateMachine()
          node.bianco.iiot.stateMachine.idle().initopcua()
          done()
        })
      } else {
        core.connector.logger.internalDebugLog('bianco.iiot not valid on renew connection')
      }
    }

    node.bianco.iiot.endpointMatchForConnecting = function (endpoint: EndpointDescription) {
      core.connector.logger.internalDebugLog('Auto Endpoint ' + endpoint.endpointUrl.toString() + ' ' + endpoint.securityPolicyUri.toString())
      let securityMode = endpoint.securityMode.key || endpoint.securityMode
      let securityPolicy = (endpoint.securityPolicyUri.includes('SecurityPolicy#')) ? endpoint.securityPolicyUri.split('#')[1] : endpoint.securityPolicyUri

      core.connector.logger.internalDebugLog('node-mode:' + node.messageSecurityMode + ' securityMode: ' + securityMode)
      core.connector.logger.internalDebugLog('node-policy:' + node.securityPolicy + ' securityPolicy: ' + securityPolicy)

      return (securityMode === node.messageSecurityMode && securityPolicy === node.securityPolicy)
    }

    node.bianco.iiot.selectEndpointFromSettings = function (discoverClient: core.nodeOPCUA.OPCUAClient) {
      discoverClient.getEndpoints(function (err, endpoints) {
        if (err) {
          core.connector.logger.internalDebugLog('Auto Switch To Endpoint Error ' + err)
          if (node.showErrors) {
            node.error(err, { payload: 'Get Endpoints Request Error' })
          }
        } else {
          const endpoint = (endpoints || []).find((endpoint) => {
            node.bianco.iiot.endpointMatchForConnecting(endpoint)
          })

          if (endpoint && endpoint.endpointUrl != null) {
            core.connector.logger.internalDebugLog('Auto Switch To Endpoint ' + endpoint.endpointUrl)
            node.endpoint = endpoint.endpointUrl
          } else {
            core.connector.logger.internalDebugLog('Auto Switch To Endpoint failed: no valid endpoints')
          }
        }

        discoverClient.disconnect(function (err) {
          if (err) {
            core.connector.logger.internalDebugLog('Endpoints Auto Request Error ' + err)
            if (node.showErrors) {
              node.error(err, { payload: 'Discover Client Disconnect Error' })
            }
          } else {
            core.connector.logger.internalDebugLog('Endpoints Auto Request Done With Endpoint ' + node.endpoint)
          }
        })
      })
    }

    node.bianco.iiot.autoSelectEndpointFromConnection = function () {
      core.connector.logger.internalDebugLog('Auto Searching For Endpoint On ' + node.endpoint)

      let endpointMustExist = node.bianco.iiot.opcuaClientOptions.endpointMustExist
      node.bianco.iiot.opcuaClientOptions.endpointMustExist = false

      let discoverClient = core.nodeOPCUA.OPCUAClient.create(node.bianco.iiot.opcuaClientOptions)

      discoverClient.connect(node.endpoint).then(function () {
        core.connector.logger.internalDebugLog('Auto Searching Endpoint Connected To ' + node.endpoint)
        node.bianco.iiot.selectEndpointFromSettings(discoverClient)
        node.bianco.iiot.opcuaClientOptions.endpointMustExist = endpointMustExist
      }).catch(function (err) {
        core.connector.logger.internalDebugLog('Get Auto Endpoint Request Error ' + err.message)
        if (core.isInitializedBiancoIIoTNode(node)) {
          node.bianco.iiot.opcuaClientOptions.endpointMustExist = endpointMustExist
        }
      })
    }

    /*  #########    SESSION    #########     */

    node.bianco.iiot.startSession = function (callerInfo: string) {
      core.connector.logger.internalDebugLog('Request For New Session From ' + callerInfo)

      if (node.bianco.iiot.isInactiveOnOPCUA()) {
        core.connector.logger.internalDebugLog('State Is Not Active While Start Session-> ' + node.bianco.iiot.stateMachine.getMachineState())
        if (node.showErrors) {
          node.error(new Error('OPC UA Connector Is Not Active'), { payload: 'Create Session Error' })
        }
        return
      }

      if (node.bianco.iiot.stateMachine.getMachineState() !== 'OPEN') {
        core.connector.logger.internalDebugLog('Session Request Not Allowed On State ' + node.bianco.iiot.stateMachine.getMachineState())
        if (node.showErrors) {
          node.error(new Error('OPC UA Connector Is Not Open'), { payload: 'Create Session Error' })
        }
        return
      }

      if (!node.bianco.iiot.opcuaClient) {
        core.connector.logger.internalDebugLog('OPC UA Client Connection Is Not Valid On State ' + node.bianco.iiot.stateMachine.getMachineState())
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

          core.connector.logger.detailDebugLog('Session Created On ' + node.endpoint + ' For ' + callerInfo)
          core.connector.logSessionInformation(node)

          node.bianco.iiot.opcuaSession.on('session_closed', function (statusCode) {
            node.bianco.iiot.handleSessionClose(statusCode)
          })
        }).catch(function (err) {
          if (core.isInitializedBiancoIIoTNode(node)) {
            node.bianco.iiot.stateMachine.lock().stopopcua()
            node.bianco.iiot.handleError(err)
          } else {
            core.connector.logger.internalDebugLog(err.message)
          }
          node.emit('session_error', err)
        })
    }

    node.bianco.iiot.resetBadSession = function () {
      if (!node.bianco) {
        return
      }

      node.bianco.iiot.sessionNodeRequests += 1
      core.connector.logger.detailDebugLog('Session Node Requests At Connector No.: ' + node.bianco.iiot.sessionNodeRequests)
      if (node.showErrors) {
        core.connector.logger.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!   BAD SESSION ON CONNECTOR   !!!!!!!!!!!!!!!!!!'.bgWhite.red)
      }

      if (node.bianco.iiot.sessionNodeRequests > node.maxBadSessionRequests) {
        core.connector.logger.internalDebugLog('Reset Bad Session Request On State ' + node.bianco.iiot.stateMachine.getMachineState())
        node.bianco.iiot.resetOPCUAConnection('ToManyBadSessionRequests')
      }
    }

    node.bianco.iiot.isInactiveOnOPCUA = function () {
      let state = node.bianco.iiot.stateMachine.getMachineState()
      return (state === 'STOPPED' || state === 'END' || state === 'RENEW' || state === 'RECONFIGURED')
    }

    node.bianco.iiot.resetOPCUAConnection = function (callerInfo: string) {
      core.connector.logger.detailDebugLog(callerInfo + ' Request For New OPC UA Connection')
      if (node.bianco.iiot.isInactiveOnOPCUA()) {
        return
      }

      node.bianco.iiot.stateMachine.lock().renew()
      node.emit('reset_opcua_connection')
      node.bianco.iiot.closeSession(() => {
        node.bianco.iiot.renewConnection(() => {
          core.connector.logger.detailDebugLog('OPC UA Connection Reset Done')
        })
      })
    }

    node.bianco.iiot.closeSession = function (done) {
      if (node.bianco.iiot.opcuaClient && node.bianco.iiot.opcuaSession) {
        core.connector.logger.detailDebugLog('Close Session And Remove Subscriptions From Session On State ' + node.bianco.iiot.stateMachine.getMachineState())

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
        core.connector.logger.internalDebugLog('Close Session Without Session On State ' + node.bianco.iiot.stateMachine.getMachineState())
        done()
      }
    }

    node.bianco.iiot.handleError = function (err) {
      core.connector.logger.internalDebugLog('Handle Error On ' + node.endpoint + ' err: ' + err)
      if (node.showErrors) {
        node.error(err, { payload: 'Handle Connector Error' })
      }
    }

    node.bianco.iiot.handleSessionClose = function (statusCode) {
      core.connector.logger.internalDebugLog('Session Closed With StatusCode ' + statusCode)

      if (node.bianco.iiot.isInactiveOnOPCUA()) {
        core.connector.logger.detailDebugLog('Connector Is Not Active On OPC UA While Session Close Event')
        return
      }

      core.connector.logSessionInformation(node)
      if (node.bianco.iiot.stateMachine.getMachineState() !== 'SESSIONRESTART') {
        node.bianco.iiot.stateMachine.lock().sessionclose()
      }
    }

    node.bianco.iiot.disconnectNodeOPCUA = function (done) {
      core.connector.logger.internalDebugLog('OPC UA Disconnect Connector On State ' + node.bianco.iiot.stateMachine.getMachineState())

      if (node.bianco.iiot.opcuaClient) {
        core.connector.logger.internalDebugLog('Close Node Disconnect Connector From ' + node.endpoint)
        try {
          node.bianco.iiot.opcuaClient.disconnect(function (err) {
            if (err) {
              node.bianco.iiot.handleError(err)
            }
            core.connector.logger.internalDebugLog('Close Node Done For Connector On ' + node.endpoint)
            done()
          })
        } catch (err) {
          node.bianco.iiot.handleError(err)
          done()
        } finally {
          node.bianco.iiot.opcuaClient = null
        }
      } else {
        core.connector.logger.internalDebugLog('Close Node Done For Connector Without Client On ' + node.endpoint)
        done()
      }
    }

    node.on('close', function (done) {
      if (!core.isInitializedBiancoIIoTNode(node)) {
        done() // if we have a very fast deploy clicking uer
      } else {
        if (node.bianco.iiot.isInactiveOnOPCUA()) {
          core.connector.logger.detailDebugLog('OPC UA Client Is Not Active On Close Node')
          core.resetBiancoNode(node)
          done()
        } else {
          core.connector.logger.detailDebugLog('OPC UA Client Is Active On Close Node With State ' + node.bianco.iiot.stateMachine.getMachineState())
          if (node.bianco.iiot.stateMachine.getMachineState() === 'SESSIONACTIVE') {
            node.bianco.iiot.closeConnector(() => {
              core.resetBiancoNode(node)
              done()
            })
          } else {
            core.connector.logger.internalDebugLog(node.bianco.iiot.stateMachine.getMachineState() + ' -> !!!  CHECK CONNECTOR STATE ON CLOSE  !!!'.bgWhite.red)
            core.resetBiancoNode(node)
            done()
          }
        }
      }
    })

    node.bianco.iiot.opcuaDisconnect = function (done) {
      if (node.bianco.iiot.registeredNodeList.length > 0) {
        core.connector.logger.internalDebugLog('Connector Has Registered Nodes And Can Not Close The Node -> Count: ' + node.bianco.iiot.registeredNodeList.length)
        if (disconnectTimeout) {
          clearTimeout(disconnectTimeout)
          disconnectTimeout = null
        }
        disconnectTimeout = setTimeout(() => {
          if (core.isInitializedBiancoIIoTNode(node)) {
            node.bianco.iiot.closeConnector(done)
          }
        }, node.connectionStopDelay)
      } else {
        node.bianco.iiot.opcuaDirectDisconnect(done)
      }
    }

    node.bianco.iiot.opcuaDirectDisconnect = function (done) {
      core.connector.logger.detailDebugLog('OPC UA Disconnect From Connector ' + node.bianco.iiot.stateMachine.getMachineState())
      node.bianco.iiot.disconnectNodeOPCUA(() => {
        node.bianco.iiot.stateMachine.lock().close()
        let fsmState = node.bianco.iiot.stateMachine.getMachineState()
        core.connector.logger.detailDebugLog('Disconnected On State ' + fsmState)
        if (!node.bianco.iiot.isInactiveOnOPCUA() && fsmState !== 'CLOSED') {
          console.log(fsmState)
          done()
          assert(false)
        }
        done()
      })
    }

    node.bianco.iiot.closeConnector = (done) => {
      core.connector.logger.detailDebugLog('Close Connector ' + node.bianco.iiot.stateMachine.getMachineState())

      if (node.bianco.iiot.isInactiveOnOPCUA()) {
        core.connector.logger.detailDebugLog('OPC UA Client Is Not Active On Close Connector')
        done()
        return
      }

      if (node.bianco.iiot.opcuaClient) {
        node.bianco.iiot.opcuaDisconnect(done)
      } else {
        core.connector.logger.detailDebugLog('OPC UA Client Is Not Valid On Close Connector')
        done()
      }
    }

    node.bianco.iiot.restartWithNewSettings = function (config: OPCUAIIoTConnectorConfigurationDef, done) {
      core.connector.logger.internalDebugLog('Renew With Flex Connector Request On State ' + node.bianco.iiot.stateMachine.getMachineState())
      node.bianco.iiot.stateMachine.lock().reconfigure()
      node.bianco.iiot.updateSettings(config)
      node.bianco.iiot.initCertificatesAndKeys()
      node.bianco.iiot.renewConnection(done)
    }

    node.bianco.iiot.updateSettings = function (config: OPCUAIIoTConnectorConfigurationDef) {
      node.discoveryUrl = config.discoveryUrl || node.discoveryUrl
      node.endpoint = config.endpoint || node.endpoint
      node.keepSessionAlive = config.keepSessionAlive || node.keepSessionAlive
      node.securityPolicy =  core.nodeOPCUA.coerceSecurityPolicy(config.securityPolicy || node.securityPolicy)
      node.messageSecurityMode = core.nodeOPCUA.coerceMessageSecurityMode(config.securityMode || node.messageSecurityMode)
      node.name = config.name || node.name
      node.showErrors = config.showErrors || node.showErrors
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

    node.bianco.iiot.resetOPCUAObjects = function () {
      core.connector.logger.detailDebugLog('Reset All OPC UA Objects')
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
        core.connector.logger.detailDebugLog('Connector IDLE Event FSM')
        node.bianco.iiot.resetOPCUAObjects()
      }

      fsm.onINITOPCUA = function (event, oldState, newState) {
        core.connector.logger.detailDebugLog('Connector Init OPC UA Event FSM')

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

        core.connector.logger.detailDebugLog('connecting OPC UA with delay of msec: ' + node.connectionStartDelay)
        clientStartTimeout = setTimeout(() => {
          if (core.isInitializedBiancoIIoTNode(node)) {
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
        core.connector.logger.detailDebugLog('Connector Open Event FSM')
        if (core.isInitializedBiancoIIoTNode(node)) {
          node.emit('connection_started', node.bianco.iiot.opcuaClient)
          core.connector.logger.internalDebugLog('Client Connected To ' + node.endpoint)
          core.connector.logger.detailDebugLog('Client Options ' + JSON.stringify(node.bianco.iiot.opcuaClientOptions))
          node.bianco.iiot.startSession('Open Event')
        }
      }

      fsm.onSESSIONREQUESTED = function (event, oldState, newState) {
        core.connector.logger.detailDebugLog('Connector Session Request Event FSM')
      }

      fsm.onSESSIONACTIVE = function (event, oldState, newState) {
        core.connector.logger.detailDebugLog('Connector Session Active Event FSM')
        node.bianco.iiot.sessionNodeRequests = 0
        node.emit('session_started', node.bianco.iiot.opcuaSession)
      }

      fsm.onSESSIONCLOSED = function (event, oldState, newState) {
        core.connector.logger.detailDebugLog('Connector Session Close Event FSM')
        node.emit('session_closed')
        if (core.isInitializedBiancoIIoTNode(node)) {
          node.bianco.iiot.opcuaSession = null
        }
      }

      fsm.onSESSIONRESTART = function (event, oldState, newState) {
        core.connector.logger.detailDebugLog('Connector Session Restart Event FSM')
        node.emit('session_restart')
      }

      fsm.onCLOSED = function (event, oldState, newState) {
        core.connector.logger.detailDebugLog('Connector Client Close Event FSM')
        node.emit('connection_closed')
        if (core.isInitializedBiancoIIoTNode(node)) {
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
        core.connector.logger.detailDebugLog('Connector Lock Event FSM')
      }

      fsm.onUNLOCKED = function (event, oldState, newState) {
        core.connector.logger.detailDebugLog('Connector Unlock Event FSM')
      }

      fsm.onSTOPPED = function (event, oldState, newState) {
        core.connector.logger.detailDebugLog('Connector Stopped Event FSM')
        node.emit('connection_stopped')
        if (core.isInitializedBiancoIIoTNode(node)) {
          node.bianco.iiot.resetAllTimer()
        }
      }

      fsm.onEND = function (event, oldState, newState) {
        core.connector.logger.detailDebugLog('Connector End Event FSM')
        node.emit('connection_end')
        if (core.isInitializedBiancoIIoTNode(node)) {
          node.bianco.iiot.resetAllTimer()
        }
      }

      fsm.onRECONFIGURED = function (event, oldState, newState) {
        core.connector.logger.detailDebugLog('Connector Reconfigure Event FSM')
        node.emit('connection_reconfigure')
        if (core.isInitializedBiancoIIoTNode(node)) {
          node.bianco.iiot.resetAllTimer()
        }
      }

      fsm.onRENEW = function (event, oldState, newState) {
        core.connector.logger.detailDebugLog('Connector Renew Event FSM')
        node.emit('connection_renew')
        if (core.isInitializedBiancoIIoTNode(node)) {
          node.bianco.iiot.resetAllTimer()
        }
      }
    }

    node.bianco.iiot.resetAllTimer = function () {
      core.connector.logger.detailDebugLog('Reset All Timer')
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
      node.bianco.iiot.stateMachine = core.connector.createStatelyMachine()
      assert(node.bianco.iiot.stateMachine.getMachineState() === 'IDLE')
      node.bianco.iiot.subscribeFSMEvents(node.bianco.iiot.stateMachine)
    }

    node.bianco.iiot.registerForOPCUA = function (opcuaNode) {
      if (!opcuaNode) {
        core.connector.logger.internalDebugLog('Node Not Valid To Register In Connector')
        return
      }

      core.connector.logger.internalDebugLog('Register In Connector NodeId: ' + opcuaNode.id)

      if (!node.bianco) {
        core.connector.logger.internalDebugLog('Node Not Initialized With Bianco To Register In Connector')
        return
      }

      node.bianco.iiot.registeredNodeList[opcuaNode.id] = opcuaNode

      opcuaNode.on('opcua_client_not_ready', () => {
        if (core.isInitializedBiancoIIoTNode(node) && node.bianco.iiot.stateMachine.getMachineState() !== 'END') {
          node.bianco.iiot.resetBadSession()
        }
      })

      if (Object.keys(node.bianco.iiot.registeredNodeList).length === 1) {
        core.connector.logger.internalDebugLog('Start Connector OPC UA Connection')
        node.bianco.iiot.renewFiniteStateMachine()
        node.bianco.iiot.stateMachine.idle().initopcua()
      }
    }

    node.bianco.iiot.deregisterForOPCUA = function (opcuaNode, done) {
      if (!opcuaNode) {
        core.connector.logger.internalDebugLog('Node Not Valid To Deregister In Connector')
        done()
        return
      }

      opcuaNode.removeAllListeners('opcua_client_not_ready')

      if (!node.bianco) {
        core.connector.logger.internalDebugLog('Node Not Initialized With Bianco To Deregister In Connector')
        return
      }

      core.connector.logger.internalDebugLog('Deregister In Connector NodeId: ' + opcuaNode.id)
      delete node.bianco.iiot.registeredNodeList[opcuaNode.id]

      if (node.bianco.iiot.stateMachine.getMachineState() === 'STOPPED' || node.bianco.iiot.stateMachine.getMachineState() === 'END') {
        done()
        return
      }

      if (Object.keys(node.bianco.iiot.registeredNodeList).length === 0) {
        node.bianco.iiot.stateMachine.lock().stopopcua()
        if (Object.keys(node.bianco.iiot.opcuaClient || {}).length > 1) {
          core.connector.logger.detailDebugLog('OPC UA Direct Disconnect On Unregister Of All Nodes')
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
    core.connector.logger.internalDebugLog(e.message)
  }

  /*  ---------------------  HTTP Requests --------------------- */

  RED.httpAdmin.get('/opcuaIIoT/client/discover/:id/:discoveryUrl', RED.auth.needsPermission('opcua.discovery'), function (req, res) {
    let node = RED.nodes.getNode(req.params.id)
    let discoverUrlRequest = decodeURIComponent(req.params.discoveryUrl)
    core.connector.logger.internalDebugLog('Get Discovery Request ' + JSON.stringify(req.params) + ' for ' + discoverUrlRequest)
    if (node) {
      if (discoverUrlRequest && !discoverUrlRequest.includes('opc.tcp://')) {
        res.json([])
      } else {
        let performFindServersRequest = core.nodeOPCUA.perform_findServersRequest
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
            core.connector.logger.internalDebugLog('Perform Find Servers Request ' + err)
            if (node.showErrors) {
              node.error(err, { payload: '' })
            }
            res.json([])
          }
        })
      }
    } else {
      core.connector.logger.internalDebugLog('Get Discovery Request None Node ' + JSON.stringify(req.params))
      res.json([])
    }
  })

  RED.httpAdmin.get('/opcuaIIoT/client/endpoints/:id/:endpointUrl', RED.auth.needsPermission('opcua.endpoints'), function (req, res) {
    let node = RED.nodes.getNode(req.params.id)
    let endpointUrlRequest = decodeURIComponent(req.params.endpointUrl)
    core.connector.logger.internalDebugLog('Get Endpoints Request ' + JSON.stringify(req.params) + ' for ' + endpointUrlRequest)
    if (node) {
      if (endpointUrlRequest && !endpointUrlRequest.includes('opc.tcp://')) {
        res.json([])
      } else {
        const endpointMustExist = node.bianco.iiot.opcuaClientOptions.endpointMustExist // to reset later
        node.bianco.iiot.opcuaClientOptions.endpointMustExist = false
        let discoveryClient = new core.nodeOPCUA.OPCUAClient(node.bianco.iiot.opcuaClientOptions)
        discoveryClient.connect(endpointUrlRequest).then(function () {
          core.connector.logger.internalDebugLog('Get Endpoints Connected For Request')
          discoveryClient.getEndpoints(function (err, endpoints) {
            if (err) {
              if (node.showErrors) {
                node.error(err, { payload: '' })
              }
              core.connector.logger.internalDebugLog('Get Endpoints Request Error ' + err)
              res.json([])
            } else {
              core.connector.logger.internalDebugLog('Sending Endpoints For Request')
              res.json(endpoints)
            }
            discoveryClient.disconnect(function () {
              core.connector.logger.internalDebugLog('Get Endpoints Request Disconnect')
            })
            node.bianco.iiot.opcuaClientOptions.endpointMustExist = endpointMustExist
          })
        }).catch(function (err) {
          if (core.isInitializedBiancoIIoTNode(node)) {
            node.bianco.iiot.opcuaClientOptions.endpointMustExist = endpointMustExist
          }
          core.connector.logger.internalDebugLog('Get Endpoints Request Error ' + err.message)
          res.json([])
        })
      }
    } else {
      core.connector.logger.internalDebugLog('Get Endpoints Request None Node ' + JSON.stringify(req.params))
      res.json([])
    }
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/DataTypeIds', RED.auth.needsPermission('opcuaIIoT.plain.datatypes'), function (req, res) {
    res.json(_.toArray(_.invert(core.nodeOPCUA.DataTypeIds)))
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/AttributeIds', RED.auth.needsPermission('opcuaIIoT.plain.attributeids'), function (req, res) {
    res.json(_.toArray(_.invert(core.nodeOPCUA.AttributeIds)))
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/StatusCodes', RED.auth.needsPermission('opcuaIIoT.plain.statuscodes'), function (req, res) {
    res.json(_.toArray(_.invert(core.nodeOPCUA.StatusCodes)))
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/ObjectTypeIds', RED.auth.needsPermission('opcuaIIoT.plain.objecttypeids'), function (req, res) {
    res.json(core.nodeOPCUA.ObjectTypeIds)
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/VariableTypeIds', RED.auth.needsPermission('opcuaIIoT.plain.variabletypeids'), function (req, res) {
    res.json(core.nodeOPCUA.VariableTypeIds)
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/ReferenceTypeIds', RED.auth.needsPermission('opcuaIIoT.plain.referencetypeids'), function (req, res) {
    res.json(core.nodeOPCUA.ReferenceTypeIds)
  })

  RED.httpAdmin.get('/opcuaIIoT/xmlsets/public', RED.auth.needsPermission('opcuaIIoT.xmlsets'), function (req, res) {
    let xmlset = []
    xmlset.push(core.nodeOPCUA.di_nodeset_filename)
    xmlset.push(core.nodeOPCUA.adi_nodeset_filename)
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
    let typeList = core.nodeOPCUA.DataTypeIds
    let invertedTypeList = _.toArray(_.invert(typeList))
    let resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ nodeId: 'i=' + typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/opcuaIIoT/list/EventTypeIds', RED.auth.needsPermission('opcuaIIoT.list.eventtypeids'), function (req, res) {
    let objectTypeIds = core.nodeOPCUA.ObjectTypeIds
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
    let typeList = core.nodeOPCUA.ObjectTypeIds
    let variabletypeList = core.nodeOPCUA.VariableTypeIds
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
    let typeList = core.nodeOPCUA.VariableTypeIds
    let invertedTypeList = _.toArray(_.invert(typeList))
    let resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ nodeId: 'i=' + typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/opcuaIIoT/list/ReferenceTypeIds', RED.auth.needsPermission('opcuaIIoT.list.referencetypeids'), function (req, res) {
    let typeList = core.nodeOPCUA.ReferenceTypeIds
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
