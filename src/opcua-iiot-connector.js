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
    const MAX_SESSION_RETRIES = 20

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
      keepSessionAlive: true,
      certificateFile: node.publicCertificateFile,
      privateKeyFile: node.privateKeyFile,
      endpoint_must_exist: node.endpointMustExist
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
      node.opcuaClient = null

      coreConnector.connect(node.discoveryUrl || node.endpoint).then(function (opcuaClient) {
        coreConnector.internalDebugLog('Connected On ' + node.endpoint + ' Options ' + JSON.stringify(node.opcuaClientOptions))

        coreConnector.setupSecureConnectOptions(opcuaClient, node.opcuaClientOptions).then(function (result) {
          coreConnector.internalDebugLog('Setup Certified Options For ' + node.endpoint)
          coreConnector.detailDebugLog('Options ' + JSON.stringify(node.opcuaClientOptions))
          delete node.opcuaClientOptions.keepSessionAlive
          node.endpoints = result.endpoints

          coreConnector.disconnect(opcuaClient).then(function () {
            coreConnector.internalDebugLog('Disconnected From ' + node.endpoint)
            coreConnector.detailDebugLog('Options ' + JSON.stringify(node.opcuaClientOptions))

            node.opcuaClient = null

            if (result.endpoints && node.autoSelectRightEndpoint) {
              result.endpoints.forEach(function (endpoint, i) {
                if (endpoint.securityMode === node.messageSecurityMode &&
                  endpoint.securityPolicyUri === node.securityPolicy) {
                  node.endpoint = endpoint.endpointUrl
                  coreConnector.internalDebugLog('Switch to Endpoint ' + JSON.stringify(node.endpoint))
                }
              })
            }

            coreConnector.connect(node.endpoint, node.opcuaClientOptions).then(function (opcuaClient) {
              coreConnector.internalDebugLog('Secured Connected On ' + node.endpoint)
              coreConnector.detailDebugLog('Options ' + JSON.stringify(node.opcuaClientOptions))

              node.opcuaClient = opcuaClient
              node.startSession(SESSION_TIMEOUT)
              node.emit('connected', opcuaClient)

              node.opcuaClient.on('close', function () {
                node.closeSession()
                node.emit('server_connection_close')
              })

              opcuaClient.on('after_reconnection', function (opcuaClient) {
                node.startSession(SESSION_TIMEOUT)
                node.emit('after_reconnection', opcuaClient)
              })

              node.endpoints = result.endpoints
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
    }

    node.startSession = function (timeoutSeconds) {
      coreConnector.internalDebugLog('Request For New Session From')

      if (node.opcuaSession) {
        coreConnector.internalDebugLog('Working Session On Start Request')
        return
      }

      coreConnector.createSession(node.opcuaClient, node.userIdentity).then(function (result) {
        coreConnector.internalDebugLog('Starting Session On ' + node.endpoint)

        node.opcuaSession = result.session
        node.opcuaSession.timeout = coreConnector.core.calcMillisecondsByTimeAndUnit(timeoutSeconds || 5, 's')

        if (node.keepSessionAlive) {
          node.opcuaSession.startKeepAliveManager()
        }

        node.opcuaSession.on('error', node.handleSessionError)
        node.opcuaSession.on('close', node.handleSessionClose)

        node.logSessionInformation(node.opcuaSession)
        node.emit('session_started', node.opcuaSession)
        node.sessionConnectRetries = 0
      }).catch(function (err) {
        coreConnector.internalDebugLog(err)
        if (node.showErrors) {
          node.error(err, {payload: ''})
        }
        node.opcuaSession = null
      })
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
      coreConnector.internalDebugLog('Reset Bad Session Id: ' + node.opcuaSession.sessionId)
      if (node.opcuaSession && node.sessionNotInRenewMode && node.sessionConnectRetries < MAX_SESSION_RETRIES) {
        node.sessionConnectRetries += 1
        node.setSessionToRenewMode()
        setTimeout(node.startSession(SESSION_TIMEOUT), CONNECTION_START_DELAY)
      } else {
        if (node.sessionConnectRetries === MAX_SESSION_RETRIES) {
          node.sessionConnectRetries = 0 // reset by new request
        }
      }
    }

    node.closeSession = function () {
      try {
        if (node.opcuaSession && node.opcuaClient) {
          coreConnector.internalDebugLog('Close Session Id: ' + node.opcuaSession.sessionId)

          coreConnector.closeSession(node.opcuaSession).then(function (session) {
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
      node.sessionNotInRenewMode = false
    }

    node.resetSessionRenewMode = function () {
      node.opcuaSession = null
      node.sessionNotInRenewMode = true
    }

    node.handleError = function (err) {
      if (err) {
        coreConnector.internalDebugLog('Error on ' + node.endpoint + ' err:' + err)
        if (node.showErrors) {
          node.error(err, {payload: ''})
        }
      } else {
        coreConnector.internalDebugLog('Error on ' + node.endpoint)
      }
    }

    node.handleSessionError = function (err) {
      if (err) {
        coreConnector.internalDebugLog('Session Error on ' + node.endpoint + ' err:' + err)
        if (node.showErrors) {
          node.error(err, {payload: ''})
        }
      } else {
        coreConnector.internalDebugLog('Session Error on ' + node.endpoint)
      }
      node.resetSessionRenewMode()
      node.resetBadSession()
    }

    node.handleSessionClose = function (err) {
      if (err) {
        coreConnector.internalDebugLog('Session Error ' + err)
        if (node.showErrors) {
          node.error(err, {payload: ''})
        }
      } else {
        coreConnector.internalDebugLog('Closed Session')
      }
      node.resetSessionRenewMode()
      node.resetBadSession()
    }

    try {
      setTimeout(node.connectOPCUAEndpoint, CONNECTION_START_DELAY)
    } catch (err) {
      coreConnector.internalDebugLog(err)
    }

    node.on('close', function (done) {
      coreConnector.internalDebugLog('Close Disconnecting From ' + node.endpoint)
      coreConnector.disconnect(node.opcuaClient)
        .then(function () {
          coreConnector.internalDebugLog('Close Disconnected From ' + node.endpoint)
          node.opcuaClient = null
          done()
        }).catch(function (err) {
          if (node.showErrors) {
            node.error(err, {payload: ''})
          }
          node.opcuaClient = null
          done()
        })
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Connector', OPCUAIIoTConnectorConfiguration, {
    credentials: {
      user: {type: 'text'},
      password: {type: 'password'}
    }
  })

  RED.httpAdmin.get('/opcuaIIoT/client/endpoints/:id', RED.auth.needsPermission('opcua.endpoints'), function (req, res) {
    let node = RED.nodes.getNode(req.params.id)
    coreConnector.internalDebugLog('Get Endpoints Request ' + JSON.stringify(req.params))

    if (node) {
      try {
        coreConnector.connect(node.discoveryUrl || node.endpoint).then(function (opcuaClient) {
          coreConnector.setupSecureConnectOptions(opcuaClient, node.opcuaClientOptions).then(function (result) {
            coreConnector.detailDebugLog('Endpoints ' + result.endpoints)
            res.json(result.endpoints || [])
          })
        }).catch(function (err) {
          coreConnector.internalDebugLog('Get Endpoints Request Error ' + err.message)
        })
      } catch (err) {
        coreConnector.internalDebugLog('Get Endpoints Request Error ' + err.message)
      }
    } else {
      coreConnector.internalDebugLog('Get Endpoints Request None Node ' + JSON.stringify(req.params))
    }
  })

  RED.httpAdmin.get('/opcuaIIoT/plain/DataTypesIds', RED.auth.needsPermission('opcuaIIoT.plain.datatypes'), function (req, res) {
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

  RED.httpAdmin.get('/opcuaIIoT/list/EvenTypesIds', RED.auth.needsPermission('opcuaIIoT.list.eventtypeids'), function (req, res) {
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
