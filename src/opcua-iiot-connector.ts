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
import {
  getNodeOPCUAClientPath,
  isInitializedIIoTNode,
  resetIiotNode,
  setNodeStatusTo,
  underscore as _
} from './core/opcua-iiot-core'
import {
  AttributeIds, ClientSession,
  coerceMessageSecurityMode,
  coerceSecurityPolicy,
  DataTypeIds,
  EndpointDescription, findServers,
  MessageSecurityMode, nodesets,
  ObjectTypeIds, OPCUAClient, ReferenceTypeIds,
  SecurityPolicy, StatusCodes, UserIdentityInfo, VariableTypeIds
} from "node-opcua";
import {CoreNode, getEnumKeys, Todo} from "./types/placeholders";
import {logger} from "./core/opcua-iiot-core-connector";
import internalDebugLog = logger.internalDebugLog;
import coreConnector from "./core/opcua-iiot-core-connector";
import detailDebugLog = logger.detailDebugLog;
import {FindServerResults} from "node-opcua-client/source/tools/findservers";
import {Node, NodeStatus} from "node-red";
import {isUndefined} from "underscore";
import {UserTokenType} from "node-opcua-service-endpoints";

interface OPCUAIIoTConnectorCredentials {
  user: string
  password: string
}

export type OPCUAIIoTConnectorNode = nodered.Node<OPCUAIIoTConnectorCredentials> & {
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
  iiot?: ConnectorIIoT
  functions?: {
    [key: string]: Function
  }
  on(event: 'connection_started', listener: (opcuaClient: OPCUAClient) => void): OPCUAIIoTConnectorNode,
  on(event: 'session_started', listener: (opcuaSession: ClientSession) => void ): void
  on(event: 'connector_init', listener: (node: Todo) => void): void

  on(event: 'server_connection_close' | 'server_connection_abort' | 'connection_closed' | 'server_connection_lost' | 'reset_opcua_connection' | 'session_closed' | 'session_restart' | 'session_error' | 'after_reconnection',
     listener: () => void): void
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

export interface ConnectorIIoT extends CoreNode {
  sessionNodeRequests: 0,
  endpoints: string[],
  opcuaClient?: OPCUAClient
  opcuaSession?: ClientSession
  discoveryServer: Todo
  serverCertificate: string
  discoveryServerEndpointUrl: string
  createConnectionTimeout: Todo
  hasOpcUaSubscriptions: boolean
  userIdentity?: UserIdentityInfo
}

/**
 * OPC UA connector Node-RED config this.
 *
 * @param RED
 */
module.exports = function (RED: nodered.NodeAPI) {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTConnectorConfiguration(
      this: OPCUAIIoTConnectorNode, config: OPCUAIIoTConnectorConfigurationDef) {
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
    this.messageSecurityMode = coerceMessageSecurityMode(config.securityMode) || MessageSecurityMode.None
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

    this.iiot =  coreConnector.initConnectorNode()

    if (!this.iiot) throw Error('IIoT Initialization Failed')

    this.setMaxListeners(UNLIMITED_LISTENERS)

    internalDebugLog('Open Connector Node')

    let sessionStartTimeout: NodeJS.Timeout | null
    let clientStartTimeout: NodeJS.Timeout | null
    let disconnectTimeout: NodeJS.Timeout | null
    let nodeOPCUAClientPath = getNodeOPCUAClientPath()

    this.securedCommunication = (
      this.securityPolicy !== SecurityPolicy.None &&
      this.messageSecurityMode !== MessageSecurityMode.None
    )

    detailDebugLog('config: ' + this.publicCertificateFile)
    detailDebugLog('config: ' + this.privateKeyFile)
    detailDebugLog('securedCommunication: ' + this.securedCommunication.toString())

    const initCertificatesAndKeys = () => {
      if (this.securedCommunication) {
        this.publicCertificateFile = this.publicCertificateFile || path.join(nodeOPCUAClientPath, '/certificates/client_selfsigned_cert_1024.pem')
        detailDebugLog('using cert: ' + this.publicCertificateFile)

        this.privateKeyFile = this.privateKeyFile || path.join(nodeOPCUAClientPath, '/certificates/PKI/own/private/private_key.pem')
        detailDebugLog('using key: ' + this.privateKeyFile)
      } else {
        this.publicCertificateFile = null
        this.privateKeyFile = null
      }
    }

    if (this.loginEnabled) {
      if (this.credentials) {
        this.iiot.userIdentity = {
          type: UserTokenType.UserName,
          userName: this.credentials.user,
          password: this.credentials.password
        }
        internalDebugLog('Connecting With Login Data On ' + this.endpoint)
      } else {
        this.error(new Error('Login Enabled But No Credentials'), { payload: '' })
      }
    }

    /*  #########   CONNECTION  #########     */

    const getUpdatedServerOptions = () =>  {
      initCertificatesAndKeys()
      // this.iiot.opcuaClientOptions
      return {
        securityPolicy: this.securityPolicy,
        securityMode: this.messageSecurityMode,
        defaultSecureTokenLifetime: this.defaultSecureTokenLifetime,
        keepSessionAlive: this.keepSessionAlive,
        certificateFile: this.publicCertificateFile,
        privateKeyFile: this.privateKeyFile,
        endpointMustExist: this.endpointMustExist,
        requestedSessionTimeout: this.requestedSessionTimeout,
        connectionStrategy: {
          maxRetry: this.strategyMaxRetry,
          initialDelay: this.strategyInitialDelay,
          maxDelay: this.strategyMaxDelay,
          randomisationFactor: this.strategyRandomisationFactor
        }
      }
    }

    const statusHandler = (status: string | NodeStatus): void => {
      this.status(status)
    }

    const errorHandler = (err: Error): void => {
      this.error(err)
    }

    const connectOPCUAEndpoint = async () => {
      if (isUndefined(this.iiot))
        return
      if (!coreConnector.checkEndpoint(this.endpoint, errorHandler)) {
        return
      }

      internalDebugLog('Connecting To Endpoint ' + this.endpoint)

      this.iiot.opcuaClientOptions = getUpdatedServerOptions()
      // TODO: causes "TypeError: Converting circular structure to JSON" at line 578 in this file
      //    this.iiot.opcuaClient = OPCUAClient.create(this.iiot.opcuaClientOptions)
      //    detailDebugLog('Options ' + this.iiot.opcuaClientOptions)
      // workaround: JSON.parse(JSON.stringify(obj))
      const optsJson = JSON.stringify(this.iiot.opcuaClientOptions)
      detailDebugLog('Options ' + optsJson)
      if (!this.iiot.opcuaClient)
        this.iiot.opcuaClient = OPCUAClient.create(JSON.parse(optsJson))
      if (Object.keys(this.iiot.opcuaClient).length === 0) {
        detailDebugLog('Failed to create OPCUA Client ', {opcuaClient: this.iiot.opcuaClient})
      }

      if (this.autoSelectRightEndpoint) {
        autoSelectEndpointFromConnection()
      }
      // coreConnector.setListenerToClient(node)
      connectToClient()
    }

    const connectToClient = () => {
      if (isUndefined(this.iiot))
        return

      // Needs to be separate if so that typescript understands the types properly
      if (isUndefined(this.iiot.opcuaClient))
        return

      if (!coreConnector.checkEndpoint(this.endpoint, errorHandler)) {
        return
      }

      this.iiot.opcuaClient.connect(this.endpoint, async (err: Error | undefined): Promise<void> => {
        if (isInitializedIIoTNode(this) && !isUndefined(this.iiot)) {
          if (err) {
            this.iiot?.stateMachine.lock().stopopcua()
            handleError(err)
          } else {
            internalDebugLog('Client Is Connected To ' + this.endpoint)
            this.iiot.stateMachine.open()
          }
        } else {
          internalDebugLog('iiot not valid on connect resolve')
        }
      })
    }

    const renewConnection = (done: () => void) => {
      if (isInitializedIIoTNode<ConnectorIIoT>(this.iiot)) {
        opcuaDirectDisconnect(() => {
          if (isUndefined(this.iiot)) return;
          renewFiniteStateMachine()
          this.iiot.stateMachine.idle().initopcua();
          done()
        })
      } else {
        internalDebugLog('bianco.iiot not valid on renew connection')
      }
    }

    const endpointMatchForConnecting = (endpoint: EndpointDescription | Todo) => {
      internalDebugLog('Auto Endpoint ' + endpoint.endpointUrl?.toString() + ' ' + endpoint.securityPolicyUri?.toString())
      let securityMode = endpoint.securityMode.key || endpoint.securityMode
      let securityPolicy = (endpoint.securityPolicyUri.includes('SecurityPolicy#')) ? endpoint.securityPolicyUri.split('#')[1] : endpoint.securityPolicyUri

      internalDebugLog('node-mode:' + this.messageSecurityMode + ' securityMode: ' + securityMode)
      internalDebugLog('node-policy:' + this.securityPolicy + ' securityPolicy: ' + securityPolicy)

      return (securityMode === this.messageSecurityMode && securityPolicy === this.securityPolicy)
    }

    const selectEndpointFromSettings = (discoverClient: OPCUAClient) => {
      discoverClient.getEndpoints((err, endpoints) => {
        if (err) {
          internalDebugLog('Auto Switch To Endpoint Error ' + err)
          if (this.showErrors) {
            this.error(err, { payload: 'Get Endpoints Request Error' })
          }
        } else {
          const endpoint = (endpoints || []).find((endpoint) => {
            endpointMatchForConnecting(endpoint)
          })

          if (endpoint && endpoint.endpointUrl != null) {
            internalDebugLog('Auto Switch To Endpoint ' + endpoint.endpointUrl)
            this.endpoint = endpoint.endpointUrl
          } else {
            internalDebugLog('Auto Switch To Endpoint failed: no valid endpoints')
          }
        }

        discoverClient.disconnect((err: Error | undefined) => {
          if (err) {
            internalDebugLog('Endpoints Auto Request Error ' + err)
            if (this.showErrors) {
              this.error(err, { payload: 'Discover Client Disconnect Error' })
            }
          } else {
            internalDebugLog('Endpoints Auto Request Done With Endpoint ' + this.endpoint)
          }
        })
      })
    }

    const autoSelectEndpointFromConnection = () => {
      internalDebugLog('Auto Searching For Endpoint On ' + this.endpoint)

      if (isUndefined(this.iiot))
        return

      let endpointMustExist = this.iiot.opcuaClientOptions.endpointMustExist
      this.iiot.opcuaClientOptions.endpointMustExist = false

      let discoverClient = OPCUAClient.create(this.iiot.opcuaClientOptions)

      discoverClient.connect(this.endpoint).then(() => {
        internalDebugLog('Auto Searching Endpoint Connected To ' + this.endpoint)
        selectEndpointFromSettings(discoverClient)
        if (isUndefined(this.iiot))
          return

        this.iiot.opcuaClientOptions.endpointMustExist = endpointMustExist
      }).catch((err: Error) => {
        internalDebugLog('Get Auto Endpoint Request Error ' + err.message)
        if (isInitializedIIoTNode<ConnectorIIoT>(this.iiot)) {
          this.iiot.opcuaClientOptions.endpointMustExist = endpointMustExist
        }
      })
    }

    const waitForExist = async <T extends object>(item: T, key: string, iterationCount = 100, checkInterval = 100): Promise<number> => {
      return new Promise<number>(
        (resolve, reject) => {

          const getClient = async <T extends Record<string,any>>(iter: number, item: T): Promise<void> => {
            if (item.hasOwnProperty(key) && item[key]) {
              resolve(0)
            }
            if (iter < 0){
              reject(new Error(key + ' not initialized'))
            }
            setTimeout(getClient, checkInterval, iter - 1, item)
          }

          getClient(iterationCount, item)
        }
      )
    }

    /*  #########    SESSION    #########     */

    const startSession = async (callerInfo: string) => {
      internalDebugLog('Request For New Session From ' + callerInfo)
      if (isUndefined(this.iiot)) {
        return
      }

      if (isInactiveOnOPCUA()) {
        internalDebugLog('State Is Not Active While Start Session-> ' + this.iiot.stateMachine.getMachineState())
        if ((this as Todo).showErrors) {
          this.error(new Error('OPC UA Connector Is Not Active'), { payload: 'Create Session Error' })
        }
        return
      }
      if (this.iiot.stateMachine.getMachineState() !== 'OPEN') {
        internalDebugLog('Session Request Not Allowed On State ' + this.iiot.stateMachine.getMachineState())
        if ((this as Todo).showErrors) {
          this.error(new Error('OPC UA Connector Is Not Open'), { payload: 'Create Session Error' })
        }
        return
      }
      await waitForExist(this.iiot, 'opcuaClient')
      if (!this.iiot.opcuaClient) {
        internalDebugLog('OPC UA Client Connection Is Not Valid On State ' + this.iiot.stateMachine.getMachineState())
        if ((this as Todo).showErrors) {
          this.error(new Error('OPC UA Client Connection Is Not Valid'), { payload: 'Create Session Error' })
        }
        return
      }

      this.iiot.stateMachine.sessionrequest()
      const res = await this.iiot.opcuaClient.createSession(this.iiot.userIdentity)
        .then((session: ClientSession) => {
          if (isUndefined(this.iiot))
            return

          session.requestedMaxReferencesPerNode = 100000
          this.iiot.opcuaSession = session
          this.iiot.stateMachine.sessionactive()

          detailDebugLog('Session Created On ' + this.endpoint + ' For ' + callerInfo)
          coreConnector.logSessionInformation(this)

          this.iiot.opcuaSession?.on('session_closed', (statusCode: number) => {
            handleSessionClose(statusCode)
          })
        }).catch((err: Error) => {
          if (isInitializedIIoTNode<ConnectorIIoT>(this.iiot)) {
            this.iiot.stateMachine.lock().stopopcua()
            handleError(err)
          } else {
            internalDebugLog(err.message)
          }
          this.emit('session_error', err)
          return -1
        })
    }

    const resetBadSession = () => {
      if (!this.iiot) {
        return
      }

      this.iiot.sessionNodeRequests += 1
      detailDebugLog('Session Node Requests At Connector No.: ' + this.iiot.sessionNodeRequests)
      if (this.showErrors) {
        internalDebugLog('!!!!!!!!!!!!!!!!!!!!!   BAD SESSION ON CONNECTOR   !!!!!!!!!!!!!!!!!!')
      }

      if (this.iiot.sessionNodeRequests > this.maxBadSessionRequests) {
        internalDebugLog('Reset Bad Session Request On State ' + this.iiot.stateMachine.getMachineState())
        resetOPCUAConnection('ToManyBadSessionRequests')
      }
    }

    const isInactiveOnOPCUA = () => {
      let state = this.iiot?.stateMachine?.getMachineState()
      return (state === 'STOPPED' || state === 'END' || state === 'RENEW' || state === 'RECONFIGURED')
    }

    const resetOPCUAConnection = (callerInfo: string) => {
      detailDebugLog(callerInfo + ' Request For New OPC UA Connection')
      if (isInactiveOnOPCUA() || isUndefined(this.iiot)) {
        return
      }

      this.iiot.stateMachine.lock().renew()
      this.emit('reset_opcua_connection')
      closeSession(() => {
        renewConnection(() => {
          detailDebugLog('OPC UA Connection Reset Done')
        })
      })
    }

    const handleError = (err: Error) => {
      internalDebugLog('Handle Error On ' + this.endpoint + ' err: ' + err)
      if (this.showErrors) {
        this.error(err, { payload: 'Handle Connector Error' })
      }
    }

    const closeSession = (done: () => void) => {
      if (isUndefined(this.iiot)) {
        return
      }

      if (this.iiot?.opcuaClient && this.iiot?.opcuaSession) {
        detailDebugLog('Close Session And Remove Subscriptions From Session On State ' + this.iiot.stateMachine.getMachineState())

        try {
          this.iiot.opcuaSession.removeAllListeners()
          this.iiot.opcuaClient.closeSession(this.iiot.opcuaSession, this.iiot.hasOpcUaSubscriptions, (err?: Error) => {
            if (err) {
              handleError(err)
            }
            done()
          })
        } catch (err: any) {
          handleError(err)
          done()
        } finally {
          if (this.iiot)
            this.iiot.opcuaSession = undefined
        }
      } else {
        internalDebugLog('Close Session Without Session On State ' + this.iiot.stateMachine.getMachineState())
        done()
      }
    }

    const handleSessionClose = (statusCode: number) => {
      internalDebugLog('Session Closed With StatusCode ' + statusCode)
      if (isUndefined(this.iiot)) {
        return
      }

      if (isInactiveOnOPCUA()) {
        detailDebugLog('Connector Is Not Active On OPC UA While Session Close Event')
        return
      }


      coreConnector.logSessionInformation(this)
      if (this.iiot?.stateMachine && this.iiot.stateMachine.getMachineState() !== 'SESSIONRESTART') {
        this.iiot.stateMachine.lock().sessionclose()
      }
    }

    const disconnectNodeOPCUA = (done: () => void) => {
      if (isUndefined(this.iiot)) {
        return
      }

      internalDebugLog('OPC UA Disconnect Connector On State ' + this.iiot.stateMachine.getMachineState())

      if (this.iiot.opcuaClient) {
        internalDebugLog('Close Node Disconnect Connector From ' + this.endpoint)
        try {
          this.iiot.opcuaClient.disconnect((err?: Error) => {
            if (err) {
              handleError(err)
            }
            internalDebugLog('Close Node Done For Connector On ' + this.endpoint)
            done()
          })
        } catch (err: any) {
          handleError(err)
          done()
        } finally {
          this.iiot.opcuaClient = undefined
        }
      } else {
        internalDebugLog('Close Node Done For Connector Without Client On ' + this.endpoint)
        done()
      }
    }

    this.on('close', (done: () => void) => {
      if (!isInitializedIIoTNode<ConnectorIIoT>(this.iiot)) {
        done() // if we have a very fast deploy clicking uer
      } else {
        if (isInactiveOnOPCUA()) {
          detailDebugLog('OPC UA Client Is Not Active On Close Node')
          resetIiotNode(this)
          done()
        } else {
          detailDebugLog('OPC UA Client Is Active On Close Node With State ' + this.iiot.stateMachine.getMachineState())
          if (this.iiot.stateMachine.getMachineState() === 'SESSIONACTIVE') {
            this.iiot.closeConnector(() => {
              resetIiotNode(this)
              done()
            })
          } else {
            internalDebugLog(this.iiot.stateMachine.getMachineState() + ' -> !!!  CHECK CONNECTOR STATE ON CLOSE  !!!')
            resetIiotNode(this)
            done()
          }
        }
      }
    })

    this.iiot.opcuaDisconnect = (done: () => void) => {
      if (isUndefined(this.iiot)) {
        return
      }

      if (this.iiot.registeredNodeList.length > 0) {
        internalDebugLog('Connector Has Registered Nodes And Can Not Close The Node -> Count: ' + this.iiot.registeredNodeList.length)
        if (disconnectTimeout) {
          clearTimeout(disconnectTimeout)
          disconnectTimeout = null
        }
        disconnectTimeout = setTimeout(() => {
          if (isInitializedIIoTNode(this.iiot)) {
            this.iiot.closeConnector(done)
          }
        }, this.connectionStopDelay)
      } else {
        this.iiot.opcuaDirectDisconnect(done)
      }
    }

    const opcuaDirectDisconnect =  (done: () => void) => {
      if (isUndefined(this.iiot)) {
        return
      }

      detailDebugLog('OPC UA Disconnect From Connector ' + this.iiot.stateMachine.getMachineState())
      disconnectNodeOPCUA(() => {
        if (isUndefined(this.iiot)) {
          return
        }
        this.iiot.stateMachine.lock().close()
        let fsmState = this.iiot.stateMachine.getMachineState()
        detailDebugLog('Disconnected On State ' + fsmState)
        if (!isInactiveOnOPCUA() && fsmState !== 'CLOSED') {
          done()
        }
        done()
      })
    }

    const closeConnector = (done: () => void) => {
      if (isUndefined(this.iiot)) {
        return
      }
      detailDebugLog('Close Connector ' + this.iiot.stateMachine.getMachineState())

      if (isInactiveOnOPCUA()) {
        detailDebugLog('OPC UA Client Is Not Active On Close Connector')
        done()
        return
      }

      if (this.iiot.opcuaClient) {
        this.iiot.opcuaDisconnect(done)
      } else {
        detailDebugLog('OPC UA Client Is Not Valid On Close Connector')
        done()
      }
    }

    const restartWithNewSettings = (config: OPCUAIIoTConnectorConfigurationDef, done: () => void) => {
      if (isUndefined(this.iiot)) {
        return
      }
      internalDebugLog('Renew With Flex Connector Request On State ' + this.iiot.stateMachine.getMachineState())
      this.iiot.stateMachine.lock().reconfigure()
      updateSettings(config)
      initCertificatesAndKeys()
      renewConnection(done)
    }

    const updateSettings = (config: OPCUAIIoTConnectorConfigurationDef) => {
      this.discoveryUrl = config.discoveryUrl || this.discoveryUrl
      this.endpoint = config.endpoint || this.endpoint
      this.keepSessionAlive = config.keepSessionAlive || this.keepSessionAlive
      this.securityPolicy =  coerceSecurityPolicy(config.securityPolicy || this.securityPolicy)
      this.messageSecurityMode = coerceMessageSecurityMode(config.securityMode || this.messageSecurityMode)
      this.name = config.name || this.name
      this.showErrors = config.showErrors || this.showErrors
      this.publicCertificateFile = config.publicCertificateFile || this.publicCertificateFile
      this.privateKeyFile = config.privateKeyFile || this.privateKeyFile
      this.defaultSecureTokenLifetime = config.defaultSecureTokenLifetime || this.defaultSecureTokenLifetime
      this.endpointMustExist = config.endpointMustExist || this.endpointMustExist
      this.autoSelectRightEndpoint = config.autoSelectRightEndpoint || this.autoSelectRightEndpoint
      this.strategyMaxRetry = config.strategyMaxRetry || this.strategyMaxRetry
      this.strategyInitialDelay = config.strategyInitialDelay || this.strategyInitialDelay
      this.strategyMaxDelay = config.strategyMaxDelay || this.strategyMaxDelay
      this.strategyRandomisationFactor = config.strategyRandomisationFactor || this.strategyRandomisationFactor
      this.requestedSessionTimeout = config.requestedSessionTimeout || this.requestedSessionTimeout
      this.connectionStartDelay = config.connectionStartDelay || this.connectionStartDelay
      this.reconnectDelay = config.reconnectDelay || this.reconnectDelay
    }

    const resetOPCUAObjects = () => {
      if (isUndefined(this.iiot)) {
        return
      }
      detailDebugLog('Reset All OPC UA Objects')
      this.iiot.sessionNodeRequests = 0
      if (this.iiot.opcuaSession) {
        if (this.iiot.opcuaClient) {
          this.iiot.opcuaClient.closeSession(this.iiot.opcuaSession, true)
        }
        this.iiot.opcuaSession.removeAllListeners()
        this.iiot.opcuaSession = undefined
      }
      if (Object.keys(this.iiot.opcuaClient || {}).length > 1) {
        // TODO: should this be .disconnect() since removeAllListeners() is not implemented anymore?
        this.iiot.opcuaClient?.removeAllListeners()
        this.iiot.opcuaClient?.disconnect((err?: Error) => {
          if (err && !isUndefined(this.iiot)) {
            handleError(err)
          }
        })
        this.iiot.opcuaClient = undefined
      }
    }

    const subscribeFSMEvents = (fsm: Todo) => {
      /* #########   FSM EVENTS  #########     */

      fsm.onIDLE = () => {
        detailDebugLog('Connector IDLE Event FSM')
        resetOPCUAObjects()
      }

      fsm.onINITOPCUA = async () => {
        detailDebugLog('Connector Init OPC UA Event FSM')

        if (!this.iiot) {
          return
        }

        resetOPCUAObjects()
        resetAllTimer()
        this.emit('connector_init', this)
        initCertificatesAndKeys()

        if (clientStartTimeout) {
          clearTimeout(clientStartTimeout)
          clientStartTimeout = null
        }
        detailDebugLog('connecting OPC UA with delay of msec: ' + this.connectionStartDelay)
        clientStartTimeout = setTimeout(() => {
          if (isInitializedIIoTNode(this.iiot)) {
            try {
              connectOPCUAEndpoint()
            } catch (err: any) {
              handleError(err)
              resetOPCUAObjects()
              this.iiot.stateMachine.lock().stopopcua()
            }
          }
        }, this.connectionStartDelay)
      }

      fsm.onOPEN = async () => {
        detailDebugLog('Connector Open Event FSM')
        if (isInitializedIIoTNode(this.iiot)) {
          this.emit('connection_started', this.iiot.opcuaClient, statusHandler)
          internalDebugLog('Client Connected To ' + this.endpoint)
          detailDebugLog('Client Options ' + JSON.stringify(this.iiot.opcuaClientOptions))
          await startSession('Open Event')
        }

      }

      fsm.onSESSIONREQUESTED = () => {
        detailDebugLog('Connector Session Request Event FSM')
      }

      fsm.onSESSIONACTIVE = () => {
        detailDebugLog('Connector Session Active Event FSM')
        if (!isUndefined(this.iiot))
          this.iiot.sessionNodeRequests = 0
        this.emit('session_started', this.iiot?.opcuaSession)
      }

      fsm.onSESSIONCLOSED = () => {
        detailDebugLog('Connector Session Close Event FSM')
        this.emit('session_closed')
        if (isInitializedIIoTNode(this.iiot)) {
          this.iiot.opcuaSession = undefined
        }
      }

      fsm.onSESSIONRESTART = () => {
        detailDebugLog('Connector Session Restart Event FSM')
        this.emit('session_restart')
      }

      fsm.onCLOSED = () => {
        detailDebugLog('Connector Client Close Event FSM')
        this.emit('connection_closed')
        if (isInitializedIIoTNode(this.iiot)) {
          if (Object.keys(this.iiot.opcuaClient || {}).length > 1) {
            // TODO: should this be .disconnect() since removeAllListeners() is not implemented anymore?
            this.iiot.opcuaClient?.removeAllListeners()
            this.iiot.opcuaClient?.disconnect((err?: Error) => {
              if (err) {
                handleError(err)
              }
            })
            this.iiot.opcuaClient = undefined
          }
        }
      }

      fsm.onLOCKED = () => {
        detailDebugLog('Connector Lock Event FSM')
      }

      fsm.onUNLOCKED = () => {
        detailDebugLog('Connector Unlock Event FSM')
      }

      fsm.onSTOPPED = () => {
        detailDebugLog('Connector Stopped Event FSM')
        this.emit('connection_stopped')
        if (isInitializedIIoTNode(this.iiot)) {
          resetAllTimer()
        }
      }

      fsm.onEND = () => {
        detailDebugLog('Connector End Event FSM')
        this.emit('connection_end')
        if (isInitializedIIoTNode(this.iiot)) {
          resetAllTimer()
        }
      }

      fsm.onRECONFIGURED = () => {
        detailDebugLog('Connector Reconfigure Event FSM')
        this.emit('connection_reconfigure')
        if (isInitializedIIoTNode(this.iiot)) {
          resetAllTimer()
        }
      }

      fsm.onRENEW = () => {
        detailDebugLog('Connector Renew Event FSM')
        this.emit('connection_renew')
        if (isInitializedIIoTNode(this.iiot)) {
          resetAllTimer()
        }
      }
    }

    const resetAllTimer = () => {
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
    this.iiot.registeredNodeList = {}

    const renewFiniteStateMachine = () => {
      if (isUndefined(this.iiot))
        return
      this.iiot.stateMachine = null
      this.iiot.stateMachine = coreConnector.createConnectorStatelyMachine()
      subscribeFSMEvents(this.iiot.stateMachine)
    }

    const registerForOPCUA = (opcuaNode: Todo, onAlias: (...args: Todo) => void) => {
      if (!opcuaNode) {
        internalDebugLog('Node Not Valid To Register In Connector')
        return
      }

      internalDebugLog('Register In Connector NodeId: ' + opcuaNode.id)

      if (!this.iiot) {
        internalDebugLog('Node Not Initialized With Bianco To Register In Connector')
        return
      }

      this.iiot.registeredNodeList[opcuaNode.id] = opcuaNode

      onAlias('opcua_client_not_ready', () => {
        if (isInitializedIIoTNode(this.iiot) && this.iiot.stateMachine.getMachineState() !== 'END') {
          resetBadSession()
        }
      })

      if (Object.keys(this.iiot.registeredNodeList).length === 1) {
        internalDebugLog('Start Connector OPC UA Connection')
        renewFiniteStateMachine()
        this.iiot.stateMachine.idle().initopcua();
      }
      else {
      }
    }

    const deregisterForOPCUA = (opcuaNode: Todo, done: () => void) =>{
      if (!opcuaNode) {
        internalDebugLog('Node Not Valid To Deregister In Connector')
        done()
        return
      }

      opcuaNode.removeAllListeners('opcua_client_not_ready')

      if (!this.iiot) {
        internalDebugLog('Node Not Initialized With Bianco To Deregister In Connector')
        return
      }

      internalDebugLog('Deregister In Connector NodeId: ' + opcuaNode.id)
      delete this.iiot.registeredNodeList[opcuaNode.id]

      if (this.iiot.stateMachine.getMachineState() === 'STOPPED' || this.iiot.stateMachine.getMachineState() === 'END') {
        done()
        return
      }

      if (Object.keys(this.iiot.registeredNodeList).length === 0) {
        this.iiot.stateMachine.lock().stopopcua()
        if (this.iiot.opcuaClient) {
          detailDebugLog('OPC UA Direct Disconnect On Unregister Of All Nodes')
          try {
            this.iiot.opcuaClient.disconnect((err?: Error) => {
              if (err) {
                handleError(err)
              }
              done()
            })
          } catch (err: any) {
            handleError(err)
            done()
          } finally {
            this.iiot.opcuaClient.removeAllListeners()
          }
        } else {
          done()
        }
      } else {
        done()
      }
    }
    renewFiniteStateMachine()

    this.functions = {
      deregisterForOPCUA,
      getUpdatedServerOptions,
      registerForOPCUA,
      waitForExist,
      restartWithNewSettings,
    }


    if (process.env.isTest == 'TRUE') {
      this.functions = {
        ...this.functions,
        connectToClient,
        connectOPCUAEndpoint,
        resetBadSession,
        startSession,
        renewConnection,
        handleError,
        registerForOPCUA,
        deregisterForOPCUA,
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
    let node: Todo = RED.nodes.getNode(req.params.id)
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
            if (node.showErrors) {
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
    let node: Todo = RED.nodes.getNode(req.params.id)
    let endpointUrlRequest = decodeURIComponent(req.params.endpointUrl)
    internalDebugLog('Get Endpoints Request ' + JSON.stringify(req.params) + ' for ' + endpointUrlRequest)
    if (node) {
      if (endpointUrlRequest && !endpointUrlRequest.includes('opc.tcp://')) {
        res.json([])
      } else {
        if (!node.iiot.opcuaClientOptions) {
          node.iiot.opcuaClientOptions = node.functions.getUpdatedServerOptions()
        }
        let discoveryClient = OPCUAClient.create({
          ...node.iiot.opcuaClientOptions,
          endpointMustExist: false
        })
        discoveryClient.connect(endpointUrlRequest).then(() => {
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
            discoveryClient.disconnect(() => {
              internalDebugLog('Get Endpoints Request Disconnect')
            });
          })
        }).catch(function (err: Error) {
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
