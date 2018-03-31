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
  let _ = require('underscore')

  function OPCUAIIoTConnectorConfiguration (config) {
    const CONNECTION_START_DELAY = 2000 // 2 sec.
    const UNLIMITED_LISTENERS = 0
    const SESSION_TIMEOUT = 15 // sec.

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
    this.defaultSecureTokenLifetime = config.defaultSecureTokenLifetime || 60000
    this.autoSelectRightEndpoint = config.autoSelectRightEndpoint
    this.strategyMaxRetry = config.strategyMaxRetry || 10
    this.strategyInitialDelay = config.strategyInitialDelay || 2000
    this.strategyMaxDelay = config.strategyMaxDelay || 10000

    let node = this
    node.setMaxListeners(UNLIMITED_LISTENERS)
    node.client = null
    node.sessionConnectRetries = 0
    node.endpoints = []
    node.userIdentity = null
    node.opcuaClient = null
    node.opcuaSession = null
    node.discoveryServer = null
    node.serverCertificate = null
    node.discoveryServerEndpointUrl = null
    node.sessionNotInRenewMode = true
    node.stateMachine = coreConnector.createStatelyMachine()
    node.stateMachine.init()

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
      connectionStrategy: {
        maxRetry: node.strategyMaxRetry,
        initialDelay: node.strategyInitialDelay,
        maxDelay: node.strategyMaxDelay
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

    node.connectOPCUAEndpoint = function () {
      coreConnector.internalDebugLog('Connecting On ' + node.endpoint)
      coreConnector.detailDebugLog('Options ' + JSON.stringify(node.opcuaClientOptions))
      node.opcuaClient = new coreConnector.core.nodeOPCUA.OPCUAClient(node.opcuaClientOptions)

      if (node.autoSelectRightEndpoint) {
        node.autoSelectEndpointFromConnection()
      }

      node.opcuaClient.on('close', function (err) {
        if (err) {
          coreConnector.internalDebugLog('Connection Error On Close ' + err)
        }
        coreConnector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION CLOSED !!!!!!!!!!!!!!!!!!!'.bgWhite.red)
        coreConnector.internalDebugLog('CONNECTION CLOSED: ' + node.endpoint)
        node.closeSession()
        node.emit('server_connection_close')
      })

      node.opcuaClient.on('backoff', function (number, delay) {
        coreConnector.internalDebugLog('!!! CONNECTION FAILED FOR #'.bgWhite.yellow, number, ' retrying ', delay / 1000.0, ' sec. !!!')
        coreConnector.internalDebugLog('CONNECTION FAILED: ' + node.endpoint)
      })

      node.opcuaClient.on('connection_reestablished', function () {
        coreConnector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT CONNECTION RE-ESTABLISHED !!!!!!!!!!!!!!!!!!!'.bgWhite.orange)
        coreConnector.internalDebugLog('CONNECTION RE-ESTABLISHED: ' + node.endpoint)
      })

      node.opcuaClient.on('start_reconnection', function () {
        coreConnector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CLIENT STARTING RECONNECTION !!!!!!!!!!!!!!!!!!!'.bgWhite.yellow)
        coreConnector.internalDebugLog('CONNECTION STARTING RECONNECTION: ' + node.endpoint)
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
        node.startSession(SESSION_TIMEOUT)
      })

      node.opcuaClient.connect(node.endpoint).then(function () {
        coreConnector.internalDebugLog('Client Connected On ' + node.endpoint)
        coreConnector.internalDebugLog('Client Options ' + JSON.stringify(node.opcuaClientOptions))
        node.emit('connected', node.opcuaClient)
        node.startSession(SESSION_TIMEOUT)
      }).catch(function (err) {
        if (node.showErrors) {
          node.error(err, {payload: 'Client Connect Error'})
        }
        node.handleError(err)
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

    node.startSession = function (timeoutSeconds) {
      coreConnector.internalDebugLog('Request For New Session From')

      if (node.opcuaSession && node.opcuaSession.sessionId !== 'terminated') {
        coreConnector.internalDebugLog('Working Session On Start Request')
        return
      }

      if (node.opcuaClient) {
        node.opcuaSession = null
        node.opcuaClient.createSession(node.userIdentity || {}).then(function (session) {
          coreConnector.internalDebugLog('Session Created On ' + node.endpoint)
          node.stateMachine.open()
          node.opcuaSession = session
          node.opcuaSession.timeout = coreConnector.core.calcMillisecondsByTimeAndUnit(timeoutSeconds || 5, 's')
          node.opcuaSession.on('error', node.handleSessionError)
          node.opcuaSession.on('close', node.handleSessionClose)
          node.logSessionInformation(node.opcuaSession)
          node.emit('session_started', node.opcuaSession)
          node.sessionConnectRetries = 0
        }).catch(function (err) {
          coreConnector.internalDebugLog('Create Session ' + err)
          if (node.showErrors) {
            node.error(err, {payload: 'Create Session Error'})
          }
          node.opcuaSession = null
        })
      } else {
        coreConnector.internalDebugLog('OPC UA Client Is Not Valid')
        node.connectOPCUAEndpoint()
      }
    }

    node.logSessionInformation = function (session) {
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
      coreConnector.internalDebugLog('Reset Bad Session')
      if (node.sessionNotInRenewMode) {
        node.sessionConnectRetries += 1
        coreConnector.internalDebugLog('Bad Session Connect Retries:' + node.sessionConnectRetries)
        node.setSessionToRenewMode()
        setTimeout(function () {
          node.startSession(SESSION_TIMEOUT)
        }, CONNECTION_START_DELAY)
      } else {
        coreConnector.internalDebugLog('Session In Renew Mode')
      }
    }

    node.closeSession = function () {
      coreConnector.internalDebugLog('Close Session On Connector State ' + node.stateMachine.getMachineState())

      if (node.stateMachine.getMachineState() !== 'LOCKED') {
        node.stateMachine.close().lock()
      } else {
        coreConnector.internalDebugLog('No Session To Close On State Locked For ' + node.endpoint)
        return
      }

      try {
        if (node.opcuaClient && node.opcuaSession && node.opcuaSession.sessionId !== 'terminated') {
          coreConnector.internalDebugLog('Close Session Id: ' + node.opcuaSession.sessionId)

          coreConnector.closeSession(node.opcuaSession).then(function () {
            coreConnector.internalDebugLog('Successfully Closed For Reconnect On ' + node.endpoint)
            node.resetSessionRenewMode()
          }).catch(function (err) {
            coreConnector.internalDebugLog('Session Error On Close ' + err)
            node.resetSessionRenewMode()
          })
        } else {
          coreConnector.internalDebugLog('No Session To Close ' + node.endpoint)
          node.resetSessionRenewMode()
        }
      } catch (err) {
        coreConnector.internalDebugLog('Session Catch On Error ' + err)
        node.resetSessionRenewMode()
      }
    }

    node.setSessionToRenewMode = function () {
      node.opcuaSession = null
      node.stateMachine.unlock().init()
      node.sessionNotInRenewMode = false
    }

    node.resetSessionRenewMode = function () {
      node.opcuaSession = null
      node.stateMachine.close().lock()
      node.sessionNotInRenewMode = true
    }

    node.handleError = function (err) {
      coreConnector.internalDebugLog('Handle Error On ' + node.endpoint + ' err:' + err)
      if (node.showErrors) {
        node.error(err, {payload: 'Handle Connector Error'})
      }
    }

    node.handleSessionError = function (err) {
      coreConnector.internalDebugLog('Session Error On ' + node.endpoint + ' err:' + err)
      if (node.showErrors) {
        node.error(err, {payload: 'Session Error'})
      }
      node.resetSessionRenewMode()
      node.resetBadSession()
    }

    node.handleSessionClose = function (err) {
      if (err) {
        coreConnector.internalDebugLog('Session Closed With Error ' + err)
        if (node.showErrors) {
          node.error(err, {payload: 'Session Closed'})
        }
      } else {
        coreConnector.internalDebugLog('Session Closed Without Error')
      }
      node.resetSessionRenewMode()
      node.resetBadSession()
    }

    try {
      setTimeout(node.connectOPCUAEndpoint, CONNECTION_START_DELAY)
    } catch (err) {
      coreConnector.internalDebugLog('Connect OPC UA Endpoint ' + err)
      if (node.showErrors) {
        node.error(err, {payload: ''})
      }
    }

    node.on('close', function (done) {
      node.stateMachine.close().lock()
      if (node.opcuaClient) {
        if (node.opcuaSession) {
          coreConnector.internalDebugLog('Close Node Try To Close Session For ' + node.endpoint)
          coreConnector.closeSession(node.opcuaSession).then(function () {
            coreConnector.internalDebugLog('Close Node Session Closed For ' + node.endpoint)
            coreConnector.internalDebugLog('Close Node Disconnecting Client ' + node.endpoint)
            node.opcuaClient.disconnect(function (err) {
              if (err) {
                coreConnector.internalDebugLog('Close Node Client Disconnected With Error ' + err + ' On ' + node.endpoint)
                if (node.showErrors) {
                  node.error(err, {payload: 'Session Close Error On Close Connector'})
                }
              } else {
                coreConnector.internalDebugLog('Close Node Client Disconnected From ' + node.endpoint)
              }
              done()
              coreConnector.internalDebugLog('Close Node Done For Connector On ' + node.endpoint)
            })
          }).catch(function (err) {
            if (err) {
              coreConnector.internalDebugLog('Close Node With Session Close Error ' + err + ' On ' + node.endpoint)
              if (node.showErrors) {
                node.error(err, {payload: 'Session Close Crash On Close Connector'})
              }
            }
            coreConnector.internalDebugLog('Close Node Disconnecting Client On Crashed Session Close On ' + node.endpoint)
            node.opcuaClient.disconnect(function (err) {
              if (err) {
                coreConnector.internalDebugLog('Close Node With Client Close Error On Crashed Session Close ' + err + ' On ' + node.endpoint)
                if (node.showErrors) {
                  node.error(err, {payload: 'Client Close Error On Close Connector'})
                }
              } else {
                coreConnector.internalDebugLog('Close Node Client Disconnected On Crashed Session Close On ' + node.endpoint)
              }
              done()
              coreConnector.internalDebugLog('Close Node Done For Connector With Crashed Session Close On ' + node.endpoint)
            })
          })
        } else {
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
            done()
            coreConnector.internalDebugLog('Close Node Done For Connector On ' + node.endpoint)
          })
        }
      } else {
        done()
        coreConnector.internalDebugLog('Close Node Done For Connector Without Client On ' + node.endpoint)
      }
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Connector', OPCUAIIoTConnectorConfiguration, {
    credentials: {
      user: {type: 'text'},
      password: {type: 'password'}
    }
  })

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

  RED.httpAdmin.get('/opcuaIIoT/list/EvenTypeIds', RED.auth.needsPermission('opcuaIIoT.list.eventtypeids'), function (req, res) {
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
}
